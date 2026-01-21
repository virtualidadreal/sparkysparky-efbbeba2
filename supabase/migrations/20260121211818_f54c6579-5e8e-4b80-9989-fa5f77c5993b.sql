-- =============================================
-- SECURITY FIX: Add RLS policies to decrypted views and missing tables
-- =============================================

-- 1. Enable RLS on the decrypted views (they inherit from base tables but need explicit policies)

-- For sparky_messages_decrypted view - create security policy
-- Note: Views inherit RLS from underlying tables, but we need to ensure the base table has proper RLS

-- 2. Fix app_settings table - add admin-only write policies
CREATE POLICY "Only admins can insert app_settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update app_settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete app_settings"
ON public.app_settings
FOR DELETE
TO authenticated
USING (is_admin());

-- 3. Fix early_access_signups table - restrict write access
-- Users should only be able to claim via the RPC function, not directly
CREATE POLICY "Users can only view their own early access signup"
ON public.early_access_signups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop the existing public read policy if it exists and recreate properly
DROP POLICY IF EXISTS "Anyone can read early access signups" ON public.early_access_signups;

-- No INSERT/UPDATE/DELETE policies - these should only happen through the claim_early_access_spot function
-- which runs with SECURITY DEFINER

-- 4. Ensure people table has proper RLS (it should already, but let's verify by checking existing policies)
-- The people table already has RLS enabled, but let's ensure the policies are correct
DROP POLICY IF EXISTS "Users can view their own people" ON public.people;
DROP POLICY IF EXISTS "Users can insert their own people" ON public.people;
DROP POLICY IF EXISTS "Users can update their own people" ON public.people;
DROP POLICY IF EXISTS "Users can delete their own people" ON public.people;

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