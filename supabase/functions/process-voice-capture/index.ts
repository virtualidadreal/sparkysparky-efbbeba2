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
      throw new Error('OPENAI_API_KEY is not configured');
    }
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice capture for idea:', ideaId);

    // Initialize Supabase client with service role for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Fallback prompt if not found in DB
    const systemPrompt = promptData?.prompt || `Eres un asistente que analiza transcripciones de notas de voz.
Responde SOLO con un JSON válido:
{
  "title": "título breve (máx 50 chars)",
  "summary": "resumen (máx 200 chars)",
  "category": "personal|trabajo|proyecto|aprendizaje|salud|finanzas|relaciones|creatividad|general",
  "priority": "low|medium|high",
  "sentiment": "positive|neutral|negative",
  "detected_emotions": [],
  "related_people": [],
  "suggested_improvements": [],
  "next_steps": [],
  "tags": []
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcripción de nota de voz:\n\n${transcription}` }
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
