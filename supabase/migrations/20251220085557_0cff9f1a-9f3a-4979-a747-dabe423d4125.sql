-- Create task_lists table for custom task lists
CREATE TABLE public.task_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'list',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on task_lists
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_lists
CREATE POLICY "Users can view their own task lists" 
ON public.task_lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task lists" 
ON public.task_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task lists" 
ON public.task_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task lists" 
ON public.task_lists FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_task_lists_updated_at
BEFORE UPDATE ON public.task_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN list_id UUID REFERENCES public.task_lists(id) ON DELETE SET NULL,
ADD COLUMN parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
ADD COLUMN sort_order INTEGER DEFAULT 0,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_task_lists_user_id ON public.task_lists(user_id);