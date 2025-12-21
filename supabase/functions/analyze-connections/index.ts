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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create auth client to verify the caller
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      console.error('Invalid authentication:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin access using RLS-protected admin_emails table
    const { data: isAdminData, error: adminError } = await authClient
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .maybeSingle();

    if (adminError || !isAdminData) {
      console.error('Admin access denied for user:', user.email);
      return new Response(
        JSON.stringify({ error: 'Admin access required for batch operations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.email} authorized for batch connection analysis`);
    // ============ END AUTHENTICATION CHECK ============

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Processing ${profiles?.length || 0} users`);

    for (const profile of profiles || []) {
      const userId = profile.user_id;
      console.log(`Analyzing connections for user: ${userId}`);

      try {
        // Fetch user's data
        const [ideasResult, tasksResult, projectsResult, peopleResult, diaryResult] = await Promise.all([
          supabase.from('ideas').select('id, title, original_content, tags, status').eq('user_id', userId).eq('status', 'active'),
          supabase.from('tasks').select('id, title, description, status').eq('user_id', userId).neq('status', 'done'),
          supabase.from('projects').select('id, title, description, tags, status').eq('user_id', userId).eq('status', 'active'),
          supabase.from('people').select('id, full_name, notes, category').eq('user_id', userId),
          supabase.from('diary_entries').select('id, title, content, tags').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
        ]);

        const ideas = ideasResult.data || [];
        const tasks = tasksResult.data || [];
        const projects = projectsResult.data || [];
        const people = peopleResult.data || [];
        const diary = diaryResult.data || [];

        // Skip if no data
        if (ideas.length === 0 && tasks.length === 0) {
          console.log(`No ideas or tasks for user ${userId}, skipping`);
          continue;
        }

        // Build context for AI
        const context = {
          ideas: ideas.map(i => ({ id: i.id, title: i.title, content: i.original_content?.substring(0, 200), tags: i.tags })),
          tasks: tasks.map(t => ({ id: t.id, title: t.title, description: t.description?.substring(0, 200) })),
          projects: projects.map(p => ({ id: p.id, title: p.title, description: p.description?.substring(0, 200), tags: p.tags })),
          people: people.map(p => ({ id: p.id, name: p.full_name, category: p.category })),
          diary: diary.map(d => ({ id: d.id, title: d.title, content: d.content?.substring(0, 200), tags: d.tags })),
        };

        const systemPrompt = `Eres un asistente que analiza conexiones entre diferentes elementos del usuario.
Debes encontrar relaciones significativas entre ideas, tareas, proyectos, personas y entradas de diario.

IMPORTANTE: Solo devuelve conexiones relevantes y significativas. No fuerces conexiones.

Responde SOLO en formato JSON con este esquema:
{
  "connections": [
    {
      "source_id": "uuid del elemento origen",
      "source_type": "idea|task|project|person|diary",
      "target_id": "uuid del elemento destino",
      "target_type": "idea|task|project|person|diary",
      "target_title": "título del elemento destino",
      "relationship": "complementa|depende_de|relacionado_con|persona_involucrada|proyecto_asociado|referencia",
      "strength": 0.5-1.0,
      "reasoning": "explicación breve de por qué están conectados"
    }
  ]
}`;

        const userPrompt = `Analiza estos datos del usuario y encuentra conexiones significativas:

${JSON.stringify(context, null, 2)}

Busca conexiones como:
- Ideas que complementan otras ideas
- Tareas relacionadas con proyectos
- Personas mencionadas en ideas o diario
- Patrones temáticos entre entradas
- Dependencias entre elementos

Máximo 20 conexiones. Solo las más relevantes.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          console.error(`AI error for user ${userId}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        
        // Parse JSON from response
        let connections = [];
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            connections = parsed.connections || [];
          }
        } catch (e) {
          console.error(`Error parsing AI response for user ${userId}:`, e);
          continue;
        }

        // Delete old connections for this user
        await supabase
          .from('intelligent_connections')
          .delete()
          .eq('user_id', userId);

        // Insert new connections
        if (connections.length > 0) {
          const connectionsToInsert = connections.map((c: any) => ({
            user_id: userId,
            source_id: c.source_id,
            source_type: c.source_type,
            target_id: c.target_id,
            target_type: c.target_type,
            target_title: c.target_title,
            relationship: c.relationship,
            strength: c.strength || 0.5,
            reasoning: c.reasoning,
          }));

          const { error: insertError } = await supabase
            .from('intelligent_connections')
            .insert(connectionsToInsert);

          if (insertError) {
            console.error(`Error inserting connections for user ${userId}:`, insertError);
          } else {
            console.log(`Inserted ${connections.length} connections for user ${userId}`);
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        continue;
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Connections analyzed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-connections:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
