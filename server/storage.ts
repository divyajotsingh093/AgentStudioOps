import { 
  users, type User, type InsertUser,
  agents, type Agent, type InsertAgent, type UpdateAgent,
  runs, type Run, type InsertRun,
  governanceIssues, type GovernanceIssue, type InsertGovernanceIssue,
  agentComponents, type AgentComponent, type InsertAgentComponent, type UpdateAgentComponent,
  dataSources, type DataSource, type InsertDataSource, type UpdateDataSource,
  dataConnectors, type DataConnector, type InsertDataConnector, type UpdateDataConnector,
  dataPermissions, type DataPermission, type InsertDataPermission,
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
  private currentUserId: number;
  private currentIssueId: number;
  private currentComponentId: number;
  private currentDataSourceId: number;
  private currentDataConnectorId: number;
  private currentDataPermissionId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.agentComponents = new Map();
    this.runs = new Map();
    this.governanceIssues = new Map();
    this.dataSources = new Map();
    this.dataConnectors = new Map();
    this.dataPermissions = new Map();
    this.currentUserId = 1;
    this.currentIssueId = 1;
    this.currentComponentId = 1;
    this.currentDataSourceId = 1;
    this.currentDataConnectorId = 1;
    this.currentDataPermissionId = 1;
    
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
      configuration: component.configuration || {}
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

export const storage = new MemStorage();
