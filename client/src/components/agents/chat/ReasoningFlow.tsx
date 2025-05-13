import React from 'react';
import { 
  Brain, 
  Database, 
  Calculator, 
  FileText, 
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage, ReasoningTrace } from '@/lib/types';

interface ReasoningFlowProps {
  messages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
}

const ReasoningFlow: React.FC<ReasoningFlowProps> = ({
  messages,
  reasoningTraces
}) => {
  const [expandedTraces, setExpandedTraces] = React.useState<string[]>([]);

  const toggleTraceExpand = (traceId: string) => {
    setExpandedTraces(prev => 
      prev.includes(traceId) 
        ? prev.filter(id => id !== traceId) 
        : [...prev, traceId]
    );
  };

  const renderTraceIcon = (type: string) => {
    switch(type) {
      case 'thought':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'data-query':
        return <Database className="h-4 w-4 text-neutrinos-blue" />;
      case 'calculation':
        return <Calculator className="h-4 w-4 text-green-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'notification':
        return <Mail className="h-4 w-4 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900">Reasoning Flow</h3>
        <p className="text-xs text-gray-500">Step-by-step chain of thought</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {reasoningTraces.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Brain className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">Reasoning flow will appear here</p>
              <p className="text-xs text-gray-400 mt-1">
                As the agent processes your request, you'll see its chain of thought here
              </p>
            </div>
          )}

          {reasoningTraces.map((trace, index) => (
            <div key={trace.id} className="mb-4 last:mb-0">
              <div className="flex">
                <div className="flex flex-col items-center mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {renderTraceIcon(trace.type)}
                  </div>
                  {index < reasoningTraces.length - 1 && (
                    <div className="w-0.5 bg-gray-200 h-full mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <Card className="border-gray-200 mb-4">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{trace.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {trace.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleTraceExpand(trace.id)}
                        >
                          {expandedTraces.includes(trace.id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(trace.timestamp).toLocaleTimeString()} · {trace.durationMs}ms
                      </div>
                      
                      {!expandedTraces.includes(trace.id) ? (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {trace.content}
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {trace.content}
                          </p>
                          
                          {trace.result && (
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                              <div className="font-medium text-xs text-gray-500 mb-1">Result:</div>
                              <div className="text-sm">{trace.result}</div>
                            </div>
                          )}

                          {trace.action && (
                            <div className="mt-2">
                              <Card className="border-neutrinos-blue/20 bg-neutrinos-blue/5">
                                <CardContent className="p-3">
                                  <div className="flex items-start">
                                    <div className="mr-2 mt-0.5">
                                      {renderTraceIcon(trace.action.type)}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium">
                                        {trace.action.title}
                                      </h5>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {trace.action.description}
                                      </p>
                                      
                                      {trace.action.data && (
                                        <div className="mt-2 bg-white rounded-md border border-gray-200 p-2 text-xs">
                                          <pre className="whitespace-pre-wrap">
                                            {JSON.stringify(trace.action.data, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReasoningFlow;