-- Create trigger function to encrypt sensitive fields in people table
CREATE OR REPLACE FUNCTION public.encrypt_people_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.email := encrypt_text(NEW.email);
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    NEW.phone := encrypt_text(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to encrypt on insert
CREATE TRIGGER encrypt_people_on_insert
  BEFORE INSERT ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_people_fields();

-- Create trigger to encrypt on update (only if fields changed)
CREATE OR REPLACE FUNCTION public.encrypt_people_fields_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only encrypt if email changed and is not already encrypted
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.email := encrypt_text(NEW.email);
  END IF;
  
  -- Only encrypt if phone changed and is not already encrypted
  IF NEW.phone IS DISTINCT FROM OLD.phone AND NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    NEW.phone := encrypt_text(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER encrypt_people_on_update
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_people_fields_on_update();

-- Create secure decrypted view with security_invoker to respect RLS
CREATE OR REPLACE VIEW public.people_decrypted
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  full_name,
  nickname,
  decrypt_text(email) as email,
  decrypt_text(phone) as phone,
  category,
  notes,
  company,
  role,
  how_we_met,
  last_contact_date,
  created_at,
  updated_at
FROM public.people;