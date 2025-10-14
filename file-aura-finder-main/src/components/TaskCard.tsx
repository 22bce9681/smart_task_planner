import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  low: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Circle },
  medium: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  high: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertCircle },
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const isCompleted = task.status === "completed";
  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  // Parse dependencies if it's a string
  const dependencies = typeof task.dependencies === 'string' 
    ? JSON.parse(task.dependencies) 
    : task.dependencies;

  const hasDependencies = dependencies && dependencies.length > 0;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-[var(--shadow-soft)] border-border/50",
      isCompleted && "opacity-60"
    )}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(isCompleted && "line-through")}>{task.title}</span>
          </CardTitle>
          <Badge variant="outline" className={priorityInfo.color}>
            <PriorityIcon className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
        </div>
        <CardDescription className="text-sm">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_hours}h estimated</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>📅</span>
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        
        {hasDependencies && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Depends on:</p>
            <div className="flex flex-wrap gap-1.5">
              {dependencies.map((dep: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
