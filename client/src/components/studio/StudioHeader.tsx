import { Link } from "wouter";
import { 
  ArrowLeft, 
  HelpCircle, 
  Upload, 
  LayoutDashboard, 
  BarChart2, 
  ClipboardCheck, 
  ShieldCheck, 
  GitCompare, 
  Network, 
  Wrench, 
  Settings,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import DeployModal from "./DeployModal";

interface StudioHeaderProps {
  agentName: string;
  agentType: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleCollaboration?: () => void;
}

const StudioHeader = ({ 
  agentName, 
  agentType,
  activeTab,
  onTabChange,
  onToggleCollaboration
}: StudioHeaderProps) => {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  
  const tabs = [
    { id: 'Overview', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { id: 'Build', icon: <Wrench className="h-4 w-4 mr-2" /> },
    { id: 'Metrics', icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { id: 'Eval', icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
    { id: 'Policy', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
    { id: 'Versions', icon: <GitCompare className="h-4 w-4 mr-2" /> },
    { id: 'Lineage', icon: <Network className="h-4 w-4 mr-2" /> },
    { id: 'Tools', icon: <Wrench className="h-4 w-4 mr-2" /> },
    { id: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> }
  ];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-3 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">{agentName}</h1>
            <Badge className="ml-3 bg-neutrinos-blue/10 text-neutrinos-blue" variant="outline">
              {agentType}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href={`/agents/chat/${agentName.replace(/\s+/g, '-').toLowerCase()}`} target="_blank">
              <Button variant="secondary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Actions Chat
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={onToggleCollaboration}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4 mr-1" /> Collaborate
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </Button>
            <Button onClick={() => setIsDeployModalOpen(true)}>
              Deploy <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`studio-tab ${activeTab === tab.id ? 'active' : ''} whitespace-nowrap flex items-center`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              {tab.id}
            </button>
          ))}
        </div>
      </div>
      
      <DeployModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
      />
    </div>
  );
};

export default StudioHeader;
