import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { agents, runs, issueSchema, governanceIssueSchema, insertAgentSchema, updateAgentSchema, insertRunSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
