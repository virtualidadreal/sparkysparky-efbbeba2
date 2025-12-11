-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only admins can update subscriptions (to prevent users upgrading themselves)
CREATE POLICY "Admins can update subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (public.is_admin());

-- Create monthly usage table
CREATE TABLE public.user_monthly_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_month TEXT NOT NULL, -- Format: YYYY-MM
  generations_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_month)
);

-- Enable RLS
ALTER TABLE public.user_monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly usage
CREATE POLICY "Users can view their own usage"
ON public.user_monthly_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.user_monthly_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.user_monthly_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_monthly_usage_updated_at
BEFORE UPDATE ON public.user_monthly_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user can generate (has remaining quota)
CREATE OR REPLACE FUNCTION public.check_user_quota(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan subscription_plan;
  v_current_month TEXT;
  v_usage_count INTEGER;
  v_limit INTEGER := 10; -- Free tier limit
BEGIN
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
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_user_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_month TEXT;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO user_monthly_usage (user_id, usage_month, generations_count)
  VALUES (p_user_id, v_current_month, 1)
  ON CONFLICT (user_id, usage_month)
  DO UPDATE SET generations_count = user_monthly_usage.generations_count + 1;
END;
$$;