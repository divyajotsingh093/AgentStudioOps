// This file contains detailed mock data models for agent components
// including rules, document models, and data fabric integration examples

export interface RuleModel {
  id: string;
  name: string;
  description: string;
  ruleType: 'Simple' | 'Complex' | 'Hybrid';
  category: string;
  status: 'Active' | 'Draft' | 'Inactive';
  version: string;
  lastUpdated: Date;
  author?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  parameters: RuleParameter[];
  examples: RuleExample[];
  metadata: Record<string, any>;
}

export interface RuleCondition {
  id: string;
  type: 'Comparison' | 'Logical' | 'Custom';
  description: string;
  expression: string;
  field?: string;
  operator?: string;
  value?: any;
  priority: number;
  metadata?: Record<string, any>;
}

export interface RuleAction {
  id: string;
  type: 'Assignment' | 'Calculation' | 'Notification' | 'Workflow' | 'Custom';
  description: string;
  expression: string;
  target?: string;
  value?: any;
  metadata?: Record<string, any>;
}

export interface RuleParameter {
  id: string;
  name: string;
  description: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Object' | 'Array';
  required: boolean;
  defaultValue?: any;
  allowedValues?: any[];
  validation?: string;
  metadata?: Record<string, any>;
}

export interface RuleExample {
  id: string;
  description: string;
  inputs: Record<string, any>;
  expectedOutput: Record<string, any>;
  explanation: string;
}

// Document model interfaces
export interface DocumentModel {
  id: string;
  name: string;
  description: string;
  type: 'Medical' | 'Financial' | 'Identity' | 'Claims' | 'Other';
  status: 'Active' | 'Draft' | 'Training';
  version: string;
  lastUpdated: Date;
  author?: string;
  supportedFormats: string[];
  fields: DocumentField[];
  extractionMethod: 'OCR' | 'LLM' | 'Hybrid' | 'Custom';
  accuracy: number; // Percentage
  processingTime: number; // Average in milliseconds
  examples: DocumentExample[];
  metadata: Record<string, any>;
}

export interface DocumentField {
  id: string;
  name: string;
  description: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Enum' | 'Array' | 'Object';
  required: boolean;
  extractionPath?: string;
  extractionConfidence: number; // Percentage
  validation?: string;
  postProcessing?: string;
  metadata?: Record<string, any>;
}

export interface DocumentExample {
  id: string;
  description: string;
  fileName: string;
  fileFormat: string;
  fileSize: number; // In bytes
  processingTime: number; // In milliseconds
  extractionResults: Record<string, any>;
  accuracy: number; // Percentage
}

// Data Fabric interfaces
export interface DataFabricModel {
  id: string;
  name: string;
  description: string;
  type: 'Schema' | 'Mapping' | 'Integration' | 'Query' | 'Other';
  status: 'Active' | 'Draft' | 'Deprecated';
  version: string;
  lastUpdated: Date;
  author?: string;
  dataSources: DataSource[];
  mappings: DataMapping[];
  entities: DataEntity[];
  relationships: DataRelationship[];
  queryTemplates: QueryTemplate[];
  examples: DataFabricExample[];
  metadata: Record<string, any>;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: 'SQL' | 'NoSQL' | 'API' | 'File' | 'Stream' | 'Other';
  connection: {
    type: string;
    details: Record<string, any>;
  };
  schema?: Record<string, any>;
  refreshRate?: string; // E.g., "real-time", "daily", "hourly"
  lastSync?: Date;
  metadata?: Record<string, any>;
}

export interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DataEntity {
  id: string;
  name: string;
  description: string;
  fields: Record<string, {
    type: string;
    description?: string;
    required?: boolean;
    source?: string;
  }>;
  primaryKey?: string[];
  metadata?: Record<string, any>;
}

export interface DataRelationship {
  id: string;
  name: string;
  description: string;
  sourceEntity: string;
  targetEntity: string;
  type: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  sourceField: string;
  targetField: string;
  metadata?: Record<string, any>;
}

export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: Record<string, {
    type: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
  }>;
  metadata?: Record<string, any>;
}

export interface DataFabricExample {
  id: string;
  description: string;
  query: string;
  parameters: Record<string, any>;
  result: any;
  executionTime: number; // In milliseconds
  explanation: string;
}

//------------------------------------------------------------------------
// MOCK DATA EXAMPLES
//------------------------------------------------------------------------

// 1. Medical Underwriting Rules Examples
export const medicalUnderwritingRules: RuleModel[] = [
  {
    id: 'rule-med-001',
    name: 'Diabetes Risk Assessment',
    description: 'Evaluates diabetes risk based on A1C levels, BMI, and family history',
    ruleType: 'Complex',
    category: 'Medical Underwriting',
    status: 'Active',
    version: '2.3.1',
    lastUpdated: new Date(2025, 3, 15),
    author: 'Medical Risk Team',
    conditions: [
      {
        id: 'cond-001',
        type: 'Comparison',
        description: 'Check if A1C level is elevated',
        expression: 'lab_results.a1c > 5.7',
        field: 'lab_results.a1c',
        operator: '>',
        value: 5.7,
        priority: 1,
        metadata: {
          source: 'Lab Results API',
          confidence: 'High'
        }
      },
      {
        id: 'cond-002',
        type: 'Comparison',
        description: 'Check if BMI is in overweight or obese range',
        expression: 'medical_data.bmi >= 25',
        field: 'medical_data.bmi',
        operator: '>=',
        value: 25,
        priority: 2
      },
      {
        id: 'cond-003',
        type: 'Logical',
        description: 'Check for family history of diabetes',
        expression: 'medical_history.family_diabetes == true',
        field: 'medical_history.family_diabetes',
        operator: '==',
        value: true,
        priority: 3
      }
    ],
    actions: [
      {
        id: 'act-001',
        type: 'Calculation',
        description: 'Calculate diabetes risk score',
        expression: 'risk_score = (lab_results.a1c > 6.0 ? 50 : 30) + (medical_data.bmi >= 30 ? 25 : 15) + (medical_history.family_diabetes ? 25 : 0)',
        target: 'risk_score',
      },
      {
        id: 'act-002',
        type: 'Assignment',
        description: 'Assign risk class based on score',
        expression: 'risk_class = risk_score >= 75 ? "High" : risk_score >= 50 ? "Medium" : "Standard"',
        target: 'risk_class'
      },
      {
        id: 'act-003',
        type: 'Notification',
        description: 'Notify underwriter if high risk',
        expression: 'risk_score >= 75',
        metadata: {
          notificationType: 'Underwriter Alert',
          priority: 'High',
          message: 'High diabetes risk detected, manual review required'
        }
      }
    ],
    parameters: [
      {
        id: 'param-001',
        name: 'a1c_threshold',
        description: 'A1C level threshold for pre-diabetes',
        type: 'Number',
        required: true,
        defaultValue: 5.7,
        validation: 'value >= 5.0 && value <= 7.0'
      },
      {
        id: 'param-002',
        name: 'bmi_threshold',
        description: 'BMI threshold for overweight status',
        type: 'Number',
        required: true,
        defaultValue: 25,
        validation: 'value >= 18.5 && value <= 40'
      },
      {
        id: 'param-003',
        name: 'high_risk_score',
        description: 'Threshold score for high risk classification',
        type: 'Number',
        required: true,
        defaultValue: 75,
        validation: 'value >= 0 && value <= 100'
      }
    ],
    examples: [
      {
        id: 'ex-001',
        description: 'High risk case with elevated A1C, obesity, and family history',
        inputs: {
          'lab_results.a1c': 6.8,
          'medical_data.bmi': 32.5,
          'medical_history.family_diabetes': true
        },
        expectedOutput: {
          'risk_score': 100,
          'risk_class': 'High'
        },
        explanation: 'This case represents a high-risk scenario with all risk factors present: A1C in diabetic range (6.8), BMI in obese range (32.5), and positive family history. The calculated risk score is 100 (50+25+25), which leads to a "High" risk classification and triggers underwriter notification.'
      },
      {
        id: 'ex-002',
        description: 'Medium risk case with elevated A1C, overweight, but no family history',
        inputs: {
          'lab_results.a1c': 6.2,
          'medical_data.bmi': 27.8,
          'medical_history.family_diabetes': false
        },
        expectedOutput: {
          'risk_score': 65,
          'risk_class': 'Medium'
        },
        explanation: 'This case represents a medium-risk scenario with two risk factors: A1C above 6.0 (6.2) and BMI in overweight range (27.8), but no family history. The calculated risk score is 65 (50+15+0), which leads to a "Medium" risk classification.'
      }
    ],
    metadata: {
      'source': 'Medical Underwriting Guidelines 2025',
      'regulatory_compliance': 'HIPAA, GDPR',
      'last_validation': '2025-02-10',
      'accuracy_rate': '97.8%',
      'reference_studies': [
        'American Diabetes Association Risk Assessment Guidelines',
        'National Health Institute BMI Classification'
      ]
    }
  },
  {
    id: 'rule-med-002',
    name: 'Cardiovascular Risk Assessment',
    description: 'Evaluates cardiovascular disease risk based on cholesterol levels, blood pressure, and lifestyle factors',
    ruleType: 'Complex',
    category: 'Medical Underwriting',
    status: 'Active',
    version: '3.1.0',
    lastUpdated: new Date(2025, 4, 5),
    author: 'Cardiac Risk Team',
    conditions: [
      {
        id: 'cond-001',
        type: 'Comparison',
        description: 'Check if total cholesterol is elevated',
        expression: 'lab_results.total_cholesterol > 200',
        field: 'lab_results.total_cholesterol',
        operator: '>',
        value: 200,
        priority: 1
      },
      {
        id: 'cond-002',
        type: 'Comparison',
        description: 'Check if LDL cholesterol is elevated',
        expression: 'lab_results.ldl > 130',
        field: 'lab_results.ldl',
        operator: '>',
        value: 130,
        priority: 2
      },
      {
        id: 'cond-003',
        type: 'Comparison',
        description: 'Check if blood pressure is elevated',
        expression: 'vital_signs.systolic > 140 || vital_signs.diastolic > 90',
        priority: 1
      },
      {
        id: 'cond-004',
        type: 'Logical',
        description: 'Check for smoking status',
        expression: 'health_history.smoking_status == "Current"',
        field: 'health_history.smoking_status',
        operator: '==',
        value: 'Current',
        priority: 3
      }
    ],
    actions: [
      {
        id: 'act-001',
        type: 'Calculation',
        description: 'Calculate base cardiovascular risk score',
        expression: `
          let score = 0;
          if (lab_results.total_cholesterol > 240) score += 30;
          else if (lab_results.total_cholesterol > 200) score += 15;
          
          if (lab_results.ldl > 160) score += 30;
          else if (lab_results.ldl > 130) score += 15;
          
          if (vital_signs.systolic > 160 || vital_signs.diastolic > 100) score += 40;
          else if (vital_signs.systolic > 140 || vital_signs.diastolic > 90) score += 20;
          
          if (health_history.smoking_status == "Current") score += 30;
          else if (health_history.smoking_status == "Former") score += 10;
          
          return score;
        `,
        target: 'cv_risk_score'
      },
      {
        id: 'act-002',
        type: 'Assignment',
        description: 'Assign risk class based on score',
        expression: 'cv_risk_class = cv_risk_score >= 70 ? "High" : cv_risk_score >= 40 ? "Medium" : "Standard"',
        target: 'cv_risk_class'
      },
      {
        id: 'act-003',
        type: 'Workflow',
        description: 'Request additional tests for high risk applicants',
        expression: 'cv_risk_score >= 70',
        metadata: {
          workflowType: 'RequestAdditionalTests',
          tests: ['Stress ECG', 'Echocardiogram'],
          priority: 'High',
          timeframe: '2 weeks'
        }
      }
    ],
    parameters: [
      {
        id: 'param-001',
        name: 'total_cholesterol_high',
        description: 'High threshold for total cholesterol',
        type: 'Number',
        required: true,
        defaultValue: 240
      },
      {
        id: 'param-002',
        name: 'total_cholesterol_borderline',
        description: 'Borderline threshold for total cholesterol',
        type: 'Number',
        required: true,
        defaultValue: 200
      },
      {
        id: 'param-003',
        name: 'high_risk_score',
        description: 'Threshold score for high CV risk classification',
        type: 'Number',
        required: true,
        defaultValue: 70
      }
    ],
    examples: [
      {
        id: 'ex-001',
        description: 'High risk case with high cholesterol, hypertension, and smoking',
        inputs: {
          'lab_results.total_cholesterol': 260,
          'lab_results.ldl': 170,
          'vital_signs.systolic': 155,
          'vital_signs.diastolic': 95,
          'health_history.smoking_status': 'Current'
        },
        expectedOutput: {
          'cv_risk_score': 100,
          'cv_risk_class': 'High'
        },
        explanation: 'This case represents a high-risk cardiovascular profile with severely elevated cholesterol (total and LDL), hypertension (Stage 2), and current smoking status. The combination results in the maximum risk score.'
      }
    ],
    metadata: {
      'source': 'American Heart Association Guidelines 2024',
      'regulatory_compliance': 'HIPAA',
      'last_validation': '2025-03-18',
      'accuracy_rate': '94.3%'
    }
  }
];

// 2. Medical Lab Test Document Models
export const medicalLabDocumentModels: DocumentModel[] = [
  {
    id: 'doc-med-001',
    name: 'Comprehensive Blood Panel Extractor',
    description: 'Advanced document model for extracting and interpreting comprehensive blood test results',
    type: 'Medical',
    status: 'Active',
    version: '4.2.1',
    lastUpdated: new Date(2025, 2, 20),
    author: 'Medical AI Team',
    supportedFormats: ['PDF', 'JPEG', 'PNG', 'TIFF', 'DOCX'],
    extractionMethod: 'Hybrid',
    accuracy: 97.8,
    processingTime: 3200, // 3.2 seconds
    fields: [
      {
        id: 'field-001',
        name: 'patient_name',
        description: 'Patient full name',
        type: 'String',
        required: true,
        extractionConfidence: 99.5,
        validation: 'string.length >= 2',
        postProcessing: 'string.proper_case()'
      },
      {
        id: 'field-002',
        name: 'patient_id',
        description: 'Patient identifier or medical record number',
        type: 'String',
        required: true,
        extractionConfidence: 98.7,
        validation: 'regex.match("^[A-Z0-9]{4,12}$")'
      },
      {
        id: 'field-003',
        name: 'test_date',
        description: 'Date when the blood test was performed',
        type: 'Date',
        required: true,
        extractionConfidence: 97.2,
        validation: 'date.is_valid() && date <= current_date',
        postProcessing: 'date.standardize("YYYY-MM-DD")'
      },
      {
        id: 'field-004',
        name: 'complete_blood_count',
        description: 'Complete blood count panel results',
        type: 'Object',
        required: true,
        extractionConfidence: 98.1,
        postProcessing: 'normalize_units()'
      },
      {
        id: 'field-005',
        name: 'lipid_panel',
        description: 'Lipid panel results including cholesterol levels',
        type: 'Object',
        required: false,
        extractionConfidence: 97.5,
        postProcessing: 'normalize_units()'
      },
      {
        id: 'field-006',
        name: 'glucose_tests',
        description: 'Glucose and diabetes-related test results',
        type: 'Object',
        required: false,
        extractionConfidence: 98.3,
        postProcessing: 'normalize_units()'
      },
      {
        id: 'field-007',
        name: 'liver_function',
        description: 'Liver function test results',
        type: 'Object',
        required: false,
        extractionConfidence: 96.8,
        postProcessing: 'normalize_units()'
      },
      {
        id: 'field-008',
        name: 'kidney_function',
        description: 'Kidney function test results',
        type: 'Object',
        required: false,
        extractionConfidence: 96.5,
        postProcessing: 'normalize_units()'
      },
      {
        id: 'field-009',
        name: 'abnormal_flags',
        description: 'Flags for values outside normal ranges',
        type: 'Array',
        required: false,
        extractionConfidence: 95.0
      },
      {
        id: 'field-010',
        name: 'doctor_notes',
        description: 'Additional notes from the physician',
        type: 'String',
        required: false,
        extractionConfidence: 92.5
      }
    ],
    examples: [
      {
        id: 'example-001',
        description: 'Standard comprehensive blood panel with abnormal glucose and cholesterol',
        fileName: 'lab_report_john_doe.pdf',
        fileFormat: 'PDF',
        fileSize: 1250000,
        processingTime: 2800,
        extractionResults: {
          patient_name: 'John Doe',
          patient_id: 'MRN12345',
          test_date: '2025-01-15',
          complete_blood_count: {
            wbc: { value: 7.5, unit: 'K/uL', range: '4.5-11.0', status: 'normal' },
            rbc: { value: 5.1, unit: 'M/uL', range: '4.5-5.9', status: 'normal' },
            hemoglobin: { value: 15.2, unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
            hematocrit: { value: 45.0, unit: '%', range: '41.0-53.0', status: 'normal' },
            platelets: { value: 250, unit: 'K/uL', range: '150-450', status: 'normal' }
          },
          lipid_panel: {
            total_cholesterol: { value: 245, unit: 'mg/dL', range: '<200', status: 'high' },
            ldl: { value: 165, unit: 'mg/dL', range: '<130', status: 'high' },
            hdl: { value: 42, unit: 'mg/dL', range: '>40', status: 'normal' },
            triglycerides: { value: 190, unit: 'mg/dL', range: '<150', status: 'high' }
          },
          glucose_tests: {
            fasting_glucose: { value: 118, unit: 'mg/dL', range: '70-99', status: 'high' },
            a1c: { value: 6.2, unit: '%', range: '<5.7', status: 'high' }
          },
          liver_function: {
            alt: { value: 30, unit: 'U/L', range: '7-56', status: 'normal' },
            ast: { value: 28, unit: 'U/L', range: '5-40', status: 'normal' },
            alp: { value: 75, unit: 'U/L', range: '44-147', status: 'normal' }
          },
          kidney_function: {
            bun: { value: 15, unit: 'mg/dL', range: '7-20', status: 'normal' },
            creatinine: { value: 0.9, unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
            egfr: { value: 90, unit: 'mL/min/1.73m²', range: '>60', status: 'normal' }
          },
          abnormal_flags: [
            { test: 'total_cholesterol', value: 245, status: 'high' },
            { test: 'ldl', value: 165, status: 'high' },
            { test: 'triglycerides', value: 190, status: 'high' },
            { test: 'fasting_glucose', value: 118, status: 'high' },
            { test: 'a1c', value: 6.2, status: 'high' }
          ],
          doctor_notes: 'Patient shows pre-diabetic glucose levels and elevated cholesterol. Recommend lifestyle modifications and follow-up in 3 months.'
        },
        accuracy: 98.2
      }
    ],
    metadata: {
      training_data_size: '150,000 documents',
      model_architecture: 'MultiModal-Vision-LLM',
      field_extraction_methods: {
        patient_data: 'Pattern matching + entity recognition',
        test_results: 'Table extraction + contextual recognition',
        abnormal_flags: 'Color and symbol detection + context'
      },
      validation_method: 'Cross-validation with human review',
      confidence_calculation: 'Weighted average of component model confidences'
    }
  },
  {
    id: 'doc-med-002',
    name: 'Medical Imaging Report Extractor',
    description: 'Document model specialized for radiology and imaging report interpretation',
    type: 'Medical',
    status: 'Active',
    version: '3.5.0',
    lastUpdated: new Date(2025, 1, 10),
    author: 'Radiology AI Team',
    supportedFormats: ['PDF', 'DICOM', 'JPEG', 'PNG', 'TIFF'],
    extractionMethod: 'Hybrid',
    accuracy: 96.5,
    processingTime: 4100, // 4.1 seconds
    fields: [
      {
        id: 'field-001',
        name: 'patient_info',
        description: 'Patient identification information',
        type: 'Object',
        required: true,
        extractionConfidence: 99.0
      },
      {
        id: 'field-002',
        name: 'exam_type',
        description: 'Type of imaging examination performed',
        type: 'String',
        required: true,
        extractionConfidence: 99.5,
        allowedValues: ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'PET Scan', 'Mammogram', 'Other']
      },
      {
        id: 'field-003',
        name: 'exam_date',
        description: 'Date when the imaging was performed',
        type: 'Date',
        required: true,
        extractionConfidence: 98.0
      },
      {
        id: 'field-004',
        name: 'body_region',
        description: 'Region of the body examined',
        type: 'String',
        required: true,
        extractionConfidence: 98.5
      },
      {
        id: 'field-005',
        name: 'clinical_indication',
        description: 'Reason for the imaging examination',
        type: 'String',
        required: false,
        extractionConfidence: 94.0
      },
      {
        id: 'field-006',
        name: 'findings',
        description: 'Detailed findings from the image interpretation',
        type: 'String',
        required: true,
        extractionConfidence: 93.5
      },
      {
        id: 'field-007',
        name: 'impression',
        description: 'Radiologist\'s summary and impression of findings',
        type: 'String',
        required: true,
        extractionConfidence: 95.0
      },
      {
        id: 'field-008',
        name: 'abnormalities',
        description: 'Specific abnormalities detected',
        type: 'Array',
        required: false,
        extractionConfidence: 92.0
      },
      {
        id: 'field-009',
        name: 'recommendations',
        description: 'Follow-up recommendations',
        type: 'String',
        required: false,
        extractionConfidence: 91.0
      },
      {
        id: 'field-010',
        name: 'radiologist',
        description: 'Radiologist who interpreted the images',
        type: 'String',
        required: true,
        extractionConfidence: 97.5
      }
    ],
    examples: [
      {
        id: 'example-001',
        description: 'Chest X-ray report with minor abnormality',
        fileName: 'chest_xray_report_jane_smith.pdf',
        fileFormat: 'PDF',
        fileSize: 890000,
        processingTime: 3850,
        extractionResults: {
          patient_info: {
            name: 'Jane Smith',
            id: 'PT98765',
            dob: '1975-08-25',
            gender: 'Female'
          },
          exam_type: 'X-Ray',
          exam_date: '2025-02-18',
          body_region: 'Chest',
          clinical_indication: 'Persistent cough for 3 weeks, rule out pneumonia',
          findings: 'PA and lateral views of the chest demonstrate clear lung fields bilaterally. Heart size is normal. No evidence of pneumonia, effusion, or pneumothorax. Small calcified granuloma in the right upper lobe, likely representing an old, healed infection. No active disease process identified. Osseous structures are intact.',
          impression: 'No acute cardiopulmonary disease. Incidental finding of calcified granuloma in right upper lobe, likely representing previous infection, no follow-up necessary.',
          abnormalities: [
            {
              description: 'Calcified granuloma',
              location: 'Right upper lobe',
              significance: 'Benign, no action needed',
              size: '5mm'
            }
          ],
          recommendations: 'No follow-up imaging required. Clinical correlation as needed.',
          radiologist: 'Dr. Robert Johnson, MD'
        },
        accuracy: 97.1
      }
    ],
    metadata: {
      specialization: 'Radiology reports',
      languages_supported: ['English', 'Spanish', 'French'],
      extraction_techniques: 'LLM with radiology-specific fine-tuning',
      integration_capabilities: 'PACS systems, EMR systems'
    }
  }
];

// 3. Data Fabric - Benefit Mapping Model
export const benefitDataFabricModels: DataFabricModel[] = [
  {
    id: 'df-ben-001',
    name: 'Insurance Benefit Coverage Mapper',
    description: 'Comprehensive data fabric model for mapping insurance policy benefits across systems and products',
    type: 'Mapping',
    status: 'Active',
    version: '3.1.2',
    lastUpdated: new Date(2025, 3, 5),
    author: 'Data Integration Team',
    dataSources: [
      {
        id: 'ds-001',
        name: 'Policy Management System',
        description: 'Primary system of record for policy information',
        type: 'SQL',
        connection: {
          type: 'PostgreSQL',
          details: {
            host: 'policydb.insurance.internal',
            database: 'policy_db',
            schema: 'policy_management'
          }
        },
        refreshRate: 'hourly',
        lastSync: new Date(2025, 4, 12, 8, 0, 0),
        metadata: {
          tables: ['policies', 'policy_benefits', 'riders', 'coverage_details'],
          record_count: 3.5e6,
          data_quality_score: 0.985
        }
      },
      {
        id: 'ds-002',
        name: 'Product Catalog',
        description: 'Product definitions and standard benefit configurations',
        type: 'SQL',
        connection: {
          type: 'MySQL',
          details: {
            host: 'productdb.insurance.internal',
            database: 'product_catalog'
          }
        },
        refreshRate: 'daily',
        lastSync: new Date(2025, 4, 12, 1, 0, 0),
        metadata: {
          tables: ['products', 'benefits', 'benefit_options', 'product_benefits'],
          record_count: 125000,
          data_quality_score: 0.995
        }
      },
      {
        id: 'ds-003',
        name: 'Claims Processing System',
        description: 'System handling claims processing and benefit utilization',
        type: 'API',
        connection: {
          type: 'REST API',
          details: {
            base_url: 'https://claims-api.insurance.internal/v2',
            authentication: 'OAuth2'
          }
        },
        refreshRate: 'real-time',
        metadata: {
          endpoints: ['/claims', '/benefits/utilization', '/eligibility'],
          average_response_time: 120 // ms
        }
      },
      {
        id: 'ds-004',
        name: 'Regulatory Compliance Database',
        description: 'Database of regulatory requirements for benefit coverage',
        type: 'SQL',
        connection: {
          type: 'Oracle',
          details: {
            host: 'regdb.insurance.internal',
            sid: 'REGCOMP'
          }
        },
        refreshRate: 'daily',
        lastSync: new Date(2025, 4, 11, 23, 0, 0),
        metadata: {
          tables: ['regulations', 'coverage_requirements', 'state_mandates'],
          record_count: 75000
        }
      }
    ],
    entities: [
      {
        id: 'entity-001',
        name: 'Policy',
        description: 'Insurance policy contract',
        fields: {
          policy_id: {
            type: 'String',
            description: 'Unique policy identifier',
            required: true,
            source: 'policy_management.policies.policy_id'
          },
          policy_number: {
            type: 'String',
            description: 'Human-readable policy number',
            required: true,
            source: 'policy_management.policies.policy_number'
          },
          policy_type: {
            type: 'String',
            description: 'Type of insurance policy',
            required: true,
            source: 'policy_management.policies.policy_type'
          },
          effective_date: {
            type: 'Date',
            description: 'Date when policy becomes effective',
            required: true,
            source: 'policy_management.policies.effective_date'
          },
          expiration_date: {
            type: 'Date',
            description: 'Date when policy expires',
            required: true,
            source: 'policy_management.policies.expiration_date'
          },
          status: {
            type: 'String',
            description: 'Current policy status',
            required: true,
            source: 'policy_management.policies.status'
          }
        },
        primaryKey: ['policy_id'],
        metadata: {
          display_name: 'Insurance Policy',
          icon: 'document'
        }
      },
      {
        id: 'entity-002',
        name: 'Benefit',
        description: 'Insurance benefit provided under a policy',
        fields: {
          benefit_id: {
            type: 'String',
            description: 'Unique benefit identifier',
            required: true,
            source: 'policy_management.policy_benefits.benefit_id'
          },
          policy_id: {
            type: 'String',
            description: 'Associated policy identifier',
            required: true,
            source: 'policy_management.policy_benefits.policy_id'
          },
          benefit_code: {
            type: 'String',
            description: 'Standard code for the benefit type',
            required: true,
            source: 'policy_management.policy_benefits.benefit_code'
          },
          benefit_name: {
            type: 'String',
            description: 'Human-readable benefit name',
            required: true,
            source: 'product_catalog.benefits.name'
          },
          coverage_amount: {
            type: 'Number',
            description: 'Monetary amount of coverage',
            required: false,
            source: 'policy_management.policy_benefits.coverage_amount'
          },
          coverage_percentage: {
            type: 'Number',
            description: 'Percentage of coverage',
            required: false,
            source: 'policy_management.policy_benefits.coverage_percentage'
          },
          deductible: {
            type: 'Number',
            description: 'Deductible amount',
            required: false,
            source: 'policy_management.policy_benefits.deductible'
          },
          waiting_period: {
            type: 'Number',
            description: 'Waiting period in days',
            required: false,
            source: 'policy_management.policy_benefits.waiting_period'
          },
          status: {
            type: 'String',
            description: 'Current benefit status',
            required: true,
            source: 'policy_management.policy_benefits.status'
          }
        },
        primaryKey: ['benefit_id'],
        metadata: {
          display_name: 'Policy Benefit',
          icon: 'shield'
        }
      },
      {
        id: 'entity-003',
        name: 'BenefitDefinition',
        description: 'Standard definition of an insurance benefit',
        fields: {
          benefit_code: {
            type: 'String',
            description: 'Standard code for the benefit type',
            required: true,
            source: 'product_catalog.benefits.code'
          },
          name: {
            type: 'String',
            description: 'Standard name of the benefit',
            required: true,
            source: 'product_catalog.benefits.name'
          },
          description: {
            type: 'String',
            description: 'Detailed description of the benefit',
            required: true,
            source: 'product_catalog.benefits.description'
          },
          category: {
            type: 'String',
            description: 'Benefit category',
            required: true,
            source: 'product_catalog.benefits.category'
          },
          coverage_type: {
            type: 'String',
            description: 'Type of coverage (monetary, percentage, etc.)',
            required: true,
            source: 'product_catalog.benefits.coverage_type'
          },
          is_standard: {
            type: 'Boolean',
            description: 'Whether this is a standard or optional benefit',
            required: true,
            source: 'product_catalog.benefits.is_standard'
          }
        },
        primaryKey: ['benefit_code'],
        metadata: {
          display_name: 'Benefit Definition',
          icon: 'book'
        }
      },
      {
        id: 'entity-004',
        name: 'RegulatoryRequirement',
        description: 'Regulatory requirement for benefit coverage',
        fields: {
          requirement_id: {
            type: 'String',
            description: 'Unique identifier for the requirement',
            required: true,
            source: 'regdb.coverage_requirements.requirement_id'
          },
          jurisdiction: {
            type: 'String',
            description: 'Jurisdiction (state, federal) for the requirement',
            required: true,
            source: 'regdb.coverage_requirements.jurisdiction'
          },
          benefit_code: {
            type: 'String',
            description: 'Associated benefit code',
            required: true,
            source: 'regdb.coverage_requirements.benefit_code'
          },
          requirement_text: {
            type: 'String',
            description: 'Detailed text of the requirement',
            required: true,
            source: 'regdb.coverage_requirements.requirement_text'
          },
          effective_date: {
            type: 'Date',
            description: 'When the requirement takes effect',
            required: true,
            source: 'regdb.coverage_requirements.effective_date'
          },
          expiration_date: {
            type: 'Date',
            description: 'When the requirement expires (if applicable)',
            required: false,
            source: 'regdb.coverage_requirements.expiration_date'
          }
        },
        primaryKey: ['requirement_id'],
        metadata: {
          display_name: 'Regulatory Requirement',
          icon: 'gavel'
        }
      }
    ],
    mappings: [
      {
        id: 'mapping-001',
        sourceField: 'policy_management.policies.policy_id',
        targetField: 'Policy.policy_id',
        description: 'Map policy ID from source to unified model'
      },
      {
        id: 'mapping-002',
        sourceField: 'policy_management.policy_benefits.benefit_id',
        targetField: 'Benefit.benefit_id',
        description: 'Map benefit ID from source to unified model'
      },
      {
        id: 'mapping-003',
        sourceField: 'policy_management.policy_benefits.benefit_code',
        targetField: 'Benefit.benefit_code',
        description: 'Map benefit code from policy benefits to unified model'
      },
      {
        id: 'mapping-004',
        sourceField: 'product_catalog.benefits.name',
        targetField: 'Benefit.benefit_name',
        transformation: 'LOOKUP(product_catalog.benefits.code = policy_management.policy_benefits.benefit_code)',
        description: 'Look up benefit name from product catalog based on benefit code'
      },
      {
        id: 'mapping-005',
        sourceField: 'policy_management.policy_benefits.policy_id',
        targetField: 'Benefit.policy_id',
        description: 'Map policy ID to benefit for relationship tracking'
      }
    ],
    relationships: [
      {
        id: 'rel-001',
        name: 'PolicyToBenefits',
        description: 'Relationship between policies and their benefits',
        sourceEntity: 'Policy',
        targetEntity: 'Benefit',
        type: 'OneToMany',
        sourceField: 'policy_id',
        targetField: 'policy_id'
      },
      {
        id: 'rel-002',
        name: 'BenefitToDefinition',
        description: 'Relationship between benefits and their standard definitions',
        sourceEntity: 'Benefit',
        targetEntity: 'BenefitDefinition',
        type: 'ManyToOne',
        sourceField: 'benefit_code',
        targetField: 'benefit_code'
      },
      {
        id: 'rel-003',
        name: 'BenefitToRequirements',
        description: 'Relationship between benefits and regulatory requirements',
        sourceEntity: 'Benefit',
        targetEntity: 'RegulatoryRequirement',
        type: 'ManyToMany',
        sourceField: 'benefit_code',
        targetField: 'benefit_code',
        metadata: {
          join_conditions: [
            'Benefit.benefit_code = RegulatoryRequirement.benefit_code',
            'Policy.jurisdiction = RegulatoryRequirement.jurisdiction'
          ]
        }
      }
    ],
    queryTemplates: [
      {
        id: 'query-001',
        name: 'PolicyBenefitSummary',
        description: 'Retrieve a summary of all benefits for a given policy',
        query: `
          SELECT 
            p.policy_number,
            p.policy_type,
            b.benefit_name,
            b.coverage_amount,
            b.coverage_percentage,
            b.deductible,
            bd.description,
            bd.category
          FROM 
            Policy p
            JOIN Benefit b ON p.policy_id = b.policy_id
            JOIN BenefitDefinition bd ON b.benefit_code = bd.benefit_code
          WHERE 
            p.policy_id = :policy_id
            AND b.status = 'ACTIVE'
          ORDER BY 
            bd.category, b.benefit_name
        `,
        parameters: {
          policy_id: {
            type: 'String',
            description: 'ID of the policy to query',
            required: true
          }
        }
      },
      {
        id: 'query-002',
        name: 'BenefitRegulatoryCompliance',
        description: 'Check regulatory compliance for a specific benefit',
        query: `
          SELECT 
            b.benefit_id,
            b.benefit_name,
            b.policy_id,
            p.jurisdiction,
            rr.requirement_id,
            rr.requirement_text,
            CASE 
              WHEN b.coverage_amount >= rr.minimum_coverage THEN 'Compliant'
              ELSE 'Non-compliant'
            END as compliance_status
          FROM 
            Benefit b
            JOIN Policy p ON b.policy_id = p.policy_id
            JOIN RegulatoryRequirement rr ON b.benefit_code = rr.benefit_code
                                         AND p.jurisdiction = rr.jurisdiction
          WHERE 
            b.benefit_id = :benefit_id
            AND rr.effective_date <= CURRENT_DATE
            AND (rr.expiration_date IS NULL OR rr.expiration_date > CURRENT_DATE)
        `,
        parameters: {
          benefit_id: {
            type: 'String',
            description: 'ID of the benefit to check',
            required: true
          }
        }
      }
    ],
    examples: [
      {
        id: 'example-001',
        description: 'Policy benefit summary for comprehensive health insurance policy',
        query: 'SELECT * FROM PolicyBenefitSummary WHERE policy_id = "POL-12345678"',
        parameters: {
          policy_id: 'POL-12345678'
        },
        result: [
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Preventive Care',
            coverage_amount: null,
            coverage_percentage: 100,
            deductible: 0,
            description: 'Coverage for preventive services including annual physicals, immunizations, and screenings',
            category: 'Preventive'
          },
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Primary Care Visit',
            coverage_amount: null,
            coverage_percentage: 90,
            deductible: 25,
            description: 'Coverage for visits to primary care physicians',
            category: 'Outpatient'
          },
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Specialist Visit',
            coverage_amount: null,
            coverage_percentage: 80,
            deductible: 45,
            description: 'Coverage for visits to specialist physicians',
            category: 'Outpatient'
          },
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Hospital Stay',
            coverage_amount: null,
            coverage_percentage: 85,
            deductible: 250,
            description: 'Coverage for inpatient hospital services',
            category: 'Inpatient'
          },
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Emergency Room',
            coverage_amount: null,
            coverage_percentage: 85,
            deductible: 150,
            description: 'Coverage for emergency room services',
            category: 'Emergency'
          },
          {
            policy_number: 'HIP-2025-789012',
            policy_type: 'Health Insurance',
            benefit_name: 'Prescription Drugs - Generic',
            coverage_amount: null,
            coverage_percentage: 90,
            deductible: 10,
            description: 'Coverage for generic prescription medications',
            category: 'Pharmacy'
          }
        ],
        executionTime: 78, // ms
        explanation: 'This example retrieves a summary of benefits for a comprehensive health insurance policy, showing different types of coverage across various categories with their respective coverage percentages and deductibles.'
      }
    ],
    metadata: {
      created_by: 'Insurance Data Integration Team',
      purpose: 'Unified benefit data model for cross-system integration',
      compliance_standards: ['HIPAA', 'GDPR', 'State Insurance Regulations'],
      data_refresh_schedule: 'Hourly for policy data, daily for regulatory data',
      known_limitations: 'Legacy policy data prior to 2023 may have incomplete benefit mappings',
      usage_notes: 'Preferred integration method is through the Benefit API endpoints'
    }
  }
];

// export all models
export const detailedMockModels = {
  medicalUnderwritingRules,
  medicalLabDocumentModels,
  benefitDataFabricModels
};