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

    console.log('Processing and classifying text for user:', userId);

    // Process with AI to classify and extract insights
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Eres Sparky, un asistente inteligente que clasifica y analiza contenido del usuario. Tu trabajo es:

1. CLASIFICAR el tipo de contenido entre:
   - "idea": pensamientos, conceptos, proyectos, reflexiones, inspiraciones
   - "task": tareas pendientes, cosas por hacer, recordatorios de acciones
   - "diary": entradas de diario, reflexiones personales del día, cómo se siente el usuario
   - "person": información sobre una persona (nuevo contacto, datos de alguien)

2. EXTRAER información estructurada según el tipo.

Responde SOLO con un JSON válido con esta estructura:

{
  "type": "idea|task|diary|person",
  "confidence": 0.0-1.0,
  "data": {
    // Para IDEA:
    "title": "título breve (máx 50 chars)",
    "summary": "resumen (máx 200 chars)",
    "category": "personal|trabajo|proyecto|aprendizaje|salud|finanzas|relaciones|creatividad|general",
    "priority": "low|medium|high",
    "sentiment": "positive|neutral|negative",
    "detected_emotions": ["emociones"],
    "related_people": ["nombres mencionados"],
    "suggested_improvements": ["sugerencias"],
    "next_steps": ["pasos a seguir"],
    "tags": ["etiquetas"]
    
    // Para TASK:
    "title": "título de la tarea (máx 100 chars)",
    "description": "descripción detallada",
    "priority": "low|medium|high",
    "due_date": "YYYY-MM-DD si se menciona, null si no",
    "project_name": "nombre del proyecto si aplica"
    
    // Para DIARY:
    "title": "título del día (máx 100 chars)",
    "content": "contenido completo",
    "mood": "happy|sad|neutral|excited|anxious|calm|angry|grateful"
    
    // Para PERSON:
    "full_name": "nombre completo",
    "nickname": "apodo si lo hay",
    "email": "email si se menciona",
    "phone": "teléfono si se menciona",
    "company": "empresa",
    "role": "cargo/rol",
    "how_we_met": "cómo se conocieron",
    "category": "friend|family|colleague|client|other",
    "notes": "notas adicionales"
  }
}

EJEMPLOS:
- "Tengo que llamar a Juan mañana" → task
- "Hoy fue un día increíble, me siento muy feliz" → diary
- "Se me ocurrió una app para..." → idea
- "Conocí a María García, trabaja en Google como PM" → person
- "Recordatorio: comprar leche" → task
- "Me pregunto si sería buena idea aprender piano" → idea`
          },
          {
            role: 'user',
            content: text
          }
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
    
    console.log('AI classification response:', aiContent.substring(0, 200));

    // Parse AI response
    let classification: ClassificationResult;
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
      classification = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to idea
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

    // Save to database based on classification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let savedRecord: any;
    let tableName: string;

    switch (classification.type) {
      case 'task':
        tableName = 'tasks';
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: classification.data.title || text.substring(0, 100),
            description: classification.data.description || text,
            priority: classification.data.priority || 'medium',
            due_date: classification.data.due_date || null,
            status: 'todo',
          })
          .select()
          .single();
        
        if (taskError) throw taskError;
        savedRecord = task;
        console.log('Task saved successfully:', task.id);
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
            tags: classification.data.tags || [],
            metadata: {}
          })
          .select()
          .single();
        
        if (ideaError) throw ideaError;
        savedRecord = idea;
        console.log('Idea saved successfully:', idea.id);
        break;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        type: classification.type,
        confidence: classification.confidence,
        record: savedRecord,
        table: tableName
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
