-- Create table for storing intelligent connections
CREATE TABLE public.intelligent_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_title TEXT NOT NULL,
  relationship TEXT NOT NULL,
  strength NUMERIC NOT NULL DEFAULT 0.5,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_connection UNIQUE (user_id, source_id, target_id)
);

-- Enable RLS
ALTER TABLE public.intelligent_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own connections"
  ON public.intelligent_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
  ON public.intelligent_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON public.intelligent_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON public.intelligent_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service role to manage connections (for cron job)
CREATE POLICY "Service role can manage all connections"
  ON public.intelligent_connections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_connections_source ON public.intelligent_connections(user_id, source_id, source_type);
CREATE INDEX idx_connections_target ON public.intelligent_connections(user_id, target_id, target_type);

-- Trigger for updated_at
CREATE TRIGGER update_intelligent_connections_updated_at
  BEFORE UPDATE ON public.intelligent_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();