import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code } from '@/components/ui/code';
import { 
  FileText, 
  BookOpen, 
  Database, 
  ArrowUpRight, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Copy,
  ListChecks,
  BarChart,
  FlaskConical,
  Calendar,
  Clock
} from 'lucide-react';

import { 
  RuleModel, 
  DocumentModel, 
  DataFabricModel,
  medicalUnderwritingRules, 
  medicalLabDocumentModels, 
  benefitDataFabricModels 
} from '@/lib/mock-detail-models';
import { useViewport } from '@/hooks/use-viewport';

interface DetailedComponentViewProps {
  componentCategory: string;
  componentType: string;
  onClose: () => void;
}

const DetailedComponentView: React.FC<DetailedComponentViewProps> = ({
  componentCategory,
  componentType,
  onClose
}) => {
  const { isMobile } = useViewport();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the appropriate mock data model based on component category and type
  const getDetailModel = (): RuleModel | DocumentModel | DataFabricModel | null => {
    if (componentCategory === 'Rules' && componentType.includes('Medical')) {
      return medicalUnderwritingRules[0]; // Diabetes risk assessment rule
    } else if (componentCategory === 'Document' && componentType.includes('Lab')) {
      return medicalLabDocumentModels[0]; // Comprehensive blood panel extractor model
    } else if (componentCategory === 'Data' && componentType.includes('Benefit')) {
      return benefitDataFabricModels[0]; // Insurance Benefit Coverage Mapper
    }
    return null;
  };
  
  const detailModel = getDetailModel();
  
  if (!detailModel) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Component Details</CardTitle>
          <CardDescription>No detailed information available for this component.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Format date strings
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Determine the icon for the component type
  const getComponentIcon = () => {
    if ('conditions' in detailModel) { // RuleModel
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if ('fields' in detailModel && 'extractionMethod' in detailModel) { // DocumentModel
      return <BookOpen className="h-5 w-5 text-amber-600" />;
    } else if ('dataSources' in detailModel) { // DataFabricModel
      return <Database className="h-5 w-5 text-teal-600" />;
    }
    return <FileText className="h-5 w-5" />;
  };
  
  // Render content based on model type
  const renderDetailContent = () => {
    if ('conditions' in detailModel) {
      return renderRuleModelDetails(detailModel as RuleModel);
    } else if ('fields' in detailModel && 'extractionMethod' in detailModel) {
      return renderDocumentModelDetails(detailModel as DocumentModel);
    } else if ('dataSources' in detailModel) {
      return renderDataFabricModelDetails(detailModel as DataFabricModel);
    }
    return null;
  };
  
  // Render for Rule Models
  const renderRuleModelDetails = (model: RuleModel) => {
    return (
      <>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Rule Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">Rule Type:</span>
                    <Badge variant="outline">{model.ruleType}</Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Category:</span>
                    <span>{model.category}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Status:</span>
                    <Badge className={
                      model.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      model.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }>
                      {model.status}
                    </Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Version:</span>
                    <span>{model.version}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Last Updated:</span>
                    <span>{formatDate(model.lastUpdated)}</span>
                  </div>
                  {model.author && (
                    <div className="flex">
                      <span className="font-medium w-32">Author:</span>
                      <span>{model.author}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Rule Parameters</h3>
                <div className="space-y-3">
                  {model.parameters.map(param => (
                    <div key={param.id} className="border p-2 rounded-md">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{param.name}</span>
                        <Badge variant="outline" className="text-xs">{param.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{param.description}</p>
                      <div className="flex text-xs mt-1">
                        <span className="font-medium w-24">Default Value:</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">{param.defaultValue?.toString() || 'None'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {model.metadata && Object.keys(model.metadata).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Additional Metadata</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <Table>
                    <TableBody>
                      {Object.entries(model.metadata).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium py-1">{key.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="py-1">
                            {Array.isArray(value) ? (
                              <ul className="list-disc pl-4 text-sm">
                                {value.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            ) : (
                              value
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="conditions">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-4">
                {model.conditions.map(condition => (
                  <Card key={condition.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="py-3">
                      <div className="flex justify-between">
                        <CardTitle className="text-sm">{condition.description}</CardTitle>
                        <Badge variant="outline">{condition.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="bg-gray-50 p-2 rounded-md font-mono text-sm">
                        {condition.expression}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                        {condition.field && (
                          <div>
                            <p className="font-medium text-xs text-gray-500">Field</p>
                            <p>{condition.field}</p>
                          </div>
                        )}
                        {condition.operator && (
                          <div>
                            <p className="font-medium text-xs text-gray-500">Operator</p>
                            <p>{condition.operator}</p>
                          </div>
                        )}
                        {condition.value !== undefined && (
                          <div>
                            <p className="font-medium text-xs text-gray-500">Value</p>
                            <p className="font-mono">{condition.value.toString()}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 text-xs text-gray-500">
                      Priority: {condition.priority}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-4">
                {model.actions.map(action => (
                  <Card key={action.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="py-3">
                      <div className="flex justify-between">
                        <CardTitle className="text-sm">{action.description}</CardTitle>
                        <Badge variant="outline">{action.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="bg-gray-50 p-2 rounded-md font-mono text-sm whitespace-pre-wrap">
                        {action.expression}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        {action.target && (
                          <div>
                            <p className="font-medium text-xs text-gray-500">Target</p>
                            <p>{action.target}</p>
                          </div>
                        )}
                        {action.value !== undefined && (
                          <div>
                            <p className="font-medium text-xs text-gray-500">Value</p>
                            <p className="font-mono">{action.value.toString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {action.metadata && (
                        <div className="mt-3">
                          <p className="font-medium text-xs text-gray-500 mb-1">Metadata</p>
                          <div className="bg-gray-50 p-2 rounded-md text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(action.metadata, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="examples">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-6">
                {model.examples.map(example => (
                  <Card key={example.id} className="overflow-hidden">
                    <CardHeader className="py-3 bg-gray-50">
                      <CardTitle className="text-sm">{example.description}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium mb-2">Inputs</h4>
                          <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">
                            <pre>{JSON.stringify(example.inputs, null, 2)}</pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium mb-2">Expected Output</h4>
                          <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">
                            <pre>{JSON.stringify(example.expectedOutput, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-medium mb-1">Explanation</h4>
                        <p className="text-sm text-gray-600">{example.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </>
    );
  };
  
  // Render for Document Models
  const renderDocumentModelDetails = (model: DocumentModel) => {
    return (
      <>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fields">Document Fields</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Document Model Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">Type:</span>
                    <Badge variant="outline">{model.type}</Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Status:</span>
                    <Badge className={
                      model.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      model.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                      model.status === 'Training' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {model.status}
                    </Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Extraction:</span>
                    <span>{model.extractionMethod}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Accuracy:</span>
                    <span>{model.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Processing Time:</span>
                    <span>{(model.processingTime / 1000).toFixed(2)} seconds</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Version:</span>
                    <span>{model.version}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Last Updated:</span>
                    <span>{formatDate(model.lastUpdated)}</span>
                  </div>
                  {model.author && (
                    <div className="flex">
                      <span className="font-medium w-32">Author:</span>
                      <span>{model.author}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Supported Formats</h3>
                <div className="flex flex-wrap gap-2">
                  {model.supportedFormats.map((format, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {format}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-sm font-medium mt-4 mb-2">Field Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Fields:</span>
                    <Badge variant="outline">{model.fields.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Required Fields:</span>
                    <Badge variant="outline">{model.fields.filter(f => f.required).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Confidence:</span>
                    <Badge variant="outline">
                      {(model.fields.reduce((sum, field) => sum + field.extractionConfidence, 0) / model.fields.length).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fields">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {model.fields.map(field => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {field.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {field.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`text-sm ${
                            field.extractionConfidence >= 95 ? 'text-green-600' : 
                            field.extractionConfidence >= 90 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {field.extractionConfidence.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{field.description}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="examples">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-6">
                {model.examples.map(example => (
                  <Card key={example.id} className="overflow-hidden">
                    <CardHeader className="py-3 bg-gray-50">
                      <div className="flex justify-between">
                        <CardTitle className="text-sm">{example.description}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="whitespace-nowrap">
                            {example.fileFormat}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                            {example.accuracy.toFixed(1)}% accuracy
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        File: {example.fileName} ({(example.fileSize / 1024).toFixed(0)} KB)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div>
                        <h4 className="text-xs font-medium mb-2">Extraction Results</h4>
                        <div className="bg-gray-50 p-2 rounded-md text-xs font-mono max-h-[300px] overflow-auto">
                          <pre>{JSON.stringify(example.extractionResults, null, 2)}</pre>
                        </div>
                      </div>
                      <div className="mt-3 text-sm flex gap-4">
                        <div>
                          <span className="font-medium text-xs">Processing Time:</span>
                          <span className="ml-1">{(example.processingTime / 1000).toFixed(2)}s</span>
                        </div>
                        <div>
                          <span className="font-medium text-xs">Accuracy:</span>
                          <span className="ml-1">{example.accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="metadata">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(model.metadata, null, 2)}</pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </>
    );
  };
  
  // Render for Data Fabric Models
  const renderDataFabricModelDetails = (model: DataFabricModel) => {
    return (
      <>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Data Fabric Model Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">Type:</span>
                    <Badge variant="outline">{model.type}</Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Status:</span>
                    <Badge className={
                      model.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      model.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }>
                      {model.status}
                    </Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Version:</span>
                    <span>{model.version}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Last Updated:</span>
                    <span>{formatDate(model.lastUpdated)}</span>
                  </div>
                  {model.author && (
                    <div className="flex">
                      <span className="font-medium w-32">Author:</span>
                      <span>{model.author}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-medium mt-4 mb-2">Model Composition</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Sources:</span>
                    <Badge variant="outline">{model.dataSources.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Entities:</span>
                    <Badge variant="outline">{model.entities.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Relationships:</span>
                    <Badge variant="outline">{model.relationships.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Query Templates:</span>
                    <Badge variant="outline">{model.queryTemplates.length}</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Model Description</h3>
                <p className="text-sm text-gray-700">{model.description}</p>
                
                {model.metadata && (
                  <>
                    <h3 className="text-sm font-medium mt-4 mb-2">Purpose</h3>
                    <p className="text-sm text-gray-700">{model.metadata.purpose}</p>
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">Compliance Standards</h3>
                    <div className="flex flex-wrap gap-2">
                      {model.metadata.compliance_standards?.map((standard: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data-sources">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-4">
                {model.dataSources.map(source => (
                  <Card key={source.id} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <div className="flex justify-between">
                        <CardTitle className="text-sm">{source.name}</CardTitle>
                        <Badge variant="outline">{source.type}</Badge>
                      </div>
                      <CardDescription>{source.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium mb-2">Connection Details</h4>
                          <div className="bg-gray-50 p-2 rounded-md text-xs">
                            <div className="mb-1"><span className="font-medium">Type:</span> {source.connection.type}</div>
                            {Object.entries(source.connection.details).map(([key, value], index) => (
                              <div key={index} className="mb-1">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium mb-2">Refresh Information</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex">
                              <span className="font-medium w-28">Refresh Rate:</span>
                              <span>{source.refreshRate || 'On-demand'}</span>
                            </div>
                            {source.lastSync && (
                              <div className="flex">
                                <span className="font-medium w-28">Last Synced:</span>
                                <span>{formatDate(source.lastSync)}</span>
                              </div>
                            )}
                          </div>
                          
                          {source.metadata && (
                            <div className="mt-3">
                              <h4 className="text-xs font-medium mb-2">Metadata</h4>
                              <div className="bg-gray-50 p-2 rounded-md text-xs">
                                {Object.entries(source.metadata).map(([key, value], index) => (
                                  <div key={index} className="mb-1">
                                    <span className="font-medium">{key}:</span>{' '}
                                    {Array.isArray(value) 
                                      ? value.join(', ')
                                      : typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : value.toString()
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="entities">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <Accordion type="multiple" className="space-y-2">
                {model.entities.map(entity => (
                  <AccordionItem key={entity.id} value={entity.id} className="border rounded-md overflow-hidden">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex items-center">
                        <span className="font-medium">{entity.name}</span>
                        <Badge className="ml-2" variant="outline">
                          {Object.keys(entity.fields).length} fields
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <p className="text-sm text-gray-600 mb-3">{entity.description}</p>
                      
                      {entity.primaryKey && (
                        <div className="mb-2">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 mb-2">
                            Primary Key: {entity.primaryKey.join(', ')}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Field</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Required</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(entity.fields).map(([fieldName, field]) => (
                              <TableRow key={fieldName}>
                                <TableCell className="font-medium py-1">
                                  {fieldName}
                                </TableCell>
                                <TableCell className="py-1">
                                  <Badge variant="outline">{field.type}</Badge>
                                </TableCell>
                                <TableCell className="py-1">
                                  {field.required ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-1 text-sm">
                                  {field.description || ''}
                                  {field.source && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Source: {field.source}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="queries">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-4">
                {model.queryTemplates.map(query => (
                  <Card key={query.id} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{query.name}</CardTitle>
                      <CardDescription>{query.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <h4 className="text-xs font-medium">SQL Query</h4>
                          <Button variant="ghost" size="sm" className="h-6 px-2 py-0">
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-md text-xs font-mono whitespace-pre-wrap">
                          {query.query}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-medium mb-1">Parameters</h4>
                        <div className="bg-gray-50 rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(query.parameters).map(([paramName, param]) => (
                                <TableRow key={paramName}>
                                  <TableCell className="font-medium py-1">
                                    {paramName}
                                  </TableCell>
                                  <TableCell className="py-1">
                                    <Badge variant="outline">{param.type}</Badge>
                                  </TableCell>
                                  <TableCell className="py-1">
                                    {param.required ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-1 text-sm">
                                    {param.description || ''}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="examples">
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-6">
                {model.examples.map(example => (
                  <Card key={example.id} className="overflow-hidden">
                    <CardHeader className="py-3 bg-gray-50">
                      <CardTitle className="text-sm">{example.description}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-medium mb-2">Query</h4>
                          <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">
                            {example.query}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium mb-2">Parameters</h4>
                          <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">
                            <pre>{JSON.stringify(example.parameters, null, 2)}</pre>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <h4 className="text-xs font-medium">Result</h4>
                            <div className="text-xs text-gray-500">
                              Execution Time: {example.executionTime}ms
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md text-xs font-mono max-h-[200px] overflow-auto">
                            <pre>{JSON.stringify(example.result, null, 2)}</pre>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium mb-1">Explanation</h4>
                          <p className="text-sm text-gray-600">{example.explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex">
            {getComponentIcon()}
            <div className="ml-2">
              <CardTitle className={isMobile ? "text-base" : "text-lg"}>
                {detailModel.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {detailModel.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mt-0 -mr-2"
          >
            &times;
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderDetailContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex gap-2 text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              Updated {formatDate(detailModel.lastUpdated)}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Version {detailModel.version}
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
        >
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Use Component
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DetailedComponentView;