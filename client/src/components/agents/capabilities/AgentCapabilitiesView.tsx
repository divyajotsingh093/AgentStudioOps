import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Download, 
  Search, 
  ArrowUpRight, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Calendar,
  BarChart,
  Workflow,
  FileText,
  Layers,
  Code,
  ChevronsUpDown
} from 'lucide-react';
import { 
  AgentCapability, 
  RuleDefinition, 
  LogicFlow,
  underwritingRules,
  decisionLogicFlows,
  agentCapabilities
} from '@/lib/mock-capabilities';
import { useViewport } from '@/hooks/use-viewport';

interface AgentCapabilitiesViewProps {
  onCreateCapability: (type: string) => void;
  onExport: () => void;
  onUseCapability: (capability: AgentCapability | RuleDefinition | LogicFlow) => void;
  onEdit: (capability: AgentCapability | RuleDefinition | LogicFlow) => void;
}

const AgentCapabilitiesView: React.FC<AgentCapabilitiesViewProps> = ({
  onCreateCapability,
  onExport,
  onUseCapability,
  onEdit
}) => {
  const { isMobile, screenSize } = useViewport();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('capabilities');
  const [expandedLogicFlow, setExpandedLogicFlow] = useState<string | null>(null);
  
  // Filter capabilities by search term
  const filteredCapabilities = agentCapabilities.filter(cap => 
    cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cap.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter rules by search term
  const filteredRules = underwritingRules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.action.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter logic flows by search term
  const filteredLogicFlows = decisionLogicFlows.filter(flow => 
    flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group capabilities by type
  const groupedCapabilities = filteredCapabilities.reduce((acc, capability) => {
    if (!acc[capability.type]) {
      acc[capability.type] = [];
    }
    acc[capability.type].push(capability);
    return acc;
  }, {} as Record<string, AgentCapability[]>);

  // Helper to format dates
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get appropriate icon for capability type
  const getCapabilityIcon = (type: string) => {
    switch(type) {
      case 'Rules':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'Logic':
        return <Code className="h-4 w-4 text-purple-600" />;
      case 'Workflow':
        return <Workflow className="h-4 w-4 text-green-600" />;
      case 'Forms':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'Document':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'Integration':
        return <ArrowRight className="h-4 w-4 text-cyan-600" />;
      case 'Orchestration':
        return <ChevronsUpDown className="h-4 w-4 text-indigo-600" />;
      case 'Data':
        return <Layers className="h-4 w-4 text-teal-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Available':
      case 'Active':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Restricted':
        return (
          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Draft':
      case 'Testing':
      case 'Inactive':
        return (
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Agent Capabilities</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={onExport}
          >
            <Download className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {isMobile ? 'Export' : 'Export Capabilities'}
          </Button>
          <Button 
            className="bg-neutrinos-blue hover:bg-neutrinos-blue/90"
            size={isMobile ? "sm" : "default"}
            onClick={() => onCreateCapability(activeTab === 'rules' ? 'rule' : activeTab === 'logic' ? 'logic' : 'capability')}
          >
            <Plus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {isMobile ? 'New' : `New ${activeTab === 'rules' ? 'Rule' : activeTab === 'logic' ? 'Logic' : 'Capability'}`}
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder={`Search ${activeTab}...`}
            className="pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="rules">Business Rules</TabsTrigger>
            <TabsTrigger value="logic">Logic Flows</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <TabsContent value="capabilities" className="m-0">
            {Object.entries(groupedCapabilities).map(([type, capabilities]) => (
              <div key={type} className="mb-8">
                <div className="flex items-center mb-4">
                  {getCapabilityIcon(type)}
                  <h3 className="text-md font-semibold ml-2">{type} Capabilities</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {capabilities.map(capability => (
                    <Card key={capability.id} className="overflow-hidden border-l-4 border-l-neutrinos-blue hover:shadow-md transition-all">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-md font-semibold">{capability.name}</CardTitle>
                          {getStatusBadge(capability.status)}
                        </div>
                        <CardDescription className="text-sm">
                          {capability.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-0 pb-2">
                        <div className="text-xs text-gray-600 space-y-1">
                          {capability.version && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Version:</span>
                              <span>{capability.version}</span>
                            </div>
                          )}
                          {capability.author && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Author:</span>
                              <span>{capability.author}</span>
                            </div>
                          )}
                          {capability.lastUsed && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Last Used:</span>
                              <span>{formatDate(capability.lastUsed)}</span>
                            </div>
                          )}
                        </div>
                        
                        {capability.examples && capability.examples.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-xs font-medium text-gray-700 mb-1">Examples:</h4>
                            <ul className="text-xs text-gray-600 list-disc pl-4">
                              {capability.examples.slice(0, 2).map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-2 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(capability)}
                          className="text-gray-600 hover:text-gray-900 text-xs"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50 text-xs"
                          onClick={() => onUseCapability(capability)}
                        >
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedCapabilities).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No capabilities found matching your search.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rules" className="m-0">
            <div className="bg-white rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Rule Name</TableHead>
                    {!isMobile && <TableHead>Description</TableHead>}
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      {!isMobile && <TableCell>{rule.description}</TableCell>}
                      <TableCell>{rule.category}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={rule.priority <= 2 ? "default" : "outline"} 
                          className={rule.priority <= 2 ? "bg-red-100 text-red-800 hover:bg-red-100" : ""}
                        >
                          P{rule.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(rule.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEdit(rule)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Edit</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onUseCapability(rule)}
                            className="h-8 w-8 p-0 text-neutrinos-blue"
                          >
                            <span className="sr-only">Use</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredRules.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No rules found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="logic" className="m-0">
            <div className="space-y-4">
              {filteredLogicFlows.map(flow => (
                <Card key={flow.id} className="overflow-hidden">
                  <CardHeader className="p-4 cursor-pointer hover:bg-gray-50" 
                    onClick={() => setExpandedLogicFlow(expandedLogicFlow === flow.id ? null : flow.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <CardTitle className="text-md font-semibold">{flow.name}</CardTitle>
                          <ChevronsUpDown className="h-4 w-4 ml-2 text-gray-400" />
                        </div>
                        <CardDescription className="text-sm">
                          {flow.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(flow.status)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(flow.lastModified || flow.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedLogicFlow === flow.id && (
                    <>
                      <CardContent className="p-4 pt-0">
                        <Separator className="my-4" />
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Logic Flow Steps:</h4>
                          <div className="space-y-3">
                            {flow.steps.map((step, index) => (
                              <div key={step.id} className="pl-4 border-l-2 border-gray-200">
                                <div className="flex items-start">
                                  <div className="bg-gray-100 text-gray-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium">{step.name}</h5>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                    <div className="mt-1 flex items-center text-xs text-gray-600">
                                      <Badge className="mr-1">{step.type}</Badge>
                                      {step.nextSteps.length > 0 && (
                                        <span>Next: {step.nextSteps.join(', ')}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(flow)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit Flow
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-neutrinos-blue hover:text-neutrinos-blue/90 hover:bg-blue-50"
                          onClick={() => onUseCapability(flow)}
                        >
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Use Flow
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
              
              {filteredLogicFlows.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No logic flows found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentCapabilitiesView;