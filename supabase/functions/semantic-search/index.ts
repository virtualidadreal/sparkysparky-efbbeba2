import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchItem {
  id: string;
  type: 'idea' | 'task' | 'project' | 'person' | 'diary';
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
}

interface Connection {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  targetTitle: string;
  relationship: string;
  strength: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, mode = 'search', itemId, itemType } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all user data
    const [ideasRes, tasksRes, projectsRes, peopleRes, diaryRes] = await Promise.all([
      supabase.from('ideas').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('people').select('*').eq('user_id', userId),
      supabase.from('diary_entries').select('*').eq('user_id', userId),
    ]);

    // Transform data to unified format
    const allItems: SearchItem[] = [];

    (ideasRes.data || []).forEach(idea => {
      allItems.push({
        id: idea.id,
        type: 'idea',
        title: idea.title,
        content: [idea.description, idea.original_content, idea.summary].filter(Boolean).join(' '),
        tags: idea.tags || [],
        created_at: idea.created_at,
      });
    });

    (tasksRes.data || []).forEach(task => {
      allItems.push({
        id: task.id,
        type: 'task',
        title: task.title,
        content: task.description || '',
        created_at: task.created_at,
      });
    });

    (projectsRes.data || []).forEach(project => {
      allItems.push({
        id: project.id,
        type: 'project',
        title: project.title,
        content: [project.description, ...(project.keywords || [])].filter(Boolean).join(' '),
        tags: project.tags || [],
        created_at: project.created_at,
      });
    });

    (peopleRes.data || []).forEach(person => {
      allItems.push({
        id: person.id,
        type: 'person',
        title: person.full_name,
        content: [person.company, person.role, person.notes, person.how_we_met].filter(Boolean).join(' '),
        created_at: person.created_at,
      });
    });

    (diaryRes.data || []).forEach(entry => {
      allItems.push({
        id: entry.id,
        type: 'diary',
        title: entry.title || `Entrada del ${entry.entry_date}`,
        content: entry.content,
        created_at: entry.created_at,
      });
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (mode === 'connections' && itemId && itemType) {
      // Find intelligent connections for a specific item
      const sourceItem = allItems.find(i => i.id === itemId && i.type === itemType);
      if (!sourceItem) {
        return new Response(
          JSON.stringify({ connections: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const otherItems = allItems.filter(i => !(i.id === itemId && i.type === itemType)).slice(0, 50);

      const connectionsPrompt = `Analiza el siguiente elemento y encuentra conexiones significativas con otros elementos del usuario.

ELEMENTO FUENTE:
- Tipo: ${sourceItem.type}
- Título: "${sourceItem.title}"
- Contenido: "${sourceItem.content.substring(0, 500)}"
- Tags: ${sourceItem.tags?.join(', ') || 'ninguno'}

OTROS ELEMENTOS DISPONIBLES:
${otherItems.map((item, i) => `${i + 1}. [${item.type}] "${item.title}" - ${item.content.substring(0, 150)}`).join('\n')}

Identifica las 5 conexiones más relevantes. Para cada conexión indica:
1. El índice del elemento relacionado (1-${otherItems.length})
2. Tipo de relación (complementa, depende_de, relacionado_con, persona_involucrada, proyecto_asociado, referencia)
3. Fuerza de la conexión (0.0 a 1.0)
4. Breve explicación del porqué

Responde SOLO en JSON:
{
  "connections": [
    {
      "index": 1,
      "relationship": "relacionado_con",
      "strength": 0.85,
      "reasoning": "Ambos tratan sobre..."
    }
  ]
}`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Eres un asistente experto en encontrar conexiones semánticas entre contenidos. Responde solo en JSON válido.' },
            { role: 'user', content: connectionsPrompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const responseText = aiData.choices?.[0]?.message?.content || '{"connections":[]}';
      
      let parsedConnections;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsedConnections = jsonMatch ? JSON.parse(jsonMatch[0]) : { connections: [] };
      } catch {
        parsedConnections = { connections: [] };
      }

      const connections: Connection[] = (parsedConnections.connections || [])
        .filter((c: any) => c.index >= 1 && c.index <= otherItems.length)
        .map((c: any) => {
          const targetItem = otherItems[c.index - 1];
          return {
            sourceId: sourceItem.id,
            sourceType: sourceItem.type,
            targetId: targetItem.id,
            targetType: targetItem.type,
            targetTitle: targetItem.title,
            relationship: c.relationship || 'relacionado_con',
            strength: Math.min(1, Math.max(0, c.strength || 0.5)),
            reasoning: c.reasoning || '',
          };
        });

      return new Response(
        JSON.stringify({ connections }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Semantic search mode
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchPrompt = `Analiza la siguiente consulta de búsqueda y encuentra los elementos más relevantes semánticamente.

CONSULTA: "${query}"

ELEMENTOS DISPONIBLES:
${allItems.slice(0, 100).map((item, i) => `${i + 1}. [${item.type}] "${item.title}" - ${item.content.substring(0, 200)} ${item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''}`).join('\n')}

Busca coincidencias por SIGNIFICADO, no solo palabras exactas. Por ejemplo:
- "reunión con inversores" debería encontrar elementos sobre "pitch", "funding", "presentación a VCs"
- "mejorar productividad" debería encontrar "automatización", "eficiencia", "gestión del tiempo"

Devuelve los índices de los 10 elementos más relevantes ordenados por relevancia, con puntuación (0.0 a 1.0).

Responde SOLO en JSON:
{
  "results": [
    { "index": 5, "score": 0.95, "reason": "Trata directamente sobre..." },
    { "index": 12, "score": 0.82, "reason": "Relacionado porque..." }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un motor de búsqueda semántica inteligente. Encuentras conexiones por significado. Responde solo en JSON válido.' },
          { role: 'user', content: searchPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || '{"results":[]}';
    
    let parsedResults;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsedResults = jsonMatch ? JSON.parse(jsonMatch[0]) : { results: [] };
    } catch {
      parsedResults = { results: [] };
    }

    const semanticResults = (parsedResults.results || [])
      .filter((r: any) => r.index >= 1 && r.index <= allItems.length)
      .map((r: any) => {
        const item = allItems[r.index - 1];
        return {
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content.substring(0, 200),
          tags: item.tags || [],
          createdAt: item.created_at,
          score: r.score || 0.5,
          reason: r.reason || '',
        };
      });

    console.log(`Semantic search for "${query}": found ${semanticResults.length} results`);

    return new Response(
      JSON.stringify({ results: semanticResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in semantic-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
