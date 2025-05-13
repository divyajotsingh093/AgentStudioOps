import { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { 
  ChevronRight, 
  Send, 
  FileText, 
  Database, 
  Calculator, 
  Mail, 
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Download,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, ReasoningTrace } from "@/lib/types";

interface ActionableOption {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ActionableChatProps {
  messages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
}

const ActionableChat = ({ 
  messages,
  reasoningTraces,
  onSendMessage 
}: ActionableChatProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAction, setSelectedAction] = useState<ActionableOption | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Mock action options for demonstration
  const actionOptions: ActionableOption[] = [
    {
      id: 'query-customer',
      type: 'data-fabric',
      title: 'Query Customer Database',
      description: 'Search for customer information in the data fabric',
      icon: <Database className="h-5 w-5 text-blue-600" />
    },
    {
      id: 'extract-document',
      type: 'tool',
      title: 'Extract Document Information',
      description: 'Use IDP to extract data from uploaded documents',
      icon: <FileText className="h-5 w-5 text-green-600" />
    },
    {
      id: 'calculate-risk',
      type: 'tool',
      title: 'Calculate Risk Score',
      description: 'Run rules engine to calculate risk assessment',
      icon: <Calculator className="h-5 w-5 text-purple-600" />
    },
    {
      id: 'send-email',
      type: 'action',
      title: 'Send Email Notification',
      description: 'Send email to requester or underwriter',
      icon: <Mail className="h-5 w-5 text-orange-600" />
    },
    {
      id: 'search-policy',
      type: 'data-fabric',
      title: 'Search Policy Database',
      description: 'Search for existing policies by criteria',
      icon: <Search className="h-5 w-5 text-red-600" />
    }
  ];
  
  // Scroll to bottom of chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleActionSelect = (action: ActionableOption) => {
    setSelectedAction(action);
    toast({
      title: `${action.title} selected`,
      description: `Ready to use ${action.title.toLowerCase()}`,
    });
  };
  
  const handleActionExecute = () => {
    if (!selectedAction) return;
    
    // Add a user message showing the action being executed
    const actionMessage = `Execute action: ${selectedAction.title}`;
    onSendMessage(actionMessage);
    
    // Reset selected action
    setSelectedAction(null);
    
    toast({
      title: "Action executed",
      description: `${selectedAction.title} has been executed successfully.`,
    });
  };
  
  // Generate a sample action result card based on the message content
  const getActionCard = (message: ChatMessage) => {
    if (message.role !== 'agent' || !message.tool) return null;
    
    if (message.tool === 'Rules Engine') {
      return (
        <Card className="mt-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-medium">Rules Engine Result</h4>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Tool Output</Badge>
            </div>
            <div className="mt-3">
              <div className="text-sm">
                <p className="font-medium">Underwriting Recommendation:</p>
                <p className="mt-1 text-green-700 font-semibold">Standard Plus</p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded">
                  <span className="text-gray-500">Hypertension:</span> Controlled
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="text-gray-500">Medication:</span> Single standard
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="text-gray-500">Build:</span> Within range
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="text-gray-500">Confidence:</span> 87%
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (message.tool === 'Data Fabric Query') {
      return (
        <Card className="mt-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="text-sm font-medium">Data Fabric Results</h4>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Query Result</Badge>
            </div>
            <div className="mt-3">
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow-sm text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Policy ID</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-3 py-2">POL-45678</td>
                      <td className="px-3 py-2">Life - Term</td>
                      <td className="px-3 py-2">
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </td>
                      <td className="px-3 py-2">12/15/2023</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">POL-23456</td>
                      <td className="px-3 py-2">Life - Whole</td>
                      <td className="px-3 py-2">
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      </td>
                      <td className="px-3 py-2">04/30/2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline" className="mr-2">
                  <Plus className="h-3 w-3 mr-1" />
                  Show All
                </Button>
                <Button size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in Data Fabric
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-4 pb-2 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="thoughts">Chain of Thought</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                    {message.role === 'agent' && message.tool && (
                      <div className="mb-1">
                        <Badge className="bg-blue-100 text-blue-700" variant="outline">
                          {message.tool}
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Action card for agent messages with tools */}
                    {message.role === 'agent' && getActionCard(message)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Action Options are now handled by the parent component */}
          
          {/* Selected Action Form */}
          {selectedAction && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {selectedAction.icon}
                  <h3 className="text-sm font-medium text-gray-700 ml-2">{selectedAction.title}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-3">
                <Textarea 
                  placeholder={`Configure ${selectedAction.title.toLowerCase()}...`}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleActionExecute}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Execute Action
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat Input */}
          {!selectedAction && (
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </TabsContent>
        
        <TabsContent value="thoughts" className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {reasoningTraces.map((trace, index) => (
                <div key={index} className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mb-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-800">{trace.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{trace.content}</p>
                  </div>
                  
                  {trace.result && (
                    <div className="mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-800">Result</h3>
                      </div>
                      <div className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono">
                        {trace.result}
                      </div>
                    </div>
                  )}
                  
                  {trace.action && (
                    <div>
                      <div className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-green-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-800">Action: {trace.action.title}</h3>
                      </div>
                      <div className="mt-1 mb-2 text-xs text-gray-600">
                        {trace.action.description}
                      </div>
                      {trace.action.data && (
                        <div className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono">
                          {typeof trace.action.data === 'object' 
                            ? JSON.stringify(trace.action.data, null, 2) 
                            : trace.action.data}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionableChat;