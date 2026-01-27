-- Fix check_user_quota to be more robust: check beta_expires_at regardless of plan value
-- This prevents issues where plan might be 'free' but beta_expires_at is still valid

CREATE OR REPLACE FUNCTION public.check_user_quota(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- DEFENSIVE CHECK: If beta_expires_at is set and still valid, treat as beta_tester
  -- This handles cases where plan might be 'free' but user has valid beta access
  IF v_beta_expires_at IS NOT NULL AND v_beta_expires_at > now() THEN
    -- Auto-fix: Update plan to beta_tester if it's incorrectly set
    IF v_plan != 'beta_tester' THEN
      UPDATE user_subscriptions 
      SET plan = 'beta_tester', updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
    
    RETURN json_build_object(
      'can_generate', true,
      'plan', 'beta_tester',
      'used', 0,
      'limit', -1,
      'remaining', -1,
      'beta_expires_at', v_beta_expires_at
    );
  END IF;

  -- If beta expired, ensure plan is set to free
  IF v_plan = 'beta_tester' AND (v_beta_expires_at IS NULL OR v_beta_expires_at <= now()) THEN
    v_plan := 'free';
    -- Auto-fix: Update plan to free if beta expired
    UPDATE user_subscriptions 
    SET plan = 'free', updated_at = now()
    WHERE user_id = p_user_id;
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
$function$;