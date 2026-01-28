-- Disable the update trigger temporarily
DROP TRIGGER IF EXISTS encrypt_people_on_update ON public.people;

-- Fix double-encrypted data by decrypting and re-encrypting correctly
-- First, let's recreate the trigger with proper logic to detect if already encrypted
CREATE OR REPLACE FUNCTION public.encrypt_people_fields_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only encrypt if email changed from old value AND is not empty
  -- The new value from application should be plain text
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL AND NEW.email != '' THEN
    -- Check if it looks like base64 encrypted data (starts with 'w' for pgp_sym_encrypt)
    IF NEW.email NOT LIKE 'ww0%' THEN
      NEW.email := encrypt_text(NEW.email);
    END IF;
  END IF;
  
  IF NEW.phone IS DISTINCT FROM OLD.phone AND NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone NOT LIKE 'ww0%' THEN
      NEW.phone := encrypt_text(NEW.phone);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also update insert function to check for already encrypted data
CREATE OR REPLACE FUNCTION public.encrypt_people_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.email NOT LIKE 'ww0%' THEN
    NEW.email := encrypt_text(NEW.email);
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' AND NEW.phone NOT LIKE 'ww0%' THEN
    NEW.phone := encrypt_text(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Re-create the update trigger
CREATE TRIGGER encrypt_people_on_update
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_people_fields_on_update();