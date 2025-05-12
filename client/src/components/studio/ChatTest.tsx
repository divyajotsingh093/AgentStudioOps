import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage as ChatMessageType, ReasoningTrace } from "@/lib/types";
import ChatMessageComponent from "./ChatMessage";

interface ChatTestProps {
  messages: ChatMessageType[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
}

const ChatTest = ({ messages, reasoningTraces, onSendMessage }: ChatTestProps) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
            />
          ))}
        </div>
        
        {/* Chat Input Area */}
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded-xl p-2 bg-white">
          <div className="flex items-center">
            <Button type="button" variant="ghost" size="icon" className="text-gray-500">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" variant="ghost" size="icon" className="text-primary">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
      
      {/* Reasoning Trace */}
      <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto p-4">
        <h3 className="font-medium mb-3">Reasoning Trace</h3>
        <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {reasoningTraces.map((trace, index) => (
            <div key={index} className="mb-4">
              {JSON.stringify(trace, null, 2)}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default ChatTest;
