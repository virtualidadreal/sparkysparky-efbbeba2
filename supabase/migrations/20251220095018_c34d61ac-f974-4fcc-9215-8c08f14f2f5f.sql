-- Add emotional analysis columns to diary_entries
ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS detected_emotions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sentiment TEXT DEFAULT NULL;