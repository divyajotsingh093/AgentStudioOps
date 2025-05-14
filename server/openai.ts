import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Agent capabilities
export interface PromptRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisRequest {
  text: string;
  type: 'sentiment' | 'summary' | 'classification' | 'extraction';
  options?: Record<string, any>;
}

// Basic text generation 
export async function generateText(request: PromptRequest): Promise<{
  text: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: request.model || MODEL,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    });

    return {
      text: response.choices[0].message.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

// Underwriting assistance functions
export async function analyzeRisk(policyData: any): Promise<{
  riskScore: number;
  recommendations: string[];
  explanation: string;
}> {
  try {
    const prompt = `
    You are an expert insurance underwriter. Please analyze the following policy data and provide:
    1. A risk score from 1-10 (where 10 is highest risk)
    2. A set of recommendations for mitigating risk
    3. A detailed explanation of your analysis

    Policy data:
    ${JSON.stringify(policyData, null, 2)}
    
    Respond with JSON in this format: 
    {
      "riskScore": number,
      "recommendations": string[],
      "explanation": string
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing risk:", error);
    throw new Error(`Failed to analyze risk: ${error.message}`);
  }
}

// Claims processing assistance
export async function analyzeClaim(claimData: any): Promise<{
  fraudRisk: 'low' | 'medium' | 'high';
  validationIssues: string[];
  processingRecommendation: string;
}> {
  try {
    const prompt = `
    You are an expert insurance claims processor. Please analyze the following claim data and provide:
    1. A fraud risk assessment (low, medium, high)
    2. Any validation issues or missing information
    3. A recommendation for processing (approve, deny, request more information)

    Claim data:
    ${JSON.stringify(claimData, null, 2)}
    
    Respond with JSON in this format: 
    {
      "fraudRisk": "low" | "medium" | "high",
      "validationIssues": string[],
      "processingRecommendation": string
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing claim:", error);
    throw new Error(`Failed to analyze claim: ${error.message}`);
  }
}

// Text analysis for customer communications, policy documents, etc.
export async function analyzeText(request: AnalysisRequest): Promise<any> {
  try {
    let prompt = "";
    let responseFormat: { type: "json_object" } | undefined;

    switch (request.type) {
      case 'sentiment':
        prompt = `Analyze the sentiment of the following text. Respond with JSON containing 'score' (1-5 where 5 is most positive), 'sentiment' (positive, negative, neutral), and 'explanation'. Text: ${request.text}`;
        responseFormat = { type: "json_object" };
        break;
      case 'summary':
        prompt = `Summarize the following text in a concise manner: ${request.text}`;
        break;
      case 'classification':
        const categories = request.options?.categories?.join(', ') || 'general categories';
        prompt = `Classify the following text into one of these categories: ${categories}. Respond with JSON containing 'category' and 'confidence' (0-1). Text: ${request.text}`;
        responseFormat = { type: "json_object" };
        break;
      case 'extraction':
        const fields = request.options?.fields?.join(', ') || 'key information';
        prompt = `Extract the following information from the text: ${fields}. Respond with JSON. Text: ${request.text}`;
        responseFormat = { type: "json_object" };
        break;
      default:
        throw new Error(`Unsupported analysis type: ${request.type}`);
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: responseFormat,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    
    return request.type === 'summary' 
      ? { summary: content } 
      : JSON.parse(content);
  } catch (error) {
    console.error(`Error analyzing text (${request.type}):`, error);
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
}

// Chat completion for customer service agents
export async function customerServiceChat(
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  customerInfo?: any
): Promise<string> {
  try {
    // Add customer info to system prompt if available
    let messages = [...history];
    
    if (customerInfo && !messages.some(m => m.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: `You are a helpful insurance customer service agent. 
        Current customer information: ${JSON.stringify(customerInfo, null, 2)}`
      });
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in customer service chat:", error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
}

// Function to generate agent components based on specifications
export async function generateAgentComponent(
  type: 'prompt' | 'policy' | 'context',
  name: string,
  description: string,
  inputs?: Record<string, any>
): Promise<string> {
  try {
    let prompt = "";
    
    switch (type) {
      case 'prompt':
        prompt = `
        Create a well-structured prompt for an AI agent with the following specifications:
        - Name: ${name}
        - Description: ${description}
        - Inputs: ${JSON.stringify(inputs || {}, null, 2)}
        
        The prompt should be comprehensive and clearly define the agent's role, constraints, and expected outputs.
        `;
        break;
      case 'policy':
        prompt = `
        Create a policy document for an AI agent with the following specifications:
        - Name: ${name}
        - Description: ${description}
        
        The policy should define:
        1. Ethical guidelines
        2. Operational boundaries
        3. Data handling rules
        4. User interaction protocols
        5. Compliance requirements
        `;
        break;
      case 'context':
        prompt = `
        Create a context document for an AI agent with the following specifications:
        - Name: ${name}
        - Description: ${description}
        
        The context should provide:
        1. Background information
        2. Domain-specific knowledge
        3. Industry terminology and definitions
        4. Relevant examples and precedents
        5. Common scenarios the agent will encounter
        `;
        break;
      default:
        throw new Error(`Unsupported component type: ${type}`);
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating agent component (${type}):`, error);
    throw new Error(`Failed to generate agent component: ${error.message}`);
  }
}

// Export the OpenAI instance for direct access
export { openai };