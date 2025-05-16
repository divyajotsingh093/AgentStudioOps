import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentExecutionHeader } from "./AgentExecutionHeader";
import { AgentActivityList, type ExecutionActivity, type Task } from "./AgentActivityList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

// Mock data for development - will be replaced with API data
const mockExecutions = [
  {
    id: "exec-1",
    status: "Completed",
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(),
    taskCount: 5
  },
  {
    id: "exec-2",
    status: "Running",
    startTime: new Date(Date.now() - 1800000),
    taskCount: 3
  }
];

const mockActivities: ExecutionActivity[] = [
  {
    id: "act-1",
    type: "task_created",
    timestamp: new Date(Date.now() - 360000),
    data: {
      taskId: "task-1",
      taskTitle: "Create new onboarding for GoLevels",
      source: "Webhook"
    }
  },
  {
    id: "act-2",
    type: "agent_executing",
    timestamp: new Date(Date.now() - 300000),
    data: {
      taskId: "task-1",
      taskTitle: "Platform Tuner",
      executionId: "exec-1"
    }
  }
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Platform Tuner",
    status: "in_progress",
    timestamp: new Date(Date.now() - 360000),
    subtasks: [
      {
        id: "subtask-1",
        title: "Fetching company information",
        status: "completed"
      },
      {
        id: "subtask-2",
        title: "Analyze industry",
        status: "queued"
      },
      {
        id: "subtask-3",
        title: "Customize workspace",
        status: "queued"
      },
      {
        id: "subtask-4",
        title: "Getting input on problems, challenges and use cases",
        status: "queued"
      },
      {
        id: "subtask-5",
        title: "Create list of AI Agents",
        status: "queued"
      }
    ]
  }
];

export function AgentExecutionPage() {
  const { id } = useParams();
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // In a real implementation, these would be API calls
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/agents/${id}`],
    enabled: !!id,
    // This is just for development, in production this would use the default fetcher
    queryFn: async () => {
      // Mock agent data
      return {
        id: id || "agent-1",
        name: "Onboarding for GoLevels",
        type: ["Assistant"],
        status: "Running",
        description: "Helps with onboarding new companies"
      };
    }
  });

  const { data: executions = mockExecutions, isLoading: isLoadingExecutions } = useQuery({
    queryKey: [`/api/agents/${id}/executions`],
    enabled: !!id,
    // Mock executions data for development
    queryFn: async () => mockExecutions
  });

  // When executions load, select the most recent one by default
  useEffect(() => {
    if (executions?.length && !selectedExecution) {
      setSelectedExecution(executions[0].id);
    }
  }, [executions, selectedExecution]);

  // Get the selected execution details
  const { data: executionDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/api/executions/${selectedExecution}`],
    enabled: !!selectedExecution,
    // Mock execution details data for development
    queryFn: async () => ({
      id: selectedExecution,
      activities: mockActivities,
      tasks: mockTasks
    })
  });

  // Mutation to start a new execution
  const startExecution = useMutation({
    mutationFn: async () => {
      // In production, this would make an actual API call
      // return await apiRequest(`/api/agents/${id}/executions`, 'POST');
      
      // For development, just return a mock new execution
      return {
        id: `exec-${Date.now()}`,
        status: "Running",
        startTime: new Date(),
        taskCount: 0
      };
    },
    onSuccess: (newExecution) => {
      // Update the executions list and select the new execution
      queryClient.setQueryData([`/api/agents/${id}/executions`], 
        (oldData: any) => [newExecution, ...(oldData || [])]);
      setSelectedExecution(newExecution.id);
    }
  });

  // Function to re-run a specific task
  const handleRerunTask = (taskId: string) => {
    // In production, this would make an actual API call
    console.log(`Re-running task: ${taskId}`);
    // You could implement a mutation here to rerun the task
  };

  if (isLoadingAgent) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Agent not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <AgentExecutionHeader 
        agent={agent} 
        executions={executions} 
        selectedExecutionId={selectedExecution}
        onSelectExecution={setSelectedExecution}
        onStartNewExecution={() => startExecution.mutate()}
      />
      
      <div className="mt-8">
        {selectedExecution && executionDetails ? (
          <AgentActivityList 
            activities={executionDetails.activities}
            tasks={executionDetails.tasks}
            onRerunTask={handleRerunTask}
          />
        ) : isLoadingDetails ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No execution selected or no data available.
          </div>
        )}
      </div>
    </div>
  );
}