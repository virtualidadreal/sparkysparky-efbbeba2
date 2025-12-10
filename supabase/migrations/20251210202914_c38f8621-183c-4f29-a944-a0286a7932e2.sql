-- Crear tabla people para CRM personal
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  phone TEXT,
  category TEXT DEFAULT 'friend',
  notes TEXT,
  company TEXT,
  role TEXT,
  how_we_met TEXT,
  last_contact_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_people_user_id ON public.people(user_id);
CREATE INDEX idx_people_category ON public.people(category);
CREATE INDEX idx_people_full_name ON public.people(full_name);

-- Habilitar RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own people"
ON public.people FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own people"
ON public.people FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
ON public.people FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
ON public.people FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_people_updated_at
BEFORE UPDATE ON public.people
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();