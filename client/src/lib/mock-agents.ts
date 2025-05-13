import { agentTypesEnum, agentStatusEnum } from "@shared/schema";

// Insurance agent types
export type AgentType = 'UW' | 'Claims' | 'Service' | 'Fraud';

export interface MockAgent {
  id: string;
  name: string;
  description: string;
  type: AgentType[];
  status: string;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  config?: any;
  isActive: boolean;
}

// Mock agent data for insurance-specific use cases
export const mockAgents: MockAgent[] = [
  {
    id: "accel-uw",
    name: "Accelerated UW Agent",
    description: "Automates underwriting decisions for standard life insurance policies",
    type: ["UW"],
    status: "Draft",
    createdAt: "2025-05-11T10:30:00Z",
    updatedAt: "2025-05-11T14:45:00Z",
    isActive: true
  },
  {
    id: "auto-claims",
    name: "Auto Claims Fast-Track",
    description: "Processes straightforward auto claims with minimal human intervention",
    type: ["Claims"],
    status: "Draft",
    createdAt: "2025-05-13T09:30:00Z",
    updatedAt: "2025-05-13T07:15:00Z",
    isActive: true
  },
  {
    id: "fraud-detect",
    name: "Fraud Detection Agent",
    description: "Identifies potential fraud indicators in claims submissions",
    type: ["Claims", "Fraud"],
    status: "Draft",
    createdAt: "2025-05-12T08:20:00Z",
    updatedAt: "2025-05-12T12:45:00Z",
    isActive: true
  },
  {
    id: "policy-service",
    name: "Policy Service Assistant",
    description: "Handles routine policy changes and endorsement requests",
    type: ["Service"],
    status: "Draft",
    createdAt: "2025-05-10T16:30:00Z",
    updatedAt: "2025-05-10T16:30:00Z",
    isActive: true
  },
  {
    id: "med-uw",
    name: "Medical Underwriting Advisor",
    description: "Analyzes medical records and provides risk assessment",
    type: ["UW"],
    status: "Draft",
    createdAt: "2025-05-06T11:15:00Z",
    updatedAt: "2025-05-06T15:20:00Z",
    isActive: true
  },
  {
    id: "customer-service",
    name: "Customer Service Bot",
    description: "Answers common customer questions and routes complex inquiries",
    type: ["Service"],
    status: "Draft",
    createdAt: "2025-05-11T09:45:00Z",
    updatedAt: "2025-05-11T14:30:00Z",
    isActive: true
  },
  {
    id: "claims-triage",
    name: "Claims Triage Agent",
    description: "Categorizes and routes incoming claims to appropriate handlers",
    type: ["Claims"],
    status: "Draft",
    createdAt: "2025-05-09T13:10:00Z",
    updatedAt: "2025-05-09T17:20:00Z",
    isActive: true
  },
  {
    id: "policy-quote",
    name: "Policy Quote Generator",
    description: "Creates preliminary quotes based on customer information",
    type: ["UW", "Service"],
    status: "Draft",
    createdAt: "2025-05-08T10:15:00Z",
    updatedAt: "2025-05-08T15:30:00Z",
    isActive: true
  },
  {
    id: "document-analyst",
    name: "Document Analysis Agent",
    description: "Extracts and validates information from uploaded documents",
    type: ["UW", "Claims", "Service"],
    status: "Draft",
    createdAt: "2025-05-07T08:45:00Z",
    updatedAt: "2025-05-07T13:15:00Z",
    isActive: true
  },
  {
    id: "renewal-optimizer",
    name: "Renewal Optimization Agent",
    description: "Suggests optimal renewal terms based on policy history",
    type: ["UW", "Service"],
    status: "Draft",
    createdAt: "2025-05-08T11:30:00Z",
    updatedAt: "2025-05-08T16:45:00Z", 
    isActive: true
  },
  {
    id: "claims-validator",
    name: "Claims Validation Expert",
    description: "Verifies claim details against policy coverage and conditions",
    type: ["Claims"],
    status: "Draft",
    createdAt: "2025-05-09T10:15:00Z",
    updatedAt: "2025-05-09T14:30:00Z",
    isActive: true
  },
  {
    id: "risk-assessor",
    name: "Risk Profile Assessor",
    description: "Evaluates complex risk factors for specialized insurance products",
    type: ["UW"],
    status: "Draft",
    createdAt: "2025-05-07T09:30:00Z",
    updatedAt: "2025-05-07T15:45:00Z",
    isActive: true
  },
  {
    id: "payment-processor",
    name: "Premium Payment Processor",
    description: "Manages payment schedules and processes recurring transactions",
    type: ["Service"],
    status: "Draft",
    createdAt: "2025-05-10T08:15:00Z",
    updatedAt: "2025-05-10T12:45:00Z",
    isActive: true
  },
  {
    id: "policy-reviewer",
    name: "Policy Review Assistant",
    description: "Performs periodic reviews of policy terms and coverage adequacy",
    type: ["UW", "Service"],
    status: "Draft",
    createdAt: "2025-05-08T14:20:00Z",
    updatedAt: "2025-05-08T18:10:00Z",
    isActive: true
  },
  {
    id: "compliance-checker",
    name: "Regulatory Compliance Checker",
    description: "Ensures policies meet current regulatory requirements across jurisdictions",
    type: ["UW", "Service"],
    status: "Draft",
    createdAt: "2025-05-06T10:45:00Z",
    updatedAt: "2025-05-06T16:30:00Z",
    isActive: true
  }
];

// Helper functions
export function getAgentTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    'UW': 'UW',
    'Claims': 'Claims',
    'Service': 'Service',
    'Fraud': 'Fraud'
  };
  
  return typeMap[type] || type;
}

export function getAgentTypeBadgeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'UW': 'bg-blue-100 text-blue-800',
    'Claims': 'bg-purple-100 text-purple-800',
    'Service': 'bg-indigo-100 text-indigo-800',
    'Fraud': 'bg-red-100 text-red-800'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-800';
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    const weeks = Math.floor(secondsAgo / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
}