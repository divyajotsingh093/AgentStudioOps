import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgentExecution {
  id: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  taskCount: number;
}

interface AgentExecutionHeaderProps {
  agent: {
    id: string;
    name: string;
    type: string[];
    status: string;
  };
  executions: AgentExecution[];
  selectedExecutionId: string | null;
  onSelectExecution: (id: string) => void;
  onStartNewExecution?: () => void;
}

export function AgentExecutionHeader({
  agent,
  executions,
  selectedExecutionId,
  onSelectExecution,
  onStartNewExecution
}: AgentExecutionHeaderProps) {
  // Get current execution if one is selected
  const currentExecution = selectedExecutionId 
    ? executions.find(e => e.id === selectedExecutionId) 
    : null;

  // Status badge based on agent status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Running":
        return <Badge className="bg-emerald-100 text-emerald-800 ml-3">In progress</Badge>;
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800 ml-3">Inactive</Badge>;
      case "Draft":
        return <Badge className="bg-amber-100 text-amber-800 ml-3">Draft</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 ml-3">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <div className="flex items-center mt-1">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              <span>
                {currentExecution 
                  ? `Execution started ${currentExecution.startTime.toLocaleDateString()}`
                  : 'No executions yet'}
              </span>
            </div>
            {agent.status && getStatusBadge(agent.status)}
          </div>
        </div>
        
        {executions.length > 0 && (
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={onStartNewExecution}
            >
              <Play className="mr-1 h-4 w-4" /> New Execution
            </Button>
          </div>
        )}
      </div>
      
      {executions.length > 0 && (
        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
          <span className="text-sm font-medium">Execution:</span>
          <div className="flex-1">
            <Select 
              value={selectedExecutionId || ''} 
              onValueChange={onSelectExecution}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select execution" />
              </SelectTrigger>
              <SelectContent>
                {executions.map(execution => (
                  <SelectItem key={execution.id} value={execution.id}>
                    {new Date(execution.startTime).toLocaleString()} 
                    {execution.status === 'Running' && ' (Running)'}
                    {execution.status === 'Completed' && ' (Completed)'}
                    {execution.status === 'Failed' && ' (Failed)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-600"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      )}
      
      {executions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No executions found for this agent.</p>
          <Button onClick={onStartNewExecution}>
            <Play className="mr-2 h-4 w-4" /> Start New Execution
          </Button>
        </div>
      )}
    </div>
  );
}