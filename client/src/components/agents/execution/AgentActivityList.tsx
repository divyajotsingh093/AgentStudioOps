import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface Task {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "queued" | "failed";
  timestamp: Date;
  details?: string;
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "queued" | "failed";
}

export interface ExecutionActivity {
  id: string;
  type: "task_created" | "agent_executing" | "input_added" | "execution_completed" | "execution_failed";
  timestamp: Date;
  data: {
    taskId?: string;
    taskTitle?: string;
    executionId?: string;
    message?: string;
    source?: string;
  };
}

interface AgentActivityListProps {
  activities: ExecutionActivity[];
  tasks: Task[];
  onRerunTask?: (taskId: string) => void;
}

export function AgentActivityList({ activities, tasks, onRerunTask }: AgentActivityListProps) {
  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Agent activity</h2>
      {activities.map((activity) => (
        <div key={activity.id} className="relative pl-8 pb-6">
          {/* Activity Timeline Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Activity Indicator */}
          <div className="absolute left-0 top-1 bg-white p-1 rounded-full">
            {activity.type === "task_created" ? (
              <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-primary" />
              </div>
            ) : activity.type === "agent_executing" ? (
              <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-blue-600" />
              </div>
            ) : (
              <div className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-gray-600" />
              </div>
            )}
          </div>
          
          {/* Activity Content */}
          <div>
            {activity.type === "task_created" && (
              <>
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">New task was created</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                {activity.data.taskId && getTaskById(activity.data.taskId) && (
                  <Card className="mt-2 border border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">{activity.data.taskTitle || "Task"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        via {activity.data.source || "API"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {activity.type === "agent_executing" && (
              <>
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">
                    Agent is executing "{activity.data.taskTitle}" task...
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto text-sm"
                    onClick={() => activity.data.taskId && onRerunTask && onRerunTask(activity.data.taskId)}
                  >
                    Re-run
                  </Button>
                </div>
                
                {activity.data.taskId && getTaskById(activity.data.taskId)?.subtasks && (
                  <div className="space-y-2 mt-3">
                    {getTaskById(activity.data.taskId)?.subtasks?.map((subtask) => (
                      <Card key={subtask.id} className="border border-gray-200">
                        <CardContent className="p-3 flex items-center">
                          {getStatusIcon(subtask.status)}
                          <span className="ml-2 text-sm">{subtask.title}</span>
                          {getStatusBadge(subtask.status)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {activity.type === "input_added" && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Input added</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}