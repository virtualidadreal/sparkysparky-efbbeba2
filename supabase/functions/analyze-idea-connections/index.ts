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
    const { ideaId } = await req.json();
    
    if (!ideaId) {
      return new Response(JSON.stringify({ error: 'ideaId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the new idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      console.error('Error fetching idea:', ideaError);
      return new Response(JSON.stringify({ error: 'Idea not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = idea.user_id;
    console.log(`Analyzing connections for new idea: ${ideaId} by user: ${userId}`);

    // Fetch existing user data to find connections
    const [ideasResult, projectsResult, peopleResult] = await Promise.all([
      supabase.from('ideas').select('id, title, original_content, tags, status')
        .eq('user_id', userId).eq('status', 'active').neq('id', ideaId).limit(50),
      supabase.from('projects').select('id, title, description, tags, status')
        .eq('user_id', userId).eq('status', 'active'),
      supabase.from('people').select('id, full_name, notes, category')
        .eq('user_id', userId),
    ]);

    const existingIdeas = ideasResult.data || [];
    const projects = projectsResult.data || [];
    const people = peopleResult.data || [];

    // Skip if no existing data to connect
    if (existingIdeas.length === 0 && projects.length === 0 && people.length === 0) {
      console.log('No existing data to connect with, skipping');
      return new Response(JSON.stringify({ success: true, connections: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build context for AI
    const newIdea = {
      id: idea.id,
      title: idea.title,
      content: idea.original_content?.substring(0, 500),
      tags: idea.tags || [],
    };

    const context = {
      newIdea,
      existingIdeas: existingIdeas.map(i => ({ 
        id: i.id, 
        title: i.title, 
        content: i.original_content?.substring(0, 150), 
        tags: i.tags 
      })),
      projects: projects.map(p => ({ 
        id: p.id, 
        title: p.title, 
        description: p.description?.substring(0, 150), 
        tags: p.tags 
      })),
      people: people.map(p => ({ 
        id: p.id, 
        name: p.full_name, 
        category: p.category 
      })),
    };

    const systemPrompt = `Eres un asistente que encuentra conexiones entre una idea nueva y los elementos existentes del usuario.
Busca SOLO conexiones significativas y relevantes. No fuerces conexiones.

Responde SOLO en formato JSON con este esquema:
{
  "connections": [
    {
      "target_id": "uuid del elemento existente",
      "target_type": "idea|project|person",
      "target_title": "título del elemento",
      "relationship": "complementa|relacionado_con|persona_involucrada|proyecto_asociado",
      "strength": 0.5-1.0,
      "reasoning": "explicación breve de la conexión"
    }
  ]
}`;

    const userPrompt = `Analiza esta NUEVA IDEA y encuentra conexiones con los elementos existentes:

NUEVA IDEA:
${JSON.stringify(newIdea, null, 2)}

ELEMENTOS EXISTENTES:
${JSON.stringify(context, null, 2)}

Busca:
- Ideas existentes que complementen o se relacionen con la nueva
- Proyectos donde esta idea podría encajar
- Personas que podrían estar involucradas

Máximo 5 conexiones más relevantes.`;

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
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      console.error('Error parsing AI response:', e);
      return new Response(JSON.stringify({ success: true, connections: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert connections for the new idea
    if (connections.length > 0) {
      const connectionsToInsert = connections.map((c: any) => ({
        user_id: userId,
        source_id: ideaId,
        source_type: 'idea',
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
        console.error('Error inserting connections:', insertError);
      } else {
        console.log(`Inserted ${connections.length} connections for idea ${ideaId}`);
      }
    }

    return new Response(JSON.stringify({ success: true, connections: connections.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-idea-connections:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
