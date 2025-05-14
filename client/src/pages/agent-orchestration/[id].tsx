import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, PlayCircle, PauseCircle, LayoutGrid, Settings, Clock, PanelRightClose, PanelRightOpen } from "lucide-react";

// Custom node types will be implemented here
const nodeTypes = {};

export default function AgentOrchestrationFlow() {
  const [match, params] = useRoute("/agent-orchestration/:id");
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Fetch flow details
  const { data: flow, isLoading: isFlowLoading, error: flowError } = useQuery({
    queryKey: [`/api/flows/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch nodes for this flow
  const { data: flowNodes, isLoading: isNodesLoading } = useQuery({
    queryKey: [`/api/flows/${params?.id}/nodes`],
    enabled: !!params?.id,
  });

  // Fetch edges for this flow
  const { data: flowEdges, isLoading: isEdgesLoading } = useQuery({
    queryKey: [`/api/flows/${params?.id}/edges`],
    enabled: !!params?.id,
  });

  // Fetch execution history
  const { data: executions, isLoading: isExecutionsLoading } = useQuery({
    queryKey: [`/api/flows/${params?.id}/executions`],
    enabled: !!params?.id,
  });

  // Prepare nodes and edges when data is loaded
  useEffect(() => {
    if (flowNodes) {
      setNodes(flowNodes.map((node) => ({
        id: node.id.toString(),
        type: node.type,
        position: { x: node.positionX, y: node.positionY },
        data: { 
          label: node.label,
          type: node.type,
          configuration: node.configuration
        },
      })));
    }
    
    if (flowEdges) {
      setEdges(flowEdges.map((edge) => ({
        id: edge.id.toString(),
        source: edge.sourceId.toString(),
        target: edge.targetId.toString(),
        label: edge.label,
        type: edge.type,
        animated: true,
        data: {
          condition: edge.condition
        }
      })));
    }
  }, [flowNodes, flowEdges]);

  // Handle node changes
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Handle edge changes  
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle connections between nodes
  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection,
      animated: true,
      data: { condition: {} }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  // Handle save flow
  const saveFlowMutation = useMutation({
    mutationFn: (data) => {
      return apiRequest(`/api/flows/${params?.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/flows/${params?.id}`] });
      toast({
        title: "Flow saved",
        description: "The flow has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not save flow. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle save
  const handleSave = () => {
    if (!flow) return;
    
    const nodeData = nodes.map(node => ({
      id: parseInt(node.id),
      flowId: parseInt(params?.id),
      type: node.data.type,
      label: node.data.label,
      positionX: node.position.x,
      positionY: node.position.y,
      configuration: node.data.configuration
    }));
    
    const edgeData = edges.map(edge => ({
      id: edge.id.includes('-') ? null : parseInt(edge.id), // New edges don't have numeric IDs
      flowId: parseInt(params?.id),
      sourceId: parseInt(edge.source),
      targetId: parseInt(edge.target),
      type: edge.type || 'default',
      label: edge.label || '',
      condition: edge.data?.condition || {}
    }));
    
    saveFlowMutation.mutate({
      nodes: nodeData,
      edges: edgeData
    });
  };

  // Handle flow execution
  const executeFlowMutation = useMutation({
    mutationFn: () => {
      return apiRequest(`/api/flows/${params?.id}/execute`, {
        method: "POST"
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/flows/${params?.id}/executions`] });
      toast({
        title: "Flow execution started",
        description: `Execution ID: ${data.id}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not execute flow. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle flow active status
  const toggleFlowStatusMutation = useMutation({
    mutationFn: (newStatus) => {
      return apiRequest(`/api/flows/${params?.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/flows/${params?.id}`] });
      toast({
        title: "Status updated",
        description: `Flow status has been updated.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update flow status. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isFlowLoading || isNodesLoading || isEdgesLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold">Loading flow...</h1>
        </div>
        <div className="h-[calc(100vh-200px)] animate-pulse bg-gray-100 rounded-md"></div>
      </div>
    );
  }

  if (flowError || !flow) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Link href="/agent-orchestration">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Flow Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>The requested flow could not be found or you don't have permission to view it.</p>
            <Link href="/agent-orchestration">
              <Button className="mt-4">Return to Flows</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link href="/agent-orchestration">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{flow.name}</h1>
          <div className="ml-4 bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
            {flow.status}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={flow.status === "Active" ? "destructive" : "default"}
            size="sm"
            onClick={() => toggleFlowStatusMutation.mutate(flow.status === "Active" ? "Draft" : "Active")}
          >
            {flow.status === "Active" ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button 
            size="sm"
            onClick={() => executeFlowMutation.mutate()}
            disabled={flow.status !== "Active"}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Execute
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleSave}
            disabled={saveFlowMutation.isPending}
          >
            {saveFlowMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex">
        <div className={`flex-grow relative border rounded-md overflow-hidden transition-all ${isPanelOpen ? 'mr-80' : ''}`}>
          <div className="h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              onInit={setReactFlowInstance}
            >
              <Background />
              <Controls />
              <MiniMap />
              <Panel position="top-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white"
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                  {isPanelOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </Button>
              </Panel>
            </ReactFlow>
          </div>
        </div>
        
        {isPanelOpen && (
          <div className="w-80 border-l overflow-auto h-full">
            <Tabs defaultValue="nodes">
              <TabsList className="w-full">
                <TabsTrigger value="nodes" className="flex-1">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Nodes
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="executions" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="nodes" className="p-4">
                <h3 className="text-lg font-medium mb-3">Add Node</h3>
                <div className="space-y-3">
                  <Card className="cursor-grab">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Agent Node</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-grab">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Tool Node</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-grab">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Condition Node</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-grab">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Input Node</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-grab">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Output Node</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="p-4">
                <h3 className="text-lg font-medium mb-3">Flow Settings</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Flow ID: {params?.id}</p>
                    <p className="text-sm text-gray-500">Created At: {new Date(flow.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Status: {flow.status}</p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm">{flow.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="executions" className="p-4">
                <h3 className="text-lg font-medium mb-3">Execution History</h3>
                {isExecutionsLoading ? (
                  <p>Loading execution history...</p>
                ) : executions?.length > 0 ? (
                  <div className="space-y-3">
                    {executions.map((execution) => (
                      <Card key={execution.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              execution.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              execution.status === 'Failed' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {execution.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(execution.startedAt).toLocaleString()}
                            </span>
                          </div>
                          {execution.completedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {Math.round((new Date(execution.completedAt) - new Date(execution.startedAt)) / 1000)}s
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No executions yet</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}