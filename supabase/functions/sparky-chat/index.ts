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

    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Sparky chat for user:', user.id);

    // Fetch all user data for context
    const [tasksRes, ideasRes, projectsRes, diaryRes, patternsRes, peopleRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('diary_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(10),
      supabase.from('detected_patterns').select('*').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('people').select('*').eq('user_id', user.id),
    ]);

    const tasks = tasksRes.data || [];
    const ideas = ideasRes.data || [];
    const projects = projectsRes.data || [];
    const diary = diaryRes.data || [];
    const patterns = patternsRes.data || [];
    const people = peopleRes.data || [];

    // Fetch brain prompts
    const { data: prompts } = await supabase
      .from('system_prompts')
      .select('*')
      .in('key', ['sparky_brain_organizer', 'sparky_brain_mentor', 'sparky_brain_creative', 'sparky_brain_business', 'sparky_brain_selector'])
      .eq('is_active', true);

    const promptsMap: Record<string, any> = {};
    prompts?.forEach(p => { promptsMap[p.key] = p; });

    // Step 1: Classify the message to select the right brain
    const selectorPrompt = promptsMap['sparky_brain_selector']?.prompt || 
      'Responde solo con: organizer, mentor, creative, o business';

    const classifyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: selectorPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!classifyResponse.ok) {
      console.error('Brain classification failed');
    }

    const classifyData = await classifyResponse.json();
    const brainType = (classifyData.choices?.[0]?.message?.content || 'organizer').toLowerCase().trim();
    
    // Map brain type to prompt key
    const brainMap: Record<string, string> = {
      'organizer': 'sparky_brain_organizer',
      'mentor': 'sparky_brain_mentor',
      'creative': 'sparky_brain_creative',
      'business': 'sparky_brain_business',
    };

    const selectedBrainKey = brainMap[brainType] || 'sparky_brain_organizer';
    const selectedBrain = promptsMap[selectedBrainKey];
    
    console.log('Selected brain:', brainType, '->', selectedBrainKey);

    // Build context summary
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done');
    const activeProjects = projects.filter(p => p.status === 'active');
    const recentDiary = diary.slice(0, 3);

    const contextSummary = `
## CONTEXTO DEL USUARIO (${new Date().toLocaleDateString('es-ES')})

### Resumen:
- ${pendingTasks.length} tareas pendientes (${overdueTasks.length} vencidas)
- ${activeProjects.length} proyectos activos
- ${ideas.length} ideas guardadas
- ${people.length} personas en su red

### Tareas pendientes:
${pendingTasks.slice(0, 10).map(t => `- [${t.priority}] ${t.title}${t.due_date ? ` (vence: ${t.due_date})` : ''}`).join('\n')}

### Proyectos activos:
${activeProjects.map(p => `- ${p.title}: ${p.progress || 0}% completado`).join('\n')}

### Ideas recientes:
${ideas.slice(0, 5).map(i => `- ${i.title} (${i.status})`).join('\n')}

### Últimas entradas del diario:
${recentDiary.map(d => `- ${d.entry_date}: ${d.title || 'Sin título'} - Estado: ${d.mood || 'neutral'}`).join('\n')}

### Patrones detectados:
${patterns.map(p => `- ${p.title}: ${p.description || ''}`).join('\n')}

### Personas importantes:
${people.slice(0, 5).map(p => `- ${p.full_name} (${p.category || 'contacto'})`).join('\n')}
`;

    // Build the system prompt with context
    const systemPrompt = `${selectedBrain?.prompt || 'Eres Sparky, un asistente personal inteligente.'}

${contextSummary}

INSTRUCCIONES ADICIONALES:
- Responde siempre en español
- Sé conciso pero útil
- Usa el contexto del usuario para personalizar tus respuestas
- Si el usuario pregunta por sus datos, usa la información proporcionada
- Puedes sugerir crear tareas, organizar ideas o planificar proyectos basándote en el contexto`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call AI with streaming disabled for simplicity
    const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedBrain?.model || 'google/gemini-2.5-flash',
        messages,
        temperature: selectedBrain?.temperature || 0.7,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('AI chat error:', chatResponse.status, errorText);
      
      if (chatResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de API alcanzado, intenta más tarde' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (chatResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos agotados' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI chat failed');
    }

    const chatData = await chatResponse.json();
    const response = chatData.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    return new Response(
      JSON.stringify({ 
        success: true, 
        response,
        brain: brainType,
        brainName: selectedBrain?.name || 'Sparky'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sparky-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
