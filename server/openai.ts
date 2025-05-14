import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user.
const DEFAULT_MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. OpenAI API calls will fail.");
}

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

/**
 * Generate text using OpenAI's chat completion
 */
export async function generateText(request: PromptRequest): Promise<{
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}> {
  try {
    const { systemPrompt, userPrompt, model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 1000 } = request;
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
    });
    
    return {
      text: response.choices[0].message.content || "",
      model: response.model,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Analyze insurance policy data for risk assessment
 */
export async function analyzeRisk(policyData: any): Promise<{
  riskScore: number;
  recommendations: string[];
  explanation: string;
  factors: Record<string, number>;
}> {
  try {
    const prompt = `
      Analyze the following insurance policy data for risk assessment.
      Provide a risk score from 1-10 (where 10 is highest risk), specific recommendations, 
      a detailed explanation of your assessment, and a breakdown of risk factors with their weights.
      
      Insurance Policy Data:
      ${JSON.stringify(policyData, null, 2)}
      
      Respond in this JSON format only:
      {
        "riskScore": number,
        "recommendations": string[],
        "explanation": string,
        "factors": {
          "factorName1": number,
          "factorName2": number,
          ...
        }
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing risk:", error);
    throw new Error(`Failed to analyze risk: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Analyze insurance claim data for fraud detection and validation
 */
export async function analyzeClaim(claimData: any): Promise<{
  fraudRisk: string;
  validationIssues: string[];
  processingRecommendation: string;
  confidenceScore: number;
  explanation: string;
}> {
  try {
    const prompt = `
      Analyze the following insurance claim data for fraud detection and validation.
      Assess fraud risk (low, medium, high), identify any validation issues, 
      recommend next steps for processing, provide a confidence score (0-1), 
      and explain your analysis.
      
      Claim Data:
      ${JSON.stringify(claimData, null, 2)}
      
      Respond in this JSON format only:
      {
        "fraudRisk": string,
        "validationIssues": string[],
        "processingRecommendation": string,
        "confidenceScore": number,
        "explanation": string
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing claim:", error);
    throw new Error(`Failed to analyze claim: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Analyze text for sentiment, summary, classification, or data extraction
 */
export async function analyzeText(request: AnalysisRequest): Promise<any> {
  try {
    const { text, type, options = {} } = request;
    
    let prompt: string;
    
    switch (type) {
      case 'sentiment':
        prompt = `
          Analyze the sentiment of the following text. Provide a rating from 1-5 (where 1 is very negative and 5 is very positive),
          a confidence score between 0-1, and a brief explanation of your analysis.
          
          Text: "${text}"
          
          Respond in this JSON format only:
          {
            "sentiment": number,
            "confidence": number,
            "explanation": string
          }
        `;
        break;
      
      case 'summary':
        const maxLength = options.maxLength || 200;
        prompt = `
          Summarize the following text in a concise way, with a maximum length of ${maxLength} characters.
          
          Text: "${text}"
          
          Respond in this JSON format only:
          {
            "summary": string
          }
        `;
        break;
        
      case 'classification':
        const categories = options.categories || ['General', 'Inquiry', 'Complaint', 'Feedback'];
        prompt = `
          Classify the following text into one of these categories: ${categories.join(', ')}.
          Also provide a confidence score between 0-1 for your classification.
          
          Text: "${text}"
          
          Respond in this JSON format only:
          {
            "category": string,
            "confidence": number,
            "explanation": string
          }
        `;
        break;
        
      case 'extraction':
        const entities = options.entities || ['Date', 'Amount', 'PolicyNumber', 'ClaimNumber', 'Name', 'Email', 'Phone'];
        prompt = `
          Extract the following entities from the text if they exist: ${entities.join(', ')}.
          
          Text: "${text}"
          
          Respond in this JSON format only:
          {
            "entities": {
              "entityName1": "extractedValue1",
              "entityName2": "extractedValue2",
              ...
            }
          }
        `;
        break;
        
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw new Error(`Failed to analyze text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Chat with a customer service AI assistant
 */
export async function customerServiceChat(
  message: string,
  conversationHistory: ChatCompletionMessageParam[] = [],
  customerInfo: Record<string, any> = {}
): Promise<{
  response: string;
  sentimentAnalysis?: { sentiment: string; score: number };
  suggestedActions?: string[];
  needsHumanEscalation: boolean;
}> {
  try {
    const systemPrompt = `
      You are an AI assistant for an insurance company.
      Be helpful, professional, and concise in your responses.
      Customer information: ${JSON.stringify(customerInfo)}
      
      If the query requires human intervention, indicate this in your response.
      
      Analyze the sentiment of the customer message, and suggest appropriate follow-up actions.
    `;
    
    // Prepare conversation history in the format OpenAI expects
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    // If the model didn't return the expected format, attempt to parse the response
    if (!result.response) {
      return {
        response: content,
        needsHumanEscalation: content.toLowerCase().includes("human") || content.toLowerCase().includes("escalat")
      };
    }
    
    return result;
  } catch (error) {
    console.error("Error in customer chat:", error);
    throw new Error(`Failed in customer chat: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate an agent component based on a description
 */
export async function generateAgentComponent(
  componentType: string,
  description: string,
  agent: any,
  context: Record<string, any> = {}
): Promise<{
  name: string;
  configuration: Record<string, any>;
  code: string;
}> {
  try {
    const prompt = `
      Generate a ${componentType} component for an AI agent with the following details:
      
      Agent: ${JSON.stringify(agent, null, 2)}
      Description: ${description}
      Additional Context: ${JSON.stringify(context, null, 2)}
      
      Create a suitable component that aligns with the agent's purpose and capabilities.
      Provide a name, configuration settings, and any necessary code.
      
      Respond in this JSON format only:
      {
        "name": string,
        "configuration": object,
        "code": string
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating component:", error);
    throw new Error(`Failed to generate component: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}