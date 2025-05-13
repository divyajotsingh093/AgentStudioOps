import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Menu, X, Home, BarChart, TestTube, FileText, GitBranch, Wrench, Settings } from 'lucide-react';
import AgentComponentManager, { AgentComponent, ComponentCategory } from '../components/AgentComponentManager';
import ComponentEditor from '../components/ComponentEditor';
import AgentActionsView from '../chat/AgentActionsView';
import AgentCapabilitiesView from '../capabilities/AgentCapabilitiesView';
import { AgentAction, ActionHistoryItem } from '@/lib/mock-actions';
import { AgentCapability, RuleDefinition, LogicFlow } from '@/lib/mock-capabilities';
import { useViewport } from '@/hooks/use-viewport';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

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
  const { isMobile, isTablet, screenSize } = useViewport();
  const [components, setComponents] = useState<AgentComponent[]>(initialComponents);
  const [activeTab, setActiveTab] = useState('components');
  const [editComponent, setEditComponent] = useState<AgentComponent | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newComponentCategory, setNewComponentCategory] = useState<ComponentCategory | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
  
  // Handlers for AgentCapabilitiesView
  const handleCreateCapability = (type: string) => {
    console.log('Create new capability of type:', type);
    // Add implementation
  };
  
  const handleExportCapabilities = () => {
    console.log('Export capabilities');
    // Add implementation
  };
  
  const handleUseCapability = (capability: AgentCapability | RuleDefinition | LogicFlow) => {
    console.log('Use capability:', capability);
    // Add implementation
  };
  
  const handleEditCapability = (capability: AgentCapability | RuleDefinition | LogicFlow) => {
    console.log('Edit capability:', capability);
    // Add implementation
  };

  // Navigation items for both mobile and desktop
  const navItems = [
    { name: 'Overview', icon: <Home className="h-4 w-4" />, active: false },
    { name: 'Build', icon: <Plus className="h-4 w-4" />, active: true },
    { name: 'Metrics', icon: <BarChart className="h-4 w-4" />, active: false },
    { name: 'Eval', icon: <TestTube className="h-4 w-4" />, active: false },
    { name: 'Policy', icon: <FileText className="h-4 w-4" />, active: false },
    { name: 'Versions', icon: <GitBranch className="h-4 w-4" />, active: false },
    { name: 'Lineage', icon: <GitBranch className="h-4 w-4" />, active: false },
    { name: 'Tools', icon: <Wrench className="h-4 w-4" />, active: false },
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, active: false },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header - Adaptive to screen size */}
      <div className="p-3 md:p-4 border-b flex justify-between items-center bg-white">
        <div className="flex items-center">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 p-1" 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold flex items-center`}>
            Accelerated UW Agent
            <Badge className="ml-2 bg-blue-100 text-blue-800">UW</Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {!isMobile && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
          <Button 
            className="bg-neutrinos-blue hover:bg-neutrinos-blue/90"
            size={isMobile ? "sm" : "default"}
          >
            Deploy
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Drawer */}
      {isMobile && mobileNavOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileNavOpen(false)}>
          <div 
            className="bg-white h-full w-64 p-4 overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className={`w-full justify-start mb-1 ${item.active ? 'text-neutrinos-blue font-medium' : 'text-gray-600'}`}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Desktop Navigation */}
      <div className={`border-b bg-white ${isMobile ? 'hidden' : 'block'}`}>
        <ResponsiveContainer>
          <div className="flex flex-wrap py-2">
            {navItems.map((item, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className={`${item.active 
                  ? 'text-neutrinos-blue font-medium border-b-2 border-neutrinos-blue' 
                  : 'text-gray-500'}`}
              >
                {isTablet && item.icon}
                <span className={isTablet ? "ml-1" : ""}>{item.name}</span>
              </Button>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
      
      <div className="p-3 md:p-4 bg-gray-50 flex-1 overflow-hidden">
        <ResponsiveContainer>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Agent Components</h2>
            {isMobile && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                <span className="text-xs">Export</span>
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid" style={{ 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)'
            }}>
              <TabsTrigger value="components" className={isMobile ? 'text-xs py-1 px-2' : ''}>
                {isMobile ? 'Components' : 'Agent Components'}
              </TabsTrigger>
              <TabsTrigger value="capabilities" className={isMobile ? 'text-xs py-1 px-2' : ''}>
                {isMobile ? 'Capabilities' : 'Agent Capabilities'}
              </TabsTrigger>
              {(!isMobile || activeTab === 'chat') && (
                <TabsTrigger value="chat" className={isMobile ? 'text-xs py-1 px-2' : ''}>
                  Action Chat
                </TabsTrigger>
              )}
              {(!isMobile || activeTab === 'enhanced-chat') && (
                <TabsTrigger value="enhanced-chat" className={isMobile ? 'text-xs py-1 px-2' : ''}>
                  Enhanced Chat
                </TabsTrigger>
              )}
              {(!isMobile || activeTab === 'flow') && (
                <TabsTrigger value="flow" className={isMobile ? 'text-xs py-1 px-2' : ''}>
                  Flow View
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="components" className="flex-1 h-full overflow-hidden">
              <div className="h-full overflow-hidden rounded-md">
                <AgentComponentManager 
                  components={components}
                  onEditComponent={handleEditComponent}
                  onAddComponent={handleAddComponent}
                  onUseComponent={handleUseComponent}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="capabilities" className="p-0 flex-1 bg-white rounded-md h-full overflow-hidden">
              <AgentCapabilitiesView 
                onCreateCapability={handleCreateCapability}
                onExport={handleExportCapabilities}
                onUseCapability={handleUseCapability}
                onEdit={handleEditCapability}
              />
            </TabsContent>
            
            <TabsContent value="chat" className="h-full overflow-hidden">
              <div className={`${isMobile ? 'h-[400px]' : 'h-[500px]'} flex items-center justify-center bg-white rounded-md`}>
                <div className="text-center p-4">
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>Action Chat</h3>
                  <p className="text-gray-500 mb-4 text-sm">Interactive chat interface with agent actions</p>
                  <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90" size={isMobile ? "sm" : "default"}>
                    Open Chat
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="enhanced-chat" className="h-full overflow-hidden">
              <div className={`${isMobile ? 'h-[400px]' : 'h-[500px]'} flex items-center justify-center bg-white rounded-md`}>
                <div className="text-center p-4">
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>Enhanced Chat</h3>
                  <p className="text-gray-500 mb-4 text-sm">Advanced chat with reasoning visualization</p>
                  <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90" size={isMobile ? "sm" : "default"}>
                    Open Enhanced Chat
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flow" className="h-full overflow-hidden">
              <div className={`${isMobile ? 'h-[400px]' : 'h-[500px]'} flex items-center justify-center bg-white rounded-md`}>
                <div className="text-center p-4">
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>Flow View</h3>
                  <p className="text-gray-500 mb-4 text-sm">Visual agent reasoning flow diagram</p>
                  <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90" size={isMobile ? "sm" : "default"}>
                    Open Flow View
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ResponsiveContainer>
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