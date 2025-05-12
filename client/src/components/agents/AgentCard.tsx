import { Link } from "wouter";
import { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { File, Activity, Search, AlertTriangle, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  agent: Agent;
}

const getAgentIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'UW':
      return File;
    case 'Claims':
      return Activity;
    case 'Service':
      return Search;
    case 'Fraud':
      return AlertTriangle;
    default:
      return File;
  }
};

const getAgentTypeColor = (type: string) => {
  switch (type) {
    case 'UW':
      return "bg-blue-100 text-blue-800";
    case 'Claims':
      return "bg-green-100 text-green-800";
    case 'Service':
      return "bg-purple-100 text-purple-800";
    case 'Fraud':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Running':
      return "bg-lime-100 text-lime-700";
    case 'Inactive':
      return "bg-gray-100 text-gray-700";
    case 'Draft':
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const AgentCard = ({ agent }: AgentCardProps) => {
  const AgentIcon = getAgentIcon(agent.type[0]);
  
  return (
    <Link href={`/agents/${agent.id}`}>
      <a className="block">
        <div className="agent-card bg-white rounded-xl shadow-md p-5 cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <AgentIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{agent.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.type.map((type) => (
                    <Badge 
                      key={type} 
                      className={cn("text-xs", getAgentTypeColor(type))}
                      variant="outline"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Badge 
              className={cn("text-xs font-medium", getStatusColor(agent.status))}
              variant="outline"
            >
              {agent.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Created by: {agent.createdBy}</span>
            <span>Updated: {agent.updatedAt}</span>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default AgentCard;
