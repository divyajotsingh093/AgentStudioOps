import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Plus } from 'lucide-react';
import AgentComponentManager, { AgentComponent, ComponentCategory } from '../components/AgentComponentManager';
import ComponentEditor from '../components/ComponentEditor';
import AgentActionsView from '../chat/AgentActionsView';
import { AgentAction, ActionHistoryItem } from '@/lib/mock-actions';

// Initial mock data for components
const initialComponents: AgentComponent[] = [
  {
    id: 'comp-1',
    name: 'Customer Profile',
    category: 'Context',
    description: 'Customer information and profile data',
    status: 'Available',
    details: {
      'Source': 'CRM System',
      'Fields': 'Name, Contact, Policy IDs'
    }
  },
  {
    id: 'comp-2',
    name: 'Policy Details',
    category: 'Context',
    description: 'Insurance policy information',
    status: 'Available',
    details: {
      'Source': 'Policy Database',
      'Fields': 'Policy ID, Coverage, Premium'
    }
  },
  {
    id: 'comp-3',
    name: 'Document Intelligence',
    category: 'Tools',
    description: 'Extract and process information from documents',
    status: 'Available',
    details: {
      'Models': 'OCR, NER',
      'Formats': 'PDF, DOCX, JPEG'
    }
  },
  {
    id: 'comp-4',
    name: 'Rules Engine',
    category: 'Tools',
    description: 'Apply business rules to underwriting decisions',
    status: 'Available',
    details: {
      'Rules Set': 'UW-2023',
      'Categories': 'Medical, Financial, Risk'
    }
  },
  {
    id: 'comp-5',
    name: 'Data Fabric Query',
    category: 'Tools',
    description: 'Query unified data across sources',
    status: 'Available',
    details: {
      'Connectors': '12 active',
      'Data Types': 'Structured, Unstructured'
    }
  },
  {
    id: 'comp-6',
    name: 'Base Prompt',
    category: 'Prompt',
    description: 'Foundation prompt for agent behavior',
    status: 'Available',
    details: {
      'Target Model': 'GPT-4',
      'Word Count': '425'
    }
  },
  {
    id: 'comp-7',
    name: 'Rule Logic',
    category: 'Capability',
    description: 'Access and apply logical rules to the current application',
    status: 'Available',
    details: {
      'Function': 'Enables agents to access and apply defined business rules'
    }
  },
  {
    id: 'comp-8',
    name: 'Agent Rules',
    category: 'Capability',
    description: 'Create and manage dynamic agent-generated rules',
    status: 'Available',
    details: {
      'Function': 'Rules that agents create when deemed necessary based on patterns'
    }
  },
  {
    id: 'comp-9',
    name: 'Process Workflow',
    category: 'Capability',
    description: 'Trigger human-in-the-loop workflows when needed',
    status: 'Available',
    details: {
      'Function': 'Initiates approval processes or expert review workflows'
    }
  },
  {
    id: 'comp-10',
    name: 'Task Forms',
    category: 'Capability',
    description: 'Generate and reference task forms for human completion',
    status: 'Available',
    details: {
      'Function': 'Creates specialized forms for data collection and human input'
    }
  },
  {
    id: 'comp-11',
    name: 'Document Intelligence',
    category: 'Capability',
    description: 'Extract and classify information from documents',
    status: 'Available',
    details: {
      'Function': 'Processes uploaded documents and extracts relevant information'
    }
  },
  {
    id: 'comp-12',
    name: 'Tooling',
    category: 'Capability',
    description: 'Connect with external tools and products',
    status: 'Available',
    details: {
      'Function': 'Integrates with insurance-specific tools and external services'
    }
  },
  {
    id: 'comp-13',
    name: 'Agent Orchestration',
    category: 'Capability',
    description: 'Manage sub-agent orchestration and reasoning flow',
    status: 'Available',
    details: {
      'Function': 'Coordinates specialized agents to accomplish complex tasks'
    }
  },
  {
    id: 'comp-14',
    name: 'Data Fabric',
    category: 'Capability',
    description: 'Access data models, schemas, and vector stores',
    status: 'Available',
    details: {
      'Function': 'Provides unified data access across structured and unstructured sources'
    }
  }
];

// Convert capability components to AgentAction format for the AgentActionsView
const convertToAgentActions = (components: AgentComponent[]): AgentAction[] => {
  return components
    .filter(comp => comp.category === 'Capability')
    .map(comp => ({
      id: comp.id,
      name: comp.name,
      category: comp.category,
      description: comp.description,
      status: comp.status === 'Available' ? 'available' : 
              comp.status === 'Restricted' ? 'restricted' : 
              undefined,
      configuration: comp.details
    }));
};

const AgentBuilder: React.FC = () => {
  const [components, setComponents] = useState<AgentComponent[]>(initialComponents);
  const [activeTab, setActiveTab] = useState('components');
  const [editComponent, setEditComponent] = useState<AgentComponent | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newComponentCategory, setNewComponentCategory] = useState<ComponentCategory | null>(null);

  // Actions for component management
  const handleEditComponent = (component: AgentComponent) => {
    setEditComponent(component);
    setIsEditorOpen(true);
  };

  const handleAddComponent = (category: ComponentCategory) => {
    setEditComponent(undefined);
    setNewComponentCategory(category);
    setIsEditorOpen(true);
  };

  const handleSaveComponent = (component: AgentComponent) => {
    if (editComponent) {
      // Update existing component
      setComponents(components.map(c => c.id === component.id ? component : c));
    } else {
      // Add new component
      setComponents([...components, component]);
    }
  };

  const handleUseComponent = (component: AgentComponent) => {
    console.log('Using component:', component);
    // Here you would implement the logic to use the component in the agent
  };

  // For AgentActionsView
  const capabilityActions = convertToAgentActions(
    components.filter(comp => comp.category === 'Capability')
  );
  
  const actionHistory: ActionHistoryItem[] = [
    {
      id: 'history-1',
      type: 'Rule Execution',
      title: 'Applied Underwriting Rules',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'success',
      metadata: {
        'Result': 'Approved',
        'Rules Applied': 'Medical history, Risk calculation'
      }
    },
    {
      id: 'history-2',
      type: 'Document Processing',
      title: 'Medical Report Analysis',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'success',
      metadata: {
        'Source': 'Lab Results PDF',
        'Key findings': 'All tests within normal range'
      }
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h1 className="text-xl font-semibold">Accelerated UW Agent</h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">UW</Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
            Deploy
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b bg-white">
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-gray-500">
            Overview
          </Button>
          <Button variant="ghost" className="text-neutrinos-blue font-medium border-b-2 border-neutrinos-blue">
            Build
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Metrics
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Eval
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Policy
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Versions
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Lineage
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Tools
          </Button>
          <Button variant="ghost" className="text-gray-500">
            Settings
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Agent Components</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="capabilities">Agent Capabilities</TabsTrigger>
            <TabsTrigger value="chat">Action Chat</TabsTrigger>
            <TabsTrigger value="enhanced-chat">Enhanced Chat</TabsTrigger>
            <TabsTrigger value="flow">Flow View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="flex-1">
            <AgentComponentManager 
              components={components}
              onEditComponent={handleEditComponent}
              onAddComponent={handleAddComponent}
              onUseComponent={handleUseComponent}
            />
          </TabsContent>
          
          <TabsContent value="capabilities" className="p-0 flex-1 bg-white rounded-md">
            <AgentActionsView
              availableActions={capabilityActions}
              actionHistory={actionHistory}
              onSelectAction={(action) => console.log('Selected action:', action)}
              onCreateAction={() => handleAddComponent('Capability')}
              onExportHistory={() => console.log('Export history')}
              onApprove={(actionId) => console.log('Approve action:', actionId)}
            />
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="h-[500px] flex items-center justify-center bg-white rounded-md">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Action Chat</h3>
                <p className="text-gray-500 mb-4">Interactive chat interface with agent actions</p>
                <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                  Open Chat
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="enhanced-chat">
            <div className="h-[500px] flex items-center justify-center bg-white rounded-md">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Enhanced Chat</h3>
                <p className="text-gray-500 mb-4">Advanced chat with reasoning visualization</p>
                <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                  Open Enhanced Chat
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="flow">
            <div className="h-[500px] flex items-center justify-center bg-white rounded-md">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Flow View</h3>
                <p className="text-gray-500 mb-4">Visual agent reasoning flow diagram</p>
                <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                  Open Flow View
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Component Editor Dialog */}
      <ComponentEditor
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditComponent(undefined);
          setNewComponentCategory(null);
        }}
        component={editComponent}
        onSave={handleSaveComponent}
        title={editComponent 
          ? `Edit ${editComponent.name}` 
          : newComponentCategory 
            ? `Add ${newComponentCategory}` 
            : 'Add Component'
        }
      />
    </div>
  );
};

export default AgentBuilder;