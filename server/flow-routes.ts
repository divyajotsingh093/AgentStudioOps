import express, { Router, Request, Response } from 'express';
import session from 'express-session';
import { z } from 'zod';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

interface CustomRequest extends Request {
  session: session.Session & {
    userId?: number | null;
  };
}

const router: Router = express.Router();

// Get all flows
router.get('/flows', async (req: CustomRequest, res: Response) => {
  try {
    const flows = await storage.getFlows();
    res.json(flows);
  } catch (err) {
    console.error('Error getting flows:', err);
    res.status(500).json({ error: 'Failed to get flows' });
  }
});

// Get flow by ID
router.get('/flows/:id', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const flow = await storage.getFlowById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    res.json(flow);
  } catch (err) {
    console.error('Error getting flow:', err);
    res.status(500).json({ error: 'Failed to get flow' });
  }
});

// Create new flow
router.post('/flows', async (req: CustomRequest, res: Response) => {
  try {
    const flowSchema = z.object({
      name: z.string().min(3),
      description: z.string().optional(),
      status: z.string().default('Draft'),
      tags: z.array(z.string()).optional(),
    });
    
    const validationResult = flowSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    const flowData = validationResult.data;
    const userId = req.session.userId || 1; // Default to 1 if no user is logged in
    
    const newFlow = await storage.createFlow({
      ...flowData,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: flowData.tags || null,
      version: '1.0.0',
      metadata: {},
    });
    
    res.status(201).json(newFlow);
  } catch (err) {
    console.error('Error creating flow:', err);
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

// Update flow
router.put('/flows/:id', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const flow = await storage.getFlowById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const updateSchema = z.object({
      name: z.string().min(3).optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      tags: z.array(z.string()).optional(),
      nodes: z.array(z.any()).optional(),
      edges: z.array(z.any()).optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    const { nodes, edges, ...flowData } = validationResult.data;
    
    // Update flow
    const updatedFlow = await storage.updateFlow(id, {
      ...flowData,
      updatedAt: new Date(),
    });
    
    // If nodes are provided, update them
    if (nodes) {
      // First get existing nodes to determine which to update vs. create
      const existingNodes = await storage.getFlowNodes(id);
      const existingNodeIds = new Set(existingNodes.map(node => node.id));
      
      // Process each node
      for (const node of nodes) {
        if (existingNodeIds.has(node.id)) {
          // Update existing node
          await storage.updateFlowNode(node.id, {
            label: node.label,
            type: node.type,
            position: {
              x: node.positionX,
              y: node.positionY
            },
            config: node.configuration || {},
            updatedAt: new Date(),
          });
        } else {
          // Create new node
          await storage.createFlowNode({
            flowId: id,
            type: node.type,
            name: node.label,
            position: {
              x: node.positionX,
              y: node.positionY
            },
            config: node.configuration || {},
            referenceId: node.referenceId || null,
            referenceType: node.referenceType || null,
          });
        }
      }
    }
    
    // If edges are provided, update them
    if (edges) {
      // First get existing edges to determine which to update vs. create
      const existingEdges = await storage.getFlowEdges(id);
      const existingEdgeIds = new Set(existingEdges.map(edge => edge.id));
      
      // Process each edge
      for (const edge of edges) {
        if (edge.id && existingEdgeIds.has(edge.id)) {
          // Update existing edge
          await storage.updateFlowEdge(edge.id, {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            type: edge.type,
            label: edge.label || null,
            condition: edge.condition || {},
            updatedAt: new Date(),
          });
        } else {
          // Create new edge
          await storage.createFlowEdge({
            flowId: id,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            type: edge.type || 'default',
            label: edge.label || null,
            condition: edge.condition || {},
          });
        }
      }
    }
    
    res.json(updatedFlow);
  } catch (err) {
    console.error('Error updating flow:', err);
    res.status(500).json({ error: 'Failed to update flow' });
  }
});

// Delete flow
router.delete('/flows/:id', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteFlow(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting flow:', err);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

// Get flow nodes
router.get('/flows/:id/nodes', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const nodes = await storage.getFlowNodes(id);
    res.json(nodes);
  } catch (err) {
    console.error('Error getting flow nodes:', err);
    res.status(500).json({ error: 'Failed to get flow nodes' });
  }
});

// Get flow edges
router.get('/flows/:id/edges', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const edges = await storage.getFlowEdges(id);
    res.json(edges);
  } catch (err) {
    console.error('Error getting flow edges:', err);
    res.status(500).json({ error: 'Failed to get flow edges' });
  }
});

// Update flow status
router.put('/flows/:id/status', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const flow = await storage.getFlowById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const schema = z.object({
      status: z.string(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    const { status } = validationResult.data;
    
    const updatedFlow = await storage.updateFlow(id, {
      status,
      updatedAt: new Date(),
    });
    
    res.json(updatedFlow);
  } catch (err) {
    console.error('Error updating flow status:', err);
    res.status(500).json({ error: 'Failed to update flow status' });
  }
});

// Execute flow
router.post('/flows/:id/execute', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const flow = await storage.getFlowById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    if (flow.status !== 'Active') {
      return res.status(400).json({ error: 'Only active flows can be executed' });
    }
    
    const userId = req.session.userId || null;
    const executionId = uuidv4();
    
    const execution = await storage.createFlowExecution({
      id: executionId,
      flowId: id,
      status: 'Running',
      input: req.body?.input || {},
      startedAt: new Date(),
      createdBy: userId,
    });
    
    // In a real implementation, we would start the actual flow execution here
    // For now, we'll just return the execution record
    
    res.status(201).json(execution);
    
    // In a production system, you would kick off an asynchronous process here
    // that would update the execution status as it progresses
    setTimeout(async () => {
      try {
        await storage.updateFlowExecution(executionId, {
          status: 'Success', 
          completedAt: new Date(),
          totalTime: 5000,
          output: { result: 'Flow completed successfully' },
        });
      } catch (error) {
        console.error('Error updating flow execution:', error);
      }
    }, 5000);
    
  } catch (err) {
    console.error('Error executing flow:', err);
    res.status(500).json({ error: 'Failed to execute flow' });
  }
});

// Get flow executions
router.get('/flows/:id/executions', async (req: CustomRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const executions = await storage.getFlowExecutions(id);
    res.json(executions);
  } catch (err) {
    console.error('Error getting flow executions:', err);
    res.status(500).json({ error: 'Failed to get flow executions' });
  }
});

// Get node executions for a specific flow execution
router.get('/executions/:executionId/nodes', async (req: CustomRequest, res: Response) => {
  try {
    const executionId = req.params.executionId;
    const nodeExecutions = await storage.getNodeExecutions(executionId);
    res.json(nodeExecutions);
  } catch (err) {
    console.error('Error getting node executions:', err);
    res.status(500).json({ error: 'Failed to get node executions' });
  }
});

export default router;