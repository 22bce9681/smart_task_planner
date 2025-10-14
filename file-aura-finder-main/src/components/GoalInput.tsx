import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles } from "lucide-react";

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
}

export const GoalInput = ({ onSubmit, isLoading }: GoalInputProps) => {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal.trim());
    }
  };

  return (
    <Card className="shadow-[var(--shadow-soft)] border-0 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          What's your goal?
        </CardTitle>
        <CardDescription>
          Describe what you want to achieve, and AI will break it down into actionable tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., Launch a product in 2 weeks, Learn React in 30 days, Plan a wedding..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:shadow-[var(--shadow-glow)]"
            disabled={isLoading || !goal.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Generating Tasks...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Task Plan
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
