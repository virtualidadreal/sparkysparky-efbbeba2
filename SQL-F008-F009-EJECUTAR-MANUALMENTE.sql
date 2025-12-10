-- ============================================
-- F-008 & F-009: Planificación Diaria + Rutina Matutina
-- EJECUTAR EN: Lovable Cloud → Database → SQL Editor
-- ============================================

-- Tabla daily_plans
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  mits UUID[] DEFAULT '{}',
  time_blocks JSONB DEFAULT '[]'::jsonb,
  meetings JSONB DEFAULT '[]'::jsonb,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  morning_energy_level INTEGER CHECK (morning_energy_level >= 1 AND morning_energy_level <= 5),
  focus_areas TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_status ON public.daily_plans(status);

-- Tabla reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('birthday', 'follow_up', 'deadline', 'reconnect', 'custom')),
  reminder_date DATE NOT NULL,
  related_entity_type TEXT CHECK (related_entity_type IN ('person', 'project', 'task', 'idea')),
  related_entity_id UUID,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON public.reminders(is_completed) WHERE is_completed = false;

-- RLS
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own plans" ON public.daily_plans;
CREATE POLICY "Users manage own plans" ON public.daily_plans FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own reminders" ON public.reminders;
CREATE POLICY "Users manage own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- DESPUÉS DE EJECUTAR: Avisar a Lovable AI
-- Di: "SQL ejecutado para F-008 y F-009"
-- ============================================