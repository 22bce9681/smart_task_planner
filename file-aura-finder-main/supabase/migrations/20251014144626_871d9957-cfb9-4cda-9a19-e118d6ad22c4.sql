-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own plans" ON public.task_plans;
DROP POLICY IF EXISTS "Users can create their own plans" ON public.task_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.task_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON public.task_plans;

DROP POLICY IF EXISTS "Users can view tasks from their plans" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their plans" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their plans" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their plans" ON public.tasks;

-- Make user_id nullable and optional
ALTER TABLE public.task_plans ALTER COLUMN user_id DROP NOT NULL;

-- Create permissive public policies
CREATE POLICY "Anyone can view plans" 
ON public.task_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create plans" 
ON public.task_plans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update plans" 
ON public.task_plans 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete plans" 
ON public.task_plans 
FOR DELETE 
USING (true);

-- Public policies for tasks
CREATE POLICY "Anyone can view tasks" 
ON public.tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (true);