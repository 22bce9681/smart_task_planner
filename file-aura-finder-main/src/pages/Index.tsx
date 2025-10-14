import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoalInput } from "@/components/GoalInput";
import { TaskBreakdown } from "@/components/TaskBreakdown";
import { PastPlans } from "@/components/PastPlans";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showNewPlan, setShowNewPlan] = useState(true);

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', currentPlan?.id],
    queryFn: async () => {
      if (!currentPlan?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('plan_id', currentPlan.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentPlan?.id,
  });

  const handleGeneratePlan = async (goal: string) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-task-plan', {
        body: { goal },
      });

      if (response.error) {
        throw response.error;
      }

      setCurrentPlan(response.data.plan);
      setShowNewPlan(false);
      refetchTasks();
      toast.success("Task plan generated successfully!");
    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast.error(error.message || "Failed to generate task plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      const { data: plan, error } = await supabase
        .from('task_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (error) throw error;
      
      setCurrentPlan(plan);
      setShowNewPlan(false);
      refetchTasks();
    } catch (error: any) {
      toast.error("Failed to load plan");
    }
  };

  const handleNewPlan = () => {
    setCurrentPlan(null);
    setShowNewPlan(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Task Planner
            </h1>
            <p className="text-muted-foreground mt-1">AI-powered goal breakdown</p>
          </div>
          {!showNewPlan && (
            <Button
              onClick={handleNewPlan}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          )}
        </header>

        <div className="grid md:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            {showNewPlan ? (
              <GoalInput onSubmit={handleGeneratePlan} isLoading={isGenerating} />
            ) : currentPlan && tasks ? (
              <TaskBreakdown goal={currentPlan.goal} tasks={tasks} />
            ) : null}
          </div>

          <aside className="space-y-6">
            <PastPlans onSelectPlan={handleSelectPlan} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
