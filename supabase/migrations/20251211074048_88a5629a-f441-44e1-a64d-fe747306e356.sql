-- Allow admins to delete system prompts
CREATE POLICY "Admins can delete system prompts"
ON public.system_prompts
FOR DELETE
USING (is_admin());