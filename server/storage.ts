import { 
  users, type User, type InsertUser,
  agents, type Agent, type InsertAgent, type UpdateAgent,
  runs, type Run, type InsertRun,
  governanceIssues, type GovernanceIssue, type InsertGovernanceIssue,
  agentComponents, type AgentComponent, type InsertAgentComponent, type UpdateAgentComponent,
  dataSources, type DataSource, type InsertDataSource, type UpdateDataSource,
  dataConnectors, type DataConnector, type InsertDataConnector, type UpdateDataConnector,
  dataPermissions, type DataPermission, type InsertDataPermission,
  agentTools, type AgentTool, type InsertAgentTool, type UpdateAgentTool,
  toolExecutions, type ToolExecution, type InsertToolExecution
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  getAgents(): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: UpdateAgent): Promise<Agent | undefined>;
  
  // Agent Component methods - for enhanced builder
  getAgentComponents(agentId: string): Promise<AgentComponent[]>;
  getAgentComponentById(id: number): Promise<AgentComponent | undefined>;
  createAgentComponent(component: InsertAgentComponent): Promise<AgentComponent>;
  updateAgentComponent(id: number, component: UpdateAgentComponent): Promise<AgentComponent | undefined>;
  deleteAgentComponent(id: number): Promise<boolean>;
  
  // Run methods
  getRuns(): Promise<Run[]>;
  getRunById(id: string): Promise<Run | undefined>;
  createRun(run: InsertRun): Promise<Run>;
  updateRunStatus(id: string, status: string): Promise<Run | undefined>;
  
  // Governance methods
  getGovernanceIssues(): Promise<GovernanceIssue[]>;
  createGovernanceIssue(issue: InsertGovernanceIssue): Promise<GovernanceIssue>;
  updateGovernanceIssue(id: string, status: string, notes?: string): Promise<GovernanceIssue | undefined>;
  
  // Data Fabric methods
  getDataSources(): Promise<DataSource[]>;
  getDataSourceById(id: number): Promise<DataSource | undefined>;
  createDataSource(source: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, source: UpdateDataSource): Promise<DataSource | undefined>;
  deleteDataSource(id: number): Promise<boolean>;
  
  getDataConnectors(): Promise<DataConnector[]>;
  getDataConnectorById(id: number): Promise<DataConnector | undefined>;
  createDataConnector(connector: InsertDataConnector): Promise<DataConnector>;
  updateDataConnector(id: number, connector: UpdateDataConnector): Promise<DataConnector | undefined>;
  deleteDataConnector(id: number): Promise<boolean>;
  
  getDataPermissions(dataSourceId: number): Promise<DataPermission[]>;
  createDataPermission(permission: InsertDataPermission): Promise<DataPermission>;
  deleteDataPermission(id: number): Promise<boolean>;
  
  // Tool Integration methods
  getTools(): Promise<AgentTool[]>;
  getToolById(id: number): Promise<AgentTool | undefined>;
  createTool(tool: InsertAgentTool): Promise<AgentTool>;
  updateTool(id: number, tool: UpdateAgentTool): Promise<AgentTool | undefined>;
  deleteTool(id: number): Promise<boolean>;
  
  // Tool Execution methods
  getToolExecutions(toolId?: number, runId?: string): Promise<ToolExecution[]>;
  createToolExecution(execution: InsertToolExecution): Promise<ToolExecution>;
  getToolExecutionById(id: number): Promise<ToolExecution | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<string, Agent>;
  private agentComponents: Map<number, AgentComponent>;
  private runs: Map<string, Run>;
  private governanceIssues: Map<string, GovernanceIssue>;
  private dataSources: Map<number, DataSource>;
  private dataConnectors: Map<number, DataConnector>;
  private dataPermissions: Map<number, DataPermission>;
  private agentTools: Map<number, AgentTool>;
  private toolExecutions: Map<number, ToolExecution>;
  private currentUserId: number;
  private currentIssueId: number;
  private currentComponentId: number;
  private currentDataSourceId: number;
  private currentDataConnectorId: number;
  private currentDataPermissionId: number;
  private currentToolId: number;
  private currentToolExecutionId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.agentComponents = new Map();
    this.runs = new Map();
    this.governanceIssues = new Map();
    this.dataSources = new Map();
    this.dataConnectors = new Map();
    this.dataPermissions = new Map();
    this.agentTools = new Map();
    this.toolExecutions = new Map();
    this.currentUserId = 1;
    this.currentIssueId = 1;
    this.currentComponentId = 1;
    this.currentDataSourceId = 1;
    this.currentDataConnectorId = 1;
    this.currentDataPermissionId = 1;
    this.currentToolId = 1;
    this.currentToolExecutionId = 1;
    
    // Initialize with mock data
    this.initializeMockData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: "user", 
      createdAt: new Date(), 
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      organization: insertUser.organization || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }
  
  async getAgentById(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    this.agents.set(agent.id, agent as Agent);
    return agent as Agent;
  }
  
  async updateAgent(id: string, agent: UpdateAgent): Promise<Agent | undefined> {
    const existingAgent = this.agents.get(id);
    if (!existingAgent) return undefined;
    
    const updatedAgent = { ...existingAgent, ...agent };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  // Agent Component methods - for enhanced builder
  async getAgentComponents(agentId: string): Promise<AgentComponent[]> {
    return Array.from(this.agentComponents.values()).filter(
      component => component.agentId === agentId
    );
  }
  
  async getAgentComponentById(id: number): Promise<AgentComponent | undefined> {
    return this.agentComponents.get(id);
  }
  
  async createAgentComponent(component: InsertAgentComponent): Promise<AgentComponent> {
    const id = this.currentComponentId++;
    const newComponent: AgentComponent = { 
      ...component, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      configuration: component.configuration || {},
      description: component.description || null,
      content: component.content || null
    };
    this.agentComponents.set(id, newComponent);
    return newComponent;
  }
  
  async updateAgentComponent(id: number, component: UpdateAgentComponent): Promise<AgentComponent | undefined> {
    const existingComponent = this.agentComponents.get(id);
    if (!existingComponent) return undefined;
    
    const updatedComponent = { 
      ...existingComponent, 
      ...component,
      updatedAt: new Date()
    };
    this.agentComponents.set(id, updatedComponent);
    return updatedComponent;
  }
  
  async deleteAgentComponent(id: number): Promise<boolean> {
    return this.agentComponents.delete(id);
  }
  
  // Run methods
  async getRuns(): Promise<Run[]> {
    return Array.from(this.runs.values());
  }
  
  async getRunById(id: string): Promise<Run | undefined> {
    return this.runs.get(id);
  }
  
  async createRun(run: InsertRun): Promise<Run> {
    this.runs.set(run.id, run as Run);
    return run as Run;
  }
  
  async updateRunStatus(id: string, status: string): Promise<Run | undefined> {
    const existingRun = this.runs.get(id);
    if (!existingRun) return undefined;
    
    const updatedRun = { ...existingRun, status };
    this.runs.set(id, updatedRun);
    return updatedRun;
  }
  
  // Governance methods
  async getGovernanceIssues(): Promise<GovernanceIssue[]> {
    return Array.from(this.governanceIssues.values());
  }
  
  async createGovernanceIssue(issue: InsertGovernanceIssue): Promise<GovernanceIssue> {
    const id = String(this.currentIssueId++);
    const newIssue = { ...issue, id: Number(id) } as GovernanceIssue;
    this.governanceIssues.set(id, newIssue);
    return newIssue;
  }
  
  async updateGovernanceIssue(id: string, status: string, notes?: string): Promise<GovernanceIssue | undefined> {
    const existingIssue = this.governanceIssues.get(id);
    if (!existingIssue) return undefined;
    
    const updatedIssue = { 
      ...existingIssue, 
      status,
      ...(notes && { notes })
    };
    
    this.governanceIssues.set(id, updatedIssue);
    return updatedIssue;
  }
  
  // Data Fabric methods
  async getDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }
  
  async getDataSourceById(id: number): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }
  
  async createDataSource(source: InsertDataSource): Promise<DataSource> {
    const id = this.currentDataSourceId++;
    const newSource: DataSource = {
      ...source,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      schema: source.schema || {},
      status: source.status || "Active",
      description: source.description || null,
      createdBy: source.createdBy || null
    };
    this.dataSources.set(id, newSource);
    return newSource;
  }
  
  async updateDataSource(id: number, source: UpdateDataSource): Promise<DataSource | undefined> {
    const existingSource = this.dataSources.get(id);
    if (!existingSource) return undefined;
    
    const updatedSource = {
      ...existingSource,
      ...source,
      updatedAt: new Date()
    };
    
    this.dataSources.set(id, updatedSource);
    return updatedSource;
  }
  
  async deleteDataSource(id: number): Promise<boolean> {
    return this.dataSources.delete(id);
  }
  
  async getDataConnectors(): Promise<DataConnector[]> {
    return Array.from(this.dataConnectors.values());
  }
  
  async getDataConnectorById(id: number): Promise<DataConnector | undefined> {
    return this.dataConnectors.get(id);
  }
  
  async createDataConnector(connector: InsertDataConnector): Promise<DataConnector> {
    const id = this.currentDataConnectorId++;
    const newConnector: DataConnector = {
      ...connector,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      transformations: connector.transformations || [],
      status: connector.status || "Active",
      description: connector.description || null,
      sourceId: connector.sourceId || null,
      targetId: connector.targetId || null,
      schedule: connector.schedule || null,
      lastSyncedAt: connector.lastSyncedAt || null
    };
    this.dataConnectors.set(id, newConnector);
    return newConnector;
  }
  
  async updateDataConnector(id: number, connector: UpdateDataConnector): Promise<DataConnector | undefined> {
    const existingConnector = this.dataConnectors.get(id);
    if (!existingConnector) return undefined;
    
    const updatedConnector = {
      ...existingConnector,
      ...connector,
      updatedAt: new Date()
    };
    
    this.dataConnectors.set(id, updatedConnector);
    return updatedConnector;
  }
  
  async deleteDataConnector(id: number): Promise<boolean> {
    return this.dataConnectors.delete(id);
  }
  
  async getDataPermissions(dataSourceId: number): Promise<DataPermission[]> {
    return Array.from(this.dataPermissions.values()).filter(
      permission => permission.dataSourceId === dataSourceId
    );
  }
  
  async createDataPermission(permission: InsertDataPermission): Promise<DataPermission> {
    const id = this.currentDataPermissionId++;
    const newPermission: DataPermission = {
      ...permission,
      id,
      createdAt: new Date(),
      dataSourceId: permission.dataSourceId || null,
      userId: permission.userId || null,
      agentId: permission.agentId || null
    };
    this.dataPermissions.set(id, newPermission);
    return newPermission;
  }
  
  async deleteDataPermission(id: number): Promise<boolean> {
    return this.dataPermissions.delete(id);
  }
  
  // Initialize with mock data
  private initializeMockData(): void {
    // Mock agents
    const agents = [
      {
        id: 'accel-uw',
        name: 'Accelerated UW Agent',
        type: ['UW'],
        description: 'Automates initial underwriting assessments for standard life insurance policies.',
        status: 'Running',
        createdBy: 'John D.',
        updatedAt: new Date()
      },
      {
        id: 'claims-fast',
        name: 'Auto Claims Fast-Track',
        type: ['Claims'],
        description: 'Processes straightforward auto claims with automated assessment and payout calculation.',
        status: 'Running',
        createdBy: 'Sarah M.',
        updatedAt: new Date()
      },
      {
        id: 'policy-analyzer',
        name: 'Policy Document Analyzer',
        type: ['Service'],
        description: 'Extracts and summarizes key information from policy documents for customer service agents.',
        status: 'Inactive',
        createdBy: 'Mike T.',
        updatedAt: new Date()
      },
      {
        id: 'fraud-detect',
        name: 'Fraud Detection Assistant',
        type: ['Fraud'],
        description: 'Analyzes claims data to identify potential fraud indicators requiring further investigation.',
        status: 'Running',
        createdBy: 'Lisa K.',
        updatedAt: new Date()
      }
    ];
    
    agents.forEach(agent => {
      this.agents.set(agent.id, agent as Agent);
    });
    
    // Mock runs
    const runs = [
      {
        id: 'run-9Y12',
        agentId: 'accel-uw',
        agentName: 'Accelerated UW Agent',
        agentIcon: 'file-text',
        status: 'Success',
        latency: 1.42,
        cost: 0.0042,
        timestamp: new Date(),
        steps: [
          { type: 'Prompt', tokens_in: 120, tokens_out: 0, latency: 300 },
          { type: 'Tool', name: 'IDP.extract', latency: 800 },
          { type: 'Tool', name: 'rules.evaluate', latency: 120 },
          { type: 'Prompt', tokens_in: 60, tokens_out: 30, latency: 200 }
        ]
      },
      {
        id: 'run-8A41',
        agentId: 'claims-fast',
        agentName: 'Auto Claims Fast-Track',
        agentIcon: 'activity',
        status: 'Failed',
        latency: 2.91,
        cost: 0.0063,
        timestamp: new Date(),
        steps: []
      },
      {
        id: 'run-7C22',
        agentId: 'fraud-detect',
        agentName: 'Fraud Detection Assistant',
        agentIcon: 'alert-triangle',
        status: 'Needs Approval',
        latency: 1.86,
        cost: 0.0051,
        timestamp: new Date(),
        steps: []
      }
    ];
    
    runs.forEach(run => {
      this.runs.set(run.id, run as Run);
    });
    
    // Mock governance issues
    const issues = [
      {
        id: 1,
        runId: 'run-7C22',
        agentId: 'fraud-detect',
        agentName: 'Fraud Detection Assistant',
        agentIcon: 'alert-triangle',
        issueType: 'Needs Approval',
        description: 'High fraud score detection requires manual review',
        timestamp: new Date(),
        status: 'Pending'
      },
      {
        id: 2,
        runId: 'run-6B19',
        agentId: 'accel-uw',
        agentName: 'Accelerated UW Agent',
        agentIcon: 'file-text',
        issueType: 'Policy Violation',
        description: 'Attempted to access restricted health data fields',
        timestamp: new Date(),
        status: 'Resolved'
      },
      {
        id: 3,
        runId: 'run-5A02',
        agentId: 'claims-fast',
        agentName: 'Auto Claims Fast-Track',
        agentIcon: 'activity',
        issueType: 'Needs Approval',
        description: 'Payment amount exceeds auto-approval threshold ($15,000)',
        timestamp: new Date(),
        status: 'Approved'
      }
    ];
    
    issues.forEach(issue => {
      this.governanceIssues.set(String(issue.id), issue as GovernanceIssue);
    });
    
    this.currentIssueId = issues.length + 1;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
  
  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }
  
  async getAgentById(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [createdAgent] = await db.insert(agents).values(agent).returning();
    return createdAgent;
  }
  
  async updateAgent(id: string, agent: UpdateAgent): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(agent)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent || undefined;
  }
  
  // Agent Component methods - for enhanced builder
  async getAgentComponents(agentId: string): Promise<AgentComponent[]> {
    return await db
      .select()
      .from(agentComponents)
      .where(eq(agentComponents.agentId, agentId));
  }
  
  async getAgentComponentById(id: number): Promise<AgentComponent | undefined> {
    const [component] = await db
      .select()
      .from(agentComponents)
      .where(eq(agentComponents.id, id));
    return component || undefined;
  }
  
  async createAgentComponent(component: InsertAgentComponent): Promise<AgentComponent> {
    const [createdComponent] = await db
      .insert(agentComponents)
      .values(component)
      .returning();
    return createdComponent;
  }
  
  async updateAgentComponent(id: number, component: UpdateAgentComponent): Promise<AgentComponent | undefined> {
    const [updatedComponent] = await db
      .update(agentComponents)
      .set(component)
      .where(eq(agentComponents.id, id))
      .returning();
    return updatedComponent || undefined;
  }
  
  async deleteAgentComponent(id: number): Promise<boolean> {
    const result = await db
      .delete(agentComponents)
      .where(eq(agentComponents.id, id));
    return !!result;
  }
  
  // Run methods
  async getRuns(): Promise<Run[]> {
    return await db.select().from(runs);
  }
  
  async getRunById(id: string): Promise<Run | undefined> {
    const [run] = await db.select().from(runs).where(eq(runs.id, id));
    return run || undefined;
  }
  
  async createRun(run: InsertRun): Promise<Run> {
    const [createdRun] = await db.insert(runs).values(run).returning();
    return createdRun;
  }
  
  async updateRunStatus(id: string, status: string): Promise<Run | undefined> {
    const [updatedRun] = await db
      .update(runs)
      .set({ status })
      .where(eq(runs.id, id))
      .returning();
    return updatedRun || undefined;
  }
  
  // Governance methods
  async getGovernanceIssues(): Promise<GovernanceIssue[]> {
    return await db.select().from(governanceIssues);
  }
  
  async createGovernanceIssue(issue: InsertGovernanceIssue): Promise<GovernanceIssue> {
    const [createdIssue] = await db
      .insert(governanceIssues)
      .values(issue)
      .returning();
    return createdIssue;
  }
  
  async updateGovernanceIssue(id: string, status: string, notes?: string): Promise<GovernanceIssue | undefined> {
    const updateData = notes ? { status, notes } : { status };
    const [updatedIssue] = await db
      .update(governanceIssues)
      .set(updateData)
      .where(eq(governanceIssues.id, Number(id)))
      .returning();
    return updatedIssue || undefined;
  }
  
  // Data Fabric methods
  async getDataSources(): Promise<DataSource[]> {
    return await db.select().from(dataSources);
  }
  
  async getDataSourceById(id: number): Promise<DataSource | undefined> {
    const [source] = await db.select().from(dataSources).where(eq(dataSources.id, id));
    return source || undefined;
  }
  
  async createDataSource(source: InsertDataSource): Promise<DataSource> {
    const [createdSource] = await db
      .insert(dataSources)
      .values(source)
      .returning();
    return createdSource;
  }
  
  async updateDataSource(id: number, source: UpdateDataSource): Promise<DataSource | undefined> {
    const [updatedSource] = await db
      .update(dataSources)
      .set(source)
      .where(eq(dataSources.id, id))
      .returning();
    return updatedSource || undefined;
  }
  
  async deleteDataSource(id: number): Promise<boolean> {
    const result = await db
      .delete(dataSources)
      .where(eq(dataSources.id, id));
    return !!result;
  }
  
  async getDataConnectors(): Promise<DataConnector[]> {
    return await db.select().from(dataConnectors);
  }
  
  async getDataConnectorById(id: number): Promise<DataConnector | undefined> {
    const [connector] = await db.select().from(dataConnectors).where(eq(dataConnectors.id, id));
    return connector || undefined;
  }
  
  async createDataConnector(connector: InsertDataConnector): Promise<DataConnector> {
    const [createdConnector] = await db
      .insert(dataConnectors)
      .values(connector)
      .returning();
    return createdConnector;
  }
  
  async updateDataConnector(id: number, connector: UpdateDataConnector): Promise<DataConnector | undefined> {
    const [updatedConnector] = await db
      .update(dataConnectors)
      .set(connector)
      .where(eq(dataConnectors.id, id))
      .returning();
    return updatedConnector || undefined;
  }
  
  async deleteDataConnector(id: number): Promise<boolean> {
    const result = await db
      .delete(dataConnectors)
      .where(eq(dataConnectors.id, id));
    return !!result;
  }
  
  async getDataPermissions(dataSourceId: number): Promise<DataPermission[]> {
    return await db
      .select()
      .from(dataPermissions)
      .where(eq(dataPermissions.dataSourceId, dataSourceId));
  }
  
  async createDataPermission(permission: InsertDataPermission): Promise<DataPermission> {
    const [createdPermission] = await db
      .insert(dataPermissions)
      .values(permission)
      .returning();
    return createdPermission;
  }
  
  async deleteDataPermission(id: number): Promise<boolean> {
    const result = await db
      .delete(dataPermissions)
      .where(eq(dataPermissions.id, id));
    return !!result;
  }
}

// Use DatabaseStorage for both development and production
export const storage = new DatabaseStorage();
