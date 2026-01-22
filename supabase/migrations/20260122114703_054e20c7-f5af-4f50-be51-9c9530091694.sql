-- Update the handle_new_user function to properly extract name from Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_display_name TEXT;
BEGIN
  -- Priority order for display name:
  -- 1. display_name (if explicitly set)
  -- 2. full_name (from Google OAuth)
  -- 3. name (alternative OAuth field)
  -- 4. first_name + last_name (if separate)
  -- 5. email (fallback)
  user_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NULLIF(
      CONCAT_WS(' ', 
        NEW.raw_user_meta_data ->> 'first_name', 
        NEW.raw_user_meta_data ->> 'last_name'
      ), 
      ''
    ),
    NEW.email
  );
  
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, user_display_name);
  RETURN NEW;
END;
$$;