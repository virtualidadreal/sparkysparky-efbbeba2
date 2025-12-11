import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ideaId, userContext } = await req.json();

    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: 'Idea ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating improvements for idea:', ideaId, 'user:', user.id);

    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .single();

    if (ideaError || !idea) {
      return new Response(
        JSON.stringify({ error: 'Idea not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch other ideas for context
    const { data: otherIdeas } = await supabase
      .from('ideas')
      .select('title, summary, category, tags')
      .eq('user_id', user.id)
      .neq('id', ideaId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch projects for context
    const { data: projects } = await supabase
      .from('projects')
      .select('title, description, keywords')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Build context about other ideas
    const otherIdeasContext = (otherIdeas || []).map(i => 
      `- "${i.title}" [${i.category || 'general'}]: ${i.summary || 'Sin resumen'} | Tags: ${(i.tags || []).join(', ')}`
    ).join('\n');

    const projectsContext = (projects || []).map(p =>
      `- "${p.title}": ${p.description || 'Sin descripción'} | Keywords: ${(p.keywords || []).join(', ')}`
    ).join('\n');

    const systemPrompt = `Eres Sparky, un asistente creativo experto en desarrollar y mejorar ideas. Tu rol es analizar la idea del usuario y sugerir mejoras concretas y accionables.

CONTEXTO DEL USUARIO:
El usuario tiene ${(otherIdeas || []).length} ideas guardadas y ${(projects || []).length} proyectos activos.

OTRAS IDEAS DEL USUARIO (para encontrar sinergias):
${otherIdeasContext || 'No hay otras ideas aún'}

PROYECTOS ACTIVOS:
${projectsContext || 'No hay proyectos activos'}

TU TAREA:
1. Analiza la idea actual en profundidad
2. Considera cómo se relaciona con otras ideas y proyectos del usuario
3. Genera 2-3 sugerencias de mejora que sean:
   - Específicas y accionables
   - Basadas en el contexto del usuario
   - Con potencial de conectar con otras ideas o proyectos
   - Innovadoras pero realizables

FORMATO DE RESPUESTA (JSON):
{
  "improvements": [
    {
      "version": 1,
      "content": "Descripción de la mejora propuesta",
      "reasoning": "Por qué esta mejora añade valor"
    }
  ],
  "connections": [
    "Títulos de ideas o proyectos relacionados que podrían conectar"
  ],
  "nextSteps": [
    {
      "step": "Acción concreta a tomar",
      "priority": "high|medium|low"
    }
  ]
}

Responde SOLO con JSON válido, sin texto adicional.`;

    const userMessage = `IDEA A MEJORAR:
Título: ${idea.title}
Contenido original: ${idea.original_content || idea.description || 'Sin contenido'}
Transcripción: ${idea.transcription || 'N/A'}
Resumen actual: ${idea.summary || 'Sin resumen'}
Categoría: ${idea.category || 'general'}
Tags: ${(idea.tags || []).join(', ') || 'ninguno'}
Sentimiento: ${idea.sentiment || 'neutral'}

${userContext ? `CONTEXTO ADICIONAL DEL USUARIO:\n${userContext}` : ''}

Por favor, genera sugerencias de mejora para esta idea.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de API alcanzado, intenta más tarde' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI request failed');
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content);

    // Parse JSON response
    let parsed;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the idea with new improvements
    const existingImprovements = idea.suggested_improvements || [];
    const newImprovements = parsed.improvements || [];
    
    // Add version numbers starting from last version
    const lastVersion = existingImprovements.length > 0 
      ? Math.max(...existingImprovements.map((i: any) => i.version || 0))
      : 0;
    
    const numberedImprovements = newImprovements.map((imp: any, idx: number) => ({
      ...imp,
      version: lastVersion + idx + 1
    }));

    const allImprovements = [...existingImprovements, ...numberedImprovements];

    // Update next_steps if we got new ones
    const existingSteps = idea.next_steps || [];
    const newSteps = parsed.nextSteps || [];
    const allSteps = [...existingSteps, ...newSteps];

    // Update the idea
    const { error: updateError } = await supabase
      .from('ideas')
      .update({
        suggested_improvements: allImprovements,
        next_steps: allSteps,
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);

    if (updateError) {
      console.error('Failed to update idea:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        improvements: numberedImprovements,
        connections: parsed.connections || [],
        nextSteps: newSteps
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in improve-idea:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});