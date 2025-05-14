import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChatInterface from '@/components/chat/ChatInterface';
import { Loader2 } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  
  // Fetch all agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const response = await apiRequest('/api/agents');
      return response || [];
    },
  });
  
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Chat</h1>
          <p className="text-muted-foreground mt-2">
            Chat with AI agents to get assistance with insurance-related queries, claims, and policy information.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Select an Agent</CardTitle>
            <CardDescription>
              Choose an AI agent to chat with based on your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(agents) && agents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {Array.isArray(agent.type) ? agent.type[0] : agent.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedAgentId && (
          <div className="mt-6">
            <ChatInterface 
              agentId={selectedAgentId} 
              agentName={Array.isArray(agents) ? 
                (agents.find((a: any) => a.id === selectedAgentId)?.name || 'AI Assistant') : 
                'AI Assistant'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;