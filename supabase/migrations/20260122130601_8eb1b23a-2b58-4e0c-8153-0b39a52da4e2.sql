-- Add beta_tester to subscription_plan enum
ALTER TYPE public.subscription_plan ADD VALUE IF NOT EXISTS 'beta_tester';

-- Create feedback table for beta testers
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('interfaz', 'usabilidad', 'funcionalidad', 'rendimiento', 'sugerencia', 'bug', 'otro')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feedback table
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.beta_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.beta_feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.beta_feedback;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" 
ON public.beta_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" 
ON public.beta_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" 
ON public.beta_feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Drop and recreate check_user_quota to handle beta_tester
DROP FUNCTION IF EXISTS public.check_user_quota(uuid);

CREATE FUNCTION public.check_user_quota(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan subscription_plan;
  v_current_month TEXT;
  v_usage_count INTEGER;
  v_limit INTEGER;
  v_is_admin BOOLEAN := false;
  v_has_early_access BOOLEAN := false;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails ae
    JOIN auth.users u ON u.email = ae.email
    WHERE u.id = p_user_id
  ) INTO v_is_admin;
  
  -- Admins have unlimited access
  IF v_is_admin THEN
    RETURN json_build_object(
      'can_generate', true,
      'plan', 'admin',
      'used', 0,
      'limit', -1,
      'remaining', -1
    );
  END IF;

  -- Check for active early access
  SELECT public.has_active_early_access(p_user_id) INTO v_has_early_access;
  
  IF v_has_early_access THEN
    RETURN json_build_object(
      'can_generate', true,
      'plan', 'pro',
      'used', 0,
      'limit', -1,
      'remaining', -1
    );
  END IF;

  -- Get user plan (default to free if not found)
  SELECT plan INTO v_plan 
  FROM user_subscriptions 
  WHERE user_id = p_user_id;
  
  IF v_plan IS NULL THEN
    v_plan := 'free';
    -- Create subscription record
    INSERT INTO user_subscriptions (user_id, plan)
    VALUES (p_user_id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Pro users have no limit
  IF v_plan = 'pro' THEN
    RETURN json_build_object(
      'can_generate', true,
      'plan', v_plan,
      'used', 0,
      'limit', -1,
      'remaining', -1
    );
  END IF;
  
  -- Get current month
  v_current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current usage
  SELECT generations_count INTO v_usage_count
  FROM user_monthly_usage
  WHERE user_id = p_user_id AND usage_month = v_current_month;
  
  IF v_usage_count IS NULL THEN
    v_usage_count := 0;
  END IF;

  -- Set limit based on plan (beta_tester gets 6, free gets 10)
  IF v_plan = 'beta_tester' THEN
    v_limit := 6;
  ELSE
    v_limit := 10;
  END IF;
  
  RETURN json_build_object(
    'can_generate', v_usage_count < v_limit,
    'plan', v_plan,
    'used', v_usage_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_usage_count)
  );
END;
$$;

-- Function to check if user is beta tester
CREATE OR REPLACE FUNCTION public.is_beta_tester(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND plan = 'beta_tester'
  );
END;
$$;

-- Function to register as beta tester
CREATE OR REPLACE FUNCTION public.register_beta_tester(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's plan to beta_tester if they're on free plan
  UPDATE user_subscriptions
  SET plan = 'beta_tester',
      updated_at = now()
  WHERE user_id = p_user_id
    AND plan = 'free';

  IF NOT FOUND THEN
    -- Try to insert if no subscription exists
    INSERT INTO user_subscriptions (user_id, plan)
    VALUES (p_user_id, 'beta_tester')
    ON CONFLICT (user_id) DO NOTHING;
    
    IF NOT FOUND THEN
      -- Check if already beta or pro
      IF EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = p_user_id AND plan IN ('beta_tester', 'pro')) THEN
        RETURN json_build_object(
          'success', false,
          'message', 'Ya tienes una suscripción activa'
        );
      END IF;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', '¡Bienvenido al programa beta!'
  );
END;
$$;