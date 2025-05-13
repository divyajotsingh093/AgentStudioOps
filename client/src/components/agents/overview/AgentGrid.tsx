import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MockAgent, getAgentTypeDisplay, getAgentTypeBadgeColor, getTimeAgo } from '@/lib/mock-agents';
import { useResponsive } from '@/hooks/use-responsive';

interface AgentCardProps {
  agent: MockAgent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="h-full transition-all hover:shadow-md cursor-pointer relative overflow-hidden">
        {/* Active status indicator */}
        {agent.isActive && (
          <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"></div>
        )}
        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
          <CardDescription className="text-gray-600">{agent.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-2">
            {agent.type.map((type) => (
              <Badge key={type} variant="secondary" className={getAgentTypeBadgeColor(type)}>
                {getAgentTypeDisplay(type)}
              </Badge>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-2 text-sm text-gray-500">
          <div>Updated {getTimeAgo(agent.updatedAt)}</div>
          <div className="font-medium">Open</div>
        </CardFooter>
      </Card>
    </Link>
  );
};

interface AgentGridProps {
  agents: MockAgent[];
  title?: string;
  description?: string;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ 
  agents, 
  title = "AI Agents", 
  description = "Insurance-specific AI agents ready to assist with various tasks."
}) => {
  const { isMobile, isTablet, breakpoint } = useResponsive();
  
  // Determine grid columns based on screen size
  const getGridCols = () => {
    if (isMobile) return "grid-cols-1";
    if (isTablet) return "grid-cols-2";
    return "grid-cols-3";
  };
  
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="mb-6">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      
      <div className={`grid ${getGridCols()} gap-6`}>
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentGrid;