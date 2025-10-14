import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { History, Loader2 } from "lucide-react";

interface PastPlansProps {
  onSelectPlan: (planId: string) => void;
}

export const PastPlans = ({ onSelectPlan }: PastPlansProps) => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['task-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-[var(--shadow-soft)] border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Plans
        </CardTitle>
        <CardDescription>View your previous task breakdowns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {plans.map((plan) => (
          <Button
            key={plan.id}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 hover:bg-primary/5 transition-colors"
            onClick={() => onSelectPlan(plan.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{plan.goal}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(plan.created_at).toLocaleDateString()}
              </p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
