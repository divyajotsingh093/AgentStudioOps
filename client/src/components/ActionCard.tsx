import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal, 
  RefreshCw,
  Eye,
  Clipboard,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface ActionCardProps {
  action: {
    id: string;
    taskId: string;
    name: string;
    description?: string;
    type: string;
    status: 'Queued' | 'Running' | 'Completed' | 'Failed';
    startedAt?: Date;
    completedAt?: Date;
    latency?: number;
    metadata: Record<string, any>;
    sequence: number;
  };
  onClick?: () => void;
  onRerun?: () => void;
  onViewDetails?: () => void;
}

export function ActionCard({ action, onClick, onRerun, onViewDetails }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const getStatusIcon = () => {
    switch (action.status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'Queued':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusBadge = () => {
    switch (action.status) {
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'Running':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 animate-pulse">⟳ Running</Badge>;
      case 'Queued':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">⏱ Queued</Badge>;
      case 'Failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800">✕ Failed</Badge>;
      default:
        return null;
    }
  };
  
  const getTypeBadge = () => {
    switch (action.type) {
      case 'LLM':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">LLM</Badge>;
      case 'Tool':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Tool</Badge>;
      case 'DataFetch':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Data</Badge>;
      default:
        return <Badge variant="outline">{action.type}</Badge>;
    }
  };
  
  const getDuration = () => {
    if (action.latency) {
      return `${action.latency}ms`;
    }
    
    if (action.completedAt && action.startedAt) {
      const duration = new Date(action.completedAt).getTime() - new Date(action.startedAt).getTime();
      return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
    }
    
    return '—';
  };
  
  const getMetadataPills = () => {
    if (!action.metadata || Object.keys(action.metadata).length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(action.metadata).map(([key, value]) => (
          <Badge key={key} variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
          </Badge>
        ))}
      </div>
    );
  };
  
  const getTimeInfo = () => {
    if (action.completedAt) {
      return (
        <span className="text-xs text-gray-500">
          Completed {formatDistanceToNow(new Date(action.completedAt), { addSuffix: true })}
        </span>
      );
    }
    
    if (action.startedAt) {
      return (
        <span className="text-xs text-gray-500">
          Started {formatDistanceToNow(new Date(action.startedAt), { addSuffix: true })}
        </span>
      );
    }
    
    return null;
  };

  return (
    <Card 
      className={`w-full border-l-4 transition-all ${
        action.status === 'Completed' ? 'border-l-green-500' :
        action.status === 'Running' ? 'border-l-blue-500' :
        action.status === 'Failed' ? 'border-l-red-500' :
        'border-l-gray-300'
      } hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{action.name}</span>
            {getTypeBadge()}
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onRerun && action.status !== 'Running' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRerun(); }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-run Action
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => { 
                  e.stopPropagation(); 
                  navigator.clipboard.writeText(action.id); 
                }}>
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>#{action.sequence}</span>
            {action.startedAt && (
              <span>
                {format(new Date(action.startedAt), 'h:mm:ss a')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {getDuration()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Execution time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {expanded && action.description && (
          <div className="mt-2 text-sm text-gray-700">
            {action.description}
          </div>
        )}
        
        {expanded && getMetadataPills()}
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex justify-between">
        <div>{getTimeInfo()}</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 p-0 text-xs"
          onClick={toggleExpand}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              More
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}