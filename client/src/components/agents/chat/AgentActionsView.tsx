import React, { useState } from 'react';
import { 
  Search,
  RefreshCw,
  Plus,
  Clock,
  Gauge,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface AgentAction {
  id: string;
  name: string;
  category: string;
  description: string;
  status?: 'available' | 'restricted';
  tags?: string[];
  configuration?: Record<string, any>;
}

interface ActionHistory {
  id: string;
  type: string;
  title: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error' | 'pending';
  metadata?: Record<string, any>;
  confidence?: number;
}

interface AgentActionsViewProps {
  availableActions: AgentAction[];
  actionHistory: ActionHistory[];
  onSelectAction?: (action: AgentAction) => void;
  onCreateAction?: () => void;
  onExportHistory?: () => void;
  onApprove?: (actionId: string) => void;
}

const AgentActionsView: React.FC<AgentActionsViewProps> = ({
  availableActions = [],
  actionHistory = [],
  onSelectAction,
  onCreateAction,
  onExportHistory,
  onApprove
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  const filteredActions = availableActions.filter(action => 
    action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (e: React.MouseEvent, actionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove?.(actionId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-white border-b">
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <h2 className="text-sm font-medium">Accelerated UW Agent</h2>
          <Badge variant="outline" className="ml-2 text-xs">
            Running
          </Badge>
          <div className="text-xs text-gray-500 ml-3">
            Session: 26 min
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="available" 
        className="flex-1 flex flex-col"
        onValueChange={(value) => setActiveTab(value as 'available' | 'history')}
      >
        <TabsList className="grid grid-cols-2 mb-0 bg-gray-100 p-1 rounded-none">
          <TabsTrigger value="available" className="text-xs py-1.5">Available Actions</TabsTrigger>
          <TabsTrigger value="history" className="text-xs py-1.5">Action History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="flex-1 flex flex-col mt-0 p-0">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search actions..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {filteredActions.map(action => (
                <div 
                  key={action.id}
                  className="border rounded-md overflow-hidden hover:shadow-sm cursor-pointer transition-shadow"
                  onClick={() => onSelectAction?.(action)}
                >
                  <div className="p-3 bg-white">
                    <div className="flex items-start">
                      {action.category === 'Policy' ? (
                        <div className="h-5 w-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <Plus className="h-3 w-3 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <FileText className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-sm">{action.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant={action.category === 'Policy' ? 'secondary' : 'outline'} className="text-xs">
                          {action.category}
                        </Badge>
                      </div>
                      
                      {action.status === 'restricted' && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Restricted
                        </Badge>
                      )}
                    </div>

                    {action.configuration && (
                      <div className="mt-3 pt-3 border-t text-xs">
                        {Object.entries(action.configuration).map(([key, value]) => (
                          <div key={key} className="flex items-center mb-1 text-gray-600">
                            <span className="font-medium mr-2">{key}:</span>
                            <span>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredActions.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm">No actions found</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full text-xs mt-2"
                onClick={onCreateAction}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Custom Action
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 flex flex-col mt-0 p-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {actionHistory.map(item => (
                <div key={item.id} className="border rounded-md overflow-hidden bg-white">
                  <div className="p-3">
                    <div className="flex items-center">
                      {item.type === 'Risk Assessment' ? (
                        <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                          <Gauge className="h-3 w-3 text-red-600" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <FileText className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      
                      <div className="ml-auto flex items-center">
                        <Badge 
                          className={`text-xs ${
                            item.status === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            item.status === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                          variant="outline"
                        >
                          {item.status || 'Completed'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timestamp.toLocaleTimeString()} • {item.timestamp.toLocaleDateString()}
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    
                    {item.metadata && (
                      <div className="mt-3 pt-3 border-t">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center mb-1 text-xs text-gray-600">
                            <span className="font-medium mr-2">{key}:</span>
                            <span>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.confidence !== undefined && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs">Confidence: <span className="font-medium">{Math.round(item.confidence * 100)}%</span></div>
                        
                        <div className="flex items-center space-x-2">
                          {item.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={(e) => handleApprove(e, item.id)}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {actionHistory.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm">No action history</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t">
            <Button 
              variant="outline" 
              className="w-full text-xs"
              onClick={onExportHistory}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentActionsView;