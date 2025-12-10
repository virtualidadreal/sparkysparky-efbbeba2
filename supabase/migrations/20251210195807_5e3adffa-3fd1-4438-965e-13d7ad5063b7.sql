-- Actualizar tabla ideas con columnas para procesamiento de IA

-- Contenido original y procesado
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS original_content text;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS improved_content text;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS summary text;

-- Audio y transcripción
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS transcription text;

-- Tags y categorización
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Sugerencias de IA (JSON)
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS suggested_improvements jsonb DEFAULT '[]';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS next_steps jsonb DEFAULT '[]';

-- Relaciones
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS related_people text[] DEFAULT '{}';

-- Análisis emocional
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative'));
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS detected_emotions text[] DEFAULT '{}';

-- Metadata flexible
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Actualizar status para incluir 'converted'
ALTER TABLE public.ideas DROP CONSTRAINT IF EXISTS ideas_status_check;
ALTER TABLE public.ideas ADD CONSTRAINT ideas_status_check 
  CHECK (status IN ('draft', 'active', 'archived', 'converted'));

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON public.ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ideas_sentiment ON public.ideas(sentiment);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(status);

-- Trigger para updated_at (si no existe)
DROP TRIGGER IF EXISTS update_ideas_updated_at ON public.ideas;
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();