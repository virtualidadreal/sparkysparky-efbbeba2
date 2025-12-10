import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ideaId, audioBase64 } = await req.json();

    if (!ideaId || !audioBase64) {
      console.error('Missing required fields:', { hasIdeaId: !!ideaId, hasAudioBase64: !!audioBase64 });
      return new Response(
        JSON.stringify({ error: 'ideaId and audioBase64 are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice capture for idea:', ideaId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the idea to verify it exists
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (fetchError || !existingIdea) {
      console.error('Failed to fetch idea:', fetchError);
      throw new Error('Idea not found');
    }

    // Process audio to binary
    console.log('Processing audio, base64 length:', audioBase64.length);
    const binaryAudio = processBase64Chunks(audioBase64);
    console.log('Binary audio size:', binaryAudio.length);

    // Transcribe using OpenAI Whisper
    console.log('Transcribing with Whisper...');
    
    const formData = new FormData();
    // Create a new ArrayBuffer copy to avoid type issues
    const audioArrayBuffer = new ArrayBuffer(binaryAudio.length);
    const audioView = new Uint8Array(audioArrayBuffer);
    audioView.set(binaryAudio);
    const blob = new Blob([audioArrayBuffer], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Spanish by default

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', whisperResponse.status, errorText);
      throw new Error(`Whisper transcription failed: ${errorText}`);
    }

    const whisperResult = await whisperResponse.json();
    const transcription = whisperResult.text;
    
    console.log('Transcription result:', transcription?.substring(0, 100));

    if (!transcription || transcription.trim().length === 0) {
      // Update idea with error state
      await supabase
        .from('ideas')
        .update({
          title: 'Audio sin contenido',
          original_content: 'No se detectó audio válido',
          status: 'draft',
        })
        .eq('id', ideaId);

      return new Response(
        JSON.stringify({ success: false, error: 'No speech detected in audio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process with Lovable AI to extract insights
    console.log('Processing transcription with AI...');
    
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
            content: `Eres un asistente que analiza transcripciones de notas de voz. Debes extraer información estructurada.
            
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
            content: `Transcripción de nota de voz:\n\n${transcription}`
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
      parsedData = {
        title: transcription.substring(0, 50),
        summary: transcription.substring(0, 200),
        category: 'general',
        priority: 'medium',
        sentiment: 'neutral',
        detected_emotions: [],
        related_people: [],
        suggested_improvements: [],
        next_steps: [],
        tags: ['voz']
      };
    }

    // Update the existing idea with transcription and analysis
    const { data: updatedIdea, error: updateError } = await supabase
      .from('ideas')
      .update({
        title: parsedData.title || transcription.substring(0, 50),
        description: transcription,
        original_content: transcription,
        improved_content: parsedData.summary,
        summary: parsedData.summary,
        transcription: transcription,
        category: parsedData.category || 'general',
        priority: parsedData.priority || 'medium',
        status: 'active',
        sentiment: parsedData.sentiment,
        detected_emotions: parsedData.detected_emotions || [],
        related_people: parsedData.related_people || [],
        suggested_improvements: parsedData.suggested_improvements || [],
        next_steps: parsedData.next_steps || [],
        tags: parsedData.tags || ['voz'],
        metadata: { source: 'voice', processed: true, whisper_model: 'whisper-1' }
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update idea');
    }

    console.log('Voice idea processed successfully:', updatedIdea.id);

    return new Response(
      JSON.stringify({ success: true, idea: updatedIdea, transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-voice-capture:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
