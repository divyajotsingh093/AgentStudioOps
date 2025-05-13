// Types for the Agent Platform

// Agent Types
export type AgentType = 'UW' | 'Claims' | 'Service' | 'Fraud';

export interface Agent {
  id: string;
  name: string;
  type: AgentType[];
  description: string;
  status: 'Running' | 'Inactive' | 'Draft';
  createdBy: string;
  updatedAt: string;
}

// Run Types
export type RunStatus = 'Success' | 'Failed' | 'Needs Approval' | 'In Progress';

export interface StepInfo {
  type: 'Prompt' | 'Tool';
  name?: string;
  tokens_in?: number;
  tokens_out?: number;
  latency: number;
  description?: string;
}

export interface Run {
  id: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  status: RunStatus;
  steps: StepInfo[];
  latency: number;
  cost: number;
  timestamp: string;
}

// Governance Types
export type IssueType = 'Policy Violation' | 'Needs Approval';
export type IssueStatus = 'Pending' | 'Approved' | 'Rejected' | 'Resolved';

export interface GovernanceIssue {
  runId: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  issueType: IssueType;
  description: string;
  timestamp: string;
  status: IssueStatus;
}

// Studio Types
export interface ContextItem {
  id: string;
  name: string;
}

export interface ToolItem {
  id: string;
  name: string;
}

export interface PromptItem {
  id: string;
  name: string;
  content: string;
}

export interface PolicyItem {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  tool?: string;
}

export interface ActionDetails {
  type: string;
  title: string;
  description: string;
  data?: any;
}

export interface ReasoningTrace {
  id: string;
  title: string;
  type: 'thought' | 'data-query' | 'calculation' | 'document' | 'notification' | 'alert';
  content: string;
  timestamp: string;
  durationMs: number;
  result?: string;
  action?: ActionDetails;
}
