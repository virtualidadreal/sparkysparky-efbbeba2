-- Add summary, tags, and related_people columns to diary_entries
ALTER TABLE public.diary_entries
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_people text[] DEFAULT '{}';