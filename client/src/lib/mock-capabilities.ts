// Mock data for agent capabilities, rules, and logic
import { v4 as uuidv4 } from 'uuid';

export interface AgentCapability {
  id: string;
  name: string;
  type: 'Rules' | 'Logic' | 'Workflow' | 'Forms' | 'Document' | 'Integration' | 'Orchestration' | 'Data';
  description: string;
  status: 'Available' | 'Restricted' | 'Draft';
  lastUsed?: Date;
  version?: string;
  author?: string;
  examples?: string[];
  configuration?: Record<string, any>;
}

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number; // 1 (highest) to 5 (lowest)
  status: 'Active' | 'Inactive' | 'Testing';
  category: string;
  createdAt: Date;
  lastModified?: Date;
  lastRun?: Date;
  successRate?: number; // Percentage of successful executions
}

export interface LogicFlow {
  id: string;
  name: string;
  description: string;
  steps: LogicStep[];
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: Date;
  lastModified?: Date;
  lastRun?: Date;
}

export interface LogicStep {
  id: string;
  type: 'Condition' | 'Action' | 'Loop' | 'Wait' | 'Calculation';
  name: string;
  description?: string;
  configuration: Record<string, any>;
  nextSteps: string[]; // IDs of the next steps
}

// Business rules for underwriting
export const underwritingRules: RuleDefinition[] = [
  {
    id: uuidv4(),
    name: 'Medical History Evaluation',
    description: 'Evaluates medical history against established risk thresholds',
    condition: 'IF medical_conditions.count > 3 OR medical_conditions.includes("heart_disease", "cancer", "diabetes")',
    action: 'THEN risk_score += 20 AND flag_for_review = true',
    priority: 1,
    status: 'Active',
    category: 'Medical Underwriting',
    createdAt: new Date(2025, 0, 15),
    lastModified: new Date(2025, 3, 10),
    lastRun: new Date(2025, 4, 1),
    successRate: 98.5
  },
  {
    id: uuidv4(),
    name: 'Premium Calculation',
    description: 'Calculates premium based on risk factors and coverage amount',
    condition: 'IF coverage_amount > 500000 AND risk_score > 50',
    action: 'THEN premium = base_premium * 1.25',
    priority: 2,
    status: 'Active',
    category: 'Rating',
    createdAt: new Date(2025, 1, 20),
    lastModified: new Date(2025, 4, 5),
    lastRun: new Date(2025, 4, 12),
    successRate: 99.8
  },
  {
    id: uuidv4(),
    name: 'Occupation Risk Assessment',
    description: 'Evaluates occupation-based risk factors',
    condition: 'IF occupation.risk_category IN ["high", "very_high"]',
    action: 'THEN require_additional_review = true AND notify_underwriter("High risk occupation detected")',
    priority: 2,
    status: 'Active',
    category: 'Occupational Risk',
    createdAt: new Date(2025, 2, 5),
    lastRun: new Date(2025, 4, 10),
    successRate: 97.2
  },
  {
    id: uuidv4(),
    name: 'Age-Based Premium Adjustment',
    description: 'Applies age-based multipliers to premium calculations',
    condition: 'IF applicant.age > 60',
    action: 'THEN premium_multiplier = 1.5 + ((applicant.age - 60) * 0.03)',
    priority: 3,
    status: 'Active',
    category: 'Rating',
    createdAt: new Date(2025, 0, 10),
    lastModified: new Date(2025, 3, 15),
    lastRun: new Date(2025, 4, 12),
    successRate: 100
  },
  {
    id: uuidv4(),
    name: 'Smoker Status Verification',
    description: 'Verifies self-reported smoker status against medical records',
    condition: 'IF declared_smoker == false AND medical_records.indicates_smoking == true',
    action: 'THEN flag_for_investigation = true AND premium_class = "Smoker"',
    priority: 1,
    status: 'Active',
    category: 'Fraud Prevention',
    createdAt: new Date(2025, 2, 20),
    lastRun: new Date(2025, 4, 11),
    successRate: 92.1
  },
  {
    id: uuidv4(),
    name: 'Policy Limit Check',
    description: 'Ensures policy limits conform to company guidelines',
    condition: 'IF total_coverage > 5000000 OR monthly_benefit > 25000',
    action: 'THEN require_executive_approval = true',
    priority: 2,
    status: 'Active',
    category: 'Policy Administration',
    createdAt: new Date(2025, 1, 15),
    lastModified: new Date(2025, 3, 20),
    lastRun: new Date(2025, 4, 12),
    successRate: 99.5
  },
  {
    id: uuidv4(),
    name: 'BMI Risk Assessment',
    description: 'Evaluates BMI against health risk metrics',
    condition: 'IF bmi < 18.5 OR bmi > 35',
    action: 'THEN risk_score += 15 AND require_additional_labs = true',
    priority: 3,
    status: 'Active',
    category: 'Medical Underwriting',
    createdAt: new Date(2025, 0, 25),
    lastModified: new Date(2025, 2, 10),
    lastRun: new Date(2025, 4, 10),
    successRate: 99.1
  },
  {
    id: uuidv4(),
    name: 'International Travel Risk',
    description: 'Assesses risk based on travel to high-risk countries',
    condition: 'IF travel_history.includes_countries(high_risk_countries) AND travel_frequency > 2',
    action: 'THEN apply_travel_rider = true AND premium += 150',
    priority: 3,
    status: 'Testing',
    category: 'Travel Risk',
    createdAt: new Date(2025, 3, 5),
    lastRun: new Date(2025, 4, 5),
    successRate: 88.7
  }
];

// Logic flows for decision making
export const decisionLogicFlows: LogicFlow[] = [
  {
    id: uuidv4(),
    name: 'Automated Underwriting Decision Flow',
    description: 'Automated decision tree for standard policy applications',
    status: 'Active',
    createdAt: new Date(2025, 1, 10),
    lastModified: new Date(2025, 4, 1),
    lastRun: new Date(2025, 4, 12),
    steps: [
      {
        id: 'step1',
        type: 'Condition',
        name: 'Initial Risk Assessment',
        description: 'Evaluate initial risk based on demographic data',
        configuration: {
          condition: 'age < 50 && bmi between 18.5 and 30 && no_medical_conditions',
          trueStep: 'step2',
          falseStep: 'step3'
        },
        nextSteps: ['step2', 'step3']
      },
      {
        id: 'step2',
        type: 'Action',
        name: 'Standard Approval',
        description: 'Approve as standard risk with normal premium',
        configuration: {
          action: 'set_risk_class = "Standard" && set_premium_multiplier = 1.0',
          notify: 'underwriter'
        },
        nextSteps: []
      },
      {
        id: 'step3',
        type: 'Condition',
        name: 'Medical Condition Check',
        description: 'Evaluate severity of medical conditions',
        configuration: {
          condition: 'medical_condition_count <= 2 && no_severe_conditions',
          trueStep: 'step4',
          falseStep: 'step5'
        },
        nextSteps: ['step4', 'step5']
      },
      {
        id: 'step4',
        type: 'Action',
        name: 'Rated Approval',
        description: 'Approve with increased premium based on risk factors',
        configuration: {
          action: 'set_risk_class = "Rated" && calculate_premium_adjustment()'
        },
        nextSteps: []
      },
      {
        id: 'step5',
        type: 'Action',
        name: 'Refer to Underwriter',
        description: 'Refer application to human underwriter for review',
        configuration: {
          action: 'create_underwriter_task() && set_status = "Under Review"',
          priority: 'Medium',
          deadline: 'two_business_days'
        },
        nextSteps: []
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Premium Calculation Workflow',
    description: 'Calculates final premium based on all risk factors and rules',
    status: 'Active',
    createdAt: new Date(2025, 2, 15),
    lastRun: new Date(2025, 4, 12),
    steps: [
      {
        id: 'calc1',
        type: 'Calculation',
        name: 'Base Premium Calculation',
        description: 'Calculate base premium from coverage amount and term',
        configuration: {
          formula: 'base_premium = (coverage_amount * rate_table[term][age_band]) / 1000'
        },
        nextSteps: ['calc2']
      },
      {
        id: 'calc2',
        type: 'Condition',
        name: 'Risk Class Determination',
        description: 'Apply risk class multipliers',
        configuration: {
          condition: 'risk_score > 100',
          trueStep: 'calc3',
          falseStep: 'calc4'
        },
        nextSteps: ['calc3', 'calc4']
      },
      {
        id: 'calc3',
        type: 'Calculation',
        name: 'High Risk Adjustment',
        description: 'Apply high risk premium adjustment',
        configuration: {
          formula: 'adjusted_premium = base_premium * (1 + (risk_score - 100) * 0.01)'
        },
        nextSteps: ['calc5']
      },
      {
        id: 'calc4',
        type: 'Calculation',
        name: 'Standard Risk Adjustment',
        description: 'Apply standard risk band multipliers',
        configuration: {
          formula: 'adjusted_premium = base_premium * risk_class_multiplier'
        },
        nextSteps: ['calc5']
      },
      {
        id: 'calc5',
        type: 'Calculation',
        name: 'Final Premium Calculation',
        description: 'Apply discounts and riders to get final premium',
        configuration: {
          formula: 'final_premium = adjusted_premium * (1 - discount_rate) + sum(rider_premiums)'
        },
        nextSteps: []
      }
    ]
  }
];

// Example agent capabilities
export const agentCapabilities: AgentCapability[] = [
  {
    id: uuidv4(),
    name: 'Medical Underwriting Rules',
    type: 'Rules',
    description: 'Standard rules for evaluating medical conditions and history',
    status: 'Available',
    version: '3.2.1',
    author: 'Risk Management Team',
    examples: [
      'Evaluate diabetes risk based on A1C levels',
      'Assess cardiovascular risk from medical history'
    ],
    configuration: {
      ruleCount: 32,
      lastUpdated: '2025-04-10',
      integrations: ['EHR System', 'Lab Results API']
    }
  },
  {
    id: uuidv4(),
    name: 'Financial Assessment Rules',
    type: 'Rules',
    description: 'Income and financial stability evaluation rules',
    status: 'Available',
    version: '2.1.0',
    author: 'Financial Risk Dept',
    examples: [
      'Income verification thresholds by policy value',
      'Debt-to-income ratio assessment'
    ],
    configuration: {
      ruleCount: 18,
      lastUpdated: '2025-03-22',
      integrations: ['Credit Bureau API', 'Income Verification Service']
    }
  },
  {
    id: uuidv4(),
    name: 'Occupational Risk Logic',
    type: 'Logic',
    description: 'Decision tree for occupational risk assessment',
    status: 'Available',
    version: '1.5.4',
    author: 'Underwriting Division',
    examples: [
      'Hazardous occupation classification',
      'Industry-specific risk factor calculation'
    ],
    configuration: {
      decisionNodes: 27,
      complexityLevel: 'Medium',
      lastUpdated: '2025-01-30'
    }
  },
  {
    id: uuidv4(),
    name: 'Anti-Fraud Detection Logic',
    type: 'Logic',
    description: 'Advanced logic for detecting potential fraudulent applications',
    status: 'Restricted',
    version: '4.0.1',
    author: 'Fraud Prevention Unit',
    examples: [
      'Identity verification scoring',
      'Cross-reference check patterns'
    ],
    configuration: {
      alertThreshold: 'Medium',
      falsePositiveRate: '3.2%',
      requiresApproval: true
    }
  },
  {
    id: uuidv4(),
    name: 'Claims Review Workflow',
    type: 'Workflow',
    description: 'End-to-end workflow for claims review and processing',
    status: 'Available',
    version: '2.2.0',
    author: 'Claims Operations',
    examples: [
      'Medical claims verification process',
      'Documentation requirements workflow'
    ],
    configuration: {
      stages: 5,
      averageCompletionTime: '3.2 days',
      automationLevel: 'High'
    }
  },
  {
    id: uuidv4(),
    name: 'Underwriting Approval Workflow',
    type: 'Workflow',
    description: 'Multi-level approval workflow for non-standard applications',
    status: 'Available',
    version: '3.1.2',
    author: 'Senior Underwriting Team',
    examples: [
      'High-value policy approval chain',
      'Medical exception review process'
    ],
    configuration: {
      approvalLevels: 3,
      escalationTriggers: ['High Risk Score', 'Large Policy Amount', 'Medical Exceptions']
    }
  },
  {
    id: uuidv4(),
    name: 'Policy Application Form',
    type: 'Forms',
    description: 'Dynamic application form with conditional logic',
    status: 'Available',
    version: '5.3.0',
    lastUsed: new Date(2025, 4, 10),
    examples: [
      'Personal information collection',
      'Medical questionnaire with branching logic'
    ],
    configuration: {
      fields: 72,
      conditionalSections: 8,
      validations: 'Enhanced',
      averageCompletionTime: '12 minutes'
    }
  },
  {
    id: uuidv4(),
    name: 'Medical Exam Request Form',
    type: 'Forms',
    description: 'Form for scheduling and tracking required medical exams',
    status: 'Available',
    version: '1.7.2',
    lastUsed: new Date(2025, 4, 11),
    examples: [
      'Lab test requirements based on age and coverage',
      'Exam scheduling and provider selection'
    ],
    configuration: {
      integrations: ['Lab Provider Network', 'Appointment System'],
      automatedFollowup: true
    }
  },
  {
    id: uuidv4(),
    name: 'Medical Record Analysis',
    type: 'Document',
    description: 'Extracts and classifies medical information from records',
    status: 'Available',
    version: '4.1.0',
    author: 'AI Document Team',
    examples: [
      'Medication list extraction and classification',
      'Chronic condition identification'
    ],
    configuration: {
      supportedFormats: ['PDF', 'DOCX', 'JPEG', 'TIFF'],
      accuracyRate: '94.7%',
      processingModel: 'MedicalGPT-4'
    }
  },
  {
    id: uuidv4(),
    name: 'Financial Document Processor',
    type: 'Document',
    description: 'Extracts financial data from statements and tax documents',
    status: 'Available',
    version: '2.8.5',
    author: 'Document Intelligence Group',
    examples: [
      'Income verification from W-2 and tax returns',
      'Investment statement analysis'
    ],
    configuration: {
      supportedDocuments: ['Tax Returns', 'W-2', 'Bank Statements', 'Investment Statements'],
      dataPoints: 28,
      confidenceThreshold: 0.85
    }
  },
  {
    id: uuidv4(),
    name: 'EHR System Connector',
    type: 'Integration',
    description: 'Secure connection to electronic health record systems',
    status: 'Available',
    version: '3.0.2',
    lastUsed: new Date(2025, 4, 9),
    examples: [
      'Retrieve patient history with consent',
      'Lab result verification'
    ],
    configuration: {
      supportedSystems: ['Epic', 'Cerner', 'AllScripts', 'NextGen'],
      authMethod: 'OAuth 2.0',
      dataExchangeFormat: 'FHIR'
    }
  },
  {
    id: uuidv4(),
    name: 'MIB Integration Tool',
    type: 'Integration',
    description: 'Medical Information Bureau data access and reporting',
    status: 'Restricted',
    version: '1.5.0',
    lastUsed: new Date(2025, 4, 8),
    examples: [
      'Prior application history verification',
      'Medical condition cross-reference'
    ],
    configuration: {
      requiresAuthorization: true,
      queryThrottling: '50/hr',
      auditLogging: true
    }
  },
  {
    id: uuidv4(),
    name: 'Multi-Agent Review Process',
    type: 'Orchestration',
    description: 'Coordinates multiple specialized agents for complex cases',
    status: 'Available',
    version: '2.1.3',
    author: 'AI Operations',
    examples: [
      'Medical specialist + financial risk assessment',
      'Fraud detection + claims history analysis'
    ],
    configuration: {
      maxAgents: 5,
      consensusModel: 'Weighted',
      fallbackHandler: 'Senior Underwriter'
    }
  },
  {
    id: uuidv4(),
    name: 'Sequential Assessment Flow',
    type: 'Orchestration',
    description: 'Step-by-step agent progression with decision gates',
    status: 'Available',
    version: '1.8.0',
    author: 'Process Optimization Team',
    examples: [
      'Initial screening → Medical assessment → Final decision',
      'Claims verification sequence'
    ],
    configuration: {
      stages: 4,
      conditionalBranching: true,
      averageCompletionTime: '2.5 hours'
    }
  },
  {
    id: uuidv4(),
    name: 'Unified Customer Data Model',
    type: 'Data',
    description: 'Comprehensive customer data schema with relationship mapping',
    status: 'Available',
    version: '5.2.1',
    lastUsed: new Date(2025, 4, 12),
    examples: [
      'Full policyholder profile with history',
      'Household relationship mapping'
    ],
    configuration: {
      entities: 12,
      relationships: 28,
      complianceStandards: ['GDPR', 'CCPA', 'HIPAA']
    }
  },
  {
    id: uuidv4(),
    name: 'Risk Assessment Vector DB',
    type: 'Data',
    description: 'Vector database of risk profiles and historical outcomes',
    status: 'Restricted',
    version: '2.0.5',
    lastUsed: new Date(2025, 4, 10),
    examples: [
      'Similar case matching for risk assessment',
      'Outcome prediction based on historical data'
    ],
    configuration: {
      vectors: '12.5M',
      dimensions: 768,
      updateFrequency: 'Daily',
      similarityMetric: 'Cosine'
    }
  }
];

// Export combined capabilities and metadata
export const getAllCapabilities = () => {
  return {
    rules: underwritingRules,
    logicFlows: decisionLogicFlows,
    capabilities: agentCapabilities,
    meta: {
      totalCount: underwritingRules.length + decisionLogicFlows.length + agentCapabilities.length,
      lastUpdated: new Date(),
      environment: 'production'
    }
  };
};