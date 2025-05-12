import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  agents, runs, issueSchema, governanceIssueSchema, 
  insertAgentSchema, updateAgentSchema, insertRunSchema,
  insertAgentComponentSchema, updateAgentComponentSchema,
  insertDataSourceSchema, updateDataSourceSchema,
  insertDataConnectorSchema, updateDataConnectorSchema,
  insertDataPermissionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the AI agent platform
  
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

  const httpServer = createServer(app);
  return httpServer;
}
