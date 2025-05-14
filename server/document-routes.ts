import express, { Response, Router } from 'express';
import multer from 'multer';
import { Request } from 'express-serve-static-core';
import session from 'express-session';
import { FileTypeResult, fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
// We'll use dynamic import for pdf-parse to avoid initialization issues
import { storage } from './storage';
import { z } from 'zod';
import { documentStatusEnum, documentTypeEnum } from '../shared/schema';
import { extractEntitiesFromDocument, classifyDocument as classifyDocumentAI, summarizeDocument as summarizeDocumentAI } from './openai';

// Extend Request type to include session
interface CustomRequest extends Request {
  session: session.Session & {
    userId?: number | null;
  };
}

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
router.post('/upload', upload.single('file'), async (req: CustomRequest, res: Response) => {
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
router.get('/', async (req: CustomRequest, res: Response) => {
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
router.get('/:id', async (req: CustomRequest, res: Response) => {
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
router.delete('/:id', async (req: CustomRequest, res: Response) => {
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
router.post('/analyze', async (req: CustomRequest, res: Response) => {
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
router.get('/:id/analyses', async (req: CustomRequest, res: Response) => {
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
    try {
      // Dynamically import pdf-parse to avoid initialization issues
      const pdfParse = await import('pdf-parse').then(module => module.default);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return ''; // Return empty string if PDF parsing fails
    }
  }
  
  // Handle text files
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }
  
  // For all other types, use OpenAI to extract text
  if (process.env.OPENAI_API_KEY) {
    try {
      // Convert buffer to base64
      const base64Image = buffer.toString('base64');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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
    } catch (error) {
      console.error('Error using OpenAI to extract text:', error);
      return ''; // Return empty string if OpenAI processing fails
    }
  }
  
  return ''; // Return empty string if no extraction method available
}

import { extractEntitiesFromDocument, classifyDocument as classifyDocumentAI, summarizeDocument as summarizeDocumentAI } from './openai';

async function extractEntities(text: string, documentType: string): Promise<{ entities: any[] }> {
  try {
    const result = await extractEntitiesFromDocument(text, documentType);
    return result;
  } catch (error) {
    console.error('Error in entity extraction:', error);
    return { entities: [] };
  }
}

async function classifyDocument(text: string): Promise<{ classification: any, confidence: number }> {
  try {
    const result = await classifyDocumentAI(text);
    return result;
  } catch (error) {
    console.error('Error in document classification:', error);
    return { 
      classification: { category: 'Unknown', intent: 'Unknown', documentType: 'Unknown' }, 
      confidence: 0 
    };
  }
}

async function summarizeDocument(text: string): Promise<{ summary: string }> {
  try {
    const result = await summarizeDocumentAI(text);
    return result;
  } catch (error) {
    console.error('Error in document summarization:', error);
    return { summary: 'Failed to generate summary due to an error.' };
  }
}

export default router;