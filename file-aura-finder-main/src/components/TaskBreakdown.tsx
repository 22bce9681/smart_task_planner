import { TaskCard } from "./TaskCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ListChecks } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimated_hours: number;
  deadline: string;
  dependencies: string | string[];
  status: string;
  order_index: number;
}

interface TaskBreakdownProps {
  goal: string;
  tasks: Task[];
}

export const TaskBreakdown = ({ goal, tasks }: TaskBreakdownProps) => {
  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  const highPriorityCount = tasks.filter(t => t.priority === "high").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-[var(--shadow-soft)] bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" />
            Your Task Plan
          </CardTitle>
          <CardDescription className="text-base">
            Goal: <span className="font-medium text-foreground">{goal}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">{tasks.length}</span>
              <span className="text-muted-foreground">Total Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">{totalHours}h</span>
              <span className="text-muted-foreground">Estimated Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-600">{highPriorityCount}</span>
              <span className="text-muted-foreground">High Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tasks
          .sort((a, b) => a.order_index - b.order_index)
          .map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
      </div>
    </div>
  );
};
