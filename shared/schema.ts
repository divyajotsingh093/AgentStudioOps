import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
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

// Tasks and Actions for Timeline Board
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  agentId: text("agent_id").references(() => agents.id),
  status: text("status").notNull().default('Queued'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  priority: text("priority").default('Medium'),
  assignedTo: integer("assigned_to").references(() => users.id),
  metadata: json("metadata").default({}),
  parentFlowExecutionId: uuid("parent_flow_execution_id").references(() => flowExecutions.id),
  scheduledFor: timestamp("scheduled_for"),
  recurringSchedule: text("recurring_schedule"),
});

export const actions = pgTable("actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => tasks.id),
  type: text("type").notNull(), // Could be 'LLM', 'Tool', 'DataFetch', etc.
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('Queued'),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  inputData: json("input_data").default({}),
  outputData: json("output_data").default({}),
  error: text("error"),
  latency: integer("latency"),
  metadata: json("metadata").default({}),
  sequence: integer("sequence").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks);
export const updateTaskSchema = createSelectSchema(tasks);
export const insertActionSchema = createInsertSchema(actions);
export const updateActionSchema = createSelectSchema(actions);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type UpdateAction = z.infer<typeof updateActionSchema>;

// Document Intelligence schemas
export const documentTypeEnum = z.enum(['Policy', 'Claim', 'Medical', 'Invoice', 'ID', 'Other']);
export const documentStatusEnum = z.enum(['Pending', 'Processed', 'Failed', 'Analyzing']);

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  associatedAgentId: text("associated_agent_id").references(() => agents.id),
  status: text("status").notNull().default('Pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documentAnalysis = pgTable("document_analysis", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  entities: json("entities").default([]),
  classification: json("classification").default({}),
  confidence: integer("confidence"),
  summary: text("summary"),
  analysisType: text("analysis_type").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents);
export const insertDocumentAnalysisSchema = createInsertSchema(documentAnalysis);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentAnalysis = typeof documentAnalysis.$inferSelect;
export type InsertDocumentAnalysis = z.infer<typeof insertDocumentAnalysisSchema>;

// Trigger Management Schema
export const triggerTypeEnum = z.enum(['Webhook', 'Schedule', 'Event', 'DataChange', 'Manual']);
export const triggerStatusEnum = z.enum(['Active', 'Inactive', 'Draft']);

export const triggers = pgTable("triggers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  agentId: text("agent_id").references(() => agents.id),
  status: text("status").notNull().default('Draft'),
  configuration: json("configuration").default({}),
  conditions: json("conditions").default([]),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const triggerEvents = pgTable("trigger_events", {
  id: serial("id").primaryKey(),
  triggerId: integer("trigger_id").references(() => triggers.id),
  runId: text("run_id").references(() => runs.id),
  status: text("status").notNull(),
  payload: json("payload"),
  result: json("result"),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTriggerSchema = createInsertSchema(triggers);
export const updateTriggerSchema = createSelectSchema(triggers);
export const insertTriggerEventSchema = createInsertSchema(triggerEvents);

export type Trigger = typeof triggers.$inferSelect;
export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type UpdateTrigger = z.infer<typeof updateTriggerSchema>;
export type TriggerEvent = typeof triggerEvents.$inferSelect;
export type InsertTriggerEvent = z.infer<typeof insertTriggerEventSchema>;

// Agent Orchestration Canvas schemas
export const nodeTypeEnum = z.enum(['Agent', 'Trigger', 'Tool', 'Decision', 'DataTransform', 'Condition', 'Input', 'Output']);
export const flowStatusEnum = z.enum(['Active', 'Inactive', 'Draft', 'Testing', 'Archived']);
export const executionStatusEnum = z.enum(['Running', 'Success', 'Failed', 'Pending', 'Canceled']);
export const taskStatusEnum = z.enum(['Queued', 'Running', 'Needs Approval', 'Done', 'Failed']);
export const actionStatusEnum = z.enum(['Queued', 'Running', 'Completed', 'Failed']);
export const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const flows = pgTable("flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('Draft'),
  version: text("version").notNull().default('1.0.0'),
  tags: text("tags").array(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: json("metadata").default({}),
});

export const flowNodes = pgTable("flow_nodes", {
  id: serial("id").primaryKey(),
  flowId: integer("flow_id").notNull().references(() => flows.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  position: json("position").notNull(),
  config: json("config").default({}),
  referenceId: text("reference_id"), // ID to the actual agent, tool, etc.
  referenceType: text("reference_type"), // Type of the reference like "agent" or "tool"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const flowEdges = pgTable("flow_edges", {
  id: serial("id").primaryKey(),
  flowId: integer("flow_id").notNull().references(() => flows.id),
  sourceId: integer("source_id").notNull().references(() => flowNodes.id),
  targetId: integer("target_id").notNull().references(() => flowNodes.id),
  type: text("type").default('default'),
  label: text("label"),
  condition: json("condition").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const flowExecutions = pgTable("flow_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  flowId: integer("flow_id").notNull().references(() => flows.id),
  status: text("status").notNull(),
  input: json("input").default({}),
  output: json("output").default({}),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by").references(() => users.id),
  error: text("error"),
  totalTime: integer("total_time"),
  metadata: json("metadata").default({}),
});

export const nodeExecutions = pgTable("node_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  flowExecutionId: uuid("flow_execution_id").notNull().references(() => flowExecutions.id),
  nodeId: integer("node_id").notNull().references(() => flowNodes.id),
  status: text("status").notNull(),
  input: json("input").default({}),
  output: json("output").default({}),
  error: text("error"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  executionTime: integer("execution_time"),
  metadata: json("metadata").default({}),
});

// Create schemas for insert and select
export const insertFlowSchema = createInsertSchema(flows).omit({ id: true, createdAt: true, updatedAt: true });
export const updateFlowSchema = createSelectSchema(flows);
export const insertFlowNodeSchema = createInsertSchema(flowNodes).omit({ id: true, createdAt: true, updatedAt: true });
export const updateFlowNodeSchema = createSelectSchema(flowNodes);
export const insertFlowEdgeSchema = createInsertSchema(flowEdges).omit({ id: true, createdAt: true, updatedAt: true });
export const updateFlowEdgeSchema = createSelectSchema(flowEdges);
export const insertFlowExecutionSchema = createInsertSchema(flowExecutions).omit({ id: true, startedAt: true });
export const insertNodeExecutionSchema = createInsertSchema(nodeExecutions).omit({ id: true, startedAt: true });

// Export types for Flow Canvas
export type Flow = typeof flows.$inferSelect;
export type InsertFlow = z.infer<typeof insertFlowSchema>;
export type UpdateFlow = z.infer<typeof updateFlowSchema>;

export type FlowNode = typeof flowNodes.$inferSelect;
export type InsertFlowNode = z.infer<typeof insertFlowNodeSchema>;
export type UpdateFlowNode = z.infer<typeof updateFlowNodeSchema>;

export type FlowEdge = typeof flowEdges.$inferSelect;
export type InsertFlowEdge = z.infer<typeof insertFlowEdgeSchema>;
export type UpdateFlowEdge = z.infer<typeof updateFlowEdgeSchema>;

export type FlowExecution = typeof flowExecutions.$inferSelect;
export type InsertFlowExecution = z.infer<typeof insertFlowExecutionSchema>;
export type NodeExecution = typeof nodeExecutions.$inferSelect;
export type InsertNodeExecution = z.infer<typeof insertNodeExecutionSchema>;

// Data Fabric Explorer additional schemas
export const dataDomains = pgTable("data_domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  owner: integer("owner").references(() => users.id),
  parentId: integer("parent_id"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Add the self-reference after table definition to avoid circular reference
// This will set up the relationship where a domain can have a parent domain
export const domainRelations = relations(dataDomains, ({ one }) => ({
  parent: one(dataDomains, {
    relationName: "domainToParent",
    fields: [dataDomains.parentId],
    references: [dataDomains.id]
  }),
  children: one(dataDomains, {
    relationName: "domainToChildren", 
    fields: [dataDomains.id],
    references: [dataDomains.parentId]
  })
}));

export const dataEntities = pgTable("data_entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domainId: integer("domain_id").references(() => dataDomains.id),
  sourceId: integer("source_id").references(() => dataSources.id),
  entityType: text("entity_type").notNull(), // Table, API Resource, etc.
  schema: json("schema").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataRelationships = pgTable("data_relationships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceEntityId: integer("source_entity_id").notNull().references(() => dataEntities.id),
  targetEntityId: integer("target_entity_id").notNull().references(() => dataEntities.id),
  relationshipType: text("relationship_type").notNull(), // one-to-one, one-to-many, etc.
  sourceField: text("source_field").notNull(),
  targetField: text("target_field").notNull(),
  description: text("description"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataLineage = pgTable("data_lineage", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull().references(() => dataEntities.id),
  processId: integer("process_id").references(() => flows.id), // Can be a flow or other process
  processType: text("process_type").notNull(), // Flow, Connector, etc.
  operation: text("operation").notNull(), // Read, Write, Transform, etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata").default({}),
});

export const dataQueries = pgTable("data_queries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  queryText: text("query_text").notNull(),
  savedBy: integer("saved_by").references(() => users.id),
  resultSchema: json("result_schema").default({}),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastExecuted: timestamp("last_executed"),
  isPublic: boolean("is_public").default(false),
});

// Create schemas for insert and select
export const insertDataDomainSchema = createInsertSchema(dataDomains);
export const updateDataDomainSchema = createSelectSchema(dataDomains);
export const insertDataEntitySchema = createInsertSchema(dataEntities);
export const updateDataEntitySchema = createSelectSchema(dataEntities);
export const insertDataRelationshipSchema = createInsertSchema(dataRelationships);
export const updateDataRelationshipSchema = createSelectSchema(dataRelationships);
export const insertDataLineageSchema = createInsertSchema(dataLineage);
export const insertDataQuerySchema = createInsertSchema(dataQueries);
export const updateDataQuerySchema = createSelectSchema(dataQueries);

// Type definitions
export type DataDomain = typeof dataDomains.$inferSelect;
export type InsertDataDomain = z.infer<typeof insertDataDomainSchema>;
export type UpdateDataDomain = z.infer<typeof updateDataDomainSchema>;
export type DataEntity = typeof dataEntities.$inferSelect;
export type InsertDataEntity = z.infer<typeof insertDataEntitySchema>;
export type UpdateDataEntity = z.infer<typeof updateDataEntitySchema>;
export type DataRelationship = typeof dataRelationships.$inferSelect;
export type InsertDataRelationship = z.infer<typeof insertDataRelationshipSchema>;
export type UpdateDataRelationship = z.infer<typeof updateDataRelationshipSchema>;
export type DataLineage = typeof dataLineage.$inferSelect;
export type InsertDataLineage = z.infer<typeof insertDataLineageSchema>;
export type DataQuery = typeof dataQueries.$inferSelect;
export type InsertDataQuery = z.infer<typeof insertDataQuerySchema>;
export type UpdateDataQuery = z.infer<typeof updateDataQuerySchema>;

// Identity Provider (IDP) schemas
export const idpProviderTypeEnum = z.enum(['OIDC', 'SAML', 'OAuth2', 'LDAP', 'Custom']);
export const idpStatusEnum = z.enum(['Active', 'Inactive', 'Testing', 'Deprecated']);

export const idpProviders = pgTable("idp_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull().default('Inactive'),
  config: json("config").notNull(),
  metadata: json("metadata").default({}),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at"),
});

export const idpMappings = pgTable("idp_mappings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => idpProviders.id),
  sourceAttribute: text("source_attribute").notNull(),
  targetAttribute: text("target_attribute").notNull(),
  mappingType: text("mapping_type").notNull(),
  transformationRule: text("transformation_rule"),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const idpRules = pgTable("idp_rules", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => idpProviders.id),
  name: text("name").notNull(),
  description: text("description"),
  condition: json("condition").notNull(),
  action: json("action").notNull(),
  priority: integer("priority").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const idpSessions = pgTable("idp_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id),
  providerId: integer("provider_id").references(() => idpProviders.id),
  externalId: text("external_id"),
  sessionData: json("session_data").default({}),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Create schemas for insert and select
export const insertIdpProviderSchema = createInsertSchema(idpProviders);
export const updateIdpProviderSchema = createSelectSchema(idpProviders);
export const insertIdpMappingSchema = createInsertSchema(idpMappings);
export const updateIdpMappingSchema = createSelectSchema(idpMappings);
export const insertIdpRuleSchema = createInsertSchema(idpRules);
export const updateIdpRuleSchema = createSelectSchema(idpRules);
export const insertIdpSessionSchema = createInsertSchema(idpSessions);

// Type definitions
export type IdpProvider = typeof idpProviders.$inferSelect;
export type InsertIdpProvider = z.infer<typeof insertIdpProviderSchema>;
export type UpdateIdpProvider = z.infer<typeof updateIdpProviderSchema>;
export type IdpMapping = typeof idpMappings.$inferSelect;
export type InsertIdpMapping = z.infer<typeof insertIdpMappingSchema>;
export type UpdateIdpMapping = z.infer<typeof updateIdpMappingSchema>;
export type IdpRule = typeof idpRules.$inferSelect;
export type InsertIdpRule = z.infer<typeof insertIdpRuleSchema>;
export type UpdateIdpRule = z.infer<typeof updateIdpRuleSchema>;
export type IdpSession = typeof idpSessions.$inferSelect;
export type InsertIdpSession = z.infer<typeof insertIdpSessionSchema>;
