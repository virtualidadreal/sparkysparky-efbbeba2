-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption/decryption functions
CREATE OR REPLACE FUNCTION encrypt_text(plain_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  IF plain_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the encryption key from Vault
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'DATABASE_ENCRYPTION_KEY'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(plain_text, encryption_key),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_text(encrypted_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  IF encrypted_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the encryption key from Vault
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'DATABASE_ENCRYPTION_KEY'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;
  
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return original text if decryption fails (for backwards compatibility with unencrypted data)
    RETURN encrypted_text;
END;
$$;

-- Create trigger function to encrypt ideas
CREATE OR REPLACE FUNCTION encrypt_idea_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only encrypt if the field has changed and is not already encrypted
  IF NEW.title IS NOT NULL AND NEW.title != '' THEN
    NEW.title := encrypt_text(NEW.title);
  END IF;
  
  IF NEW.description IS NOT NULL AND NEW.description != '' THEN
    NEW.description := encrypt_text(NEW.description);
  END IF;
  
  IF NEW.original_content IS NOT NULL AND NEW.original_content != '' THEN
    NEW.original_content := encrypt_text(NEW.original_content);
  END IF;
  
  IF NEW.improved_content IS NOT NULL AND NEW.improved_content != '' THEN
    NEW.improved_content := encrypt_text(NEW.improved_content);
  END IF;
  
  IF NEW.transcription IS NOT NULL AND NEW.transcription != '' THEN
    NEW.transcription := encrypt_text(NEW.transcription);
  END IF;
  
  IF NEW.sparky_take IS NOT NULL AND NEW.sparky_take != '' THEN
    NEW.sparky_take := encrypt_text(NEW.sparky_take);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to encrypt diary entries
CREATE OR REPLACE FUNCTION encrypt_diary_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.title IS NOT NULL AND NEW.title != '' THEN
    NEW.title := encrypt_text(NEW.title);
  END IF;
  
  IF NEW.content IS NOT NULL AND NEW.content != '' THEN
    NEW.content := encrypt_text(NEW.content);
  END IF;
  
  IF NEW.summary IS NOT NULL AND NEW.summary != '' THEN
    NEW.summary := encrypt_text(NEW.summary);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to encrypt sparky messages
CREATE OR REPLACE FUNCTION encrypt_message_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.content IS NOT NULL AND NEW.content != '' THEN
    NEW.content := encrypt_text(NEW.content);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for encryption on INSERT and UPDATE
CREATE TRIGGER encrypt_ideas_trigger
  BEFORE INSERT OR UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_idea_fields();

CREATE TRIGGER encrypt_diary_trigger
  BEFORE INSERT OR UPDATE ON diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_diary_fields();

CREATE TRIGGER encrypt_messages_trigger
  BEFORE INSERT OR UPDATE ON sparky_messages
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_message_fields();

-- Create views for decrypted data access
CREATE OR REPLACE VIEW ideas_decrypted AS
SELECT 
  id,
  user_id,
  decrypt_text(title) as title,
  decrypt_text(description) as description,
  category,
  priority,
  status,
  decrypt_text(original_content) as original_content,
  decrypt_text(improved_content) as improved_content,
  summary,
  audio_url,
  decrypt_text(transcription) as transcription,
  tags,
  related_people,
  suggested_improvements,
  next_steps,
  metadata,
  project_id,
  decrypt_text(sparky_take) as sparky_take,
  sentiment,
  detected_emotions,
  created_at,
  updated_at
FROM ideas;

CREATE OR REPLACE VIEW diary_entries_decrypted AS
SELECT 
  id,
  user_id,
  entry_date,
  decrypt_text(title) as title,
  decrypt_text(content) as content,
  mood,
  decrypt_text(summary) as summary,
  tags,
  related_people,
  sentiment,
  detected_emotions,
  created_at,
  updated_at
FROM diary_entries;

CREATE OR REPLACE VIEW sparky_messages_decrypted AS
SELECT 
  id,
  user_id,
  role,
  decrypt_text(content) as content,
  brain,
  created_at
FROM sparky_messages;

-- Grant access to views
GRANT SELECT ON ideas_decrypted TO authenticated;
GRANT SELECT ON diary_entries_decrypted TO authenticated;
GRANT SELECT ON sparky_messages_decrypted TO authenticated;

-- Enable RLS on views
ALTER VIEW ideas_decrypted SET (security_invoker = on);
ALTER VIEW diary_entries_decrypted SET (security_invoker = on);
ALTER VIEW sparky_messages_decrypted SET (security_invoker = on);