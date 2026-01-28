-- Create device_tokens table for push notifications
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL DEFAULT 'ios',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens(user_id);

-- Enable Row Level Security
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own tokens
CREATE POLICY "Users can view own tokens" ON public.device_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own tokens
CREATE POLICY "Users can insert own tokens" ON public.device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own tokens
CREATE POLICY "Users can update own tokens" ON public.device_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own tokens
CREATE POLICY "Users can delete own tokens" ON public.device_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();