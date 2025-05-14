import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Loader2, Send, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ChatInterfaceProps {
  agentId: string;
  sessionId?: string;
  agentName?: string;
  agentAvatar?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  agentId, 
  sessionId: initialSessionId, 
  agentName = 'AI Assistant',
  agentAvatar
}) => {
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Query to fetch existing messages if we have a session
  const { data: chatSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId],
    queryFn: async () => {
      const response = await apiRequest(`/api/chat/sessions/${sessionId}`);
      return response;
    },
    enabled: !!sessionId,
  });
  
  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { agentId: string; message: string; sessionId?: string }) => {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // If this is the first message, we'll get a session ID back
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      // Clear the input field
      setMessage('');
      
      // Invalidate the chat session query to refresh the messages
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions', sessionId || data.sessionId] });
      
      // Check for escalation
      if (data.message?.metadata?.needsHumanEscalation) {
        toast({
          title: 'Request escalated',
          description: 'This query requires human assistance. It has been escalated to a human agent.',
          variant: 'default',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession]);
  
  // Handle message submission
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      agentId,
      message,
      sessionId,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  // Render messages
  const renderMessages = () => {
    if (!chatSession || !Array.isArray(chatSession.messages) || chatSession.messages.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <p>No messages yet. Start the conversation by sending a message.</p>
        </div>
      );
    }
    
    return chatSession.messages.map((msg: ChatMessage) => (
      <div 
        key={msg.id} 
        className={`flex gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {msg.role !== 'user' && (
          <Avatar className="h-8 w-8">
            {agentAvatar ? (
              <AvatarImage src={agentAvatar} alt={agentName} />
            ) : (
              <AvatarFallback>{agentName.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
        )}
        
        <div className={`max-w-[80%] rounded-lg p-3 ${
          msg.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <div className="whitespace-pre-wrap">{msg.content}</div>
          
          {/* Sentiment badge if available */}
          {msg.metadata?.sentimentAnalysis && (
            <div className="mt-2">
              <Badge variant={
                msg.metadata.sentimentAnalysis.score <= 2 ? 'destructive' : 
                msg.metadata.sentimentAnalysis.score >= 4 ? 'outline' : 
                'secondary'
              }>
                {msg.metadata.sentimentAnalysis.sentiment}
              </Badge>
            </div>
          )}
        </div>
        
        {msg.role === 'user' && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        )}
      </div>
    ));
  };
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          {agentAvatar && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={agentAvatar} alt={agentName} />
              <AvatarFallback>{agentName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <span>{agentName}</span>
        </CardTitle>
        {sessionId && (
          <div className="text-xs text-muted-foreground">Session: {sessionId}</div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-grow overflow-y-auto p-4">
        {isLoadingSession ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {renderMessages()}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={!message || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;