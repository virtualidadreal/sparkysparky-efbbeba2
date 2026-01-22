-- Add beta expiration tracking to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update check_user_quota to give beta_testers unlimited access (like Pro) while active
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
  v_beta_expires_at TIMESTAMP WITH TIME ZONE;
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

  -- Get user plan and beta expiration
  SELECT plan, beta_expires_at INTO v_plan, v_beta_expires_at
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

  -- Beta testers have unlimited access while their beta period is active
  IF v_plan = 'beta_tester' AND v_beta_expires_at IS NOT NULL AND v_beta_expires_at > now() THEN
    RETURN json_build_object(
      'can_generate', true,
      'plan', 'beta_tester',
      'used', 0,
      'limit', -1,
      'remaining', -1,
      'beta_expires_at', v_beta_expires_at
    );
  END IF;

  -- If beta expired, treat as free
  IF v_plan = 'beta_tester' AND (v_beta_expires_at IS NULL OR v_beta_expires_at <= now()) THEN
    v_plan := 'free';
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

  -- Free plan limit
  v_limit := 10;
  
  RETURN json_build_object(
    'can_generate', v_usage_count < v_limit,
    'plan', v_plan,
    'used', v_usage_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_usage_count)
  );
END;
$$;

-- Update register_beta_tester to set 6 months expiration
DROP FUNCTION IF EXISTS public.register_beta_tester(uuid);

CREATE FUNCTION public.register_beta_tester(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_beta_end TIMESTAMP WITH TIME ZONE;
  v_current_plan subscription_plan;
BEGIN
  -- Check current plan
  SELECT plan INTO v_current_plan
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- If already pro or active beta, don't allow
  IF v_current_plan = 'pro' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ya tienes una suscripción Pro activa'
    );
  END IF;

  IF v_current_plan = 'beta_tester' THEN
    -- Check if still active
    IF EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_id = p_user_id 
      AND beta_expires_at > now()
    ) THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Ya eres beta tester'
      );
    END IF;
  END IF;

  -- Calculate beta end date (6 months from now)
  v_beta_end := now() + interval '6 months';

  -- Update or insert subscription
  INSERT INTO user_subscriptions (user_id, plan, beta_expires_at)
  VALUES (p_user_id, 'beta_tester', v_beta_end)
  ON CONFLICT (user_id) DO UPDATE SET 
    plan = 'beta_tester',
    beta_expires_at = v_beta_end,
    updated_at = now();

  RETURN json_build_object(
    'success', true,
    'message', '¡Bienvenido al programa beta! Tienes 6 meses de acceso Pro gratis',
    'beta_expires_at', v_beta_end
  );
END;
$$;

-- Update is_beta_tester to check active beta
DROP FUNCTION IF EXISTS public.is_beta_tester(uuid);

CREATE FUNCTION public.is_beta_tester(p_user_id uuid)
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
    AND beta_expires_at > now()
  );
END;
$$;