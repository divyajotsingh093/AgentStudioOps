import { db } from './db';
import { 
  users, agents, agentComponents, runs, governanceIssues, 
  dataSources, dataConnectors, dataPermissions, agentTools, toolExecutions,
  documents, documentAnalysis
} from '@shared/schema';

// Initialize the database by pushing the schema
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Create tables if they don't exist
  try {
    // We're using the Drizzle ORM to create tables
    // The tables are defined in shared/schema.ts
    console.log('Running database migrations...');
    
    // Create tables using Drizzle's migrate API
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        full_name TEXT,
        organization TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type JSONB,
        description TEXT,
        status TEXT NOT NULL,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        capabilities JSONB,
        configuration JSONB
      );
      
      CREATE TABLE IF NOT EXISTS agent_components (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL REFERENCES agents(id),
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        configuration JSONB,
        content TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        agent_id TEXT REFERENCES agents(id),
        status TEXT NOT NULL,
        type TEXT,
        input TEXT,
        output TEXT,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        metrics JSONB,
        user_id INTEGER REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS governance_issues (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        related_agent_id TEXT REFERENCES agents(id),
        related_run_id TEXT REFERENCES runs(id),
        notes TEXT
      );
      
      CREATE TABLE IF NOT EXISTS data_sources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        configuration JSONB,
        description TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        schema JSONB
      );
      
      CREATE TABLE IF NOT EXISTS data_connectors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        source_id INTEGER REFERENCES data_sources(id),
        connection_type TEXT NOT NULL,
        configuration JSONB,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS data_permissions (
        id SERIAL PRIMARY KEY,
        data_source_id INTEGER REFERENCES data_sources(id),
        user_id INTEGER REFERENCES users(id),
        agent_id TEXT REFERENCES agents(id),
        permission_level TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS agent_tools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version TEXT NOT NULL,
        endpoint TEXT,
        auth_type TEXT,
        auth_config JSONB,
        parameters JSONB,
        response_schema JSONB,
        metadata JSONB
      );
      
      CREATE TABLE IF NOT EXISTS tool_executions (
        id SERIAL PRIMARY KEY,
        tool_id INTEGER REFERENCES agent_tools(id),
        run_id TEXT REFERENCES runs(id),
        agent_id TEXT REFERENCES agents(id),
        status TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        latency INTEGER,
        request_payload JSONB,
        response_payload JSONB,
        error_message TEXT
      );
      
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        content TEXT,
        uploaded_by INTEGER REFERENCES users(id),
        associated_agent_id TEXT REFERENCES agents(id),
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS document_analysis (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        entities JSONB DEFAULT '[]',
        classification JSONB DEFAULT '{}',
        confidence INTEGER,
        summary TEXT,
        analysis_type TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database initialization complete!');
    
    // Create an initial admin user if none exists
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Creating initial admin user...');
      await db.insert(users).values({
        username: 'admin',
        password: 'password123', // Note: In production, use proper password hashing
        role: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        organization: 'Neutrinos AI'
      });
      console.log('Initial admin user created successfully.');
    }
    
    // Create sample tools if none exist
    const existingTools = await db.select().from(agentTools);
    if (existingTools.length === 0) {
      console.log('Creating sample tools...');
      
      // Risk analysis tool
      await db.insert(agentTools).values({
        name: 'Risk Analyzer',
        description: 'Analyzes policy data to assess risk and provide underwriting recommendations',
        type: 'API',
        status: 'Active',
        version: '1.0.0',
        endpoint: '/api/ai/analyze-risk',
        authType: 'None',
        parameters: [
          {
            name: 'policyData',
            type: 'object',
            required: true,
            description: 'Insurance policy data to analyze'
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            riskScore: {
              type: 'number',
              description: 'Risk score from 1-10'
            },
            recommendations: {
              type: 'array',
              description: 'List of recommendations'
            },
            explanation: {
              type: 'string',
              description: 'Detailed explanation of risk analysis'
            }
          }
        }
      });
      
      // Claims analyzer tool
      await db.insert(agentTools).values({
        name: 'Claims Analyzer',
        description: 'Analyzes claim data to detect fraud risk and validation issues',
        type: 'API',
        status: 'Active',
        version: '1.0.0',
        endpoint: '/api/ai/analyze-claim',
        authType: 'None',
        parameters: [
          {
            name: 'claimData',
            type: 'object',
            required: true,
            description: 'Claim data to analyze'
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            fraudRisk: {
              type: 'string',
              description: 'Fraud risk assessment (low, medium, high)'
            },
            validationIssues: {
              type: 'array',
              description: 'List of validation issues'
            },
            processingRecommendation: {
              type: 'string',
              description: 'Recommendation for processing'
            }
          }
        }
      });
      
      // Text analysis tool
      await db.insert(agentTools).values({
        name: 'Text Analyzer',
        description: 'Analyzes text for sentiment, classification, summarization, or data extraction',
        type: 'API',
        status: 'Active',
        version: '1.0.0',
        endpoint: '/api/ai/analyze-text',
        authType: 'None',
        parameters: [
          {
            name: 'text',
            type: 'string',
            required: true,
            description: 'Text to analyze'
          },
          {
            name: 'type',
            type: 'string',
            required: true,
            description: 'Type of analysis (sentiment, summary, classification, extraction)'
          },
          {
            name: 'options',
            type: 'object',
            required: false,
            description: 'Additional options for the analysis'
          }
        ],
        responseSchema: {
          type: 'object',
          description: 'Analysis results (varies based on type)'
        }
      });
      
      // Document Analysis tool
      await db.insert(agentTools).values({
        name: 'Document Analyzer',
        description: 'Analyzes insurance documents to extract entities, classify content, and generate summaries',
        type: 'API',
        status: 'Active',
        version: '1.0.0',
        endpoint: '/api/documents/analyze',
        authType: 'None',
        parameters: [
          {
            name: 'documentId',
            type: 'number',
            required: true,
            description: 'ID of the document to analyze'
          },
          {
            name: 'analysisTypes',
            type: 'array',
            required: false,
            description: 'Types of analysis to perform (entities, classification, summary)'
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'number',
              description: 'ID of the analyzed document'
            },
            analysisResults: {
              type: 'array',
              description: 'Results of the analyses performed'
            }
          }
        }
      });
      
      console.log('Sample tools created successfully.');
    }
    
    // Create sample agent if none exists
    const existingAgents = await db.select().from(agents);
    if (existingAgents.length === 0) {
      console.log('Creating sample agent...');
      
      // Underwriting assistant agent
      await db.insert(agents).values({
        id: 'accel-uw',
        name: 'Accelerated Underwriting Assistant',
        type: ['UW'],
        description: 'AI assistant for accelerated underwriting decisions',
        status: 'Running',
        createdBy: 'admin',
        version: '1.0.0',
        isPublic: true,
        capabilities: {
          riskAssessment: true,
          policyRecommendation: true,
          fraudDetection: false,
          customerCommunication: true
        },
        configuration: {
          responseStyle: 'professional',
          dataAccess: ['policyDB', 'customerInfo'],
          approvalThreshold: 0.8
        }
      });
      
      console.log('Sample agent created successfully.');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// For ES modules, we can't use require.main === module
// Instead, we check if this file is executed directly
// This will run if the file is executed directly, but not if imported
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization successful!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}