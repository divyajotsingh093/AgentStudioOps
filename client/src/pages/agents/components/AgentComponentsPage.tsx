import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { useLocation, useRoute, useParams } from 'wouter';
import AgentComponentManager, { AgentComponent } from '@/components/agents/components/AgentComponentManager';
import DetailedComponentView from '@/components/agents/components/DetailedComponentView';
import { useViewport } from '@/hooks/use-viewport';
import { FileText, BookOpen, Database } from 'lucide-react';

// Mock data models
const specializedComponents: AgentComponent[] = [
  {
    id: 'model-rule-1',
    name: 'Medical Underwriting Rules',
    category: 'Tools',
    type: 'Medical Underwriting',
    description: 'Advanced rule-based system for evaluating medical risks',
    status: 'Available',
    details: {
      'Rules Count': '25',
      'Accuracy': '97.8%',
      'Version': '3.2.1',
      'Last Updated': 'Apr 15, 2025'
    }
  },
  {
    id: 'model-doc-1',
    name: 'Lab Test Analysis Model',
    category: 'Tools',
    type: 'Lab Document',
    description: 'AI model for extracting and analyzing medical lab test results',
    status: 'Available',
    details: {
      'Accuracy': '96.5%',
      'Supported Tests': '45+',
      'Processing Time': '3.2s',
      'Last Updated': 'Feb 20, 2025'
    }
  },
  {
    id: 'model-data-1',
    name: 'Benefit Mapping Schema',
    category: 'Context',
    type: 'Benefit Data',
    description: 'Comprehensive schema for mapping insurance benefits across systems',
    status: 'Available',
    details: {
      'Data Sources': '4',
      'Entities': '12',
      'Query Templates': '8',
      'Last Updated': 'Apr 5, 2025'
    }
  }
];

const AgentComponentsPage: React.FC = () => {
  const { isMobile } = useViewport();
  const [selectedComponent, setSelectedComponent] = useState<AgentComponent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [_, params] = useRoute('/agents/components/:id?');
  const [__, setLocation] = useLocation();

  const handleComponentClick = (component: AgentComponent) => {
    setSelectedComponent(component);
    setDetailsOpen(true);
  };

  const handleEditComponent = (component: AgentComponent) => {
    console.log('Edit component', component);
    // Add implementation for editing
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agent Component Models</h1>
        <Button 
          className="bg-neutrinos-blue hover:bg-neutrinos-blue/90"
          onClick={() => setLocation('/agents/builder/accel-uw')}
        >
          Return to Agent Builder
        </Button>
      </div>
      
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="models">Model Components</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="p-0">
          {detailsOpen && selectedComponent ? (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <DetailedComponentView 
                componentCategory={selectedComponent.category}
                componentType={selectedComponent.name}
                onClose={() => setDetailsOpen(false)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializedComponents.map(component => (
                <Card 
                  key={component.id}
                  className="overflow-hidden border-l-4 border-l-neutrinos-blue transition-all hover:shadow-md cursor-pointer"
                  onClick={() => handleComponentClick(component)}
                >
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      {component.type?.includes('Medical') && (
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      )}
                      {component.type?.includes('Lab') && (
                        <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                      )}
                      {component.type?.includes('Benefit') && (
                        <Database className="h-5 w-5 mr-2 text-teal-600" />
                      )}
                      <h3 className="text-lg font-semibold">{component.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{component.description}</p>
                    
                    <div className="text-sm text-gray-500 grid grid-cols-2 gap-2">
                      {Object.entries(component.details || {}).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documentation" className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Component Model Documentation</h2>
          <p className="mb-4">
            This page provides access to detailed insurance-specific component models that can be integrated into Neutrinos AI agents.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">Available Component Types</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>
              <span className="font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" /> 
                Rule Models
              </span>
              <p className="text-sm text-gray-600">Detailed rule systems for insurance underwriting and claims processing</p>
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-amber-600" /> 
                Document Models
              </span>
              <p className="text-sm text-gray-600">AI systems for processing and extracting data from insurance documents</p>
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <Database className="h-4 w-4 mr-2 text-teal-600" /> 
                Data Fabric Models
              </span>
              <p className="text-sm text-gray-600">Schemas and mappings for integrating insurance data systems</p>
            </li>
          </ul>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How to Use</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Browse available component models</li>
              <li>Click on a component to view detailed specifications</li>
              <li>Review capabilities, parameters, and examples</li>
              <li>Use the "Use Component" button to integrate into your agent</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentComponentsPage;