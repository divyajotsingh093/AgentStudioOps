import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ChevronLeft } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';

// Type definitions for the component models
interface RuleModel {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  rules: {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    category: string;
  }[];
  metadata: {
    rulesCount: number;
    accuracy: string;
    lastUpdated: string;
  };
}

interface DocumentModel {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  fields: {
    id: string;
    name: string;
    dataType: string;
    required: boolean;
    examples: string[];
  }[];
  metadata: {
    documentTypes: string[];
    processingSpeed: string;
    fieldAccuracy: string;
    entityRecognition: string[];
    lastUpdated: string;
  };
}

interface DataModel {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  schema: {
    tables: {
      name: string;
      fields: {
        name: string;
        type: string;
        constraints: string[];
      }[];
    }[];
    relationships: {
      source: string;
      target: string;
      type: string;
    }[];
  };
  metadata: {
    sourceSystems: string[];
    refreshFrequency: string;
    lastUpdated: string;
  };
}

type ComponentModel = RuleModel | DocumentModel | DataModel;

// Mock data for component models
const mockModels: ComponentModel[] = [
  {
    id: 'model-rule-1',
    name: 'Medical Underwriting Rules',
    type: 'Rule Engine',
    description: 'Advanced rule-based system for evaluating medical risks in underwriting',
    version: '3.2.1',
    rules: [
      {
        id: 'rule-1',
        name: 'Diabetes Type 2 Standard Rating',
        condition: 'diagnosis.contains("Type 2 Diabetes") && a1c < 7.0 && no_complications',
        action: 'AssignRating("Standard")',
        priority: 10,
        category: 'Endocrine'
      },
      {
        id: 'rule-2',
        name: 'Diabetes Type 2 Table B Rating',
        condition: 'diagnosis.contains("Type 2 Diabetes") && a1c >= 7.0 && a1c < 8.0',
        action: 'AssignRating("Table B")',
        priority: 11,
        category: 'Endocrine'
      },
      {
        id: 'rule-3',
        name: 'Elevated BP with Normal Range',
        condition: 'systolic >= 130 && systolic <= 139 && diastolic >= 80 && diastolic <= 89 && no_medications',
        action: 'AssignRating("Standard")',
        priority: 5,
        category: 'Cardiovascular'
      }
    ],
    metadata: {
      rulesCount: 25,
      accuracy: '97.8%',
      lastUpdated: 'Apr 15, 2025'
    }
  },
  {
    id: 'model-doc-1',
    name: 'Lab Test Document Intelligence',
    type: 'Document Intelligence',
    description: 'Advanced document processing for medical lab tests',
    version: '2.1.0',
    fields: [
      {
        id: 'field-1',
        name: 'A1C Level',
        dataType: 'percentage',
        required: true,
        examples: ['6.5%', '7.2%', '5.9%']
      },
      {
        id: 'field-2',
        name: 'Blood Pressure',
        dataType: 'string',
        required: true,
        examples: ['120/80', '135/85', '145/95']
      },
      {
        id: 'field-3',
        name: 'Cholesterol Panel',
        dataType: 'object',
        required: true,
        examples: ['LDL: 120, HDL: 50, Total: 200', 'LDL: 100, HDL: 45, Total: 180']
      }
    ],
    metadata: {
      documentTypes: ['Medical Labs', 'Diagnoses', 'Treatments'],
      processingSpeed: '3-5 seconds per page',
      fieldAccuracy: '96.7%',
      entityRecognition: ['Medical terms', 'Measurements', 'Dates', 'Doctor names'],
      lastUpdated: 'Apr 28, 2025'
    }
  },
  {
    id: 'model-data-1',
    name: 'Benefits Mapping Data',
    type: 'Data Model',
    description: 'Data model for mapping insurance benefits to medical procedures',
    version: '1.5.3',
    schema: {
      tables: [
        {
          name: 'Benefits',
          fields: [
            {
              name: 'benefit_id',
              type: 'uuid',
              constraints: ['primary key']
            },
            {
              name: 'benefit_name',
              type: 'string',
              constraints: ['not null']
            },
            {
              name: 'coverage_percentage',
              type: 'decimal',
              constraints: ['not null']
            }
          ]
        },
        {
          name: 'Procedures',
          fields: [
            {
              name: 'procedure_id',
              type: 'uuid',
              constraints: ['primary key']
            },
            {
              name: 'procedure_code',
              type: 'string',
              constraints: ['not null', 'unique']
            },
            {
              name: 'procedure_name',
              type: 'string',
              constraints: ['not null']
            }
          ]
        }
      ],
      relationships: [
        {
          source: 'Benefits',
          target: 'Procedures',
          type: 'many-to-many'
        }
      ]
    },
    metadata: {
      sourceSystems: ['Claims Processing', 'Provider Network'],
      refreshFrequency: 'Daily',
      lastUpdated: 'May 10, 2025'
    }
  }
];

// Component model card
const ModelCard: React.FC<{ model: ComponentModel }> = ({ model }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-all cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-medium">{model.name}</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">{model.type}</Badge>
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-gray-700">Version:</span> {model.version}
          </div>
          {'metadata' in model && model.metadata.lastUpdated && (
            <div>
              <span className="font-medium text-gray-700">Updated:</span> {model.metadata.lastUpdated}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="h-4 w-4 mr-2" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component for displaying the model details
const ModelDetail: React.FC<{ model: ComponentModel }> = ({ model }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{model.name}</h3>
        <p className="text-gray-600">{model.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">General Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Type:</span> {model.type}
            </div>
            <div>
              <span className="font-medium text-gray-700">Version:</span> {model.version}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Metadata</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {'metadata' in model && 'rulesCount' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Rules Count:</span> {model.metadata.rulesCount}
              </div>
            )}
            {'metadata' in model && 'accuracy' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Accuracy:</span> {model.metadata.accuracy}
              </div>
            )}
            {'metadata' in model && 'fieldAccuracy' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Field Accuracy:</span> {model.metadata.fieldAccuracy}
              </div>
            )}
            {'metadata' in model && 'processingSpeed' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Processing Speed:</span> {model.metadata.processingSpeed}
              </div>
            )}
            {'metadata' in model && 'refreshFrequency' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Refresh Frequency:</span> {model.metadata.refreshFrequency}
              </div>
            )}
            {'metadata' in model && 'lastUpdated' in model.metadata && (
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span> {model.metadata.lastUpdated}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Rule Engine specific details */}
      {'rules' in model && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Rules</h4>
          <div className="space-y-4">
            {model.rules.map((rule) => (
              <Card key={rule.id} className="p-3">
                <div className="font-medium text-blue-800">{rule.name}</div>
                <div className="text-sm mt-2">
                  <div>
                    <span className="font-medium text-gray-700">Condition:</span>
                    <div className="p-2 bg-gray-50 rounded my-1 font-mono text-xs">{rule.condition}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Action:</span>
                    <div className="p-2 bg-gray-50 rounded my-1 font-mono text-xs">{rule.action}</div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>
                      <span className="font-medium text-gray-700">Priority:</span> {rule.priority}
                    </span>
                    <Badge>{rule.category}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Document Intelligence specific details */}
      {'fields' in model && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Document Fields</h4>
          <div className="space-y-4">
            {model.fields.map((field) => (
              <Card key={field.id} className="p-3">
                <div className="font-medium text-blue-800">{field.name}</div>
                <div className="text-sm mt-2">
                  <div className="flex justify-between">
                    <span>
                      <span className="font-medium text-gray-700">Type:</span> {field.dataType}
                    </span>
                    {field.required && <Badge>Required</Badge>}
                  </div>
                  
                  <div className="mt-2">
                    <span className="font-medium text-gray-700">Examples:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {field.examples.map((example, i) => (
                        <Badge variant="outline" key={i}>{example}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Data Model specific details */}
      {'schema' in model && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Data Schema</h4>
          <div className="space-y-4">
            {model.schema.tables.map((table) => (
              <Card key={table.name} className="p-3">
                <div className="font-medium text-blue-800">{table.name}</div>
                <div className="text-sm mt-2">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-700">Field</th>
                        <th className="text-left text-xs font-medium text-gray-700">Type</th>
                        <th className="text-left text-xs font-medium text-gray-700">Constraints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.fields.map((field, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-1">{field.name}</td>
                          <td className="py-1">{field.type}</td>
                          <td className="py-1">
                            {field.constraints.map((c, j) => (
                              <Badge key={j} className="mr-1 text-xs" variant="outline">{c}</Badge>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
            
            {model.schema.relationships.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Relationships</h5>
                <div className="space-y-2">
                  {model.schema.relationships.map((rel, i) => (
                    <div key={i} className="text-sm flex items-center p-2 bg-gray-50 rounded">
                      <span>{rel.source}</span>
                      <span className="mx-2">→</span>
                      <span>{rel.target}</span>
                      <Badge className="ml-2" variant="outline">{rel.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
export default function AgentComponentsPage() {
  const isMobile = useIsMobile();
  const [selectedModel, setSelectedModel] = useState<ComponentModel | null>(null);
  
  return (
    <div className="container py-4 md:py-6 mx-auto">
      <div className="mb-6">
        <div className="flex items-center">
          {selectedModel && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={() => setSelectedModel(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {selectedModel ? selectedModel.name : "Component Models"}
            </h1>
            {!selectedModel && (
              <p className="text-gray-600">
                Specialized models for advanced agent capabilities
              </p>
            )}
          </div>
        </div>
      </div>
      
      {!selectedModel ? (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Models</TabsTrigger>
            <TabsTrigger value="rules">Rule Models</TabsTrigger>
            <TabsTrigger value="documents">Document Models</TabsTrigger>
            <TabsTrigger value="data">Data Models</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockModels.map((model) => (
                <div key={model.id} onClick={() => setSelectedModel(model)}>
                  <ModelCard model={model} />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="rules" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockModels
                .filter((model) => 'rules' in model)
                .map((model) => (
                  <div key={model.id} onClick={() => setSelectedModel(model)}>
                    <ModelCard model={model} />
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockModels
                .filter((model) => 'fields' in model)
                .map((model) => (
                  <div key={model.id} onClick={() => setSelectedModel(model)}>
                    <ModelCard model={model} />
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="data" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockModels
                .filter((model) => 'schema' in model)
                .map((model) => (
                  <div key={model.id} onClick={() => setSelectedModel(model)}>
                    <ModelCard model={model} />
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-4">
          <ModelDetail model={selectedModel} />
        </Card>
      )}
    </div>
  );
}