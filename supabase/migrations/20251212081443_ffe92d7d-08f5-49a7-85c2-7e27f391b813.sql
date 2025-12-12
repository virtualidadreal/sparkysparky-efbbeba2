-- Update check_user_quota to give admins unlimited generations
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
  v_limit INTEGER := 10; -- Free tier limit
  v_is_admin BOOLEAN := false;
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
  
  RETURN json_build_object(
    'can_generate', v_usage_count < v_limit,
    'plan', v_plan,
    'used', v_usage_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_usage_count)
  );
END;
$function$;