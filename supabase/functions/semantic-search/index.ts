import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_QUERY_LENGTH = 500;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_ITEM_TYPES = ['idea', 'task', 'project', 'person', 'diary'] as const;
const VALID_MODES = ['search', 'connections'] as const;

// Validation functions
function validateUUID(value: unknown, fieldName: string): { valid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  if (!UUID_REGEX.test(value)) {
    return { valid: false, error: `${fieldName} must be a valid UUID` };
  }
  
  return { valid: true };
}

function validateQuery(query: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (query === undefined || query === null) {
    return { valid: true, sanitized: '' }; // Query is optional for connections mode
  }
  
  if (typeof query !== 'string') {
    return { valid: false, error: 'Query must be a string' };
  }
  
  const trimmed = query.trim();
  
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters` };
  }
  
  return { valid: true, sanitized: trimmed };
}

function validateMode(mode: unknown): { valid: boolean; error?: string; value?: string } {
  if (mode === undefined || mode === null) {
    return { valid: true, value: 'search' }; // Default mode
  }
  
  if (typeof mode !== 'string') {
    return { valid: false, error: 'Mode must be a string' };
  }
  
  if (!VALID_MODES.includes(mode as any)) {
    return { valid: false, error: `Mode must be one of: ${VALID_MODES.join(', ')}` };
  }
  
  return { valid: true, value: mode };
}

function validateItemType(itemType: unknown): { valid: boolean; error?: string } {
  if (itemType === undefined || itemType === null) {
    return { valid: true }; // Optional field
  }
  
  if (typeof itemType !== 'string') {
    return { valid: false, error: 'itemType must be a string' };
  }
  
  if (!VALID_ITEM_TYPES.includes(itemType as any)) {
    return { valid: false, error: `itemType must be one of: ${VALID_ITEM_TYPES.join(', ')}` };
  }
  
  return { valid: true };
}

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
    // SECURITY: Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated client to get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user from JWT
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Parse and validate request body
    let requestBody;
    try {
      const bodyText = await req.text();
      if (bodyText.length > 10000) { // ~10KB max for search requests
        return new Response(
          JSON.stringify({ error: 'Request body too large' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestBody = JSON.parse(bodyText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only accept query params (userId comes from JWT now)
    const { query, mode, itemId, itemType } = requestBody;

    // Validate mode
    const modeValidation = validateMode(mode);
    if (!modeValidation.valid) {
      return new Response(
        JSON.stringify({ error: modeValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const validatedMode = modeValidation.value!;

    // Validate query
    const queryValidation = validateQuery(query);
    if (!queryValidation.valid) {
      return new Response(
        JSON.stringify({ error: queryValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const validatedQuery = queryValidation.sanitized!;

    // Validate itemId if provided
    if (itemId !== undefined && itemId !== null) {
      const itemIdValidation = validateUUID(itemId, 'itemId');
      if (!itemIdValidation.valid) {
        return new Response(
          JSON.stringify({ error: itemIdValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate itemType if provided
    const itemTypeValidation = validateItemType(itemType);
    if (!itemTypeValidation.valid) {
      return new Response(
        JSON.stringify({ error: itemTypeValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for database queries (RLS is bypassed but we filter by authenticated userId)
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all user data (filtered by authenticated userId)
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

    if (validatedMode === 'connections' && itemId && itemType) {
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
    if (!validatedQuery || validatedQuery.length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchPrompt = `Analiza la siguiente consulta de búsqueda y encuentra los elementos más relevantes semánticamente.

CONSULTA: "${validatedQuery}"

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

    console.log(`Semantic search for "${validatedQuery}": found ${semanticResults.length} results`);

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
