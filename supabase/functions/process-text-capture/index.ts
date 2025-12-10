import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ error: 'Text and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing text capture for user:', userId);

    // Process with AI to extract insights
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente que analiza ideas y pensamientos. Debes extraer información estructurada del texto.
            
Responde SOLO con un JSON válido con esta estructura exacta:
{
  "title": "título breve de la idea (máx 50 caracteres)",
  "summary": "resumen conciso de la idea (máx 200 caracteres)",
  "category": "una de: personal, trabajo, proyecto, aprendizaje, salud, finanzas, relaciones, creatividad, general",
  "priority": "una de: low, medium, high",
  "sentiment": "una de: positive, neutral, negative",
  "detected_emotions": ["array de emociones detectadas"],
  "related_people": ["nombres de personas mencionadas"],
  "suggested_improvements": ["sugerencias para mejorar o desarrollar la idea"],
  "next_steps": ["pasos concretos a seguir"],
  "tags": ["etiquetas relevantes"]
}`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI processing failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response received:', aiContent.substring(0, 100));

    // Parse AI response
    let parsedData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic extraction
      parsedData = {
        title: text.substring(0, 50),
        summary: text.substring(0, 200),
        category: 'general',
        priority: 'medium',
        sentiment: 'neutral',
        detected_emotions: [],
        related_people: [],
        suggested_improvements: [],
        next_steps: [],
        tags: []
      };
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: idea, error: insertError } = await supabase
      .from('ideas')
      .insert({
        user_id: userId,
        title: parsedData.title || text.substring(0, 50),
        description: text,
        original_content: text,
        improved_content: parsedData.summary,
        summary: parsedData.summary,
        category: parsedData.category || 'general',
        priority: parsedData.priority || 'medium',
        status: 'draft',
        sentiment: parsedData.sentiment,
        detected_emotions: parsedData.detected_emotions || [],
        related_people: parsedData.related_people || [],
        suggested_improvements: parsedData.suggested_improvements || [],
        next_steps: parsedData.next_steps || [],
        tags: parsedData.tags || [],
        metadata: {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save idea');
    }

    console.log('Idea saved successfully:', idea.id);

    return new Response(
      JSON.stringify({ success: true, idea }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-text-capture:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
