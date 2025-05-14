import express, { Router, Request, Response } from 'express';
import { 
  generateText, 
  analyzeRisk, 
  analyzeClaim, 
  analyzeText, 
  customerServiceChat, 
  generateAgentComponent
} from './openai';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// Route for general text generation with OpenAI
router.post('/generate-text', async (req: Request, res: Response) => {
  try {
    const { systemPrompt, userPrompt, model, temperature, maxTokens } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'System prompt and user prompt are required' });
    }
    
    const response = await generateText({
      systemPrompt,
      userPrompt,
      model: model || 'gpt-4o',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Route for analyzing insurance risk
router.post('/analyze-risk', async (req: Request, res: Response) => {
  try {
    const { policyData } = req.body;
    
    if (!policyData) {
      return res.status(400).json({ error: 'Policy data is required' });
    }
    
    const runId = uuidv4();
    
    // Create a run record
    await storage.createRun({
      id: runId,
      agentId: req.body.agentId || "risk-assessment-agent",
      agentName: "Risk Assessment Agent",
      agentIcon: "shield",
      status: 'Running',
      steps: JSON.stringify(policyData),
      latency: 0,
      cost: 0
    });
    
    const analysisResult = await analyzeRisk(policyData);
    
    // Update run status
    await storage.updateRunStatus(runId, 'Completed');
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing risk:', error);
    res.status(500).json({ error: 'Failed to analyze risk' });
  }
});

// Route for analyzing insurance claims
router.post('/analyze-claim', async (req: Request, res: Response) => {
  try {
    const { claimData } = req.body;
    
    if (!claimData) {
      return res.status(400).json({ error: 'Claim data is required' });
    }
    
    const runId = uuidv4();
    
    // Create a run record
    await storage.createRun({
      id: runId,
      agentId: req.body.agentId || "claim-analysis-agent",
      agentName: "Claim Analysis Agent",
      agentIcon: "document-check",
      status: 'Running',
      steps: JSON.stringify(claimData),
      latency: 0,
      cost: 0
    });
    
    const analysisResult = await analyzeClaim(claimData);
    
    // Update run status
    await storage.updateRunStatus(runId, 'Completed');
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing claim:', error);
    res.status(500).json({ error: 'Failed to analyze claim' });
  }
});

// Route for text analysis (sentiment, summary, classification, extraction)
router.post('/analyze-text', async (req: Request, res: Response) => {
  try {
    const { text, type, options } = req.body;
    
    if (!text || !type) {
      return res.status(400).json({ error: 'Text and analysis type are required' });
    }
    
    const analysisResult = await analyzeText({ text, type, options });
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

// Route for customer service chat
router.post('/customer-chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, customerInfo } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const chatResponse = await customerServiceChat(message, conversationHistory || [], customerInfo || {});
    
    res.json(chatResponse);
  } catch (error) {
    console.error('Error in customer chat:', error);
    res.status(500).json({ error: 'Failed to process customer chat' });
  }
});

// Route for generating agent components
router.post('/generate-component', async (req: Request, res: Response) => {
  try {
    const { componentType, description, agentId, context } = req.body;
    
    if (!componentType || !description || !agentId) {
      return res.status(400).json({ error: 'Component type, description, and agent ID are required' });
    }
    
    const agent = await storage.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const runId = uuidv4();
    
    // Create a run record with agent details
    
    await storage.createRun({
      id: runId,
      agentId: agentId,
      agentName: agent?.name || "Component Generator",
      agentIcon: "robot",
      status: 'Running',
      steps: JSON.stringify({ componentType, description, context }),
      latency: 0,
      cost: 0
    });
    
    const component = await generateAgentComponent(
      componentType,
      description,
      agent,
      context || {}
    );
    
    // Create the component in the database
    const savedComponent = await storage.createAgentComponent({
      agentId: agentId,
      type: componentType,
      name: component.name,
      description: description,
      configuration: component.configuration,
      content: component.code // map the code field to content as per schema
    });
    
    // Update run status
    await storage.updateRunStatus(runId, 'Completed');
    
    res.json(savedComponent);
  } catch (error) {
    console.error('Error generating component:', error);
    res.status(500).json({ error: 'Failed to generate component' });
  }
});

// Route for executing tool runs with logging
router.post('/execute-run', async (req: Request, res: Response) => {
  const { toolId, runId, input, agentId } = req.body;
  
  if (!toolId || !input) {
    return res.status(400).json({ error: 'Tool ID and input are required' });
  }
  
  try {
    // Get the tool
    const tool = await storage.getToolById(parseInt(toolId));
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    // Create tool execution record
    const startTime = new Date();
    
    // Create a unique execution ID
    const executionId = parseInt(Date.now().toString().slice(-9));
    
    // Record the execution
    await storage.createToolExecution({
      id: executionId,
      toolId: parseInt(toolId),
      runId: runId || null,
      agentId: agentId || null,
      status: 'Running',
      requestPayload: input,
      responsePayload: null,
      errorMessage: null,
      timestamp: startTime,
      latency: null
    });
    
    // Get the appropriate AI service based on the tool endpoint
    let result;
    const inputData = typeof input === 'string' ? JSON.parse(input) : input;
    
    if (tool.endpoint === '/api/ai/analyze-risk') {
      result = await analyzeRisk(inputData);
    } else if (tool.endpoint === '/api/ai/analyze-claim') {
      result = await analyzeClaim(inputData);
    } else if (tool.endpoint === '/api/ai/analyze-text') {
      result = await analyzeText(inputData);
    } else if (tool.endpoint === '/api/ai/generate-text') {
      result = await generateText(inputData);
    } else if (tool.endpoint === '/api/ai/customer-chat') {
      result = await customerServiceChat(
        inputData.message,
        inputData.conversationHistory || [],
        inputData.customerInfo || {}
      );
    } else {
      throw new Error(`Unsupported tool endpoint: ${tool.endpoint}`);
    }
    
    const endTime = new Date();
    const latency = endTime.getTime() - startTime.getTime();
    
    // Update the execution with results
    await storage.updateToolExecution(executionId, {
      status: 'Completed',
      responsePayload: result,
      latency
    });
    
    res.json({
      executionId,
      toolId,
      runId,
      agentId,
      result,
      latency
    });
    
  } catch (error) {
    console.error('Error executing tool:', error);
    
    // Update the execution with error if we have an executionId
    if (req.body.executionId) {
      await storage.updateToolExecution(parseInt(req.body.executionId), {
        status: 'Failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    res.status(500).json({ error: 'Failed to execute tool' });
  }
});

export default router;