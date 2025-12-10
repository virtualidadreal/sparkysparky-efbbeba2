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
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { type } = await req.json();

    // Fetch user data for context
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [tasksRes, ideasRes, patternsRes, projectsRes] = await Promise.all([
      supabaseClient.from('tasks').select('*').eq('user_id', user.id),
      supabaseClient.from('ideas').select('*').eq('user_id', user.id).gte('created_at', weekAgo),
      supabaseClient.from('detected_patterns').select('*').eq('user_id', user.id).eq('status', 'active'),
      supabaseClient.from('projects').select('*').eq('user_id', user.id).eq('status', 'active')
    ]);

    const tasks = tasksRes.data || [];
    const ideas = ideasRes.data || [];
    const patterns = patternsRes.data || [];
    const projects = projectsRes.data || [];

    // Categorize tasks
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done');
    const todayTasks = tasks.filter(t => t.due_date === today && t.status !== 'done');
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
    const pendingTasks = tasks.filter(t => t.status === 'todo');
    const staleIdeas = ideas.filter(i => i.status === 'draft' && new Date(i.created_at) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));

    let prompt = '';
    let systemPrompt = '';

    if (type === 'morning_briefing') {
      systemPrompt = `Eres un asistente personal inteligente que genera briefings matutinos concisos y accionables en español.
Tu objetivo es dar una visión clara del día y ayudar al usuario a priorizar.
Responde en formato JSON con esta estructura:
{
  "greeting": "Saludo personalizado corto",
  "summary": "Resumen ejecutivo del día en 2-3 oraciones",
  "top_priorities": ["Lista de 3 prioridades máximas para hoy"],
  "alerts": [{"type": "overdue|deadline|stale", "message": "Descripción corta", "severity": "high|medium|low"}],
  "suggestions": [{"action": "Acción sugerida", "reason": "Por qué"}],
  "energy_tip": "Consejo basado en patrones del usuario"
}`;

      prompt = `Genera un briefing matutino para hoy (${today}).

DATOS DEL USUARIO:
- Tareas vencidas (${overdueTasks.length}): ${JSON.stringify(overdueTasks.slice(0, 5).map(t => ({ title: t.title, due: t.due_date, priority: t.priority })))}
- Tareas para hoy (${todayTasks.length}): ${JSON.stringify(todayTasks.map(t => ({ title: t.title, priority: t.priority })))}
- Tareas alta prioridad pendientes (${highPriorityTasks.length}): ${JSON.stringify(highPriorityTasks.slice(0, 5).map(t => ({ title: t.title, due: t.due_date })))}
- Ideas recientes sin procesar (${staleIdeas.length}): ${JSON.stringify(staleIdeas.slice(0, 3).map(i => ({ title: i.title, days: Math.floor((Date.now() - new Date(i.created_at).getTime()) / (24*60*60*1000)) })))}
- Patrones detectados: ${JSON.stringify(patterns.slice(0, 3).map(p => ({ title: p.title, type: p.pattern_type })))}
- Proyectos activos (${projects.length}): ${JSON.stringify(projects.slice(0, 3).map(p => ({ title: p.title, progress: p.progress })))}

Genera un briefing motivador pero realista.`;

    } else if (type === 'suggestions') {
      systemPrompt = `Eres un asistente que genera sugerencias inteligentes de productividad en español.
Analiza los datos y sugiere acciones concretas.
Responde en formato JSON:
{
  "suggestions": [
    {
      "id": "unique_id",
      "type": "task|idea|project|habit",
      "title": "Título corto de la sugerencia",
      "description": "Descripción detallada",
      "priority": "high|medium|low",
      "action_type": "create_task|review_idea|update_project|reschedule",
      "related_items": ["IDs o títulos relacionados"]
    }
  ]
}`;

      prompt = `Genera sugerencias de productividad basadas en:

CONTEXTO:
- ${pendingTasks.length} tareas pendientes
- ${overdueTasks.length} tareas vencidas
- ${staleIdeas.length} ideas sin revisar desde hace más de 3 días
- ${highPriorityTasks.length} tareas de alta prioridad sin completar
- Patrones: ${JSON.stringify(patterns.map(p => p.title))}

TAREAS RECIENTES: ${JSON.stringify(tasks.slice(0, 10).map(t => ({ title: t.title, status: t.status, priority: t.priority })))}
IDEAS RECIENTES: ${JSON.stringify(ideas.slice(0, 5).map(i => ({ title: i.title, status: i.status, tags: i.tags })))}

Genera 3-5 sugerencias accionables y específicas.`;

    } else if (type === 'alerts') {
      systemPrompt = `Eres un sistema de alertas inteligente que identifica problemas y oportunidades en español.
Responde en formato JSON:
{
  "alerts": [
    {
      "id": "unique_id",
      "type": "overdue|deadline|stale_idea|blocked_project|pattern_warning|opportunity",
      "severity": "critical|high|medium|low",
      "title": "Título de la alerta",
      "message": "Mensaje descriptivo",
      "action_label": "Texto del botón de acción",
      "related_id": "ID del item relacionado (opcional)",
      "related_type": "task|idea|project (opcional)"
    }
  ]
}`;

      prompt = `Genera alertas proactivas basadas en:

ALERTAS POTENCIALES:
1. Tareas vencidas (${overdueTasks.length}): ${JSON.stringify(overdueTasks.map(t => ({ id: t.id, title: t.title, due: t.due_date, days_overdue: Math.floor((Date.now() - new Date(t.due_date).getTime()) / (24*60*60*1000)) })))}
2. Ideas estancadas (${staleIdeas.length}): ${JSON.stringify(staleIdeas.map(i => ({ id: i.id, title: i.title, days: Math.floor((Date.now() - new Date(i.created_at).getTime()) / (24*60*60*1000)) })))}
3. Tareas que vencen mañana: ${JSON.stringify(tasks.filter(t => {
        const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
        return t.due_date === tomorrow && t.status !== 'done';
      }).map(t => ({ id: t.id, title: t.title })))}
4. Proyectos con poco progreso: ${JSON.stringify(projects.filter(p => (p.progress || 0) < 30).map(p => ({ id: p.id, title: p.title, progress: p.progress })))}

Prioriza las alertas más críticas primero. Máximo 5 alertas.`;

    } else if (type === 'reminders') {
      systemPrompt = `Eres un sistema de recordatorios inteligente que aprende de patrones del usuario.
Responde en formato JSON:
{
  "reminders": [
    {
      "id": "unique_id",
      "type": "follow_up|deadline|habit|review|planning",
      "title": "Título del recordatorio",
      "message": "Mensaje del recordatorio",
      "timing": "now|later_today|tomorrow|this_week",
      "based_on": "Explicación de por qué se sugiere este recordatorio"
    }
  ]
}`;

      prompt = `Genera recordatorios inteligentes basados en:

PATRONES DETECTADOS: ${JSON.stringify(patterns.map(p => ({ title: p.title, type: p.pattern_type, occurrences: p.occurrences })))}

CONTEXTO ACTUAL:
- Tareas para hoy: ${todayTasks.length}
- Tareas vencidas: ${overdueTasks.length}
- Alta prioridad pendiente: ${highPriorityTasks.length}
- Proyectos activos: ${projects.length}

HISTORIAL RECIENTE:
- Tareas completadas esta semana: ${tasks.filter(t => t.status === 'done' && new Date(t.updated_at) > new Date(weekAgo)).length}
- Ideas capturadas esta semana: ${ideas.length}

Genera 3-5 recordatorios útiles basados en patrones y contexto.`;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      // Return a default structure based on type
      if (type === 'morning_briefing') {
        result = {
          greeting: "¡Buenos días!",
          summary: "Hoy tienes tareas pendientes por revisar.",
          top_priorities: todayTasks.slice(0, 3).map(t => t.title),
          alerts: overdueTasks.slice(0, 2).map(t => ({ type: 'overdue', message: `"${t.title}" está vencida`, severity: 'high' })),
          suggestions: [],
          energy_tip: "Empieza por las tareas más importantes."
        };
      } else if (type === 'suggestions') {
        result = { suggestions: [] };
      } else if (type === 'alerts') {
        result = {
          alerts: overdueTasks.slice(0, 3).map(t => ({
            id: t.id,
            type: 'overdue',
            severity: 'high',
            title: 'Tarea vencida',
            message: `"${t.title}" venció el ${t.due_date}`,
            action_label: 'Ver tarea',
            related_id: t.id,
            related_type: 'task'
          }))
        };
      } else {
        result = { reminders: [] };
      }
    }

    return new Response(JSON.stringify({ success: true, data: result, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in proactive-insights:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
