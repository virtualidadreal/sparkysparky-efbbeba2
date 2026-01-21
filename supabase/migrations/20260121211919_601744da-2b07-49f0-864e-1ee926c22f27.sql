-- Recreate views with security_invoker = true so they inherit RLS from base tables

-- 1. Recreate ideas_decrypted view with security invoker
DROP VIEW IF EXISTS public.ideas_decrypted;
CREATE VIEW public.ideas_decrypted 
WITH (security_invoker = true)
AS
SELECT 
    id,
    user_id,
    decrypt_text(title) AS title,
    decrypt_text(description) AS description,
    category,
    priority,
    status,
    decrypt_text(original_content) AS original_content,
    decrypt_text(improved_content) AS improved_content,
    summary,
    audio_url,
    decrypt_text(transcription) AS transcription,
    tags,
    related_people,
    suggested_improvements,
    next_steps,
    metadata,
    project_id,
    decrypt_text(sparky_take) AS sparky_take,
    sentiment,
    detected_emotions,
    created_at,
    updated_at
FROM ideas;

-- 2. Recreate diary_entries_decrypted view with security invoker
DROP VIEW IF EXISTS public.diary_entries_decrypted;
CREATE VIEW public.diary_entries_decrypted
WITH (security_invoker = true)
AS
SELECT 
    id,
    user_id,
    entry_date,
    decrypt_text(title) AS title,
    decrypt_text(content) AS content,
    mood,
    decrypt_text(summary) AS summary,
    tags,
    related_people,
    sentiment,
    detected_emotions,
    created_at,
    updated_at
FROM diary_entries;

-- 3. Recreate sparky_messages_decrypted view with security invoker
DROP VIEW IF EXISTS public.sparky_messages_decrypted;
CREATE VIEW public.sparky_messages_decrypted
WITH (security_invoker = true)
AS
SELECT 
    id,
    user_id,
    role,
    decrypt_text(content) AS content,
    brain,
    created_at
FROM sparky_messages;