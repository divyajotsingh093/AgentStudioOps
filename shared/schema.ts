import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  email: text("email").unique(),
  fullName: text("full_name"),
  organization: text("organization"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  organization: true,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  capabilities: json("capabilities").default({}),
  configuration: json("configuration").default({}),
  version: text("version").default("1.0.0"),
  isPublic: boolean("is_public").default(false),
});

// Agent components for the enhanced builder
export const agentComponents = pgTable("agent_components", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agents.id),
  type: text("type").notNull(), // prompt, tool, context, policy
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"),
  configuration: json("configuration").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents);
export const updateAgentSchema = createSelectSchema(agents);
export const insertAgentComponentSchema = createInsertSchema(agentComponents);
export const updateAgentComponentSchema = createSelectSchema(agentComponents);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;
export type AgentComponent = typeof agentComponents.$inferSelect;
export type InsertAgentComponent = z.infer<typeof insertAgentComponentSchema>;
export type UpdateAgentComponent = z.infer<typeof updateAgentComponentSchema>;

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

// Data Fabric schemas
export const dataSourceTypeEnum = z.enum(['API', 'Database', 'File', 'Stream', 'Custom']);
export const dataPermissionEnum = z.enum(['Read', 'Write', 'Admin']);

export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  connectionConfig: json("connection_config").notNull(),
  schema: json("schema").default({}),
  status: text("status").default("Active"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataConnectors = pgTable("data_connectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sourceId: integer("source_id").references(() => dataSources.id),
  targetId: integer("target_id").references(() => dataSources.id),
  transformations: json("transformations").default([]),
  schedule: text("schedule"),
  lastSyncedAt: timestamp("last_synced_at"),
  status: text("status").default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataPermissions = pgTable("data_permissions", {
  id: serial("id").primaryKey(),
  dataSourceId: integer("data_source_id").references(() => dataSources.id),
  userId: integer("user_id").references(() => users.id),
  agentId: text("agent_id").references(() => agents.id),
  permissionType: text("permission_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDataSourceSchema = createInsertSchema(dataSources);
export const updateDataSourceSchema = createSelectSchema(dataSources);
export const insertDataConnectorSchema = createInsertSchema(dataConnectors);
export const updateDataConnectorSchema = createSelectSchema(dataConnectors);
export const insertDataPermissionSchema = createInsertSchema(dataPermissions);

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type UpdateDataSource = z.infer<typeof updateDataSourceSchema>;
export type DataConnector = typeof dataConnectors.$inferSelect;
export type InsertDataConnector = z.infer<typeof insertDataConnectorSchema>;
export type UpdateDataConnector = z.infer<typeof updateDataConnectorSchema>;
export type DataPermission = typeof dataPermissions.$inferSelect;
export type InsertDataPermission = z.infer<typeof insertDataPermissionSchema>;

// Tool Integration Schemas
export const toolStatusEnum = z.enum(['Active', 'Inactive', 'Draft', 'Deprecated']);
export const toolTypeEnum = z.enum(['API', 'Function', 'Service', 'Integration', 'Custom']);
export const toolAuthTypeEnum = z.enum(['None', 'ApiKey', 'OAuth', 'Basic', 'Custom']);

export const agentTools = pgTable("agent_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull().default('Active'),
  version: text("version").notNull().default('1.0.0'),
  endpoint: text("endpoint"),
  authType: text("auth_type").notNull().default('None'),
  authConfig: json("auth_config").default({}),
  parameters: json("parameters").default([]),
  responseSchema: json("response_schema").default({}),
  metadata: json("metadata").default({}),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const toolExecutions = pgTable("tool_executions", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => agentTools.id),
  runId: text("run_id").references(() => runs.id),
  agentId: text("agent_id").references(() => agents.id),
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  latency: integer("latency"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertToolSchema = createInsertSchema(agentTools);
export const updateToolSchema = createSelectSchema(agentTools);
export const insertToolExecutionSchema = createInsertSchema(toolExecutions);

export type AgentTool = typeof agentTools.$inferSelect;
export type InsertAgentTool = z.infer<typeof insertToolSchema>;
export type UpdateAgentTool = z.infer<typeof updateToolSchema>;
export type ToolExecution = typeof toolExecutions.$inferSelect;
export type InsertToolExecution = z.infer<typeof insertToolExecutionSchema>;
