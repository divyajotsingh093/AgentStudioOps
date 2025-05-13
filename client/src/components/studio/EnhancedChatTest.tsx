import { useState, useRef, useEffect } from "react";
import { 
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  FileUp 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ReasoningTrace } from "@/lib/types";
import ReasoningFlow from "../agents/chat/ReasoningFlow";

interface EnhancedChatTestProps {
  messages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
}

const EnhancedChatTest = ({
  messages,
  reasoningTraces,
  onSendMessage
}: EnhancedChatTestProps) => {
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "thoughts">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
  
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full h-full"
    >
      {/* Chat Panel */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-neutrinos-blue mr-2" />
              <h3 className="font-medium">Chat Interface</h3>
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-neutrinos-blue text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'agent' && message.tool && (
                      <Badge className="mb-1 bg-neutrinos-blue/10 text-neutrinos-blue" variant="outline">
                        {message.tool}
                      </Badge>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
              >
                <FileUp className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Reasoning Panel */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-neutrinos-blue mr-2" />
              <h3 className="font-medium">Chain of Thought</h3>
            </div>
            <Badge variant="outline">
              {reasoningTraces.length} steps
            </Badge>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <ReasoningFlow traces={reasoningTraces} />
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EnhancedChatTest;