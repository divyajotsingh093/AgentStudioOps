import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CollaborationUser {
  userId: string;
  username: string;
  color: string;
  cursorPosition?: {
    componentId: number;
    position: number;
  };
}

export interface CollaborationChange {
  id: string;
  type: 'component_update' | 'component_create' | 'component_delete' | 'agent_update';
  data: any;
  userId: string;
  timestamp: Date;
}

export interface UseCollaborationProps {
  agentId: string;
  userName: string;
  userId?: string; // If not provided, will generate one
  onUserJoined?: (user: CollaborationUser) => void;
  onUserLeft?: (userId: string) => void;
  onComponentUpdated?: (change: CollaborationChange) => void;
  onComponentCreated?: (change: CollaborationChange) => void;
  onComponentDeleted?: (componentId: number) => void;
  onCursorUpdated?: (userId: string, position: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for real-time collaboration on agent editing
 */
export function useCollaboration({
  agentId,
  userName,
  userId = uuidv4(),
  onUserJoined,
  onUserLeft,
  onComponentUpdated,
  onComponentCreated,
  onComponentDeleted,
  onCursorUpdated,
  onError
}: UseCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [changes, setChanges] = useState<CollaborationChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    setIsLoading(true);
    
    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      
      // Join collaboration session
      socket.send(JSON.stringify({
        type: 'join_session',
        agentId,
        userId,
        userName
      }));
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message.type);
        
        switch (message.type) {
          case 'session_joined':
            setIsConnected(true);
            setUsers(message.users || []);
            setChanges(message.recentChanges || []);
            setIsLoading(false);
            break;
            
          case 'user_joined':
            if (message.userId !== userId) {
              const newUser: CollaborationUser = {
                userId: message.userId,
                username: message.username,
                color: message.color
              };
              
              setUsers(prev => [...prev, newUser]);
              onUserJoined?.(newUser);
            }
            break;
            
          case 'user_left':
            if (message.userId !== userId) {
              setUsers(prev => prev.filter(user => user.userId !== message.userId));
              onUserLeft?.(message.userId);
            }
            break;
            
          case 'component_updated':
            if (message.userId !== userId) {
              const change = {
                ...message.change,
                timestamp: new Date(message.change.timestamp)
              };
              
              setChanges(prev => [...prev, change]);
              onComponentUpdated?.(change);
            }
            break;
            
          case 'component_created':
            if (message.userId !== userId) {
              const change = {
                ...message.change,
                timestamp: new Date(message.change.timestamp)
              };
              
              setChanges(prev => [...prev, change]);
              onComponentCreated?.(change);
            }
            break;
            
          case 'component_deleted':
            if (message.userId !== userId) {
              const change = {
                ...message.change,
                timestamp: new Date(message.change.timestamp)
              };
              
              setChanges(prev => [...prev, change]);
              onComponentDeleted?.(message.change.data.componentId);
            }
            break;
            
          case 'cursor_updated':
            if (message.userId !== userId) {
              setUsers(prev => 
                prev.map(user => 
                  user.userId === message.userId 
                    ? { ...user, cursorPosition: message.position }
                    : user
                )
              );
              
              onCursorUpdated?.(message.userId, message.position);
            }
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError(err as Error);
        onError?.(err as Error);
      }
    });
    
    // Connection closed
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      setError(new Error('WebSocket connection error'));
      setIsConnected(false);
      onError?.(new Error('WebSocket connection error'));
    });
    
    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        // Send leave message
        socket.send(JSON.stringify({
          type: 'leave_session',
          agentId,
          userId
        }));
        
        socket.close();
      }
    };
  }, [agentId, userId, userName]);
  
  // Methods to send updates to the server
  const updateComponent = useCallback((component: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'component_update',
        component,
        userId
      }));
    }
  }, [userId]);
  
  const createComponent = useCallback((component: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'component_create',
        component,
        userId
      }));
    }
  }, [userId]);
  
  const deleteComponent = useCallback((componentId: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'component_delete',
        componentId,
        userId
      }));
    }
  }, [userId]);
  
  const updateCursorPosition = useCallback((position: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'cursor_update',
        position,
        userId
      }));
    }
  }, [userId]);
  
  return {
    isConnected,
    isLoading,
    error,
    users,
    changes,
    updateComponent,
    createComponent,
    deleteComponent,
    updateCursorPosition
  };
}