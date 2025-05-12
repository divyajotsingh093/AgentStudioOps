import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Agent types
export const agentTypesEnum = z.enum(['UW', 'Claims', 'Service', 'Fraud']);
export const agentStatusEnum = z.enum(['Running', 'Inactive', 'Draft']);

// Agent schema
export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").array().notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  createdBy: text("created_by").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents);
export const updateAgentSchema = createSelectSchema(agents);
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;

// Run status types
export const runStatusEnum = z.enum(['Success', 'Failed', 'Needs Approval', 'In Progress']);

// Step info type
export const stepTypeEnum = z.enum(['Prompt', 'Tool']);
export const stepInfoSchema = z.object({
  type: stepTypeEnum,
  name: z.string().optional(),
  tokens_in: z.number().optional(),
  tokens_out: z.number().optional(),
  latency: z.number(),
  description: z.string().optional(),
});

// Run schema
export const runs = pgTable("runs", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agents.id),
  agentName: text("agent_name").notNull(),
  agentIcon: text("agent_icon").notNull(),
  status: text("status").notNull(),
  steps: json("steps").notNull(),
  latency: integer("latency").notNull(),
  cost: integer("cost").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertRunSchema = createInsertSchema(runs);
export type Run = typeof runs.$inferSelect;
export type InsertRun = z.infer<typeof insertRunSchema>;

// Governance issue types
export const issueTypeEnum = z.enum(['Policy Violation', 'Needs Approval']);
export const issueStatusEnum = z.enum(['Pending', 'Approved', 'Rejected', 'Resolved']);

// Governance issues schema
export const governanceIssues = pgTable("governance_issues", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull().references(() => runs.id),
  agentId: text("agent_id").notNull().references(() => agents.id),
  agentName: text("agent_name").notNull(),
  agentIcon: text("agent_icon").notNull(),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull(),
  notes: text("notes"),
});

export const issueSchema = z.object({
  runId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  agentIcon: z.string(),
  issueType: issueTypeEnum,
  description: z.string(),
  status: issueStatusEnum,
});

export const governanceIssueSchema = createInsertSchema(governanceIssues);
export type GovernanceIssue = typeof governanceIssues.$inferSelect;
export type InsertGovernanceIssue = z.infer<typeof governanceIssueSchema>;
