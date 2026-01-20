import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'X-Sparky-Brain, X-Sparky-Brain-Name',
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
      console.error('CRITICAL: LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Sparky chat for user:', user.id);

    // Fetch ALL user data with FULL CONTENT for RAG
    const [tasksRes, ideasRes, projectsRes, diaryRes, patternsRes, peopleRes, memoryRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('diary_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(30),
      supabase.from('detected_patterns').select('*').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('people').select('*').eq('user_id', user.id),
      supabase.from('memory_entries').select('*').eq('user_id', user.id).eq('is_active', true).limit(50),
    ]);

    const tasks = tasksRes.data || [];
    const ideas = ideasRes.data || [];
    const projects = projectsRes.data || [];
    const diary = diaryRes.data || [];
    const patterns = patternsRes.data || [];
    const people = peopleRes.data || [];
    const memories = memoryRes.data || [];

    // Fetch brain prompts
    const { data: prompts } = await supabase
      .from('system_prompts')
      .select('*')
      .in('key', ['sparky_brain_organizer', 'sparky_brain_mentor', 'sparky_brain_creative', 'sparky_brain_business', 'sparky_brain_casual', 'sparky_brain_selector'])
      .eq('is_active', true);

    const promptsMap: Record<string, any> = {};
    prompts?.forEach(p => { promptsMap[p.key] = p; });

    // Step 1: Classify the message to select the right brain
    const selectorPrompt = promptsMap['sparky_brain_selector']?.prompt || 
      'Responde solo con: organizer, mentor, creative, business, o casual';

    const classifyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-nano',
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
    
    const brainMap: Record<string, string> = {
      'organizer': 'sparky_brain_organizer',
      'mentor': 'sparky_brain_mentor',
      'creative': 'sparky_brain_creative',
      'business': 'sparky_brain_business',
      'casual': 'sparky_brain_casual',
    };

    const selectedBrainKey = brainMap[brainType] || 'sparky_brain_organizer';
    const selectedBrain = promptsMap[selectedBrainKey];
    
    console.log('Selected brain:', brainType, '->', selectedBrainKey);

    // Build FULL RAG context with complete content
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done');
    const completedTasks = tasks.filter(t => t.status === 'done').slice(0, 10);
    const activeProjects = projects.filter(p => p.status === 'active');

    // Build comprehensive RAG context
    const contextSummary = `
## CONTEXTO COMPLETO DEL USUARIO (${new Date().toLocaleDateString('es-ES')})

### RESUMEN EJECUTIVO:
- ${pendingTasks.length} tareas pendientes (${overdueTasks.length} vencidas)
- ${completedTasks.length} tareas completadas recientemente
- ${activeProjects.length} proyectos activos de ${projects.length} total
- ${ideas.length} ideas guardadas
- ${diary.length} entradas de diario
- ${people.length} personas en su red
- ${patterns.length} patrones activos detectados
- ${memories.length} memorias activas

---

### 📋 TAREAS PENDIENTES (${pendingTasks.length}):
${pendingTasks.map(t => `
**${t.title}** [Prioridad: ${t.priority || 'media'}] [Estado: ${t.status}]
${t.description ? `Descripción: ${t.description}` : ''}
${t.due_date ? `Fecha límite: ${t.due_date}` : 'Sin fecha límite'}
Creada: ${t.created_at?.split('T')[0] || 'N/A'}
`).join('\n---\n')}

### ⚠️ TAREAS VENCIDAS (${overdueTasks.length}):
${overdueTasks.map(t => `- ${t.title} (venció: ${t.due_date})`).join('\n')}

### ✅ TAREAS COMPLETADAS RECIENTEMENTE:
${completedTasks.map(t => `- ${t.title} (${t.updated_at?.split('T')[0] || 'N/A'})`).join('\n')}

---

### 📁 PROYECTOS (${projects.length}):
${projects.map(p => `
**${p.title}** [Estado: ${p.status}] [Progreso: ${p.progress || 0}%]
${p.description ? `Descripción: ${p.description}` : ''}
${p.due_date ? `Fecha límite: ${p.due_date}` : ''}
Tags: ${(p.tags || []).join(', ') || 'ninguno'}
Keywords: ${(p.keywords || []).join(', ') || 'ninguno'}
`).join('\n---\n')}

---

### 💡 IDEAS (${ideas.length}):
${ideas.map(i => `
**${i.title}** [Categoría: ${i.category || 'general'}] [Prioridad: ${i.priority || 'media'}] [Estado: ${i.status}]
${i.summary ? `Resumen: ${i.summary}` : ''}
${i.description ? `Descripción: ${i.description}` : ''}
${i.original_content ? `Contenido original: ${i.original_content}` : ''}
${i.improved_content ? `Contenido mejorado: ${i.improved_content}` : ''}
${i.transcription ? `Transcripción: ${i.transcription}` : ''}
Sentimiento: ${i.sentiment || 'neutral'}
Emociones: ${(i.detected_emotions || []).join(', ') || 'ninguna'}
Tags: ${(i.tags || []).join(', ') || 'ninguno'}
Personas relacionadas: ${(i.related_people || []).join(', ') || 'ninguna'}
${i.next_steps ? `Próximos pasos: ${JSON.stringify(i.next_steps)}` : ''}
${i.suggested_improvements ? `Mejoras sugeridas: ${JSON.stringify(i.suggested_improvements)}` : ''}
Creada: ${i.created_at?.split('T')[0] || 'N/A'}
`).join('\n---\n')}

---

### 📔 DIARIO (últimas ${diary.length} entradas):
${diary.map(d => `
**${d.title || 'Sin título'}** [Fecha: ${d.entry_date}] [Estado de ánimo: ${d.mood || 'neutral'}]
Contenido completo: ${d.content}
${d.summary ? `Resumen: ${d.summary}` : ''}
Tags: ${(d.tags || []).join(', ') || 'ninguno'}
Personas mencionadas: ${(d.related_people || []).join(', ') || 'ninguna'}
`).join('\n---\n')}

---

### 👥 PERSONAS (${people.length}):
${people.map(p => `
**${p.full_name}** ${p.nickname ? `(${p.nickname})` : ''} [Categoría: ${p.category || 'contacto'}]
${p.email ? `Email: ${p.email}` : ''} ${p.phone ? `Teléfono: ${p.phone}` : ''}
${p.company ? `Empresa: ${p.company}` : ''} ${p.role ? `Rol: ${p.role}` : ''}
${p.how_we_met ? `Cómo se conocieron: ${p.how_we_met}` : ''}
${p.notes ? `Notas: ${p.notes}` : ''}
Último contacto: ${p.last_contact_date || 'N/A'}
`).join('\n---\n')}

---

### 🔍 PATRONES DETECTADOS (${patterns.length}):
${patterns.map(p => `
**${p.title}** [Tipo: ${p.pattern_type}] [Ocurrencias: ${p.occurrences || 1}]
${p.description ? `Descripción: ${p.description}` : ''}
${p.suggestions ? `Sugerencias: ${JSON.stringify(p.suggestions)}` : ''}
${p.evidence ? `Evidencia: ${JSON.stringify(p.evidence)}` : ''}
`).join('\n---\n')}

---

### 🧠 MEMORIAS ACTIVAS (${memories.length}):
${memories.map(m => `
[${m.entry_type}] ${m.content}
Categoría: ${m.category || 'general'} | Confianza: ${m.confidence || 1}
`).join('\n')}
`;

    // Build the system prompt with full RAG context
    const systemPrompt = `${selectedBrain?.prompt || 'Eres Sparky, un asistente personal inteligente.'}

${contextSummary}

INSTRUCCIONES CRÍTICAS:
- Tienes acceso a TODA la información del usuario arriba (RAG completo)
- Cuando el usuario pregunte sobre sus ideas, tareas, proyectos, etc., USA la información detallada proporcionada
- Puedes citar contenido específico de sus ideas, entradas de diario, etc.
- Responde siempre en español
- Sé específico y usa los datos reales del usuario
- Si el usuario pregunta "¿qué ideas tengo sobre X?", busca en el contenido de las ideas
- Puedes relacionar ideas entre sí, detectar patrones, y ofrecer insights basados en todo el contexto`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-15).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call AI WITH STREAMING - Using GPT-5-mini for better token streaming
    const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages,
        temperature: selectedBrain?.temperature || 0.7,
        stream: true,
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

    // Return streaming response with metadata header
    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', 'text/event-stream');
    headers.set('X-Sparky-Brain', brainType);
    headers.set('X-Sparky-Brain-Name', selectedBrain?.name || 'Sparky');

    return new Response(chatResponse.body, { headers });

  } catch (error) {
    console.error('Error in sparky-chat:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
