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
import ReasoningFlow from "./ReasoningFlow";
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
        {/* Left Panel: Chat and Actions */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={30}>
              <div className="flex h-full">
                <div className="w-1/2 border-r">
                  <AvailableActions onActionSelect={handleActionSelect} />
                </div>
                <div className="w-1/2">
                  <ActionHistory />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={70}>
              <ActionableChat 
                messages={messages} 
                reasoningTraces={reasoningTraces}
                onSendMessage={onSendMessage}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Reasoning Flow */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <ReasoningFlow
            messages={messages}
            reasoningTraces={reasoningTraces}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AgentActionChat;