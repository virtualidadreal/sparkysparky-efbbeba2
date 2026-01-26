import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_AUDIO_BASE64_LENGTH = 10485760; // ~10MB in base64
const MIN_AUDIO_BASE64_LENGTH = 100; // Minimum valid audio
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function validateAudioBase64(audioBase64: unknown): { valid: boolean; error?: string } {
  if (typeof audioBase64 !== 'string') {
    return { valid: false, error: 'audioBase64 must be a string' };
  }
  
  if (audioBase64.length < MIN_AUDIO_BASE64_LENGTH) {
    return { valid: false, error: 'Audio data too short or empty' };
  }
  
  if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
    return { valid: false, error: `Audio exceeds maximum size of ~10MB` };
  }
  
  // Basic base64 validation
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (!base64Regex.test(audioBase64)) {
    return { valid: false, error: 'Invalid base64 encoding' };
  }
  
  return { valid: true };
}

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

    const authenticatedUserId = user.id;
    console.log('Authenticated user:', authenticatedUserId);

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      // Check body size before parsing (base64 + overhead)
      if (bodyText.length > 15000000) { // ~15MB max request
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

    const { ideaId, audioBase64 } = requestBody;

    // Validate ideaId
    const ideaIdValidation = validateUUID(ideaId, 'ideaId');
    if (!ideaIdValidation.valid) {
      console.error('Invalid ideaId:', ideaIdValidation.error);
      return new Response(
        JSON.stringify({ error: ideaIdValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audioBase64
    const audioValidation = validateAudioBase64(audioBase64);
    if (!audioValidation.valid) {
      console.error('Invalid audio:', audioValidation.error);
      return new Response(
        JSON.stringify({ error: audioValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('CRITICAL: OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!LOVABLE_API_KEY) {
      console.error('CRITICAL: LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing voice capture for idea:', ideaId);

    // Initialize Supabase client with service role for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user quota before processing
    const { data: quotaData, error: quotaError } = await supabase.rpc('check_user_quota', {
      p_user_id: authenticatedUserId
    });

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
    }

    if (quotaData && !quotaData.can_generate) {
      return new Response(
        JSON.stringify({ 
          error: 'Has alcanzado el límite mensual de generaciones. Actualiza a Pro para continuar.',
          quota_exceeded: true,
          quota: quotaData
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the idea to verify it exists AND check ownership
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (fetchError || !existingIdea) {
      console.error('Failed to fetch idea:', fetchError);
      throw new Error('Idea not found');
    }

    // SECURITY: Verify ownership - user can only process their own ideas
    if (existingIdea.user_id !== authenticatedUserId) {
      console.error('Ownership check failed:', existingIdea.user_id, '!==', authenticatedUserId);
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this idea' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      
      // Mensaje de error más específico para el usuario
      let userMessage = 'Error en la transcripción del audio';
      if (whisperResponse.status === 429) {
        userMessage = 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.';
      } else if (whisperResponse.status === 413 || errorText.includes('size')) {
        userMessage = 'El audio es demasiado grande. Máximo 5 minutos.';
      } else if (errorText.includes('Invalid file')) {
        userMessage = 'Formato de audio no válido. Intenta grabar de nuevo.';
      }
      
      throw new Error(userMessage);
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

    // Get the system prompt from database
    console.log('Processing transcription with AI...');
    
    const { data: promptData, error: promptError } = await supabase
      .from('system_prompts')
      .select('prompt')
      .eq('key', 'voice_processing')
      .eq('is_active', true)
      .single();

    if (promptError) {
      console.error('Error fetching system prompt:', promptError);
    }

    // Map mood to valid database values
    function mapMoodToValid(mood: string | undefined): string {
      const validMoods = ['great', 'good', 'neutral', 'bad', 'terrible'];
      if (mood && validMoods.includes(mood)) return mood;
      const moodMap: Record<string, string> = {
        'happy': 'great', 'excited': 'great', 'grateful': 'great',
        'calm': 'good', 'sad': 'bad', 'anxious': 'bad', 'angry': 'terrible',
      };
      return moodMap[mood || ''] || 'neutral';
    }

    // Heuristic detection for diary entries - check BEFORE AI call
    const transcriptionLower = transcription.toLowerCase();
    const diaryPatterns = [
      'mi diario', 'en mi diario', 'apunta en mi diario', 'anota en mi diario',
      'hoy ha sido', 'hoy fue', 'hoy me', 'hoy estoy', 'hoy he',
      'me siento', 'me he sentido', 'cómo me siento',
      'mi día', 'el día de hoy', 'este día',
      'me desperté', 'me he despertado', 'me levanté', 'me he levantado',
      'reflexión', 'reflexiono'
    ];
    
    const isDiaryByHeuristic = diaryPatterns.some(pattern => transcriptionLower.includes(pattern));
    console.log('Heuristic diary detection:', isDiaryByHeuristic, 'for:', transcription.substring(0, 50));

    // Heuristic detection for tasks - check BEFORE AI call
    const taskPatterns = [
      'apunta en mi lista de tareas', 'añade a mi lista de tareas', 'agrega a mi lista de tareas',
      'apunta esta tarea', 'añade esta tarea', 'agrega esta tarea', 'crea una tarea',
      'apúntame que', 'apúntame esto', 'recuérdame que', 'recordarme que',
      'tengo que', 'tengo pendiente', 'necesito hacer', 'debo hacer',
      'apunta en mis tareas', 'añade a mis tareas', 'agrega a mis tareas',
      'nueva tarea', 'crear tarea', 'añadir tarea'
    ];
    
    const isTaskByHeuristic = taskPatterns.some(pattern => transcriptionLower.includes(pattern));
    console.log('Heuristic task detection:', isTaskByHeuristic, 'for:', transcription.substring(0, 50));

    // Extract task list name if mentioned
    let mentionedListName: string | null = null;
    const listNamePatterns = [
      /(?:en la lista|en mi lista|lista)\s+(?:de\s+)?["']?([^"'.,]+)["']?/i,
      /(?:en|a)\s+(?:la lista|mi lista)\s+["']?([^"'.,]+)["']?/i,
      /lista\s+["']?([^"'.,]+)["']?/i
    ];
    
    for (const pattern of listNamePatterns) {
      const match = transcription.match(pattern);
      if (match && match[1]) {
        mentionedListName = match[1].trim();
        console.log('Detected task list name:', mentionedListName);
        break;
      }
    }

    // Get user's projects and recent ideas for context
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id, title, tags, keywords')
      .eq('user_id', authenticatedUserId)
      .eq('status', 'active');

    const { data: recentIdeas } = await supabase
      .from('ideas')
      .select('id, title, tags')
      .eq('user_id', authenticatedUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's task lists for context
    const { data: userTaskLists } = await supabase
      .from('task_lists')
      .select('id, name')
      .eq('user_id', authenticatedUserId)
      .order('sort_order', { ascending: true });

    // Build context for AI
    const projectsList = userProjects?.map(p => `- ${p.title} (tags: ${(p.tags || []).join(', ')})`).join('\n') || 'Ninguno';
    const recentIdeasList = recentIdeas?.map(i => `- ${i.title}`).join('\n') || 'Ninguna';
    const taskListsList = userTaskLists?.map(l => `- "${l.name}" (id: ${l.id})`).join('\n') || 'Ninguna';

    // New Sparky prompt for voice capture
    const systemPrompt = `Eres Sparky, un asistente personal de ideas. El usuario acaba de capturar una idea por voz.

CONTEXTO DEL USUARIO:
Proyectos activos:
${projectsList}

Ideas recientes:
${recentIdeasList}

Listas de tareas disponibles:
${taskListsList}

INSTRUCCIONES:
1. Clasifica el contenido:
   - Si habla de su día, experiencias personales o emociones → "diary"
   - Si menciona "apunta en mi lista de tareas", "añade esta tarea", "recuérdame que", "tengo que hacer" o similar → "task"
   - Para ideas creativas, proyectos, negocios → "idea"
   
2. Para TAREAS:
   - Si el usuario menciona una lista específica (ej: "en la lista de trabajo", "en mi lista personal"), identifica el task_list_id correspondiente
   - Si NO menciona lista específica, deja task_list_id como null (irá a inbox)

3. Genera un título específico, un resumen con INTENCIÓN, y un comentario de Sparky.`;

    const classificationTool = {
      type: "function",
      function: {
        name: "classify_content",
        description: "Clasifica el contenido de una nota de voz",
        parameters: {
          type: "object",
          properties: {
            content_type: { 
              type: "string", 
              enum: ["diary", "idea", "task", "person"],
              description: "diary: reflexiones personales, cómo ha sido el día, emociones. idea: conceptos creativos, proyectos. task: acciones pendientes, recordatorios, cosas que hay que hacer (detectar frases como 'apunta en mi lista de tareas', 'recuérdame que', 'tengo que'). person: información sobre alguien."
            },
            title: { type: "string", description: "Título de 5-8 palabras, específico y descriptivo. Para tareas: la acción a realizar. No genérico." },
            summary: { type: "string", description: "2-3 frases en prosa que capturen QUÉ quiere hacer el usuario y POR QUÉ/PARA QUÉ. No uses bullets. Sintetiza la intención." },
            project_id: { type: "string", description: "ID del proyecto si hay match claro (>80%), o null si no" },
            task_list_id: { type: "string", description: "ID de la lista de tareas si el usuario la menciona explícitamente, o null si no menciona ninguna (irá a inbox)" },
            task_list_name: { type: "string", description: "Nombre de la lista de tareas mencionada por el usuario (para debug), o null" },
            sparky_take: { type: "string", description: "1-2 frases con tu comentario. Elige: conexión con ideas anteriores, pregunta que rete la idea, patrón detectado, o siguiente paso concreto. Nunca halagos vacíos. Sé específico." },
            category: { type: "string", enum: ["personal", "trabajo", "proyecto", "aprendizaje", "salud", "finanzas", "relaciones", "creatividad", "general"] },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
            mood: { type: "string", enum: ["great", "good", "neutral", "bad", "terrible"] },
            detected_emotions: { type: "array", items: { type: "string" } },
            related_people: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } }
          },
          required: ["content_type", "title", "summary"]
        }
      }
    };
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Clasifica esta transcripción. Si habla de su día, experiencias personales o emociones, es "diary". Transcripción:\n\n${transcription}` }
        ],
        tools: [classificationTool],
        tool_choice: { type: "function", function: { name: "classify_content" } }
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
    
    // Extract from tool call
    let parsedData;
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      try {
        parsedData = JSON.parse(toolCall.function.arguments);
        console.log('AI tool call classification:', parsedData.content_type);
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
      }
    }
    
    // Fallback if tool call failed
    if (!parsedData) {
      const aiContent = aiData.choices?.[0]?.message?.content || '';
      console.log('AI response (no tool call):', aiContent.substring(0, 100));
      
      try {
        let cleanContent = aiContent.trim();
        if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
        if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
        if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
        parsedData = JSON.parse(cleanContent.trim());
      } catch {
        parsedData = {
          content_type: isDiaryByHeuristic ? 'diary' : 'idea',
          title: transcription.substring(0, 50),
          summary: transcription.substring(0, 200),
          category: 'general',
          priority: 'medium',
          sentiment: 'neutral',
          mood: 'neutral',
          detected_emotions: [],
          related_people: [],
          tags: ['voz']
        };
      }
    }

    // OVERRIDE: If heuristic detected diary but AI said otherwise, trust heuristic
    if (isDiaryByHeuristic && parsedData.content_type !== 'diary') {
      console.log('Overriding AI classification to diary based on heuristic');
      parsedData.content_type = 'diary';
    }

    // OVERRIDE: If heuristic detected task but AI said otherwise, trust heuristic
    if (isTaskByHeuristic && parsedData.content_type !== 'task') {
      console.log('Overriding AI classification to task based on heuristic');
      parsedData.content_type = 'task';
    }

    // Determine content type with priority: diary heuristic > task heuristic > AI
    let contentType = parsedData.content_type || 'idea';
    if (isDiaryByHeuristic) contentType = 'diary';
    else if (isTaskByHeuristic) contentType = 'task';
    console.log('Final classification:', contentType);

    // Handle based on content type
    if (contentType === 'diary') {
      // Create diary entry instead of idea
      const { data: diaryEntry, error: diaryError } = await supabase
        .from('diary_entries')
        .insert({
          user_id: authenticatedUserId,
          title: parsedData.title || `Entrada del ${new Date().toLocaleDateString('es-ES')}`,
          content: transcription,
          summary: parsedData.summary || null,
          mood: mapMoodToValid(parsedData.mood),
          entry_date: new Date().toISOString().split('T')[0],
          tags: parsedData.tags || [],
          related_people: parsedData.related_people || [],
        })
        .select()
        .single();

      if (diaryError) {
        console.error('Diary insert error:', diaryError);
        throw new Error('Failed to create diary entry');
      }

      // Delete the placeholder idea
      await supabase.from('ideas').delete().eq('id', ideaId);

      // Increment usage
      await supabase.rpc('increment_user_usage', { p_user_id: authenticatedUserId });

      console.log('Voice diary entry created:', diaryEntry.id);

      return new Response(
        JSON.stringify({ success: true, type: 'diary', entry: diaryEntry, id: diaryEntry.id, transcription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (contentType === 'task') {
      // Determine task list ID
      // Priority: AI detected list > heuristic detected list name > null (inbox)
      let taskListId: string | null = parsedData.task_list_id || null;
      
      // If AI didn't detect a list but we have a mentioned list name from heuristic, try to match it
      if (!taskListId && mentionedListName && userTaskLists && userTaskLists.length > 0) {
        const mentionedLower = mentionedListName.toLowerCase();
        const matchedList = userTaskLists.find(l => 
          l.name.toLowerCase().includes(mentionedLower) || 
          mentionedLower.includes(l.name.toLowerCase())
        );
        if (matchedList) {
          taskListId = matchedList.id;
          console.log('Matched task list from heuristic:', matchedList.name);
        }
      }
      
      console.log('Creating task with list_id:', taskListId || 'inbox (null)');
      
      // Create task instead of idea
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: authenticatedUserId,
          title: parsedData.title || transcription.substring(0, 100),
          description: transcription,
          priority: parsedData.priority || 'medium',
          status: 'todo',
          list_id: taskListId, // null = inbox
        })
        .select()
        .single();

      if (taskError) {
        console.error('Task insert error:', taskError);
        throw new Error('Failed to create task');
      }

      // Delete the placeholder idea
      await supabase.from('ideas').delete().eq('id', ideaId);

      // Increment usage
      await supabase.rpc('increment_user_usage', { p_user_id: authenticatedUserId });

      console.log('Voice task created:', task.id);

      return new Response(
        JSON.stringify({ success: true, type: 'task', task, id: task.id, list_id: taskListId, transcription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-match project if AI suggested one or find best match
    let matchedProjectId = parsedData.project_id || null;
    
    if (!matchedProjectId && userProjects && userProjects.length > 0) {
      const ideaTags = parsedData.tags || [];
      const contentLower = `${parsedData.title || ''} ${transcription}`.toLowerCase();
      
      for (const project of userProjects) {
        const projectTags = (project.tags || []).map((t: string) => t.toLowerCase());
        const keywords = (project.keywords || []).map((k: string) => k.toLowerCase());
        
        const tagMatch = ideaTags.some((t: string) => projectTags.includes(t.toLowerCase()));
        const keywordMatch = keywords.some((k: string) => contentLower.includes(k));
        const titleMatch = contentLower.includes(project.title.toLowerCase());
        
        if (tagMatch || keywordMatch || titleMatch) {
          matchedProjectId = project.id;
          console.log('Auto-matched to project:', project.title);
          break;
        }
      }
    }

    // Update the existing idea with transcription and analysis (for type 'idea' or 'person')
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
        project_id: matchedProjectId,
        sparky_take: parsedData.sparky_take || null,
        metadata: { source: 'voice', processed: true, whisper_model: 'whisper-1' }
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update idea');
    }

    // Increment usage
    await supabase.rpc('increment_user_usage', { p_user_id: authenticatedUserId });

    console.log('Voice idea processed successfully:', updatedIdea.id);

    return new Response(
      JSON.stringify({ success: true, type: 'idea', idea: updatedIdea, id: updatedIdea.id, transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-voice-capture:', error);
    
    // Mensaje más amigable para el usuario
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el audio';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
