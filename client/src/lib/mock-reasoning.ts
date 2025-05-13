// Mock reasoning flows for different user queries
import { ReasoningAction } from '@/components/agents/chat/ReasoningFlow';

// Mock reasoning flow for policy verification
export const policyVerificationFlow: ReasoningAction[] = [
  {
    id: 'reasoning-1',
    title: 'Policy Search Analysis',
    description: 'Based on the query, I need to search for policy details using either a policy number or customer information.',
    category: 'Reasoning',
    confidence: 0.95
  },
  {
    id: 'reasoning-2',
    title: 'Data Access Requirements',
    description: 'To provide policy status, I need to access our Claims Processing API and check Policy Management Database.',
    category: 'Reasoning',
    confidence: 0.9
  },
  {
    id: 'tool-1',
    title: 'Policy Lookup Tool',
    description: 'Retrieve full policy details using policy number or customer identifiers',
    category: 'Tool',
    confidence: 0.92
  },
  {
    id: 'api-1',
    title: 'Claims API Integration',
    description: 'Connect to Claims Processing API to check for active claims and policy status',
    category: 'API',
    confidence: 0.85
  },
  {
    id: 'action-1',
    title: 'Verify Policy Status',
    description: 'Run comprehensive verification on policy status, payment status, and coverage details',
    category: 'Action',
    confidence: 0.88
  }
];

// Mock reasoning flow for premium calculation
export const premiumCalculationFlow: ReasoningAction[] = [
  {
    id: 'reasoning-1',
    title: 'Premium Modification Analysis',
    description: 'The request involves calculating a premium change which requires retrieving the current policy and applying new factors.',
    category: 'Reasoning',
    confidence: 0.93
  },
  {
    id: 'reasoning-2',
    title: 'Actuarial Rule Selection',
    description: 'Based on the coverage changes, I need to select the appropriate underwriting and rating rules to apply.',
    category: 'Reasoning',
    confidence: 0.88
  },
  {
    id: 'tool-1',
    title: 'Premium Calculator',
    description: 'Calculate premium changes using our actuarial models and rating factors',
    category: 'Tool',
    confidence: 0.96
  },
  {
    id: 'tool-2',
    title: 'Coverage Analyzer',
    description: 'Analyze impact of coverage changes on overall policy risk and premium',
    category: 'Tool',
    confidence: 0.84
  },
  {
    id: 'api-1',
    title: 'Rating API',
    description: 'Connect to our rating engine API to apply correct rating factors',
    category: 'API',
    confidence: 0.91
  },
  {
    id: 'action-1',
    title: 'Generate Premium Quote',
    description: 'Generate a detailed premium quote with breakdown of changes and effective dates',
    category: 'Action',
    confidence: 0.89
  }
];

// Mock reasoning flow for claims history
export const claimsHistoryFlow: ReasoningAction[] = [
  {
    id: 'reasoning-1',
    title: 'Claims Data Retrieval Planning',
    description: 'The query is about claims history, which requires accessing historical claims data and filtering based on date ranges.',
    category: 'Reasoning',
    confidence: 0.94
  },
  {
    id: 'reasoning-2',
    title: 'Claims Analysis Approach',
    description: 'Claims data should be organized chronologically and summarized by type, amount, and status for effective presentation.',
    category: 'Reasoning',
    confidence: 0.87
  },
  {
    id: 'tool-1',
    title: 'Claims History Tool',
    description: 'Retrieve and analyze claims history across specified date ranges',
    category: 'Tool',
    confidence: 0.93
  },
  {
    id: 'api-1',
    title: 'Claims Database API',
    description: 'Connect to the claims database to retrieve historical claims data',
    category: 'API',
    confidence: 0.89
  },
  {
    id: 'action-1',
    title: 'Generate Claims Report',
    description: 'Generate a comprehensive claims history report with visual analytics',
    category: 'Action',
    confidence: 0.85
  }
];

// Map of query keywords to reasoning flows
export const reasoningFlowMap: Record<string, ReasoningAction[]> = {
  'policy': policyVerificationFlow,
  'verify': policyVerificationFlow,
  'status': policyVerificationFlow,
  'check': policyVerificationFlow,
  
  'premium': premiumCalculationFlow,
  'calculate': premiumCalculationFlow,
  'quote': premiumCalculationFlow,
  'price': premiumCalculationFlow,
  
  'claims': claimsHistoryFlow,
  'history': claimsHistoryFlow,
  'report': claimsHistoryFlow,
};

// Function to find the most appropriate reasoning flow based on user input
export function findReasoningFlow(userInput: string): ReasoningAction[] {
  const input = userInput.toLowerCase();
  let bestMatch: ReasoningAction[] | null = null;
  let maxMatchCount = 0;
  
  // Check each keyword for matches
  Object.entries(reasoningFlowMap).forEach(([keyword, flow]) => {
    if (input.includes(keyword)) {
      if (!bestMatch || maxMatchCount < keyword.length) {
        bestMatch = flow;
        maxMatchCount = keyword.length;
      }
    }
  });
  
  // Default to policy verification if no matches
  return bestMatch || policyVerificationFlow;
}