import React, { useState } from 'react';
import { 
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Play, 
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ActionableChat from "./ActionableChat";
import AvailableActions from "./AvailableActions";
import PolicyDetails from "./PolicyDetails";
import ActionHistory from "./ActionHistory";
import { ChatMessage, ReasoningTrace } from "@/lib/types";

interface AgentActionChatProps {
  agentName: string;
  messages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
}

// Removed mock data as it's no longer used

const AgentActionChat: React.FC<AgentActionChatProps> = ({
  agentName,
  messages,
  reasoningTraces,
  onSendMessage
}) => {
  const { toast } = useToast();
  
  const handleActionSelect = (actionId: string) => {
    toast({
      title: "Action Selected",
      description: `Selected action: ${actionId}`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-neutrinos-blue mr-2" />
          <div>
            <h2 className="text-md font-medium">{agentName}</h2>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-700 mr-2">Running</Badge>
              <span className="text-xs text-gray-500">Session: 26 min</span>
            </div>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" className="mr-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Main Chat Panel */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="flex flex-col h-full">
            {/* Policy Details - Shown above the chat */}
            <PolicyDetails />

            {/* Available Actions */}
            <AvailableActions onActionSelect={handleActionSelect} />

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <ActionableChat 
                messages={messages} 
                reasoningTraces={reasoningTraces}
                onSendMessage={onSendMessage}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Action History */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <ActionHistory />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AgentActionChat;