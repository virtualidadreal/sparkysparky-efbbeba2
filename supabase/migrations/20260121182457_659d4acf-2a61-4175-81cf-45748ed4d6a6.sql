-- Table to track early access signups
CREATE TABLE public.early_access_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  premium_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '3 months'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.early_access_signups ENABLE ROW LEVEL SECURITY;

-- Users can view their own early access status
CREATE POLICY "Users can view their own early access"
ON public.early_access_signups
FOR SELECT
USING (auth.uid() = user_id);

-- App settings table for configurable values
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the early access limit setting
INSERT INTO public.app_settings (key, value, description)
VALUES ('early_access_limit', '30', 'Maximum number of early access spots for 3-month free premium')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on app_settings (public read)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Function to get early access stats (spots taken, total, remaining)
CREATE OR REPLACE FUNCTION public.get_early_access_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spots_taken INTEGER;
  total_spots INTEGER;
  result JSON;
BEGIN
  -- Get total spots from settings
  SELECT (value::TEXT)::INTEGER INTO total_spots
  FROM public.app_settings
  WHERE key = 'early_access_limit';
  
  -- Default to 30 if not set
  IF total_spots IS NULL THEN
    total_spots := 30;
  END IF;
  
  -- Count spots taken
  SELECT COUNT(*) INTO spots_taken
  FROM public.early_access_signups;
  
  result := json_build_object(
    'spots_taken', spots_taken,
    'total_spots', total_spots,
    'spots_remaining', GREATEST(0, total_spots - spots_taken),
    'is_available', spots_taken < total_spots
  );
  
  RETURN result;
END;
$$;

-- Function to claim an early access spot (called during signup)
CREATE OR REPLACE FUNCTION public.claim_early_access_spot(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spots_taken INTEGER;
  total_spots INTEGER;
  premium_end TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Get total spots from settings
  SELECT (value::TEXT)::INTEGER INTO total_spots
  FROM public.app_settings
  WHERE key = 'early_access_limit';
  
  IF total_spots IS NULL THEN
    total_spots := 30;
  END IF;
  
  -- Lock and count current spots
  SELECT COUNT(*) INTO spots_taken
  FROM public.early_access_signups
  FOR UPDATE;
  
  -- Check if spots available
  IF spots_taken >= total_spots THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No hay plazas disponibles',
      'spots_remaining', 0
    );
  END IF;
  
  -- Check if user already claimed
  IF EXISTS (SELECT 1 FROM public.early_access_signups WHERE user_id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ya tienes acceso early access',
      'spots_remaining', total_spots - spots_taken
    );
  END IF;
  
  -- Calculate premium end date
  premium_end := now() + interval '3 months';
  
  -- Insert early access record
  INSERT INTO public.early_access_signups (user_id, premium_expires_at)
  VALUES (p_user_id, premium_end);
  
  -- Update or create user subscription to Pro
  INSERT INTO public.user_subscriptions (user_id, plan)
  VALUES (p_user_id, 'pro')
  ON CONFLICT (user_id) DO UPDATE SET plan = 'pro', updated_at = now();
  
  RETURN json_build_object(
    'success', true,
    'message', '¡Felicidades! Tienes 3 meses de Sparky Pro gratis',
    'premium_expires_at', premium_end,
    'spots_remaining', total_spots - spots_taken - 1
  );
END;
$$;

-- Function to check if user has active early access premium
CREATE OR REPLACE FUNCTION public.has_active_early_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.early_access_signups
    WHERE user_id = p_user_id
    AND premium_expires_at > now()
  );
$$;