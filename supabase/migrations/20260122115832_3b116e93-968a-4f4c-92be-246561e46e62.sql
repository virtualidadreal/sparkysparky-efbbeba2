-- Update encrypt_text function to use the correct schema for pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_text(plain_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
    extensions.pgp_sym_encrypt(plain_text, encryption_key),
    'base64'
  );
END;
$function$;

-- Update decrypt_text function to use the correct schema for pgcrypto
CREATE OR REPLACE FUNCTION public.decrypt_text(encrypted_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
  
  RETURN extensions.pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return original text if decryption fails (for backwards compatibility with unencrypted data)
    RETURN encrypted_text;
END;
$function$;