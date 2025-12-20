import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_TEXT_LENGTH = 10000;
const MIN_TEXT_LENGTH = 1;

// Validation functions
function validateTextInput(text: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Text must be a string' };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { valid: false, error: 'Text cannot be empty' };
  }
  
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` };
  }
  
  return { valid: true, sanitized: trimmed };
}

// Map AI mood responses to valid database values
function mapMoodToValid(mood: string | undefined): string {
  const validMoods = ['great', 'good', 'neutral', 'bad', 'terrible'];
  if (mood && validMoods.includes(mood)) {
    return mood;
  }
  
  // Map common AI responses to valid values
  const moodMap: Record<string, string> = {
    'happy': 'great',
    'excited': 'great',
    'grateful': 'great',
    'calm': 'good',
    'sad': 'bad',
    'anxious': 'bad',
    'angry': 'terrible',
  };
  
  return moodMap[mood || ''] || 'neutral';
}

type ContentType = 'idea' | 'task' | 'diary' | 'person';

interface ClassificationResult {
  type: ContentType;
  confidence: number;
  data: Record<string, any>;
}

interface Project {
  id: string;
  title: string;
  tags: string[];
  keywords: string[];
}

// Function to find matching project based on tags and keywords
function findMatchingProject(
  projects: Project[],
  ideaTags: string[],
  ideaTitle: string,
  ideaContent: string
): string | null {
  if (!projects || projects.length === 0) return null;
  
  const contentLower = `${ideaTitle} ${ideaContent}`.toLowerCase();
  
  let bestMatch: { projectId: string; score: number } | null = null;
  
  for (const project of projects) {
    let score = 0;
    
    // Score by matching tags
    const projectTags = (project.tags || []).map(t => t.toLowerCase());
    const matchingTags = ideaTags.filter(t => projectTags.includes(t.toLowerCase()));
    score += matchingTags.length * 10;
    
    // Score by matching keywords in content
    const keywords = (project.keywords || []).map(k => k.toLowerCase());
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        score += 5;
      }
    }
    
    // Score by project title appearing in content
    if (contentLower.includes(project.title.toLowerCase())) {
      score += 15;
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { projectId: project.id, score };
    }
  }
  
  return bestMatch?.projectId || null;
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

    // Parse request body with size check
    let requestBody;
    try {
      const bodyText = await req.text();
      if (bodyText.length > 50000) { // ~50KB max request size
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

    // Only accept text from request body (userId comes from JWT)
    const { text } = requestBody;

    // Validate and sanitize text input
    const textValidation = validateTextInput(text);
    if (!textValidation.valid) {
      return new Response(
        JSON.stringify({ error: textValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedText = textValidation.sanitized!;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('CRITICAL: LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user quota before processing
    const { data: quotaData, error: quotaError } = await supabase.rpc('check_user_quota', {
      p_user_id: userId
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

    console.log('Processing and classifying text for authenticated user:', userId);

    // Get the system prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('system_prompts')
      .select('prompt')
      .eq('key', 'text_classification')
      .eq('is_active', true)
      .single();

    if (promptError) {
      console.error('Error fetching system prompt:', promptError);
    }

    // Fallback prompt if not found in DB
    const basePrompt = promptData?.prompt || `Eres Sparky, un asistente inteligente que clasifica contenido.
Clasifica el texto como: idea, task, diary, o person.`;

    // Get user's projects and recent ideas for context
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id, title, tags, keywords')
      .eq('user_id', userId)
      .eq('status', 'active');

    const { data: recentIdeas } = await supabase
      .from('ideas')
      .select('id, title, tags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build context for AI
    const projectsList = userProjects?.map(p => `- ${p.title} (ID: ${p.id}, tags: ${(p.tags || []).join(', ')})`).join('\n') || 'Ninguno';
    const recentIdeasList = recentIdeas?.map(i => `- ${i.title}`).join('\n') || 'Ninguna';

    const systemPrompt = `${basePrompt}

CONTEXTO DEL USUARIO:
Proyectos activos:
${projectsList}

Ideas recientes:
${recentIdeasList}

INSTRUCCIONES PARA IDEAS:
- Genera un título de 5-8 palabras, específico y descriptivo
- El summary debe capturar QUÉ quiere hacer Y POR QUÉ en 2-3 frases
- sparky_take: 1-2 frases con tu comentario (conexión, pregunta, patrón o siguiente paso). Nunca halagos vacíos.
- project_id: asigna un ID de proyecto si hay match claro (>80%), sino null`;

    // Use tool calling for structured output
    const classificationTool = {
      type: "function",
      function: {
        name: "classify_content",
        description: "Clasifica el contenido del usuario en una de las categorías disponibles",
        parameters: {
          type: "object",
          properties: {
            type: { 
              type: "string", 
              enum: ["idea", "task", "diary", "person"],
              description: "Tipo de contenido. IMPORTANTE: usa 'diary' para experiencias del día, emociones actuales, reflexiones personales del momento, o cuando mencione 'diario'"
            },
            confidence: { type: "number", description: "Confianza de 0 a 1" },
            data: {
              type: "object",
              properties: {
                title: { type: "string", description: "Título de 5-8 palabras, específico y descriptivo" },
                summary: { type: "string", description: "2-3 frases en prosa: QUÉ quiere hacer y POR QUÉ. No bullets." },
                sparky_take: { type: "string", description: "1-2 frases: conexión, pregunta retadora, patrón detectado, o siguiente paso. Nunca halagos vacíos." },
                project_id: { type: "string", description: "ID del proyecto si hay match claro (>80%)" },
                content: { type: "string", description: "Contenido completo (para diary)" },
                description: { type: "string", description: "Descripción (para task)" },
                category: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                mood: { type: "string", enum: ["great", "good", "neutral", "bad", "terrible"], description: "Estado de ánimo" },
                sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                detected_emotions: { type: "array", items: { type: "string" } },
                related_people: { type: "array", items: { type: "string" } },
                suggested_improvements: { type: "array", items: { type: "string" } },
                next_steps: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } },
                due_date: { type: "string", description: "Fecha YYYY-MM-DD si aplica" },
                full_name: { type: "string" },
                nickname: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                company: { type: "string" },
                role: { type: "string" },
                how_we_met: { type: "string" },
                notes: { type: "string" }
              },
              required: ["title"]
            }
          },
          required: ["type", "confidence", "data"]
        }
      }
    };

    // Process with AI to classify using tool calling
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
          { role: 'user', content: sanitizedText }
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
    
    // Parse tool call response
    let classification: ClassificationResult;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        classification = JSON.parse(toolCall.function.arguments);
        console.log('AI classification via tool call:', classification.type, 'confidence:', classification.confidence);
      } else {
        // Fallback: try to parse from content (legacy format)
        const aiContent = aiData.choices?.[0]?.message?.content || '';
        console.log('Fallback to content parsing:', aiContent.substring(0, 200));
        
        let cleanContent = aiContent.trim();
        if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
        if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
        if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
        classification = JSON.parse(cleanContent.trim());
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', JSON.stringify(aiData).substring(0, 500));
      
      // Heuristic fallback: detect diary entries by keywords
      const textLower = sanitizedText.toLowerCase();
      const diaryKeywords = ['hoy', 'hoy está', 'hoy ha sido', 'me siento', 'mi día', 'esta mañana', 'esta noche', 'diario'];
      const isDiary = diaryKeywords.some(kw => textLower.includes(kw));
      
      if (isDiary) {
        // Heuristic mood detection
        const positiveWords = ['increíble', 'genial', 'fantástico', 'feliz', 'contento', 'bien', 'excelente'];
        const negativeWords = ['mal', 'triste', 'terrible', 'horrible', 'fatal', 'agotado'];
        const hasPositive = positiveWords.some(w => textLower.includes(w));
        const hasNegative = negativeWords.some(w => textLower.includes(w));
        const heuristicMood = hasPositive ? 'great' : (hasNegative ? 'bad' : 'neutral');
        
        classification = {
          type: 'diary',
          confidence: 0.6,
          data: {
            title: `Entrada del ${new Date().toLocaleDateString('es-ES')}`,
            content: sanitizedText,
            mood: heuristicMood
          }
        };
        console.log('Heuristic fallback: classified as diary');
      } else {
        classification = {
          type: 'idea',
          confidence: 0.5,
          data: {
            title: sanitizedText.substring(0, 50),
            summary: sanitizedText.substring(0, 200),
            category: 'general',
            priority: 'medium',
            sentiment: 'neutral',
            detected_emotions: [],
            related_people: [],
            suggested_improvements: [],
            next_steps: [],
            tags: []
          }
        };
      }
    }

    let savedRecord: any;
    let tableName: string;
    let matchedProjectId: string | null = null;

    switch (classification.type) {
      case 'task':
        tableName = 'tasks';
        
        // Try to match task to a project
        if (userProjects && userProjects.length > 0) {
          matchedProjectId = findMatchingProject(
            userProjects as Project[],
            [],
            classification.data.title || '',
            sanitizedText
          );
        }
        
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: classification.data.title || sanitizedText.substring(0, 100),
            description: classification.data.description || sanitizedText,
            priority: classification.data.priority || 'medium',
            due_date: classification.data.due_date || null,
            status: 'todo',
            project_id: matchedProjectId,
          })
          .select()
          .single();
        
        if (taskError) throw taskError;
        savedRecord = task;
        console.log('Task saved successfully:', task.id, 'Project:', matchedProjectId);
        break;

      case 'diary':
        tableName = 'diary_entries';
        const { data: diary, error: diaryError } = await supabase
          .from('diary_entries')
          .insert({
            user_id: userId,
            title: classification.data.title || `Entrada del ${new Date().toLocaleDateString('es-ES')}`,
            content: classification.data.content || sanitizedText,
            // Map AI mood to valid database values
            mood: mapMoodToValid(classification.data.mood),
            entry_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();
        
        if (diaryError) throw diaryError;
        savedRecord = diary;
        console.log('Diary entry saved successfully:', diary.id);
        break;

      case 'person':
        tableName = 'people';
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            user_id: userId,
            full_name: classification.data.full_name || 'Contacto sin nombre',
            nickname: classification.data.nickname || null,
            email: classification.data.email || null,
            phone: classification.data.phone || null,
            company: classification.data.company || null,
            role: classification.data.role || null,
            how_we_met: classification.data.how_we_met || null,
            category: classification.data.category || 'other',
            notes: classification.data.notes || sanitizedText,
          })
          .select()
          .single();
        
        if (personError) throw personError;
        savedRecord = person;
        console.log('Person saved successfully:', person.id);
        break;

      case 'idea':
      default:
        tableName = 'ideas';
        const ideaTags = classification.data.tags || [];
        
        // Use project_id from AI if provided, otherwise auto-match
        matchedProjectId = classification.data.project_id || null;
        
        if (!matchedProjectId && userProjects && userProjects.length > 0) {
          matchedProjectId = findMatchingProject(
            userProjects as Project[],
            ideaTags,
            classification.data.title || '',
            sanitizedText
          );
          
          if (matchedProjectId) {
            console.log('Auto-matched idea to project:', matchedProjectId);
          }
        }
        
        const { data: idea, error: ideaError } = await supabase
          .from('ideas')
          .insert({
            user_id: userId,
            title: classification.data.title || sanitizedText.substring(0, 50),
            description: sanitizedText,
            original_content: sanitizedText,
            improved_content: classification.data.summary,
            summary: classification.data.summary,
            category: classification.data.category || 'general',
            priority: classification.data.priority || 'medium',
            status: 'active',
            sentiment: classification.data.sentiment,
            detected_emotions: classification.data.detected_emotions || [],
            related_people: classification.data.related_people || [],
            suggested_improvements: classification.data.suggested_improvements || [],
            next_steps: classification.data.next_steps || [],
            tags: ideaTags,
            project_id: matchedProjectId,
            sparky_take: classification.data.sparky_take || null,
            metadata: {}
          })
          .select()
          .single();
        
        if (ideaError) throw ideaError;
        savedRecord = idea;
        console.log('Idea saved successfully:', idea.id, 'Project:', matchedProjectId);
        
        // === PROJECT SUGGESTION LOGIC ===
        // Check for related ideas and suggest creating a project
        let projectSuggestion = null;
        
        if (!matchedProjectId && ideaTags.length > 0) {
          // Get other ideas with similar tags
          const { data: relatedIdeas } = await supabase
            .from('ideas')
            .select('id, title, tags, created_at')
            .eq('user_id', userId)
            .neq('id', idea.id)
            .is('project_id', null)
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (relatedIdeas && relatedIdeas.length > 0) {
            // Find ideas with matching tags
            const matchingIdeas = relatedIdeas.filter((relatedIdea: any) => {
              const relatedTags = (relatedIdea.tags || []).map((t: string) => t.toLowerCase());
              return ideaTags.some((tag: string) => relatedTags.includes(tag.toLowerCase()));
            });
            
            if (matchingIdeas.length >= 1) { // 2+ ideas total (including current one)
              // Determine topic from most common tag
              const tagCounts: Record<string, number> = {};
              for (const tag of ideaTags) {
                tagCounts[tag.toLowerCase()] = (tagCounts[tag.toLowerCase()] || 0) + 1;
              }
              for (const relatedIdea of matchingIdeas) {
                for (const tag of (relatedIdea.tags || [])) {
                  tagCounts[tag.toLowerCase()] = (tagCounts[tag.toLowerCase()] || 0) + 1;
                }
              }
              
              const topTopic = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || ideaTags[0]?.toLowerCase() || 'general';
              
              // Check if we already have a suggestion for this topic
              const { data: existingSuggestion } = await supabase
                .from('project_suggestions')
                .select('*')
                .eq('user_id', userId)
                .eq('topic', topTopic)
                .single();
              
              if (existingSuggestion) {
                // Update existing suggestion
                if (existingSuggestion.status !== 'dismissed_forever' && existingSuggestion.status !== 'accepted') {
                  const newIdeaIds = [...new Set([...existingSuggestion.idea_ids, idea.id, ...matchingIdeas.map((i: any) => i.id)])];
                  const newCount = existingSuggestion.suggestion_count + 1;
                  
                  await supabase
                    .from('project_suggestions')
                    .update({ 
                      idea_ids: newIdeaIds,
                      suggestion_count: newCount,
                      status: 'pending'
                    })
                    .eq('id', existingSuggestion.id);
                  
                  // Only show suggestion if not dismissed forever and we have 2+ ideas
                  if (newIdeaIds.length >= 2) {
                    projectSuggestion = {
                      id: existingSuggestion.id,
                      topic: topTopic,
                      ideaCount: newIdeaIds.length,
                      suggestionCount: newCount,
                      canDismissForever: newCount >= 3
                    };
                  }
                }
              } else {
                // Create new suggestion
                const allIdeaIds = [idea.id, ...matchingIdeas.map((i: any) => i.id)];
                
                if (allIdeaIds.length >= 2) {
                  const { data: newSuggestion } = await supabase
                    .from('project_suggestions')
                    .insert({
                      user_id: userId,
                      topic: topTopic,
                      idea_ids: allIdeaIds,
                      suggestion_count: 1,
                      status: 'pending'
                    })
                    .select()
                    .single();
                  
                  if (newSuggestion) {
                    projectSuggestion = {
                      id: newSuggestion.id,
                      topic: topTopic,
                      ideaCount: allIdeaIds.length,
                      suggestionCount: 1,
                      canDismissForever: false
                    };
                  }
                }
              }
            }
          }
        }
        
        // Store project suggestion in savedRecord for response
        if (projectSuggestion) {
          savedRecord.projectSuggestion = projectSuggestion;
        }
        break;
    }

    // Increment usage after successful generation
    await supabase.rpc('increment_user_usage', { p_user_id: userId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        type: classification.type,
        confidence: classification.confidence,
        record: savedRecord,
        table: tableName,
        matchedProjectId,
        projectSuggestion: savedRecord?.projectSuggestion || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-text-capture:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
