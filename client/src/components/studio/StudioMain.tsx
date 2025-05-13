import { useState } from "react";
import { ChatMessage, ReasoningTrace, PromptItem } from "@/lib/types";
import ChatTest from "./ChatTest";
import EnhancedChatTest from "./EnhancedChatTest";
import FlowView from "./FlowView";
import PromptEditor from "./PromptEditor";
import AgentActionChat from "../agents/chat/AgentActionChat";

interface StudioMainProps {
  chatMessages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
  selectedPrompt: PromptItem | null;
  onSavePrompt: (prompt: PromptItem) => void;
  onClosePromptEditor: () => void;
  agentName?: string;
}

const StudioMain = ({
  chatMessages,
  reasoningTraces,
  onSendMessage,
  selectedPrompt,
  onSavePrompt,
  onClosePromptEditor,
  agentName = "Accelerated UW Agent"
}: StudioMainProps) => {
  const [activeView, setActiveView] = useState<'chat' | 'enhanced' | 'flow' | 'actions'>('enhanced');
  
  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Canvas Mode Selector */}
      <div className="bg-white border-b border-gray-200 p-2 flex">
        <button 
          className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${
            activeView === 'enhanced' 
              ? 'bg-neutrinos-blue text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveView('enhanced')}
        >
          Enhanced Chat
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${
            activeView === 'actions' 
              ? 'bg-neutrinos-blue text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveView('actions')}
        >
          Agent Actions
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${
            activeView === 'chat' 
              ? 'bg-neutrinos-blue text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveView('chat')}
        >
          Chat Test
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            activeView === 'flow' 
              ? 'bg-neutrinos-blue text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveView('flow')}
        >
          Flow View
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'actions' ? (
          <AgentActionChat
            agentName={agentName}
            messages={chatMessages}
            reasoningTraces={reasoningTraces}
            onSendMessage={onSendMessage}
          />
        ) : activeView === 'chat' ? (
          <ChatTest 
            messages={chatMessages}
            reasoningTraces={reasoningTraces}
            onSendMessage={onSendMessage}
          />
        ) : (
          <FlowView />
        )}
        
        {/* Right Panel - Prompt Editor */}
        {selectedPrompt && (
          <PromptEditor
            prompt={selectedPrompt}
            onSave={onSavePrompt}
            onCancel={onClosePromptEditor}
          />
        )}
      </div>
    </div>
  );
};

export default StudioMain;
