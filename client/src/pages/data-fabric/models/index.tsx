import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Boxes, Search, Link2, Plus, Compass, Shield,
  FilterX, ArrowDownUp, BarChart3, Network, Database, Code, ChevronsUpDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data models
const mockDataModels = [
  {
    id: "model-1",
    name: "Policy Contract",
    type: "Domain Model",
    description: "Core insurance policy data structure with coverage information",
    entityCount: 12,
    version: "2.3.1",
    lastUpdated: "2025-05-01T10:15:00Z",
    createdBy: "John Smith",
    status: "Active",
    entities: [
      { name: "Policy", fields: 15, relationships: 4 },
      { name: "Coverage", fields: 12, relationships: 2 },
      { name: "Insured", fields: 9, relationships: 3 },
      { name: "Premium", fields: 8, relationships: 1 }
    ],
    dataSources: [
      { id: 1, name: "Customer Policies Database" },
      { id: 3, name: "Product Catalog Service" }
    ]
  },
  {
    id: "model-2",
    name: "Customer Profile",
    type: "Domain Model",
    description: "Comprehensive customer information model with preferences",
    entityCount: 8,
    version: "1.5.0",
    lastUpdated: "2025-04-15T14:30:00Z",
    createdBy: "Sarah Johnson",
    status: "Active",
    entities: [
      { name: "Customer", fields: 24, relationships: 6 },
      { name: "Address", fields: 8, relationships: 1 },
      { name: "Preference", fields: 12, relationships: 1 },
      { name: "Communication", fields: 9, relationships: 2 }
    ],
    dataSources: [
      { id: 2, name: "Customer Policies Database" },
      { id: 8, name: "Customer CRM" }
    ]
  },
  {
    id: "model-3",
    name: "Claims Processing",
    type: "Domain Model",
    description: "Claims lifecycle and processing workflow",
    entityCount: 15,
    version: "3.1.2",
    lastUpdated: "2025-05-08T09:45:00Z",
    createdBy: "Michael Chen",
    status: "Active",
    entities: [
      { name: "Claim", fields: 20, relationships: 7 },
      { name: "ClaimItem", fields: 14, relationships: 2 },
      { name: "Assessment", fields: 18, relationships: 3 },
      { name: "Payment", fields: 12, relationships: 2 }
    ],
    dataSources: [
      { id: 1, name: "Claims Processing API" }
    ]
  },
  {
    id: "model-4",
    name: "Provider Network",
    type: "Domain Model",
    description: "Healthcare provider network and relationships",
    entityCount: 11,
    version: "2.0.5",
    lastUpdated: "2025-04-30T11:20:00Z",
    createdBy: "Emily Wilson",
    status: "Active",
    entities: [
      { name: "Provider", fields: 16, relationships: 5 },
      { name: "Facility", fields: 18, relationships: 3 },
      { name: "Specialty", fields: 7, relationships: 2 },
      { name: "Network", fields: 9, relationships: 4 }
    ],
    dataSources: [
      { id: 6, name: "Provider Network Service" }
    ]
  },
  {
    id: "model-5",
    name: "Insurance Products",
    type: "Domain Model",
    description: "Insurance product definitions and structure",
    entityCount: 9,
    version: "1.7.3",
    lastUpdated: "2025-03-22T16:15:00Z",
    createdBy: "David Kim",
    status: "Active",
    entities: [
      { name: "Product", fields: 14, relationships: 6 },
      { name: "Benefit", fields: 12, relationships: 3 },
      { name: "Pricing", fields: 15, relationships: 2 },
      { name: "Regulation", fields: 8, relationships: 2 }
    ],
    dataSources: [
      { id: 3, name: "Product Catalog Service" }
    ]
  },
  {
    id: "model-6",
    name: "Policy Analytics Schema",
    type: "Analytics Model",
    description: "Analytical data model for policy performance",
    entityCount: 7,
    version: "1.2.0",
    lastUpdated: "2025-05-10T14:35:00Z",
    createdBy: "Jessica Martinez",
    status: "Draft",
    entities: [
      { name: "PolicyPerformance", fields: 22, relationships: 4 },
      { name: "RiskMetric", fields: 15, relationships: 2 },
      { name: "TimeSegment", fields: 6, relationships: 3 }
    ],
    dataSources: [
      { id: 7, name: "Analytics Warehouse" }
    ]
  },
  {
    id: "model-7",
    name: "Consumer Knowledge Graph",
    type: "Knowledge Graph",
    description: "Customer relationship and behavior knowledge graph",
    entityCount: 14,
    version: "0.8.5",
    lastUpdated: "2025-05-05T10:30:00Z",
    createdBy: "Alex Thompson",
    status: "Experimental",
    entities: [
      { name: "Consumer", fields: 18, relationships: 12 },
      { name: "Behavior", fields: 9, relationships: 6 },
      { name: "Preference", fields: 11, relationships: 8 },
      { name: "Relationship", fields: 7, relationships: 15 }
    ],
    dataSources: [
      { id: 8, name: "Customer CRM" },
      { id: 7, name: "Analytics Warehouse" }
    ]
  },
  {
    id: "model-8",
    name: "Regulatory Compliance",
    type: "Compliance Model",
    description: "Regulatory requirements and compliance rules",
    entityCount: 18,
    version: "4.2.1",
    lastUpdated: "2025-04-25T09:10:00Z",
    createdBy: "Robert Williams",
    status: "Active",
    entities: [
      { name: "Regulation", fields: 12, relationships: 5 },
      { name: "Requirement", fields: 16, relationships: 8 },
      { name: "Jurisdiction", fields: 9, relationships: 4 },
      { name: "ComplianceRule", fields: 21, relationships: 7 }
    ],
    dataSources: [
      { id: 4, name: "Regulatory Compliance Database" }
    ]
  }
];

// Model type icons
const modelTypeIcons = {
  'Domain Model': <Boxes className="h-5 w-5 text-indigo-600" />,
  'Analytics Model': <BarChart3 className="h-5 w-5 text-green-600" />,
  'Knowledge Graph': <Compass className="h-5 w-5 text-amber-600" />,
  'Compliance Model': <Shield className="h-5 w-5 text-red-600" />
};

// Create model form component
function CreateModelForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Domain Model');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, would save to the backend
    toast({
      title: "Data model created",
      description: `${name} has been created successfully.`
    });
    
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Model Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter model name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Model Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select model type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Domain Model">Domain Model</SelectItem>
            <SelectItem value="Analytics Model">Analytics Model</SelectItem>
            <SelectItem value="Knowledge Graph">Knowledge Graph</SelectItem>
            <SelectItem value="Compliance Model">Compliance Model</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter model description"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Model</Button>
      </DialogFooter>
    </form>
  );
}

// Model card component
function ModelCard({ model }: { model: any }) {
  const [, setLocation] = useLocation();
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => setLocation(`/data-fabric/models/${model.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2">
              {modelTypeIcons[model.type as keyof typeof modelTypeIcons] || <Boxes className="h-5 w-5 text-indigo-600" />}
            </div>
            <CardTitle className="text-lg">{model.name}</CardTitle>
          </div>
          <Badge variant={model.status === 'Active' ? 'default' : model.status === 'Draft' ? 'outline' : 'secondary'}>
            {model.status}
          </Badge>
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Entities:</span> {model.entityCount}
          </div>
          <div>
            <span className="text-gray-500">Version:</span> {model.version}
          </div>
          <div>
            <span className="text-gray-500">Updated:</span> {new Date(model.lastUpdated).toLocaleDateString()}
          </div>
          <div>
            <span className="text-gray-500">Created by:</span> {model.createdBy}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex">
          {model.dataSources?.slice(0, 2).map((source: any, index: number) => (
            <div 
              key={source.id} 
              className={`h-8 w-8 rounded-full bg-neutrinos-blue/10 border-2 border-white flex items-center justify-center text-xs font-medium text-neutrinos-blue ${index > 0 ? '-ml-2' : ''}`}
              title={source.name}
            >
              {source.name.substring(0, 2)}
            </div>
          ))}
          {model.dataSources?.length > 2 && (
            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white -ml-2 flex items-center justify-center text-xs font-medium text-gray-600">
              +{model.dataSources.length - 2}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

// Main component
export default function DataModelsIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filter models based on search term and filters
  const filteredModels = mockDataModels.filter(model => {
    const matchesSearch = 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || model.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Data Models</h1>
            <p className="text-gray-600">Structured data definitions for your business domain</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                <Plus className="h-4 w-4 mr-2" /> Create Model
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Data Model</DialogTitle>
                <DialogDescription>
                  Define a new data model for your business domain.
                </DialogDescription>
              </DialogHeader>
              <CreateModelForm onClose={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search data models..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Domain Model">Domain Model</SelectItem>
                <SelectItem value="Analytics Model">Analytics Model</SelectItem>
                <SelectItem value="Knowledge Graph">Knowledge Graph</SelectItem>
                <SelectItem value="Compliance Model">Compliance Model</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" title="Reset filters" onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}>
              <FilterX className="h-4 w-4" />
            </Button>
            
            <div className="border-l mx-1"></div>
            
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="grid">
          {filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <Boxes className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No data models found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm flex items-center gap-1">
                      <span>Name</span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </th>
                    <th className="text-left p-3 font-medium text-sm">Type</th>
                    <th className="text-left p-3 font-medium text-sm">Entities</th>
                    <th className="text-left p-3 font-medium text-sm">Version</th>
                    <th className="text-left p-3 font-medium text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-sm">Updated</th>
                    <th className="text-right p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500">
                        No data models found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredModels.map(model => (
                      <tr key={model.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {modelTypeIcons[model.type as keyof typeof modelTypeIcons] || <Boxes className="h-4 w-4" />}
                            <span>{model.type}</span>
                          </div>
                        </td>
                        <td className="p-3">{model.entityCount}</td>
                        <td className="p-3">{model.version}</td>
                        <td className="p-3">
                          <Badge variant={model.status === 'Active' ? 'default' : model.status === 'Draft' ? 'outline' : 'secondary'}>
                            {model.status}
                          </Badge>
                        </td>
                        <td className="p-3">{new Date(model.lastUpdated).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}