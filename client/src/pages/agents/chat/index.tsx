import React from 'react';
import ActionChat from '@/components/agents/chat/ActionChat';
import { useRoute, useParams } from 'wouter';
import { AgentAction, ActionHistoryItem } from '@/lib/mock-actions';

// Mock data for agent actions
const mockActions: AgentAction[] = [
  {
    id: 'act1',
    name: 'Customer Query',
    description: 'Search for customer information in the policy database',
    status: 'Ready',
    inputFields: [
      { name: 'customerName', type: 'string', required: false },
      { name: 'policyNumber', type: 'string', required: false },
      { name: 'dateOfBirth', type: 'date', required: false }
    ],
    outputFields: [
      { name: 'policyDetails', type: 'object' },
      { name: 'customerInfo', type: 'object' }
    ]
  },
  {
    id: 'act2',
    name: 'Policy Verification',
    description: 'Check policy status and verify coverage details',
    status: 'Ready',
    inputFields: [
      { name: 'policyNumber', type: 'string', required: true }
    ],
    outputFields: [
      { name: 'coverageStatus', type: 'string' },
      { name: 'policyStatus', type: 'string' },
      { name: 'lastPaymentDate', type: 'date' }
    ]
  },
  {
    id: 'act3',
    name: 'Premium Calculator',
    description: 'Calculate premium changes based on coverage modifications',
    status: 'Ready',
    inputFields: [
      { name: 'policyNumber', type: 'string', required: true },
      { name: 'coverageChanges', type: 'object', required: true }
    ],
    outputFields: [
      { name: 'newPremium', type: 'number' },
      { name: 'premiumDifference', type: 'number' },
      { name: 'effectiveDate', type: 'date' }
    ]
  },
  {
    id: 'act4',
    name: 'Claims History',
    description: 'View past claims for a specific policy or customer',
    status: 'Ready',
    inputFields: [
      { name: 'policyNumber', type: 'string', required: false },
      { name: 'customerId', type: 'string', required: false },
      { name: 'dateRange', type: 'dateRange', required: false }
    ],
    outputFields: [
      { name: 'claims', type: 'array' },
      { name: 'claimsSummary', type: 'object' }
    ]
  },
  {
    id: 'act5',
    name: 'Document Retrieval',
    description: 'Retrieve policy documents and certificates',
    status: 'Pending',
    inputFields: [
      { name: 'policyNumber', type: 'string', required: true },
      { name: 'documentType', type: 'enum', required: true }
    ],
    outputFields: [
      { name: 'documentUrl', type: 'string' },
      { name: 'documentMetadata', type: 'object' }
    ]
  }
];

// Mock data for action history
const mockHistory: ActionHistoryItem[] = [
  {
    id: 'hist1',
    name: 'Customer Query Results',
    timestamp: new Date(2024, 3, 30, 14, 23), // April 30, 2024, 14:23
    result: 'POL-23456 - Life - Whole - Pending',
    status: 'success'
  },
  {
    id: 'hist2',
    name: 'Policy Verification',
    timestamp: new Date(2024, 3, 30, 15, 45), // April 30, 2024, 15:45
    result: 'Status: Active, Coverage: $500,000, Term: 30 years',
    status: 'success'
  }
];

// Default agent data
const defaultAgentData = {
  id: 'accel-uw',
  name: 'Accelerated UW Agent',
  status: 'Running',
  description: 'Medical underwriting assistant for life insurance policies',
  category: 'Underwriting',
  version: '1.2.0',
  lastUpdated: '2025-04-28T14:30:00Z',
  creator: 'System Administrator'
};

export default function AgentChatPage() {
  // In a real app, this would fetch agent data based on the ID from the API
  const [, params] = useRoute('/agents/chat/:id');
  const agentId = params?.id || 'accel-uw'; // Default to 'accel-uw' if no ID provided
  
  // This would normally come from API
  const agent = defaultAgentData;
  
  return (
    <div className="h-screen">
      <ActionChat 
        agentId={agentId}
        agentName={agent.name}
        agentStatus={agent.status}
        actions={mockActions}
        history={mockHistory}
      />
    </div>
  );
}