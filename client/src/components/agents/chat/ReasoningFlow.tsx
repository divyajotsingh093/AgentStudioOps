import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  Database, 
  FileText,
  Calculator,
  Search,
  ChevronsDown,
  ChevronsUp,
  AlertTriangle
} from "lucide-react";
import { ReasoningTrace } from "@/lib/types";
import ActionCard, { ActionType } from "./ActionCard";

interface ReasoningFlowProps {
  traces: ReasoningTrace[];
}

const ReasoningFlow: React.FC<ReasoningFlowProps> = ({ traces }) => {
  const [expandedTraces, setExpandedTraces] = useState<number[]>([]);
  const [expandedActionCards, setExpandedActionCards] = useState<number[]>([]);
  const { toast } = useToast();
  
  const handleToggleTrace = (index: number) => {
    setExpandedTraces(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  const handleToggleActionCard = (index: number) => {
    setExpandedActionCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  const handleActionCardAction = (action: string, data: any) => {
    toast({
      title: `Action: ${action}`,
      description: `Performed ${action} on data`,
    });
  };
  
  const renderActionIcon = (action?: string) => {
    if (!action) return null;
    
    switch(action) {
      case 'call_rules_engine':
        return <Calculator className="h-4 w-4 text-purple-500" />;
      case 'query_data_fabric':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'extract_document':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'ask_for_details':
        return <Search className="h-4 w-4 text-orange-500" />;
      case 'provide_assessment':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <ChevronRight className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {traces.map((trace, index) => {
        const isExpanded = expandedTraces.includes(index);
        const isActionCardExpanded = expandedActionCards.includes(index);
        const hasAction = !!trace.action;
        const hasActionData = !!trace.actionType && !!trace.actionData;
        
        return (
          <Card 
            key={index} 
            className={`border ${hasAction ? 'border-blue-200' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                  <CardTitle className="text-sm font-medium">
                    {index + 1}. Reasoning Step
                  </CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => handleToggleTrace(index)}
                >
                  {isExpanded ? 
                    <ChevronsUp className="h-4 w-4" /> : 
                    <ChevronsDown className="h-4 w-4" />
                  }
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="py-0 px-4 pb-3">
              {/* Always show the thought */}
              <div className="text-sm">
                <p>{trace.thought}</p>
              </div>
              
              {/* Conditionally show action, input, and observation when expanded */}
              {isExpanded && hasAction && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center">
                    {renderActionIcon(trace.action)}
                    <span className="ml-2 text-sm font-medium">Action: {trace.action}</span>
                  </div>
                  
                  {trace.action_input && (
                    <div className="pl-6">
                      <div className="text-xs text-gray-500 mb-1">Input:</div>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
                        {typeof trace.action_input === 'object' 
                          ? JSON.stringify(trace.action_input, null, 2)
                          : trace.action_input
                        }
                      </div>
                    </div>
                  )}
                  
                  {trace.observation && !hasActionData && (
                    <div className="pl-6">
                      <div className="text-xs text-gray-500 mb-1">Observation:</div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        {typeof trace.observation === 'object'
                          ? JSON.stringify(trace.observation, null, 2)
                          : trace.observation
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Card */}
              {hasActionData && (
                <div className={`mt-3 ${isExpanded ? '' : 'pl-6'}`}>
                  {!isExpanded && (
                    <div className="flex items-center mb-2">
                      {renderActionIcon(trace.action)}
                      <span className="ml-2 text-xs font-medium">Action: {trace.action}</span>
                      <Badge className="ml-2 text-xs bg-blue-100 text-blue-700">Executed</Badge>
                    </div>
                  )}
                  
                  <ActionCard
                    type={trace.actionType as ActionType}
                    title={trace.actionTitle || 'Action Result'}
                    data={trace.actionData}
                    expanded={isActionCardExpanded}
                    onToggleExpand={() => handleToggleActionCard(index)}
                    onAction={handleActionCardAction}
                  />
                </div>
              )}
              
              {/* Show toggle button when not expanded */}
              {!isExpanded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs w-full justify-center" 
                  onClick={() => handleToggleTrace(index)}
                >
                  Show Details <ChevronsDown className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReasoningFlow;