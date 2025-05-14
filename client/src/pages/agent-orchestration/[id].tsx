import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Network, Save, Play, ArrowLeft, Settings, Code, Undo, Download, Share2 } from "lucide-react";
import { Helmet } from "react-helmet";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom node components
const TriggerNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 rounded-lg border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-gray-50 dark:bg-gray-800`}>
    <div className="flex items-center">
      <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
        <Play className="h-4 w-4 text-amber-500" />
      </div>
      <h4 className="ml-2 font-medium">{data.label}</h4>
    </div>
    <div className="text-xs text-gray-500 mt-2">{data.description || "Trigger node"}</div>
  </div>
);

const AgentNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 rounded-lg border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-gray-50 dark:bg-gray-800`}>
    <div className="flex items-center">
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
        <Settings className="h-4 w-4 text-blue-500" />
      </div>
      <h4 className="ml-2 font-medium">{data.label}</h4>
    </div>
    <div className="text-xs text-gray-500 mt-2">{data.description || "Agent node"}</div>
  </div>
);

const ToolNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 rounded-lg border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-gray-50 dark:bg-gray-800`}>
    <div className="flex items-center">
      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
        <Code className="h-4 w-4 text-green-500" />
      </div>
      <h4 className="ml-2 font-medium">{data.label}</h4>
    </div>
    <div className="text-xs text-gray-500 mt-2">{data.description || "Tool node"}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  tool: ToolNode,
};

type FlowData = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  version: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
};

type FlowNode = {
  id: string;
  flowId: number;
  nodeType: string;
  data: object;
  position: { x: number, y: number };
  createdAt: string;
  updatedAt: string;
};

type FlowEdge = {
  id: string;
  flowId: number;
  source: string;
  target: string;
  data: object;
  createdAt: string;
  updatedAt: string;
};

export default function FlowEditor() {
  const params = useParams<{ id: string }>();
  const flowId = Number(params.id);
  const [, navigate] = useLocation();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTab, setActiveTab] = useState("canvas");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [nodeFormData, setNodeFormData] = useState({
    label: "",
    description: "",
    nodeType: "agent",
  });

  // Fetch flow data
  const { data: flowData, isLoading, isError } = useQuery<FlowData>({
    queryKey: ['/api/flows', flowId],
    retry: 1,
  });

  // Update flow mutation
  const updateFlowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update flow');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flows', flowId] });
      setIsDirty(false);
      toast({
        title: "Flow saved",
        description: "Your flow has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the flow. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Execute flow mutation
  const executeFlowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/flows/${flowId}/execute`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute flow');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Flow execution started",
        description: `Execution ID: ${data.executionId}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute the flow. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load flow data
  useEffect(() => {
    if (flowData) {
      if (flowData.nodes && flowData.nodes.length > 0) {
        setNodes(flowData.nodes);
      }
      
      if (flowData.edges && flowData.edges.length > 0) {
        setEdges(flowData.edges);
      }
    }
  }, [flowData, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    
    setNodeFormData({
      label: node.data.label || "",
      description: node.data.description || "",
      nodeType: node.type || "agent",
    });
    
    setActiveTab("properties");
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setActiveTab("properties");
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Handle node changes
  const handleNodeDataChange = (key: string, value: string) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            [key]: value,
          },
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setIsDirty(true);
  };

  // Handle node type change
  const handleNodeTypeChange = (value: string) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          type: value,
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setNodeFormData({
      ...nodeFormData,
      nodeType: value,
    });
    setIsDirty(true);
  };

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      data: { label: 'Connection' },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    setIsDirty(true);
  }, [setEdges]);

  // Add new node
  const addNode = (type: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 250, y: 250 },
      data: { 
        label: `New ${type} node`,
        description: `Description for ${type} node`,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setIsDirty(true);
  };

  // Save flow
  const saveFlow = () => {
    updateFlowMutation.mutate();
  };

  // Execute flow
  const executeFlow = () => {
    executeFlowMutation.mutate();
  };
  
  // Delete selected element
  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
    
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
    
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Loading Flow...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !flowData) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Error Loading Flow</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Failed to load flow data. Please try again.</div>
        </div>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/agent-orchestration')}>
            Return to Flows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{flowData.name} | Agent Orchestration | Neutrinos AI Agent Studio</title>
        <meta name="description" content={`Edit and manage the ${flowData.name} agent orchestration flow`} />
      </Helmet>
      
      <div className="container mx-auto p-4 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/agent-orchestration')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Network className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{flowData.name}</h1>
            <Badge className="ml-2">{flowData.status}</Badge>
            <Badge variant="outline" className="ml-1">v{flowData.version}</Badge>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={executeFlow} 
              disabled={executeFlowMutation.isPending || updateFlowMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Flow
            </Button>
            <Button 
              onClick={saveFlow} 
              disabled={!isDirty || updateFlowMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("canvas")}>
                  <Network className="h-4 w-4 mr-2" />
                  Canvas View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("properties")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Properties
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Flow
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Flow
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={deleteSelected}>
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>
            
            <div className="py-2 px-4 space-x-2">
              <Button variant="outline" size="sm" onClick={() => addNode('trigger')}>Add Trigger</Button>
              <Button variant="outline" size="sm" onClick={() => addNode('agent')}>Add Agent</Button>
              <Button variant="outline" size="sm" onClick={() => addNode('tool')}>Add Tool</Button>
            </div>
          </div>
          
          <TabsContent value="canvas" className="flex-1 relative overflow-hidden">
            <div className="w-full h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="flex-1">
            <div className="p-4 h-full overflow-auto">
              {!selectedNode && !selectedEdge ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Settings className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a node or edge to edit its properties</p>
                </div>
              ) : selectedNode ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Node Properties</CardTitle>
                    <CardDescription>
                      Edit the properties of this node
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="node-type">Node Type</Label>
                      <Select 
                        value={nodeFormData.nodeType} 
                        onValueChange={handleNodeTypeChange}
                      >
                        <SelectTrigger id="node-type">
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trigger">Trigger</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="tool">Tool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="node-label">Label</Label>
                      <Input 
                        id="node-label" 
                        value={nodeFormData.label} 
                        onChange={(e) => {
                          setNodeFormData({...nodeFormData, label: e.target.value});
                          handleNodeDataChange('label', e.target.value);
                        }} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="node-description">Description</Label>
                      <Textarea 
                        id="node-description" 
                        value={nodeFormData.description} 
                        onChange={(e) => {
                          setNodeFormData({...nodeFormData, description: e.target.value});
                          handleNodeDataChange('description', e.target.value);
                        }} 
                      />
                    </div>
                    
                    {/* Node-type specific properties would go here */}
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={deleteSelected}
                        className="w-full"
                      >
                        Delete Node
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Edge Properties</CardTitle>
                    <CardDescription>
                      Edit the properties of this connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edge-label">Label</Label>
                      <Input 
                        id="edge-label" 
                        value={selectedEdge?.data?.label || ""} 
                        onChange={(e) => {
                          setEdges(eds => eds.map(edge => {
                            if (edge.id === selectedEdge?.id) {
                              return {
                                ...edge,
                                data: { ...edge.data, label: e.target.value },
                              };
                            }
                            return edge;
                          }));
                          setIsDirty(true);
                        }} 
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={deleteSelected}
                        className="w-full"
                      >
                        Delete Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="executions" className="flex-1 p-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Flow Executions</CardTitle>
                <CardDescription>
                  View the execution history of this flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="flex justify-center">
                    <Play className="h-12 w-12 text-gray-400 mb-2" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No executions yet</h3>
                  <p className="text-gray-500">
                    Run this flow to see execution details here
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={executeFlow} 
                  disabled={executeFlowMutation.isPending}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Flow
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}