import { Router, Request, Response } from 'express';
import * as ai from './openai';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';
import { insertAgentComponentSchema } from '@shared/schema';

const router = Router();

// Generate text with OpenAI
router.post('/generate-text', async (req: Request, res: Response) => {
  try {
    const { systemPrompt, userPrompt, model, temperature, maxTokens } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'System prompt and user prompt are required' });
    }

    const result = await ai.generateText({
      systemPrompt,
      userPrompt,
      model,
      temperature,
      maxTokens
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze risk for underwriting
router.post('/analyze-risk', async (req: Request, res: Response) => {
  try {
    const { policyData, runId, agentId } = req.body;
    
    if (!policyData) {
      return res.status(400).json({ error: 'Policy data is required' });
    }

    const result = await ai.analyzeRisk(policyData);
    
    // Record tool execution if runId and agentId are provided
    if (runId && agentId) {
      await storage.createToolExecution({
        runId,
        agentId,
        toolId: 1, // Assuming risk analyzer tool ID is 1
        status: 'Success',
        requestPayload: policyData,
        responsePayload: result,
        latency: 0, // Would calculate actual latency in production
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error analyzing risk:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze claim
router.post('/analyze-claim', async (req: Request, res: Response) => {
  try {
    const { claimData, runId, agentId } = req.body;
    
    if (!claimData) {
      return res.status(400).json({ error: 'Claim data is required' });
    }

    const result = await ai.analyzeClaim(claimData);
    
    // Record tool execution if runId and agentId are provided
    if (runId && agentId) {
      await storage.createToolExecution({
        runId,
        agentId,
        toolId: 2, // Assuming claim analyzer tool ID is 2
        status: 'Success',
        requestPayload: claimData,
        responsePayload: result,
        latency: 0, // Would calculate actual latency in production
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error analyzing claim:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text analysis
router.post('/analyze-text', async (req: Request, res: Response) => {
  try {
    const { text, type, options } = req.body;
    
    if (!text || !type) {
      return res.status(400).json({ error: 'Text and analysis type are required' });
    }

    const result = await ai.analyzeText({ text, type, options });
    res.json(result);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Customer service chat
router.post('/customer-chat', async (req: Request, res: Response) => {
  try {
    const { history, customerInfo } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Chat history array is required' });
    }

    const response = await ai.customerServiceChat(history, customerInfo);
    res.json({ response });
  } catch (error) {
    console.error('Error in customer chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate agent component
router.post('/generate-component', async (req: Request, res: Response) => {
  try {
    const { type, name, description, inputs, agentId } = req.body;
    
    if (!type || !name || !description || !agentId) {
      return res.status(400).json({ error: 'Type, name, description, and agentId are required' });
    }

    const content = await ai.generateAgentComponent(type, name, description, inputs);
    
    // Save the component to the database
    const component = await storage.createAgentComponent({
      agentId,
      type,
      name,
      description,
      content,
      configuration: inputs || {}
    });

    res.json({ component });
  } catch (error) {
    console.error('Error generating component:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute run with an agent
router.post('/execute-run', async (req: Request, res: Response) => {
  try {
    const { agentId, input, userId } = req.body;
    
    if (!agentId || !input) {
      return res.status(400).json({ error: 'Agent ID and input are required' });
    }

    // Get the agent from storage
    const agent = await storage.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get agent components
    const components = await storage.getAgentComponents(agentId);
    
    // Find prompt components
    const prompts = components.filter(c => c.type === 'prompt');
    const systemPrompt = prompts.find(p => p.name.toLowerCase().includes('system'))?.content || '';
    
    // Use first prompt if no system prompt found
    const effectiveSystemPrompt = systemPrompt || prompts[0]?.content || 'You are a helpful AI assistant in the insurance industry.';
    
    // Generate response using the agent's configuration
    const result = await ai.generateText({
      systemPrompt: effectiveSystemPrompt,
      userPrompt: input,
      temperature: 0.7
    });

    // Create a run record
    const runId = uuidv4();
    const run = await storage.createRun({
      id: runId,
      agentId,
      agentName: agent.name,
      agentIcon: "📊", // Default icon
      status: "Success",
      steps: [{
        type: "Prompt",
        name: "Initial prompt",
        tokens_in: result.usage.promptTokens,
        tokens_out: result.usage.completionTokens,
        latency: 0, // Would calculate actual latency in production
        description: "Initial user query processed by agent"
      }],
      latency: 0, // Would calculate actual latency in production
      cost: result.usage.totalTokens,
      timestamp: new Date()
    });

    res.json({
      runId,
      response: result.text,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error executing run:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;