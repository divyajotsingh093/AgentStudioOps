import { useEffect, useState } from "react";
import { useParams } from "wouter";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioSidebar from "@/components/studio/StudioSidebar";
import StudioMain from "@/components/studio/StudioMain";
import CollaborationPanel from "@/components/studio/CollaborationPanel";
import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import AgentOverview from "@/components/agents/builder/AgentOverview";
import AgentMetrics from "@/components/agents/builder/AgentMetrics";
import AgentEvalQA from "@/components/agents/builder/AgentEvalQA";
import AgentPolicyInsights from "@/components/agents/builder/AgentPolicyInsights";
import AgentVersionDiff from "@/components/agents/builder/AgentVersionDiff";
import AgentDataLineage from "@/components/agents/builder/AgentDataLineage";
import AgentToolTelemetry from "@/components/agents/builder/AgentToolTelemetry";
import AgentSettings from "@/components/agents/builder/AgentSettings";
import { agents, contextItems, toolItems, promptItems, policyItems, chatMessages, reasoningTraces } from "@/lib/mock-data";
import { Agent, ChatMessage, PromptItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const AgentStudio = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [collaborationPanelOpen, setCollaborationPanelOpen] = useState(false);
  const { toast } = useToast();
  
  // Function to toggle the collaboration panel
  const toggleCollaborationPanel = () => {
    setCollaborationPanelOpen(prev => !prev);
  };
  
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
    
    toast({
      title: "Prompt saved",
      description: `Prompt "${prompt.name}" has been saved successfully.`,
    });
  };
  
  if (!agent) {
    return <div className="p-6">Agent not found</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-gray-800">{agent.name}</span>
          <Badge className="bg-neutrinos-blue/10 text-neutrinos-blue">{agent.type[0]}</Badge>
        </div>
      </AppHeader>
      
      <StudioHeader 
        agentName={agent.name}
        agentType={agent.type[0]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {/* Collaboration Panel */}
      {id && (
        <CollaborationPanel 
          agentId={id}
          userName="Current User"
          isExpanded={collaborationPanelOpen}
          onToggleExpand={toggleCollaborationPanel}
        />
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'Overview' && (
          <div className="flex-1 overflow-y-auto">
            <AgentOverview />
          </div>
        )}
        
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
              agentName={agent.name}
            />
          </>
        )}
        
        {activeTab === 'Metrics' && (
          <div className="flex-1 overflow-y-auto">
            <AgentMetrics />
          </div>
        )}
        
        {activeTab === 'Eval' && (
          <div className="flex-1 overflow-y-auto">
            <AgentEvalQA />
          </div>
        )}
        
        {activeTab === 'Policy' && (
          <div className="flex-1 overflow-y-auto">
            <AgentPolicyInsights />
          </div>
        )}
        
        {activeTab === 'Versions' && (
          <div className="flex-1 overflow-y-auto">
            <AgentVersionDiff />
          </div>
        )}
        
        {activeTab === 'Lineage' && (
          <div className="flex-1 overflow-y-auto">
            <AgentDataLineage />
          </div>
        )}
        
        {activeTab === 'Tools' && (
          <div className="flex-1 overflow-y-auto">
            <AgentToolTelemetry />
          </div>
        )}
        
        {activeTab === 'Settings' && (
          <div className="flex-1 overflow-y-auto">
            <AgentSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentStudio;
