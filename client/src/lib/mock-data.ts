import { Agent, Run, GovernanceIssue, ContextItem, ToolItem, PromptItem, PolicyItem, ChatMessage, ReasoningTrace } from './types';

// Agents mock data
export const agents: Agent[] = [
  {
    id: 'accel-uw',
    name: 'Accelerated UW Agent',
    type: ['UW'],
    description: 'Automates initial underwriting assessments for standard life insurance policies.',
    status: 'Running',
    createdBy: 'John D.',
    updatedAt: '2 days ago'
  },
  {
    id: 'claims-fast',
    name: 'Auto Claims Fast-Track',
    type: ['Claims'],
    description: 'Processes straightforward auto claims with automated assessment and payout calculation.',
    status: 'Running',
    createdBy: 'Sarah M.',
    updatedAt: '5 days ago'
  },
  {
    id: 'policy-analyzer',
    name: 'Policy Document Analyzer',
    type: ['Service'],
    description: 'Extracts and summarizes key information from policy documents for customer service agents.',
    status: 'Inactive',
    createdBy: 'Mike T.',
    updatedAt: '2 weeks ago'
  },
  {
    id: 'fraud-detect',
    name: 'Fraud Detection Assistant',
    type: ['Fraud'],
    description: 'Analyzes claims data to identify potential fraud indicators requiring further investigation.',
    status: 'Running',
    createdBy: 'Lisa K.',
    updatedAt: '1 day ago'
  }
];

// Runs mock data
export const runs: Run[] = [
  {
    id: 'run-9Y12',
    agentId: 'accel-uw',
    agentName: 'Accelerated UW Agent',
    agentIcon: 'file-text',
    status: 'Success',
    latency: 1.42,
    cost: 0.0042,
    timestamp: '2023-07-15 14:32:10',
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
    timestamp: '2023-07-15 14:30:05',
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
    timestamp: '2023-07-15 14:28:22',
    steps: []
  }
];

// Governance issues mock data
export const governanceIssues: GovernanceIssue[] = [
  {
    runId: 'run-7C22',
    agentId: 'fraud-detect',
    agentName: 'Fraud Detection Assistant',
    agentIcon: 'alert-triangle',
    issueType: 'Needs Approval',
    description: 'High fraud score detection requires manual review',
    timestamp: '2023-07-15 14:28:22',
    status: 'Pending'
  },
  {
    runId: 'run-6B19',
    agentId: 'accel-uw',
    agentName: 'Accelerated UW Agent',
    agentIcon: 'file-text',
    issueType: 'Policy Violation',
    description: 'Attempted to access restricted health data fields',
    timestamp: '2023-07-15 13:45:18',
    status: 'Resolved'
  },
  {
    runId: 'run-5A02',
    agentId: 'claims-fast',
    agentName: 'Auto Claims Fast-Track',
    agentIcon: 'activity',
    issueType: 'Needs Approval',
    description: 'Payment amount exceeds auto-approval threshold ($15,000)',
    timestamp: '2023-07-15 11:22:05',
    status: 'Approved'
  }
];

// Studio mock data
export const contextItems: ContextItem[] = [
  { id: 'context-1', name: 'Customer Profile' },
  { id: 'context-2', name: 'Policy Details' }
];

export const toolItems: ToolItem[] = [
  { id: 'tool-1', name: 'Document Intelligence' },
  { id: 'tool-2', name: 'Rules Engine' },
  { id: 'tool-3', name: 'Data Fabric Query' }
];

export const promptItems: PromptItem[] = [
  { 
    id: 'prompt-1', 
    name: 'Base Prompt',
    content: 
`You are an AI assistant for insurance underwriting at Neutrinos Insurance. 

Your role is to:
1. Collect relevant health and medical information
2. Apply underwriting rules to evaluate applications
3. Make recommendations based on risk assessment
4. Request additional information when needed
5. Create clear, explainable decisions

Available ratings:
- Preferred Plus
- Preferred
- Standard Plus
- Standard
- Table A-H (increasing risk)
- Decline

Always consider:
- Medical conditions
- Medications
- Family history
- Lifestyle factors
- Policy amount

Use Tools:
- Rules Engine: for policy evaluation
- Document Intelligence: for analyzing medical records
- Data Fabric Query: for retrieving customer history`
  }
];

export const policyItems: PolicyItem[] = [
  { id: 'policy-1', name: 'Data Governance' },
  { id: 'policy-2', name: 'Security Rules' }
];

export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'agent',
    content: "Hello! I'm the Accelerated UW Agent. I can help evaluate insurance applications based on health and medical data. How can I assist you today?"
  },
  {
    id: 'msg-2',
    role: 'user',
    content: "I need to process a new life insurance application for a 35-year-old non-smoker with hypertension."
  },
  {
    id: 'msg-3',
    role: 'agent',
    content: "I'd be happy to help process that application. I'll need some specific information:\n\n1. Current blood pressure readings\n2. Any medications being taken\n3. Duration of hypertension diagnosis\n4. Any other medical conditions\n5. Coverage amount requested\n\nYou can also upload any medical reports if available."
  },
  {
    id: 'msg-4',
    role: 'user',
    content: "BP is 140/90, taking lisinopril 10mg, diagnosed 3 years ago. No other conditions. Coverage requested is $500,000."
  },
  {
    id: 'msg-5',
    role: 'agent',
    content: "Let me search for any existing customer records in our system."
  },
  {
    id: 'msg-6',
    role: 'agent',
    tool: 'Data Fabric Query',
    content: "I've found the customer's previous policy records in our database. The applicant has two existing policies - one term life policy that's active and one whole life policy application that's currently pending."
  },
  {
    id: 'msg-7',
    role: 'agent',
    content: "Now I'll run a health assessment based on the information provided."
  },
  {
    id: 'msg-8',
    role: 'agent',
    tool: 'Rules Engine',
    content: "Based on the information provided, I've evaluated this application against our underwriting guidelines:\n\n- BP readings (140/90) indicate controlled hypertension\n- Single medication at standard dosage\n- No other health complications\n- Coverage amount within standard limits\n\nRecommendation: Standard Plus rating\n\nThis application can proceed to the next underwriting stage. Would you like me to create the initial assessment report?"
  },
  {
    id: 'msg-9',
    role: 'user',
    content: "Yes, please create the assessment report and prepare it for underwriter review."
  },
  {
    id: 'msg-10',
    role: 'agent',
    content: "I'll generate that report for you now."
  }
];

export const reasoningTraces: ReasoningTrace[] = [
  {
    id: "trace-1",
    title: "Initial Assessment",
    type: "thought",
    content: "Processing an underwriting request for a 35-year-old non-smoker with hypertension.",
    timestamp: new Date().toISOString(),
    durationMs: 150
  },
  {
    id: "trace-2",
    title: "Customer Search",
    type: "data-query",
    content: "Received BP readings, medication info, diagnosis history, and coverage amount. Let me first check if the customer has any existing policies in our database.",
    timestamp: new Date().toISOString(),
    durationMs: 320,
    result: "Found 1 customer matching the criteria with 2 existing policies.",
    action: {
      type: "data-query",
      title: "Customer Query Results",
      description: "Retrieved customer information from CRM database",
      data: {
        headers: ['Customer ID', 'Name', 'Policy Count', 'Status'],
        rows: [
          { id: 'CUST-5678', name: 'John Smith', policyCount: 2, status: { type: 'badge', value: 'Active', color: 'green' } }
        ]
      }
    }
  },
  {
    id: "trace-3",
    title: "Medical Records Analysis",
    type: "document",
    content: "Found the customer in our database. They have two existing policies. Now I'll check the medical records for more details on the hypertension condition.",
    timestamp: new Date().toISOString(),
    durationMs: 610,
    result: "Medical records confirm hypertension diagnosis from 3 years ago. Blood pressure is 140/90 mmHg with Lisinopril 10mg medication.",
    action: {
      type: "document",
      title: "Medical Records Extraction",
      description: "Extracted key information from medical documents",
      data: {
        document: "Medical_Report_12345.pdf",
        model: "Medical IDP v2.1",
        confidence: 94,
        fields: [
          { name: "Blood Pressure", value: "140/90 mmHg" },
          { name: "Medication", value: "Lisinopril 10mg" },
          { name: "Diagnosis Date", value: "06/15/2022" },
          { name: "Physician", value: "Dr. Robert Chen" }
        ]
      }
    }
  },
  {
    id: "trace-4",
    title: "Risk Assessment",
    type: "calculation",
    content: "Now I'll run the risk assessment based on all the information gathered.",
    timestamp: new Date().toISOString(),
    durationMs: 450,
    result: "Risk calculation complete. Standard Plus classification determined with 87% confidence.",
    action: {
      type: "calculation",
      title: "Risk Assessment Results",
      description: "Calculated risk score based on medical information",
      data: {
        title: "Underwriting Recommendation",
        result: { value: "Standard Plus", color: "green" },
        factors: [
          { name: "Hypertension", value: "Controlled" },
          { name: "Medication", value: "Single standard" },
          { name: "Build", value: "Within range" },
          { name: "Confidence", value: "87%" }
        ]
      }
    }
  },
  {
    id: "trace-5",
    title: "Final Recommendation",
    type: "thought",
    content: "The applicant's condition is well controlled with a single medication. Blood pressure is slightly elevated but within acceptable limits for Standard Plus. The customer has existing policies with us which shows a good relationship.",
    timestamp: new Date().toISOString(),
    durationMs: 200,
    action: {
      type: "notification",
      title: "Underwriter Notification",
      description: "Prepared report for underwriter review",
      data: {
        to: "underwriter@neutrinos.com",
        subject: "Standard Plus Application Ready for Review",
        status: { value: "Sent", color: "green" },
        key_factors: [
          "35-year-old non-smoker",
          "Controlled hypertension (BP 140/90)",
          "Single medication (lisinopril 10mg)",
          "No other health issues",
          "Coverage: $500,000"
        ]
      }
    }
  }
];
