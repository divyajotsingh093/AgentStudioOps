import express, { Response, Router } from 'express';
import { Request } from 'express-serve-static-core';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { storage } from './storage';
import { customerServiceChat, generateText } from './openai';
import WebSocket from 'ws';

// Extend Request type to include session
interface CustomRequest extends Request {
  session: session.Session & {
    userId?: number | null;
  };
}

const router: Router = express.Router();

// Validation schemas
const sendMessageSchema = z.object({
  agentId: z.string(),
  message: z.string().min(1),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Interfaces for chat
interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ChatSession {
  id: string;
  agentId: string;
  userId: number | null;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'deleted';
}

// In-memory store for chat sessions - will be replaced with database in production
const chatSessions = new Map<string, ChatSession>();

// Active WebSocket connections for real-time chat
const chatConnections = new Map<string, WebSocket[]>();

// Send a message to an agent
router.post('/send', async (req: CustomRequest, res: Response) => {
  try {
    const { agentId, message, sessionId, metadata } = sendMessageSchema.parse(req.body);
    
    // Get the agent to validate it exists
    const agent = await storage.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Get or create a chat session
    let session: ChatSession;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId)!;
      
      // Update session
      session.updatedAt = new Date();
    } else {
      // Create a new session
      const newSessionId = uuidv4();
      session = {
        id: newSessionId,
        agentId,
        userId: req.session.userId || null,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };
      chatSessions.set(newSessionId, session);
    }
    
    // Add user message to session
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata,
    };
    session.messages.push(userMessage);
    
    // Process the message with the appropriate agent type
    let response: { text: string; metadata?: Record<string, any> };
    
    switch (agent.type) {
      case 'CustomerService':
        response = await customerServiceChat({
          conversation: session.messages.map(msg => ({
            role: msg.role === 'agent' ? 'assistant' : msg.role,
            content: msg.content,
          })),
          options: {
            companyName: 'Neutrinos Insurance',
            agentName: agent.name,
            knowledgeBase: agent.knowledge || [],
          }
        });
        break;
      
      default:
        // Default handling using generic text generation
        const systemPrompt = `You are ${agent.name}, an AI assistant specializing in ${agent.description}. 
          You provide helpful, accurate, and concise responses.`;
        
        const previousMessages = session.messages
          .slice(-10) // Get last 10 messages for context
          .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join('\n');
        
        const userPrompt = `Previous conversation:\n${previousMessages}\n\nUser's latest message: ${message}\n\nRespond as ${agent.name}:`;
        
        const result = await generateText({
          systemPrompt,
          userPrompt,
          temperature: 0.7,
        });
        
        response = { text: result.text };
    }
    
    // Add agent response to session
    const agentMessage: ChatMessage = {
      id: uuidv4(),
      role: 'agent',
      content: response.text,
      timestamp: new Date(),
      metadata: response.metadata,
    };
    session.messages.push(agentMessage);
    
    // Broadcast message to all connected WebSocket clients for this session
    broadcastMessage(session.id, agentMessage);
    
    return res.json({
      success: true,
      sessionId: session.id,
      message: agentMessage,
    });
  } catch (error) {
    console.error('Error in chat processing:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get chat sessions for a user
router.get('/sessions', async (req: CustomRequest, res: Response) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Filter sessions by user ID and optionally by agent ID
    const userSessions = [...chatSessions.values()].filter(session => 
      session.userId === userId && 
      (agentId ? session.agentId === agentId : true) &&
      session.status !== 'deleted'
    );
    
    // Sort by most recent first
    userSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return res.json(userSessions.map(session => ({
      id: session.id,
      agentId: session.agentId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
      messageCount: session.messages.length,
      lastMessage: session.messages.length > 0 ? session.messages[session.messages.length - 1] : null,
    })));
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get messages for a specific chat session
router.get('/sessions/:sessionId', async (req: CustomRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Verify the user has access to this session
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to this chat session' });
    }
    
    return res.json({
      id: session.id,
      agentId: session.agentId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
      messages: session.messages,
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Helper function to broadcast a message to all connected WebSocket clients for a session
function broadcastMessage(sessionId: string, message: ChatMessage) {
  const connections = chatConnections.get(sessionId) || [];
  
  // Filter to only active connections
  const activeConnections = connections.filter(
    ws => ws.readyState === WebSocket.OPEN
  );
  
  // Update the connections list
  chatConnections.set(sessionId, activeConnections);
  
  // Broadcast the message
  for (const ws of activeConnections) {
    ws.send(JSON.stringify({
      type: 'new_message',
      sessionId,
      message,
    }));
  }
}

export default router;

// Export for WebSocket handling in routes.ts
export function registerChatWebSocketHandler(wss: WebSocket.Server) {
  wss.on('connection', (ws) => {
    let currentSessionId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_chat_session' && data.sessionId) {
          // Store the session this connection is interested in
          currentSessionId = data.sessionId;
          
          // Add to connections map
          if (!chatConnections.has(currentSessionId)) {
            chatConnections.set(currentSessionId, []);
          }
          chatConnections.get(currentSessionId)!.push(ws);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'chat_session_joined',
            sessionId: currentSessionId,
          }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      if (currentSessionId) {
        // Remove from connections list when disconnected
        const connections = chatConnections.get(currentSessionId) || [];
        const updatedConnections = connections.filter(conn => conn !== ws);
        
        if (updatedConnections.length > 0) {
          chatConnections.set(currentSessionId, updatedConnections);
        } else {
          chatConnections.delete(currentSessionId);
        }
      }
    });
  });
}