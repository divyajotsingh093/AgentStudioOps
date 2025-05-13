import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Database, Send, PlusCircle, Filter, Search, ArrowRight } from 'lucide-react';
import { AgentAction, ActionHistoryItem } from '@/lib/mock-actions';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { useResponsive } from '@/hooks/use-responsive';

interface ActionChatProps {
  agentId: string;
  agentName: string;
  agentStatus: string;
  actions?: AgentAction[];
  history?: ActionHistoryItem[];
}

const ActionChat: React.FC<ActionChatProps> = ({ 
  agentId, 
  agentName, 
  agentStatus, 
  actions = [], 
  history = [] 
}) => {
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<{type: 'user' | 'agent' | 'action', content: string, timestamp: Date}[]>([]);
  const [filteredActions, setFilteredActions] = useState(actions);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();
  
  // Filter actions when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredActions(actions);
      return;
    }
    
    const filtered = actions.filter(action => 
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredActions(filtered);
  }, [searchTerm, actions]);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // Add user message
    setChatMessages(prev => [
      ...prev, 
      {
        type: 'user',
        content: messageText,
        timestamp: new Date()
      }
    ]);
    
    // Clear input
    setMessageText('');
    
    // Simulate agent response (in real app, this would be an API call)
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'agent',
          content: `I'll help you with that. Would you like me to run the "Customer Query" action to find more information?`,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };
  
  const handleActionClick = (action: AgentAction) => {
    setChatMessages(prev => [
      ...prev,
      {
        type: 'action',
        content: `Executing action: ${action.name}`,
        timestamp: new Date()
      }
    ]);
    
    // Simulate action result (in real app, this would be an API call)
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'agent',
          content: `I've completed the "${action.name}" action. Found policy POL-23456 for a Whole Life insurance product. The policy is currently active and up to date on payments.`,
          timestamp: new Date()
        }
      ]);
    }, 1500);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-3 border-b bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-neutrinos-blue/15 flex items-center justify-center">
            <div className="text-neutrinos-blue text-sm font-medium">AI</div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{agentName}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={agentStatus === 'Running' ? 'default' : 'outline'} className={agentStatus === 'Running' ? 'bg-green-600' : ''}>
                {agentStatus}
              </Badge>
              <span className="text-xs text-gray-500">Session: 26 min</span>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-3 mb-0 flex-shrink-0">
          <TabsTrigger value="chat">Action Chat</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Chat</TabsTrigger>
          <TabsTrigger value="test">Chat Test</TabsTrigger>
          <TabsTrigger value="flow">Flow View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 border-0 data-[state=active]:flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 flex-1 overflow-hidden">
            {/* Left panel - available actions */}
            <div className="border-r hidden md:flex flex-col bg-gray-50">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Available Actions</h3>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search actions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {filteredActions.map((action) => (
                    <Card 
                      key={action.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleActionClick(action)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{action.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{action.description}</div>
                          </div>
                          <Badge variant={action.status === 'Ready' ? 'outline' : 'secondary'}>
                            {action.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right panel - chat */}
            <div className="md:col-span-2 flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto p-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                    <h3 className="font-medium mb-2">Start a conversation</h3>
                    <p className="max-w-md">
                      Ask a question or click an action to begin interacting with the agent.
                    </p>
                  </div>
                )}
                
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 max-w-3xl ${msg.type === 'user' ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`rounded-lg p-3 ${
                          msg.type === 'user' 
                            ? 'bg-neutrinos-blue text-white' 
                            : msg.type === 'action' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Action history panels - shown on larger screens */}
              <div className="border-t p-3 bg-gray-50 hidden md:block">
                <h3 className="font-semibold mb-2">Action History</h3>
                <div className="space-y-2">
                  {history.slice(0, 2).map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.timestamp}</div>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open in Data Fabric</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {item.result && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Result:</span> {item.result}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Message input */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {/* Mobile action button */}
                <div className="mt-2 md:hidden">
                  <Button variant="outline" className="w-full" onClick={() => {
                    alert('This would open the actions panel on mobile');
                  }}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Choose Action
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="enhanced" className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold mb-2">Enhanced Chat Coming Soon</h3>
            <p className="text-gray-500 max-w-md">
              This view will provide advanced AI features with full context awareness
              and collaborative capabilities.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="test" className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold mb-2">Chat Test Environment</h3>
            <p className="text-gray-500 max-w-md">
              This area will provide tools for testing and debugging agent conversations.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="flow" className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold mb-2">Conversation Flow Visualization</h3>
            <p className="text-gray-500 max-w-md">
              This view will show the conversation as a visual flow, helping you understand
              how the agent makes decisions.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionChat;