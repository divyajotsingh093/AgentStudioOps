import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { FileTypeResult, fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import pdf from 'pdf-parse';
import { storage } from './storage';
import { z } from 'zod';
import { documentStatusEnum, documentTypeEnum } from '../shared/schema';

// Configure multer for in-memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. Document analysis will fail.");
}

const router: Router = express.Router();

// Document validation schemas
const uploadDocumentSchema = z.object({
  name: z.string().min(1),
  type: documentTypeEnum.optional(),
  associatedAgentId: z.string().optional(),
});

const analyzeDocumentSchema = z.object({
  documentId: z.number(),
  analysisType: z.enum(['entity_extraction', 'classification', 'summary']),
});

// Upload document endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate request body
    const body = uploadDocumentSchema.parse(req.body);
    
    // Get file type
    const fileBuffer = req.file.buffer;
    const fileTypeResult = await fileTypeFromBuffer(fileBuffer);
    const mimeType = fileTypeResult?.mime || req.file.mimetype;
    
    // Ensure it's a permitted file type
    if (!isPermittedFileType(mimeType)) {
      return res.status(400).json({ 
        error: 'Unsupported file type. Only PDF, DOC, DOCX, TXT, and image files are supported.' 
      });
    }
    
    // Extract text content if possible
    let textContent = '';
    try {
      textContent = await extractTextFromFile(fileBuffer, mimeType);
    } catch (extractionError) {
      console.error('Error extracting text:', extractionError);
      // Continue without text content
    }
    
    // Create document record
    const document = await storage.createDocument({
      name: body.name,
      type: body.type || 'Other',
      mimeType,
      size: req.file.size,
      content: textContent,
      uploadedBy: req.session.userId || null,
      associatedAgentId: body.associatedAgentId || null,
      status: 'Pending',
    });
    
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ 
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const documents = await storage.getDocuments(agentId);
    return res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const document = await storage.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    return res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const success = await storage.deleteDocument(id);
    if (!success) {
      return res.status(404).json({ error: 'Document not found or could not be deleted' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Analyze document
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { documentId, analysisType } = analyzeDocumentSchema.parse(req.body);
    
    // Get the document
    const document = await storage.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if we have content to analyze
    if (!document.content) {
      return res.status(400).json({ error: 'Document has no content to analyze' });
    }
    
    // Update document status
    await storage.updateDocument(documentId, { status: 'Analyzing' });
    
    // Create analysis record
    const analysis = await storage.createDocumentAnalysis({
      documentId,
      analysisType,
      status: 'Processing',
      entities: [],
      classification: {},
      confidence: null,
      summary: null,
    });
    
    // Process the document based on analysis type
    let result;
    switch (analysisType) {
      case 'entity_extraction':
        result = await extractEntities(document.content, document.type);
        break;
      case 'classification':
        result = await classifyDocument(document.content);
        break;
      case 'summary':
        result = await summarizeDocument(document.content);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported analysis type' });
    }
    
    // Update analysis with results
    const updatedAnalysis = await storage.updateDocumentAnalysis(analysis.id, {
      ...result,
      status: 'Completed',
    });
    
    // Update document status
    await storage.updateDocument(documentId, { status: 'Processed' });
    
    return res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error analyzing document:', error);
    
    // Update document status if possible
    try {
      if (req.body.documentId) {
        await storage.updateDocument(req.body.documentId, { status: 'Failed' });
      }
    } catch (updateError) {
      console.error('Error updating document status:', updateError);
    }
    
    return res.status(500).json({ 
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get document analyses
router.get('/:id/analyses', async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const analyses = await storage.getDocumentAnalyses(documentId);
    return res.json(analyses);
  } catch (error) {
    console.error('Error fetching document analyses:', error);
    return res.status(500).json({ error: 'Failed to fetch document analyses' });
  }
});

// Helper functions
function isPermittedFileType(mimeType: string): boolean {
  const permittedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ];
  
  return permittedTypes.includes(mimeType);
}

async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  // Handle PDFs
  if (mimeType === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  }
  
  // Handle text files
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }
  
  // For all other types, use OpenAI to extract text
  if (process.env.OPENAI_API_KEY) {
    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all the text content from this document/image. Return just the text without any additional comments."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 4000,
    });
    
    return response.choices[0].message.content || '';
  }
  
  return ''; // Return empty string if no extraction method available
}

async function extractEntities(text: string, documentType: string): Promise<{ entities: any[] }> {
  const systemPrompt = `Extract key entities from this ${documentType} document. Focus on specific information like:
  - Policy numbers
  - Claim numbers
  - Names of individuals
  - Dates
  - Monetary amounts
  - Addresses
  - Contact information
  - Vehicle information (if applicable)
  - Property details (if applicable)
  
  Return the data as a JSON array where each entity has a "type", "value", and "confidence" (a number between 0-1) property.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });
  
  const content = response.choices[0].message.content;
  try {
    const parsedContent = JSON.parse(content || '{}');
    return { entities: parsedContent.entities || [] };
  } catch (error) {
    console.error('Error parsing entity extraction response:', error);
    return { entities: [] };
  }
}

async function classifyDocument(text: string): Promise<{ classification: any, confidence: number }> {
  const systemPrompt = `Classify this insurance document into one of the following categories:
  - Policy
  - Claim
  - Medical Report
  - Invoice
  - Legal Document
  - Correspondence
  - Other
  
  Also determine the intent of the document (e.g., new application, renewal, claim submission, information request).
  
  Return the result as a JSON object with "category", "intent", and "confidence" (a number between 0-1) properties.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });
  
  const content = response.choices[0].message.content;
  try {
    const parsedContent = JSON.parse(content || '{}');
    const confidence = typeof parsedContent.confidence === 'number' ? 
      Math.floor(parsedContent.confidence * 100) : 0;
    
    delete parsedContent.confidence;
    return { 
      classification: parsedContent, 
      confidence
    };
  } catch (error) {
    console.error('Error parsing classification response:', error);
    return { 
      classification: { category: 'Unknown', intent: 'Unknown' }, 
      confidence: 0 
    };
  }
}

async function summarizeDocument(text: string): Promise<{ summary: string }> {
  const systemPrompt = `Provide a concise summary of this insurance document, highlighting:
  - Key information
  - Important dates
  - Key actions or next steps
  - Critical financial information
  
  Keep the summary under 300 words and focus on the most important information an insurance agent would need.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });
  
  return { summary: response.choices[0].message.content || '' };
}

export default router;