import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ error: 'Text and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing and classifying text for user:', userId);

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
    const systemPrompt = promptData?.prompt || `Eres Sparky, un asistente inteligente que clasifica contenido.
Clasifica el texto como: idea, task, diary, o person.`;

    // Get user's projects for auto-matching
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id, title, tags, keywords')
      .eq('user_id', userId)
      .eq('status', 'active');

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
                title: { type: "string", description: "Título breve (máx 100 chars)" },
                summary: { type: "string", description: "Resumen del contenido" },
                content: { type: "string", description: "Contenido completo (para diary)" },
                description: { type: "string", description: "Descripción (para task)" },
                category: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                mood: { type: "string", enum: ["happy", "sad", "neutral", "excited", "anxious", "calm", "angry", "grateful"] },
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
          { role: 'user', content: text }
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
      const textLower = text.toLowerCase();
      const diaryKeywords = ['hoy', 'hoy está', 'hoy ha sido', 'me siento', 'mi día', 'esta mañana', 'esta noche', 'diario'];
      const isDiary = diaryKeywords.some(kw => textLower.includes(kw));
      
      if (isDiary) {
        classification = {
          type: 'diary',
          confidence: 0.6,
          data: {
            title: `Entrada del ${new Date().toLocaleDateString('es-ES')}`,
            content: text,
            mood: 'neutral'
          }
        };
        console.log('Heuristic fallback: classified as diary');
      } else {
        classification = {
          type: 'idea',
          confidence: 0.5,
          data: {
            title: text.substring(0, 50),
            summary: text.substring(0, 200),
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
            text
          );
        }
        
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: classification.data.title || text.substring(0, 100),
            description: classification.data.description || text,
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
            content: classification.data.content || text,
            mood: classification.data.mood || 'neutral',
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
            notes: classification.data.notes || text,
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
        
        // Auto-match idea to project based on tags and keywords
        if (userProjects && userProjects.length > 0) {
          matchedProjectId = findMatchingProject(
            userProjects as Project[],
            ideaTags,
            classification.data.title || '',
            text
          );
          
          if (matchedProjectId) {
            console.log('Auto-matched idea to project:', matchedProjectId);
          }
        }
        
        const { data: idea, error: ideaError } = await supabase
          .from('ideas')
          .insert({
            user_id: userId,
            title: classification.data.title || text.substring(0, 50),
            description: text,
            original_content: text,
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
            metadata: {}
          })
          .select()
          .single();
        
        if (ideaError) throw ideaError;
        savedRecord = idea;
        console.log('Idea saved successfully:', idea.id, 'Project:', matchedProjectId);
        break;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        type: classification.type,
        confidence: classification.confidence,
        record: savedRecord,
        table: tableName,
        matchedProjectId
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
