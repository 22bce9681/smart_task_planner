-- Create task_plans table to store user goals
CREATE TABLE public.task_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for task_plans
CREATE POLICY "Users can view their own plans" 
ON public.task_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
ON public.task_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.task_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" 
ON public.task_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create tasks table to store individual tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.task_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours INTEGER,
  deadline DATE,
  dependencies JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks (access through plan ownership)
CREATE POLICY "Users can view tasks from their plans" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.task_plans 
    WHERE task_plans.id = tasks.plan_id 
    AND task_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks in their plans" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.task_plans 
    WHERE task_plans.id = tasks.plan_id 
    AND task_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tasks in their plans" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.task_plans 
    WHERE task_plans.id = tasks.plan_id 
    AND task_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tasks from their plans" 
ON public.tasks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.task_plans 
    WHERE task_plans.id = tasks.plan_id 
    AND task_plans.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_plans_updated_at
BEFORE UPDATE ON public.task_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();