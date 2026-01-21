-- Fix app_settings to restrict read access to authenticated users only
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;

CREATE POLICY "Authenticated users can read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);