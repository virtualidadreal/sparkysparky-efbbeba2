-- Remove the overly permissive policy that grants public access
DROP POLICY IF EXISTS "Service role can manage all connections" ON public.intelligent_connections;