-- Create a security definer function to safely check ownership of people records
CREATE OR REPLACE FUNCTION public.owns_person_record(_user_id uuid, _person_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.people
    WHERE id = _person_id
      AND user_id = _user_id
  )
$$;

-- Recreate RLS policies with explicit enforcement
-- First drop existing policies
DROP POLICY IF EXISTS "Users can delete their own people" ON public.people;
DROP POLICY IF EXISTS "Users can insert their own people" ON public.people;
DROP POLICY IF EXISTS "Users can update their own people" ON public.people;
DROP POLICY IF EXISTS "Users can view their own people" ON public.people;

-- Recreate with stricter policies
CREATE POLICY "Users can view their own people" 
ON public.people 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own people" 
ON public.people 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people" 
ON public.people 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people" 
ON public.people 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.people FORCE ROW LEVEL SECURITY;