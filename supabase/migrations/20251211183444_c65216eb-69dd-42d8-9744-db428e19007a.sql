-- Add INSERT and DELETE policies for admin_emails table (restricted to admins only)
CREATE POLICY "Admins can insert admin emails" 
ON public.admin_emails 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admin emails" 
ON public.admin_emails 
FOR DELETE 
USING (is_admin());