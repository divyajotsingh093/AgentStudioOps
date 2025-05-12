import { Link } from "wouter";
import { ArrowLeft, HelpCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import DeployModal from "./DeployModal";

interface StudioHeaderProps {
  agentName: string;
  agentType: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StudioHeader = ({ 
  agentName, 
  agentType,
  activeTab,
  onTabChange
}: StudioHeaderProps) => {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  
  const tabs = ['Build', 'Test', 'Deploy', 'Versions', 'Governance'];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="mr-3 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Link>
            <h1 className="text-xl font-semibold">{agentName}</h1>
            <Badge className="ml-3 bg-blue-100 text-blue-700" variant="outline">
              {agentType}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </Button>
            <Button onClick={() => setIsDeployModalOpen(true)}>
              Deploy <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`studio-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
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
