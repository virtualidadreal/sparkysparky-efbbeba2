-- Create table to track project suggestions based on idea topics
CREATE TABLE public.project_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  idea_ids UUID[] NOT NULL DEFAULT '{}',
  suggestion_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, dismissed_forever
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own suggestions" 
ON public.project_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions" 
ON public.project_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" 
ON public.project_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suggestions" 
ON public.project_suggestions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create unique constraint on user_id and topic
CREATE UNIQUE INDEX idx_project_suggestions_user_topic ON public.project_suggestions(user_id, topic);

-- Create trigger for updated_at
CREATE TRIGGER update_project_suggestions_updated_at
BEFORE UPDATE ON public.project_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();