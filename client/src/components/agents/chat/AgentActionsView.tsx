import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Download, 
  ArrowUpRight, 
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Search
} from "lucide-react";
import { AgentAction, ActionHistoryItem } from "@/lib/mock-actions";

interface AgentActionsViewProps {
  availableActions: AgentAction[];
  actionHistory: ActionHistoryItem[];
  onSelectAction: (action: AgentAction) => void;
  onCreateAction: () => void;
  onExportHistory: () => void;
  onApprove: (actionId: string) => void;
}

const AgentActionsView: React.FC<AgentActionsViewProps> = ({
  availableActions,
  actionHistory,
  onSelectAction,
  onCreateAction,
  onExportHistory,
  onApprove
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories for filtering
  const categories = [...new Set(availableActions.map(action => action.category))];
  
  // Filter actions based on search and category
  const filteredActions = availableActions.filter(action => {
    const matchesSearch = 
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? action.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Function to render status badge
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Success
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'restricted':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            Restricted
          </Badge>
        );
      case 'available':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            Available
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Agent Capabilities</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExportHistory}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            size="sm"
            className="bg-neutrinos-blue hover:bg-neutrinos-blue/90"
            onClick={onCreateAction}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Action
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="actions" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="actions">Available Actions</TabsTrigger>
          <TabsTrigger value="history">Action History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="flex-1 flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-neutrinos-blue hover:bg-neutrinos-blue/90" : ""}
            >
              All
            </Button>
            {categories.map(category => (
              <Button 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-neutrinos-blue hover:bg-neutrinos-blue/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search actions..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutrinos-blue focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {/* Rule Logic Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Rule Logic</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Access and apply logical rules to the current application
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Enables agents to access and apply defined business rules</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-rule-logic',
                      name: 'Rule Logic',
                      category: 'Rules',
                      description: 'Access and apply logical rules to the current application',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Agent Rules Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Agent Rules</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Create and manage dynamic agent-generated rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Rules that agents create when deemed necessary based on patterns</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-agent-rules',
                      name: 'Agent Rules',
                      category: 'Rules',
                      description: 'Create and manage dynamic agent-generated rules',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Process Workflow Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Process Workflow</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Trigger human-in-the-loop workflows when needed
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Initiates approval processes or expert review workflows</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-process-workflow',
                      name: 'Process Workflow',
                      category: 'Workflow',
                      description: 'Trigger human-in-the-loop workflows when needed',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Task Forms Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Task Forms</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Generate and reference task forms for human completion
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Creates specialized forms for data collection and human input</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-task-forms',
                      name: 'Task Forms',
                      category: 'Forms',
                      description: 'Generate and reference task forms for human completion',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Document Intelligence Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Document Intelligence</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Extract and classify information from documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Processes uploaded documents and extracts relevant information</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-document-intelligence',
                      name: 'Document Intelligence',
                      category: 'Documents',
                      description: 'Extract and classify information from documents',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Tooling Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Tooling</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Connect with external tools and products
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Integrates with insurance-specific tools and external services</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-tooling',
                      name: 'Tooling',
                      category: 'Integration',
                      description: 'Connect with external tools and products',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Agent Orchestration Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Agent Orchestration</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Manage sub-agent orchestration and reasoning flow
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Coordinates specialized agents to accomplish complex tasks</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-agent-orchestration',
                      name: 'Agent Orchestration',
                      category: 'Orchestration',
                      description: 'Manage sub-agent orchestration and reasoning flow',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Data Fabric Action Card */}
              <Card className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-semibold">Data Fabric</CardTitle>
                    {renderStatusBadge('available')}
                  </div>
                  <CardDescription className="text-sm">
                    Access data models, schemas, and vector stores
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="text-xs text-gray-500">
                    <p>Provides unified data access across structured and unstructured sources</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                    onClick={() => onSelectAction({
                      id: 'action-data-fabric',
                      name: 'Data Fabric',
                      category: 'Data',
                      description: 'Access data models, schemas, and vector stores',
                      status: 'available'
                    })}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Display all the filtered standard actions */}
              {filteredActions.map(action => (
                <Card key={action.id} className="overflow-hidden border-l-4 border-l-neutrinos-blue">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md font-semibold">{action.name}</CardTitle>
                      {renderStatusBadge(action.status)}
                    </div>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-2">
                    {action.tags && action.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {action.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {action.configuration && (
                      <div className="text-xs text-gray-500">
                        {Object.entries(action.configuration).map(([key, value]) => (
                          <p key={key}>{key}: {value}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                      onClick={() => onSelectAction(action)}
                    >
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="space-y-4 pb-4">
              {actionHistory.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-md font-semibold">{item.title}</CardTitle>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.type} • {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(item.status)}
                        {item.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => onApprove(item.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {item.metadata && (
                      <div className="text-sm">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="flex mb-1">
                            <span className="font-medium w-32">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.confidence !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Confidence</span>
                          <span className="text-sm text-gray-500">{Math.round(item.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-neutrinos-blue h-2 rounded-full" 
                            style={{ width: `${item.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentActionsView;