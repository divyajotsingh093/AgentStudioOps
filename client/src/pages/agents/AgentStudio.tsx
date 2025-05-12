import { useEffect, useState } from "react";
import { useParams } from "wouter";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioSidebar from "@/components/studio/StudioSidebar";
import StudioMain from "@/components/studio/StudioMain";
import { agents, contextItems, toolItems, promptItems, policyItems, chatMessages, reasoningTraces } from "@/lib/mock-data";
import { Agent, ChatMessage, PromptItem } from "@/lib/types";

const AgentStudio = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState('Build');
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  
  useEffect(() => {
    // Find agent by ID
    const foundAgent = agents.find(agent => agent.id === id);
    if (foundAgent) {
      setAgent(foundAgent);
    }
  }, [id]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${messages.length + 1}`,
      role: 'user',
      content: message
    };
    
    setMessages([...messages, userMessage]);
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: `msg-${messages.length + 2}`,
        role: 'agent',
        content: `I've processed your request: "${message}". How else can I assist you?`
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };
  
  const handleEditItem = (type: string, id: string) => {
    if (type === 'prompt') {
      const prompt = promptItems.find(item => item.id === id);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    }
  };
  
  const handleAddItem = (type: string) => {
    if (type === 'prompt') {
      const newPrompt: PromptItem = {
        id: `prompt-${promptItems.length + 1}`,
        name: 'New Prompt',
        content: ''
      };
      setSelectedPrompt(newPrompt);
    }
  };
  
  const handleSavePrompt = (prompt: PromptItem) => {
    // Update or add prompt in a real app
    console.log('Saving prompt:', prompt);
    setSelectedPrompt(null);
  };
  
  if (!agent) {
    return <div className="p-6">Agent not found</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      <StudioHeader 
        agentName={agent.name}
        agentType={agent.type[0]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'Build' && (
          <>
            <StudioSidebar 
              contextItems={contextItems}
              toolItems={toolItems}
              promptItems={promptItems}
              policyItems={policyItems}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <StudioMain 
              chatMessages={messages}
              reasoningTraces={reasoningTraces}
              onSendMessage={handleSendMessage}
              selectedPrompt={selectedPrompt}
              onSavePrompt={handleSavePrompt}
              onClosePromptEditor={() => setSelectedPrompt(null)}
            />
          </>
        )}
        
        {activeTab === 'Test' && (
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium">Test Tab Content</h2>
            <p className="mt-2 text-gray-600">This is where more comprehensive testing features would go.</p>
          </div>
        )}
        
        {activeTab === 'Deploy' && (
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium">Deploy Tab Content</h2>
            <p className="mt-2 text-gray-600">This is where deployment configuration would go.</p>
          </div>
        )}
        
        {activeTab === 'Versions' && (
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium">Versions Tab Content</h2>
            <p className="mt-2 text-gray-600">This is where version history would go.</p>
          </div>
        )}
        
        {activeTab === 'Governance' && (
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium">Governance Tab Content</h2>
            <p className="mt-2 text-gray-600">This is where governance settings would go.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentStudio;
