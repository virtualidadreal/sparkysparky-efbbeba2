-- Tabla para memoria longitudinal y contexto del usuario
CREATE TABLE public.memory_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('fact', 'preference', 'pattern', 'insight', 'goal', 'habit')),
  category TEXT,
  content TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('idea', 'diary', 'task', 'project', 'manual', 'ai_detected')),
  source_id UUID,
  confidence DECIMAL(3,2) DEFAULT 1.0,
  last_referenced_at TIMESTAMP WITH TIME ZONE,
  reference_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para superresúmenes periódicos
CREATE TABLE public.summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary_type TEXT NOT NULL CHECK (summary_type IN ('daily', 'weekly', 'monthly', 'topic', 'project')),
  period_start DATE,
  period_end DATE,
  topic TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  key_insights JSONB DEFAULT '[]',
  patterns_detected JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para patrones detectados
CREATE TABLE public.detected_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('recurring_theme', 'behavior', 'productivity', 'emotional', 'goal_progress', 'blocker')),
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '[]',
  occurrences INTEGER DEFAULT 1,
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged', 'dismissed')),
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_memory_entries_user_type ON public.memory_entries(user_id, entry_type);
CREATE INDEX idx_memory_entries_category ON public.memory_entries(user_id, category);
CREATE INDEX idx_summaries_user_type ON public.summaries(user_id, summary_type);
CREATE INDEX idx_summaries_period ON public.summaries(user_id, period_start, period_end);
CREATE INDEX idx_detected_patterns_user ON public.detected_patterns(user_id, pattern_type);

-- RLS para memory_entries
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory entries"
ON public.memory_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory entries"
ON public.memory_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory entries"
ON public.memory_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory entries"
ON public.memory_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS para summaries
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own summaries"
ON public.summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
ON public.summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
ON public.summaries FOR DELETE
USING (auth.uid() = user_id);

-- RLS para detected_patterns
ALTER TABLE public.detected_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patterns"
ON public.detected_patterns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patterns"
ON public.detected_patterns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns"
ON public.detected_patterns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns"
ON public.detected_patterns FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_memory_entries_updated_at
BEFORE UPDATE ON public.memory_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_detected_patterns_updated_at
BEFORE UPDATE ON public.detected_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();