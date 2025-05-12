import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ZoomIn, ZoomOut, Database, FileText, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactFlow, { 
  Background, 
  Controls, 
  NodeTypes, 
  Edge, 
  Node, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node components
const DatabaseNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-200">
    <div className="flex items-center">
      <Database className="h-4 w-4 text-blue-600 mr-2" />
      <div className="font-bold">{data.label}</div>
    </div>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const DocumentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-200">
    <div className="flex items-center">
      <FileText className="h-4 w-4 text-green-600 mr-2" />
      <div className="font-bold">{data.label}</div>
    </div>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const nodeTypes: NodeTypes = {
  database: DatabaseNode,
  document: DocumentNode,
};

// Mock data for data lineage
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'database',
    data: { label: 'Customer Database' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    type: 'database',
    data: { label: 'Policy System' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    type: 'document',
    data: { label: 'Medical Records' },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    type: 'database',
    data: { label: 'Rules Engine' },
    position: { x: 250, y: 200 },
  },
  {
    id: '5',
    type: 'document',
    data: { label: 'Underwriting Decision' },
    position: { x: 250, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

const AgentDataLineage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { toast } = useToast();
  
  const handleExportImage = () => {
    toast({
      title: "Graph exported",
      description: "Data lineage graph has been exported as PNG.",
    });
  };
  
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Data Lineage Graph</h2>
        <Button 
          variant="outline" 
          onClick={handleExportImage}
        >
          <Download className="mr-2 h-4 w-4" />
          Export as PNG
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <Card className="shadow-sm lg:col-span-3 h-[500px]">
          <CardContent className="p-0 h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </CardContent>
        </Card>
        
        {/* Node Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Node Details</CardTitle>
            <CardDescription>
              {selectedNode 
                ? `Information about ${selectedNode.data.label}`
                : 'Select a node to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1">
                    <Badge className="bg-blue-100 text-blue-700" variant="outline">
                      {selectedNode.type === 'database' ? 'Database' : 'Document'}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Access Permissions</h3>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs flex justify-between bg-gray-50 p-2 rounded">
                      <span>Underwriting Agents</span>
                      <Badge className="bg-green-100 text-green-700" variant="outline">Read</Badge>
                    </div>
                    <div className="text-xs flex justify-between bg-gray-50 p-2 rounded">
                      <span>Admin Users</span>
                      <Badge className="bg-purple-100 text-purple-700" variant="outline">Admin</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sample Data</h3>
                  <div className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                    <pre className="text-xs">
                      {selectedNode.type === 'database' 
                        ? `{
  "id": "cust-12345",
  "name": "[MASKED]",
  "policy_ids": ["POL-9876", "POL-5432"],
  "risk_score": 82,
  "last_updated": "2025-05-15T14:32:10"
}`
                        : `{
  "document_id": "DOC-7890",
  "type": "Medical Report",
  "status": "Verified",
  "uploaded_by": "Dr. [MASKED]",
  "date": "2025-05-10"
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Connections</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-xs">
                      <Link2 className="h-3 w-3 mr-2 text-gray-400" />
                      Connected to {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} nodes
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <Database className="h-12 w-12 text-gray-300 mb-3" />
                <p>Click on a node in the graph to view its details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDataLineage;