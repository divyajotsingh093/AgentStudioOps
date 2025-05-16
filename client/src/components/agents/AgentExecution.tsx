import React, { useState } from "react";
import { 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Play 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AgentExecutionProps {
  agentName: string;
  agentId: string;
}

// Task status types
type TaskStatus = "completed" | "in_progress" | "queued" | "failed";

// Task and subtask interfaces
interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  timestamp: Date;
  details?: string;
  subtasks?: Subtask[];
}

// Mock data for the execution section
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Create new onboarding for GoLevels",
    status: "completed",
    timestamp: new Date(Date.now() - 360000),
    subtasks: []
  },
  {
    id: "task-2",
    title: "Platform Tuner",
    status: "in_progress",
    timestamp: new Date(Date.now() - 300000),
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

export function AgentExecution({ agentName, agentId }: AgentExecutionProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to get status badge for tasks and subtasks
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "queued":
        return <Badge variant="outline" className="ml-2">Queued</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-2">In progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 ml-2">Failed</Badge>;
      default:
        return null;
    }
  };
  
  // Function to get status icon for activities and tasks
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Handle re-running a task
  const handleRerunTask = (taskId: string) => {
    console.log(`Re-running task: ${taskId}`);
    // Implementation would connect to API
  };

  return (
    <div className="py-6 px-2 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{agentName}</h1>
          <Badge className="bg-blue-100 text-blue-800">In progress</Badge>
        </div>
        
        <div className="space-y-8">
          <h2 className="text-xl font-semibold mb-4">Agent activity</h2>
          
          {/* Task 1 - Created */}
          <div className="relative pl-8 pb-6">
            {/* Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Activity Indicator */}
            <div className="absolute left-0 top-1 bg-white p-1 rounded-full">
              <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-primary" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">New task was created</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDistanceToNow(mockTasks[0].timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <Card className="mt-2 border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{mockTasks[0].title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    via Webhook
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Task 2 - Executing */}
          <div className="relative pl-8 pb-6">
            {/* Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Activity Indicator */}
            <div className="absolute left-0 top-1 bg-white p-1 rounded-full">
              <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-blue-600" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">
                  Agent is executing "{mockTasks[1].title}" task...
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto text-sm"
                  onClick={() => handleRerunTask(mockTasks[1].id)}
                >
                  Re-run
                </Button>
              </div>
              
              <div className="space-y-2 mt-3">
                {mockTasks[1].subtasks?.map((subtask) => (
                  <Card key={subtask.id} className="border border-gray-200">
                    <CardContent className="p-3 flex items-center">
                      {getStatusIcon(subtask.status)}
                      <span className="ml-2 text-sm">{subtask.title}</span>
                      {getStatusBadge(subtask.status)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          {/* Input added indicator */}
          <div className="relative pl-8 pb-6">
            {/* Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Activity Indicator */}
            <div className="absolute left-0 top-1 bg-white p-1 rounded-full">
              <div className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-gray-600" />
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Input added</span>
            </div>
          </div>
          
          {/* Future Task Placeholder */}
          <div className="relative pl-8">
            {/* Activity Indicator */}
            <div className="absolute left-0 top-1 bg-white p-1 rounded-full">
              <div className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center">
                <ChevronRight className="h-3 w-3 text-gray-600" />
              </div>
            </div>
            
            <Card className="mt-2 border border-dashed border-gray-200">
              <CardContent className="p-4 flex items-center justify-center">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>Create new task</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}