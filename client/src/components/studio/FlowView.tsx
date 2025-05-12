import { useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

// Create a simple agent workflow for demo purposes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'User Input' },
    position: { x: 250, y: 0 },
    style: { backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '10px' }
  },
  {
    id: '2',
    data: { label: 'Process Input' },
    position: { x: 250, y: 100 },
    style: { backgroundColor: '#eef2ff', borderRadius: '0.75rem', padding: '10px', borderColor: '#4F46E5' }
  },
  {
    id: '3',
    data: { label: 'Document Intelligence' },
    position: { x: 100, y: 200 },
    style: { backgroundColor: '#eef2ff', borderRadius: '0.75rem', padding: '10px', borderColor: '#4F46E5' }
  },
  {
    id: '4',
    data: { label: 'Rules Engine' },
    position: { x: 400, y: 200 },
    style: { backgroundColor: '#eef2ff', borderRadius: '0.75rem', padding: '10px', borderColor: '#4F46E5' }
  },
  {
    id: '5',
    data: { label: 'Generate Response' },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#eef2ff', borderRadius: '0.75rem', padding: '10px', borderColor: '#4F46E5' }
  },
  {
    id: '6',
    type: 'output',
    data: { label: 'Agent Response' },
    position: { x: 250, y: 400 },
    style: { backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '10px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6', animated: true },
];

const FlowView = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default FlowView;
