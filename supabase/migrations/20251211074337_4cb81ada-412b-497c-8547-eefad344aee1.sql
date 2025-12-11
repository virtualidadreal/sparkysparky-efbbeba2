-- Add AI configuration columns to system_prompts table
ALTER TABLE public.system_prompts
ADD COLUMN IF NOT EXISTS model text DEFAULT 'google/gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS temperature numeric DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS max_tokens integer DEFAULT 2048;

-- Create global admin settings table
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can view settings"
ON public.admin_settings FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert settings"
ON public.admin_settings FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update settings"
ON public.admin_settings FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete settings"
ON public.admin_settings FOR DELETE
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global settings
INSERT INTO public.admin_settings (key, name, description, category, value) VALUES
('pattern_analysis_frequency', 'Frecuencia de análisis de patrones', 'Cada cuántas horas se ejecuta el análisis automático', 'analysis', '{"hours": 24}'::jsonb),
('memory_retention_days', 'Días de retención de memoria', 'Cuántos días mantener las memorias activas', 'memory', '{"days": 90}'::jsonb),
('max_active_memories', 'Máximo de memorias activas', 'Número máximo de memorias activas por usuario', 'memory', '{"count": 100}'::jsonb),
('morning_briefing_hour', 'Hora del briefing matutino', 'Hora a la que se genera el briefing (0-23)', 'notifications', '{"hour": 8}'::jsonb),
('summary_frequency', 'Frecuencia de resúmenes', 'Con qué frecuencia generar resúmenes automáticos', 'summaries', '{"type": "weekly"}'::jsonb),
('proactive_insights_enabled', 'Insights proactivos habilitados', 'Activar o desactivar insights proactivos automáticos', 'analysis', '{"enabled": true}'::jsonb),
('context_window_days', 'Días de contexto', 'Cuántos días de historial incluir en el contexto de IA', 'ai', '{"days": 30}'::jsonb);