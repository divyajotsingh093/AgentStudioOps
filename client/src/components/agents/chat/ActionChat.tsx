import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ChevronRight, ChevronDown, X, Clock, CheckCircle, AlertCircle, AlertTriangle, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Link } from 'wouter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AgentAction, ActionHistoryItem } from '@/lib/mock-actions';

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
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{type: 'user' | 'agent' | 'action', content: string, timestamp: Date}[]>([
    {
      type: 'agent',
      content: `👋 Welcome to the ${agentName} action chat! I can help you with various insurance tasks. Please let me know what you need assistance with, or you can select an action from the sidebar.`,
      timestamp: new Date()
    }
  ]);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({});
  const [showActions, setShowActions] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Uncategorized', 'Policy', 'Underwriting']));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Group actions by category
  const groupedActions = actions.reduce<Record<string, AgentAction[]>>((groups, action) => {
    const category = action.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {});
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const userMessage = {
      type: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, userMessage]);
    
    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        type: 'agent' as const,
        content: `I'll help you with that. Here are some actions I can take related to "${userInput}":`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, agentResponse]);
    }, 1000);
    
    setUserInput('');
  };
  
  const handleActionClick = (action: AgentAction) => {
    setSelectedAction(action);
    setActionInputs({});
    
    // If action has no inputs, execute it immediately
    if (!action.inputFields || action.inputFields.length === 0) {
      executeAction(action, {});
    }
  };
  
  const executeAction = (action: AgentAction, inputs: Record<string, string>) => {
    // Add action message
    const actionMessage = {
      type: 'action' as const,
      content: `Executing action: ${action.name}${
        Object.keys(inputs).length > 0 
          ? ` with inputs: ${Object.entries(inputs)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`
          : ''
      }`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, actionMessage]);
    
    // Simulate action response
    setTimeout(() => {
      const actionResponse = {
        type: 'agent' as const,
        content: `I've completed the "${action.name}" action. Here are the results: ${generateRandomResult(action)}`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, actionResponse]);
    }, 1500);
    
    setSelectedAction(null);
  };
  
  const generateRandomResult = (action: AgentAction) => {
    const results = [
      "The policy verification completed successfully. The policy is active and in good standing.",
      "Customer information retrieved. The customer has been with us for 5 years and has 2 active policies.",
      "Premium calculation completed. The new premium would be $1,249.50 per year, a difference of -$125.30 from the current rate.",
      "Claims history shows 1 claim in the past 3 years, settled for $12,450 on 10/15/2023.",
      "Document retrieval successful. The policy document has been generated and is ready for viewing."
    ];
    
    return results[Math.floor(Math.random() * results.length)];
  };
  
  const handleInputChange = (field: string, value: string) => {
    setActionInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const canExecuteAction = () => {
    if (!selectedAction || !selectedAction.inputFields) return true;
    
    // Check if all required fields have values
    return selectedAction.inputFields.every(field => 
      !field.required || (actionInputs[field.name] && actionInputs[field.name].trim() !== '')
    );
  };
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
      return date;
    }
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/agents/${agentId}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{agentName}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span className={`h-2 w-2 rounded-full mr-2 ${
                agentStatus === 'Running' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {agentStatus}
            </div>
          </div>
        </div>
        
        <div className="flex">
          <Button variant="outline" size="sm" onClick={() => setShowActions(!showActions)}>
            {showActions ? 'Hide Actions' : 'Show Actions'}
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`max-w-3/4 rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-neutrinos-blue text-white' 
                      : message.type === 'action'
                        ? 'bg-purple-100 border border-purple-200'
                        : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {selectedAction ? (
            <div className="border-t p-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{selectedAction.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{selectedAction.description}</p>
              
              {selectedAction.inputFields && selectedAction.inputFields.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {selectedAction.inputFields.map(field => (
                      <div key={field.name}>
                        <label className="text-sm font-medium mb-1 block">
                          {field.name}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          placeholder={`Enter ${field.name}`}
                          value={actionInputs[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => executeAction(selectedAction, actionInputs)} disabled={!canExecuteAction()}>
                      Execute Action
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm text-gray-600 mb-2">This action doesn't require any inputs.</p>
                  <Button onClick={() => executeAction(selectedAction, {})}>Execute Action</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t p-4 bg-white">
              <div className="flex items-center">
                <Input
                  placeholder="Type a message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button className="ml-2" onClick={handleSendMessage} disabled={!userInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions sidebar */}
        {showActions && (
          <div className="w-80 border-l bg-white overflow-hidden flex flex-col">
            <Accordion type="multiple" className="flex-1 overflow-auto">
              <AccordionItem value="available-actions" className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                  <span className="font-medium">Available Actions</span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="divide-y">
                    {Object.entries(groupedActions).map(([category, categoryActions]) => (
                      <div key={category} className="py-1">
                        <div
                          className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(category)}
                        >
                          <span className="text-sm font-medium">{category}</span>
                          {expandedCategories.has(category) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        
                        {expandedCategories.has(category) && (
                          <div className="pl-4">
                            {categoryActions.map((action) => (
                              <div 
                                key={action.id}
                                className="py-2 px-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                onClick={() => handleActionClick(action)}
                              >
                                <div>
                                  <div className="text-sm">{action.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                                </div>
                                {action.status && (
                                  <Badge variant={action.status === 'Ready' ? 'default' : 'outline'} className="text-xs">
                                    {action.status}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="history" className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                  <span className="font-medium">Action History</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 px-4 pb-4">
                    {history.map((item) => (
                      <Card key={item.id} className="shadow-sm">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm">{item.name || item.title}</CardTitle>
                            <div className="text-xs text-gray-500">{formatTime(item.timestamp)}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-sm">
                            {item.result || (item.metadata && JSON.stringify(item.metadata))}
                          </div>
                          {item.status && (
                            <div className="flex items-center mt-2">
                              {item.status === 'success' && <CheckCircle className="text-green-500 h-3 w-3 mr-1" />}
                              {item.status === 'warning' && <AlertCircle className="text-yellow-500 h-3 w-3 mr-1" />}
                              {item.status === 'error' && <AlertTriangle className="text-red-500 h-3 w-3 mr-1" />}
                              {item.status === 'pending' && <RotateCw className="text-blue-500 h-3 w-3 mr-1 animate-spin" />}
                              <span className={`text-xs ${
                                item.status === 'success' ? 'text-green-600' :
                                item.status === 'warning' ? 'text-yellow-600' :
                                item.status === 'error' ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionChat;