-- Tabla para almacenar los prompts del sistema de Sparky
CREATE TABLE public.system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

-- Tabla para emails de administradores
CREATE TABLE public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
$$;

-- Políticas para system_prompts: solo admins pueden ver y editar
CREATE POLICY "Admins can view system prompts"
ON public.system_prompts
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update system prompts"
ON public.system_prompts
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert system prompts"
ON public.system_prompts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Políticas para admin_emails: solo admins pueden ver
CREATE POLICY "Admins can view admin emails"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_system_prompts_updated_at
BEFORE UPDATE ON public.system_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar prompts iniciales
INSERT INTO public.system_prompts (key, name, description, prompt) VALUES
('text_classification', 'Clasificación de Contenido', 'Prompt para clasificar texto como idea, tarea, diario o persona', 
'Eres Sparky, un asistente inteligente que clasifica y analiza contenido del usuario. Tu trabajo es:

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
- "Me pregunto si sería buena idea aprender piano" → idea'),

('voice_processing', 'Procesamiento de Voz', 'Prompt para analizar transcripciones de audio',
'Eres Sparky, un asistente que analiza transcripciones de audio. El usuario ha dictado un mensaje de voz.

Analiza la transcripción y extrae información estructurada.

Responde SOLO con un JSON válido:
{
  "title": "título breve de la idea (máx 50 caracteres)",
  "summary": "resumen conciso (máx 200 caracteres)",
  "category": "personal|trabajo|proyecto|aprendizaje|salud|finanzas|relaciones|creatividad|general",
  "priority": "low|medium|high",
  "sentiment": "positive|neutral|negative",
  "detected_emotions": ["array de emociones detectadas"],
  "related_people": ["nombres de personas mencionadas"],
  "suggested_improvements": ["sugerencias para mejorar o desarrollar la idea"],
  "next_steps": ["pasos concretos a seguir"],
  "tags": ["etiquetas relevantes"]
}');