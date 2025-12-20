-- Añadir campo sparky_take a la tabla ideas
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS sparky_take text;