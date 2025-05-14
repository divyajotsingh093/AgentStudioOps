import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { 
  agents, runs, issueSchema, governanceIssueSchema, 
  insertAgentSchema, updateAgentSchema, insertRunSchema,
  insertAgentComponentSchema, updateAgentComponentSchema,
  insertDataSourceSchema, updateDataSourceSchema,
  insertDataConnectorSchema, updateDataConnectorSchema,
  insertDataPermissionSchema, insertToolSchema, updateToolSchema,
  insertToolExecutionSchema, toolTypeEnum, toolAuthTypeEnum, toolStatusEnum,
  insertTriggerSchema, updateTriggerSchema, insertTriggerEventSchema,
  triggerTypeEnum, triggerStatusEnum
} from "@shared/schema";
import { z } from "zod";
import aiRoutes from './ai-routes';
import documentRoutes from './document-routes';
import chatRoutes, { registerChatWebSocketHandler } from './chat-routes';
import flowRoutes from './flow-routes';
import idpRoutes from './idp-routes';

// Collaborative editing types
interface CollaborationSession {
  agentId: string;
  clients: Map<string, WebSocket>;
  lastModified: Date;
  activeUsers: Map<string, {
    username: string;
    cursorPosition?: {
      componentId: number;
      position: number;
    };
    color: string;
  }>;
  changes: Array<{
    id: string;
    type: 'component_update' | 'component_create' | 'component_delete' | 'agent_update';
    data: any;
    userId: string;
    timestamp: Date;
  }>;
}

// Store active collaboration sessions
const collaborationSessions = new Map<string, CollaborationSession>();

// Generate random colors for users
function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#073B4C', '#6F2DBD', '#8338EC', '#3A86FF', '#FB5607'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Broadcast to all clients in a session except sender
function broadcastToSession(
  session: CollaborationSession, 
  message: any, 
  excludeClientId?: string
) {
  const messageStr = JSON.stringify(message);
  
  for (const [clientId, client] of session.clients.entries()) {
    if (excludeClientId !== clientId && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the AI agent platform
  
  // Register AI routes
  app.use('/api/ai', aiRoutes);
  
  // Register Document routes
  app.use('/api/documents', documentRoutes);
  
  // Register Chat routes
  app.use('/api/chat', chatRoutes);
  
  // Register Agent Orchestration routes
  app.use('/api', flowRoutes);
  
  // Register Identity Provider (IDP) routes
  app.use('/api/idp', idpRoutes);
  
  // Agents API
  app.get("/api/agents", async (req, res) => {
    try {
      const allAgents = await storage.getAgents();
      res.json(allAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgentById(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const newAgent = await storage.createAgent(agentData);
      res.status(201).json(newAgent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const agentData = updateAgentSchema.parse(req.body);
      const updatedAgent = await storage.updateAgent(req.params.id, agentData);
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(updatedAgent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  // Agent Components API - for enhanced builder
  app.get("/api/agents/:agentId/components", async (req, res) => {
    try {
      const components = await storage.getAgentComponents(req.params.agentId);
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent components" });
    }
  });

  app.get("/api/agent-components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const component = await storage.getAgentComponentById(id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      res.json(component);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch component" });
    }
  });

  app.post("/api/agent-components", async (req, res) => {
    try {
      const componentData = insertAgentComponentSchema.parse(req.body);
      const newComponent = await storage.createAgentComponent(componentData);
      res.status(201).json(newComponent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid component data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent component" });
    }
  });

  app.put("/api/agent-components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const componentData = updateAgentComponentSchema.parse(req.body);
      const updatedComponent = await storage.updateAgentComponent(id, componentData);
      if (!updatedComponent) {
        return res.status(404).json({ message: "Component not found" });
      }
      res.json(updatedComponent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid component data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update agent component" });
    }
  });

  app.delete("/api/agent-components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const success = await storage.deleteAgentComponent(id);
      if (!success) {
        return res.status(404).json({ message: "Component not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent component" });
    }
  });

  // Runs API
  app.get("/api/runs", async (req, res) => {
    try {
      const allRuns = await storage.getRuns();
      res.json(allRuns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch runs" });
    }
  });

  app.get("/api/runs/:id", async (req, res) => {
    try {
      const run = await storage.getRunById(req.params.id);
      if (!run) {
        return res.status(404).json({ message: "Run not found" });
      }
      res.json(run);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch run" });
    }
  });

  app.post("/api/runs", async (req, res) => {
    try {
      const runData = insertRunSchema.parse(req.body);
      const newRun = await storage.createRun(runData);
      res.status(201).json(newRun);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid run data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create run" });
    }
  });

  app.put("/api/runs/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['Success', 'Failed', 'Needs Approval', 'In Progress'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRun = await storage.updateRunStatus(req.params.id, status);
      if (!updatedRun) {
        return res.status(404).json({ message: "Run not found" });
      }
      res.json(updatedRun);
    } catch (error) {
      res.status(500).json({ message: "Failed to update run status" });
    }
  });

  // Governance API
  app.get("/api/governance/issues", async (req, res) => {
    try {
      const issues = await storage.getGovernanceIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch governance issues" });
    }
  });

  app.post("/api/governance/issues", async (req, res) => {
    try {
      const issueData = governanceIssueSchema.parse(req.body);
      const newIssue = await storage.createGovernanceIssue(issueData);
      res.status(201).json(newIssue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create governance issue" });
    }
  });

  app.put("/api/governance/issues/:id", async (req, res) => {
    try {
      const { status, notes } = req.body;
      if (!status || !['Approved', 'Rejected', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedIssue = await storage.updateGovernanceIssue(req.params.id, status, notes);
      if (!updatedIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json(updatedIssue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update governance issue" });
    }
  });

  // Data Fabric API
  // Data Sources
  app.get("/api/data-sources", async (req, res) => {
    try {
      const sources = await storage.getDataSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.get("/api/data-sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data source ID" });
      }
      
      const source = await storage.getDataSourceById(id);
      if (!source) {
        return res.status(404).json({ message: "Data source not found" });
      }
      res.json(source);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data source" });
    }
  });

  app.post("/api/data-sources", async (req, res) => {
    try {
      const sourceData = insertDataSourceSchema.parse(req.body);
      const newSource = await storage.createDataSource(sourceData);
      res.status(201).json(newSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data source", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data source" });
    }
  });

  app.put("/api/data-sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data source ID" });
      }
      
      const sourceData = updateDataSourceSchema.parse(req.body);
      const updatedSource = await storage.updateDataSource(id, sourceData);
      if (!updatedSource) {
        return res.status(404).json({ message: "Data source not found" });
      }
      res.json(updatedSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data source", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  app.delete("/api/data-sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data source ID" });
      }
      
      const success = await storage.deleteDataSource(id);
      if (!success) {
        return res.status(404).json({ message: "Data source not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data source" });
    }
  });

  // Data Connectors
  app.get("/api/data-connectors", async (req, res) => {
    try {
      const connectors = await storage.getDataConnectors();
      res.json(connectors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data connectors" });
    }
  });

  app.get("/api/data-connectors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data connector ID" });
      }
      
      const connector = await storage.getDataConnectorById(id);
      if (!connector) {
        return res.status(404).json({ message: "Data connector not found" });
      }
      res.json(connector);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data connector" });
    }
  });

  app.post("/api/data-connectors", async (req, res) => {
    try {
      const connectorData = insertDataConnectorSchema.parse(req.body);
      const newConnector = await storage.createDataConnector(connectorData);
      res.status(201).json(newConnector);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data connector", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data connector" });
    }
  });

  app.put("/api/data-connectors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data connector ID" });
      }
      
      const connectorData = updateDataConnectorSchema.parse(req.body);
      const updatedConnector = await storage.updateDataConnector(id, connectorData);
      if (!updatedConnector) {
        return res.status(404).json({ message: "Data connector not found" });
      }
      res.json(updatedConnector);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data connector", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update data connector" });
    }
  });

  app.delete("/api/data-connectors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data connector ID" });
      }
      
      const success = await storage.deleteDataConnector(id);
      if (!success) {
        return res.status(404).json({ message: "Data connector not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data connector" });
    }
  });

  // Data Permissions
  app.get("/api/data-sources/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data source ID" });
      }
      
      const permissions = await storage.getDataPermissions(id);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data permissions" });
    }
  });

  app.post("/api/data-permissions", async (req, res) => {
    try {
      const permissionData = insertDataPermissionSchema.parse(req.body);
      const newPermission = await storage.createDataPermission(permissionData);
      res.status(201).json(newPermission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data permission", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data permission" });
    }
  });

  app.delete("/api/data-permissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid data permission ID" });
      }
      
      const success = await storage.deleteDataPermission(id);
      if (!success) {
        return res.status(404).json({ message: "Data permission not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data permission" });
    }
  });

  // Tool Integration API
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tool ID" });
      }
      
      const tool = await storage.getToolById(id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post("/api/tools", async (req, res) => {
    try {
      const toolData = insertToolSchema.parse(req.body);
      const newTool = await storage.createTool(toolData);
      res.status(201).json(newTool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tool data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.put("/api/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tool ID" });
      }
      
      const toolData = updateToolSchema.parse(req.body);
      const updatedTool = await storage.updateTool(id, toolData);
      if (!updatedTool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(updatedTool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tool data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tool ID" });
      }
      
      const success = await storage.deleteTool(id);
      if (!success) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Tool Execution API
  app.get("/api/tool-executions", async (req, res) => {
    try {
      const toolId = req.query.toolId ? parseInt(req.query.toolId as string) : undefined;
      const runId = req.query.runId as string | undefined;
      
      const executions = await storage.getToolExecutions(toolId, runId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool executions" });
    }
  });

  app.get("/api/tool-executions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid execution ID" });
      }
      
      const execution = await storage.getToolExecutionById(id);
      if (!execution) {
        return res.status(404).json({ message: "Tool execution not found" });
      }
      res.json(execution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool execution" });
    }
  });

  app.post("/api/tool-executions", async (req, res) => {
    try {
      const executionData = insertToolExecutionSchema.parse(req.body);
      const newExecution = await storage.createToolExecution(executionData);
      res.status(201).json(newExecution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid execution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tool execution" });
    }
  });

  // Tool metadata and configuration
  app.get("/api/tool-metadata", (req, res) => {
    try {
      res.json({
        types: toolTypeEnum.options,
        authTypes: toolAuthTypeEnum.options,
        statuses: toolStatusEnum.options
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool metadata" });
    }
  });
  
  // Trigger metadata
  app.get("/api/trigger-metadata", (req, res) => {
    try {
      res.json({
        types: triggerTypeEnum.options,
        statuses: triggerStatusEnum.options
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trigger metadata" });
    }
  });

  // Trigger API Routes
  app.get("/api/triggers", async (req, res) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const triggers = await storage.getTriggers(agentId);
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch triggers" });
    }
  });
  
  app.get("/api/triggers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trigger ID" });
      }
      
      const trigger = await storage.getTriggerById(id);
      if (!trigger) {
        return res.status(404).json({ message: "Trigger not found" });
      }
      
      res.json(trigger);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trigger" });
    }
  });
  
  app.post("/api/triggers", async (req, res) => {
    try {
      const triggerData = insertTriggerSchema.parse(req.body);
      const newTrigger = await storage.createTrigger(triggerData);
      res.status(201).json(newTrigger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trigger data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trigger" });
    }
  });
  
  app.put("/api/triggers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trigger ID" });
      }
      
      const triggerData = updateTriggerSchema.partial().parse(req.body);
      const updatedTrigger = await storage.updateTrigger(id, triggerData);
      
      if (!updatedTrigger) {
        return res.status(404).json({ message: "Trigger not found" });
      }
      
      res.json(updatedTrigger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trigger data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update trigger" });
    }
  });
  
  app.delete("/api/triggers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trigger ID" });
      }
      
      const success = await storage.deleteTrigger(id);
      if (!success) {
        return res.status(404).json({ message: "Trigger not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trigger" });
    }
  });
  
  // Trigger Event API Routes
  app.get("/api/trigger-events", async (req, res) => {
    try {
      const triggerId = req.query.triggerId ? parseInt(req.query.triggerId as string) : undefined;
      const events = await storage.getTriggerEvents(triggerId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trigger events" });
    }
  });
  
  app.get("/api/trigger-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getTriggerEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Trigger event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trigger event" });
    }
  });
  
  app.post("/api/trigger-events", async (req, res) => {
    try {
      const eventData = insertTriggerEventSchema.parse(req.body);
      const newEvent = await storage.createTriggerEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trigger event" });
    }
  });
  
  app.put("/api/trigger-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const eventData = req.body;
      const updatedEvent = await storage.updateTriggerEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Trigger event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trigger event" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Register chat WebSocket handler
  registerChatWebSocketHandler(wss);
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    let userId: string | null = null;
    let userName: string | null = null;
    let currentSession: CollaborationSession | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received WebSocket message type: ${data.type}`);
        
        switch(data.type) {
          case 'join_session': {
            // Client joining a collaborative session
            userId = data.userId;
            userName = data.userName || `User-${userId.slice(0, 4)}`;
            const agentId = data.agentId;
            
            // Create or get session
            if (!collaborationSessions.has(agentId)) {
              console.log(`Creating new collaborative session for agent ${agentId}`);
              collaborationSessions.set(agentId, {
                agentId,
                clients: new Map(),
                lastModified: new Date(),
                activeUsers: new Map(),
                changes: []
              });
            }
            
            currentSession = collaborationSessions.get(agentId)!;
            currentSession.clients.set(userId, ws);
            
            // Add user to active users with a random color
            const userColor = generateUserColor();
            currentSession.activeUsers.set(userId, {
              username: userName,
              color: userColor
            });
            
            // Send current session state to the new user
            const activeUsers = Array.from(currentSession.activeUsers.entries()).map(
              ([id, user]) => ({
                id,
                username: user.username,
                color: user.color,
                cursorPosition: user.cursorPosition
              })
            );
            
            ws.send(JSON.stringify({
              type: 'session_joined',
              agentId,
              userId,
              users: activeUsers,
              recentChanges: currentSession.changes.slice(-50) // Send last 50 changes
            }));
            
            // Notify other clients about the new user
            broadcastToSession(currentSession, {
              type: 'user_joined',
              userId,
              username: userName,
              color: userColor
            }, userId);
            
            console.log(`User ${userName} (${userId}) joined session for agent ${agentId}`);
            break;
          }
          
          case 'leave_session': {
            if (currentSession && userId) {
              currentSession.clients.delete(userId);
              currentSession.activeUsers.delete(userId);
              
              // Notify other clients
              broadcastToSession(currentSession, {
                type: 'user_left',
                userId
              });
              
              console.log(`User ${userName} (${userId}) left session for agent ${currentSession.agentId}`);
              
              // Clean up session if empty
              if (currentSession.clients.size === 0) {
                collaborationSessions.delete(currentSession.agentId);
                console.log(`Removed empty session for agent ${currentSession.agentId}`);
              }
              
              currentSession = null;
              userId = null;
              userName = null;
            }
            break;
          }
          
          case 'component_update': {
            if (currentSession && userId) {
              const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const change = {
                id: changeId,
                type: 'component_update' as const,
                data: data.component,
                userId,
                timestamp: new Date()
              };
              
              // Add to change history
              currentSession.changes.push(change);
              currentSession.lastModified = new Date();
              
              // Broadcast to other clients
              broadcastToSession(currentSession, {
                type: 'component_updated',
                change,
                userId
              }, userId);
              
              console.log(`User ${userName} updated component ${data.component.id}`);
            }
            break;
          }
          
          case 'component_create': {
            if (currentSession && userId) {
              const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const change = {
                id: changeId,
                type: 'component_create' as const,
                data: data.component,
                userId,
                timestamp: new Date()
              };
              
              // Add to change history
              currentSession.changes.push(change);
              currentSession.lastModified = new Date();
              
              // Broadcast to other clients
              broadcastToSession(currentSession, {
                type: 'component_created',
                change,
                userId
              }, userId);
              
              console.log(`User ${userName} created new component`);
            }
            break;
          }
          
          case 'component_delete': {
            if (currentSession && userId) {
              const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const change = {
                id: changeId,
                type: 'component_delete' as const,
                data: { 
                  componentId: data.componentId 
                },
                userId,
                timestamp: new Date()
              };
              
              // Add to change history
              currentSession.changes.push(change);
              currentSession.lastModified = new Date();
              
              // Broadcast to other clients
              broadcastToSession(currentSession, {
                type: 'component_deleted',
                change,
                userId
              }, userId);
              
              console.log(`User ${userName} deleted component ${data.componentId}`);
            }
            break;
          }
          
          case 'cursor_update': {
            if (currentSession && userId) {
              // Update user's cursor position
              const user = currentSession.activeUsers.get(userId);
              if (user) {
                user.cursorPosition = data.position;
                currentSession.activeUsers.set(userId, user);
                
                // Broadcast to other clients
                broadcastToSession(currentSession, {
                  type: 'cursor_updated',
                  userId,
                  position: data.position
                }, userId);
              }
            }
            break;
          }
        }
        
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
    
    ws.on('close', () => {
      // Handle disconnection
      if (currentSession && userId) {
        currentSession.clients.delete(userId);
        currentSession.activeUsers.delete(userId);
        
        // Notify other clients
        broadcastToSession(currentSession, {
          type: 'user_left',
          userId
        });
        
        console.log(`User ${userName} (${userId}) disconnected from session for agent ${currentSession.agentId}`);
        
        // Clean up session if empty
        if (currentSession.clients.size === 0) {
          collaborationSessions.delete(currentSession.agentId);
          console.log(`Removed empty session for agent ${currentSession.agentId}`);
        }
      }
    });
  });
  
  // Add API endpoints for collaboration information
  app.get('/api/collaboration/sessions', (req, res) => {
    const sessionInfo = Array.from(collaborationSessions.entries()).map(([agentId, session]) => ({
      agentId,
      userCount: session.activeUsers.size,
      lastModified: session.lastModified,
      changeCount: session.changes.length
    }));
    
    res.json(sessionInfo);
  });
  
  app.get('/api/collaboration/sessions/:agentId', (req, res) => {
    const agentId = req.params.agentId;
    const session = collaborationSessions.get(agentId);
    
    if (!session) {
      return res.status(404).json({ message: 'No active collaboration session for this agent' });
    }
    
    const users = Array.from(session.activeUsers.entries()).map(([userId, user]) => ({
      userId,
      username: user.username,
      color: user.color,
      hasActiveCursor: !!user.cursorPosition
    }));
    
    res.json({
      agentId,
      userCount: session.activeUsers.size,
      lastModified: session.lastModified,
      changeCount: session.changes.length,
      users
    });
  });
  
  return httpServer;
}
