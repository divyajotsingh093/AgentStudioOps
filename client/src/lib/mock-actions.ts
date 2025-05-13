// Mock data for agent actions and action history

export const availableActions = [
  {
    id: 'action-1',
    name: 'Issue Policy',
    category: 'Policy',
    description: 'Create and issue approved insurance policy',
    status: 'available',
    configuration: {
      'Hypertension': 'Controlled',
      'Build': 'Within range'
    }
  },
  {
    id: 'action-2',
    name: 'Decline Application',
    category: 'Policy',
    description: 'Decline application based on underwriting criteria',
    status: 'restricted',
    tags: ['high-risk', 'authority-required']
  },
  {
    id: 'action-3',
    name: 'Request Additional Information',
    category: 'Workflow',
    description: 'Request additional medical records or tests',
    status: 'available'
  },
  {
    id: 'action-4',
    name: 'Apply Rate Class',
    category: 'Underwriting',
    description: 'Apply standard or non-standard rate class based on risk assessment',
    status: 'available',
    configuration: {
      'Medical': 'Single standard',
      'Confidence': '87%'
    }
  },
  {
    id: 'action-5',
    name: 'Schedule Medical Exam',
    category: 'Workflow',
    description: 'Schedule a paramedical exam for the applicant',
    status: 'available'
  }
];

export const actionHistory = [
  {
    id: 'history-1',
    type: 'Risk Assessment',
    title: 'Risk Assessment',
    timestamp: new Date(Date.now() - 4 * 60000), // 4 minutes ago
    status: 'success',
    metadata: {
      'Result': 'Standard rate',
      'Factors': 'BP, height/weight, activity level'
    }
  },
  {
    id: 'history-2',
    type: 'Medical Records Analysis',
    title: 'Medical Records Analysis',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    status: 'success',
    metadata: {
      'Source': 'Electronic Health Records',
      'Key findings': 'Controlled hypertension, no other issues'
    }
  },
  {
    id: 'history-3',
    type: 'Underwriting Decision',
    title: 'Applying Rate Class',
    timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
    status: 'pending',
    confidence: 0.87,
    metadata: {
      'Proposed class': 'Single standard',
      'Authority level': 'Manager approval'
    }
  }
];