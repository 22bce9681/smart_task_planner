import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal } = await req.json();
    console.log('Generating task plan for goal:', goal);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use Lovable AI with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert project manager and task planner. Break down user goals into actionable tasks with clear dependencies, priorities, and realistic timelines. Consider task complexity and dependencies when estimating hours and deadlines.`
          },
          {
            role: "user",
            content: `Break down this goal into 5-8 actionable tasks: "${goal}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_task_plan",
              description: "Create a structured task breakdown with dependencies and timelines",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { 
                          type: "string",
                          description: "Clear, actionable task title"
                        },
                        description: { 
                          type: "string",
                          description: "Detailed description of what needs to be done"
                        },
                        priority: { 
                          type: "string",
                          enum: ["low", "medium", "high"],
                          description: "Task priority based on importance and dependencies"
                        },
                        estimated_hours: { 
                          type: "integer",
                          description: "Estimated hours to complete (1-40)"
                        },
                        days_from_start: { 
                          type: "integer",
                          description: "Days from project start when this task should be completed"
                        },
                        dependencies: {
                          type: "array",
                          items: { type: "string" },
                          description: "Array of task titles that must be completed before this one"
                        }
                      },
                      required: ["title", "description", "priority", "estimated_hours", "days_from_start", "dependencies"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["tasks"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_task_plan" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract structured output from tool call
    const toolCall = data.choices[0].message.tool_calls[0];
    const taskPlan = JSON.parse(toolCall.function.arguments);

    console.log('Parsed task plan:', taskPlan);

    // Create task plan in database
    const { data: plan, error: planError } = await supabase
      .from('task_plans')
      .insert({
        goal: goal
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating plan:', planError);
      throw planError;
    }

    console.log('Created plan:', plan.id);

    // Calculate deadlines based on days_from_start
    const today = new Date();
    const tasksWithDeadlines = taskPlan.tasks.map((task: any, index: number) => {
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + task.days_from_start);
      
      return {
        plan_id: plan.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimated_hours: task.estimated_hours,
        deadline: deadline.toISOString().split('T')[0],
        dependencies: JSON.stringify(task.dependencies),
        order_index: index,
        status: 'pending'
      };
    });

    // Insert all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksWithDeadlines)
      .select();

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Created ${tasks.length} tasks`);

    return new Response(
      JSON.stringify({ plan, tasks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-task-plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
