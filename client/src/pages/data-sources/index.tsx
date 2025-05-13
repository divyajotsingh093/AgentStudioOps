import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Database, FileIcon, Sliders, ArrowDownUp, Webhook, GitFork, Network } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Types
interface DataSource {
  id: number;
  name: string;
  type: string;
  description: string;
  connectionConfig: any;
  schema: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for demonstration
const mockDataSources: DataSource[] = [
  {
    id: 1,
    name: 'Claims Processing API',
    type: 'API',
    description: 'System handling claims processing and benefit utilization',
    connectionConfig: {
      type: 'REST API',
      baseUrl: 'https://claims-api.insurance.internal/v2',
      authentication: 'OAuth2'
    },
    schema: {
      endpoints: ['/claims', '/benefits/utilization', '/eligibility'],
      average_response_time: 120
    },
    status: 'Active',
    createdAt: '2025-04-15T10:00:00Z',
    updatedAt: '2025-05-10T14:30:00Z'
  },
  {
    id: 2,
    name: 'Customer Policies Database',
    type: 'Database',
    description: 'Main database for customer policy information',
    connectionConfig: {
      type: 'PostgreSQL',
      host: 'db.insurance.internal',
      port: 5432,
      database: 'policies_production'
    },
    schema: {
      tables: ['policies', 'customers', 'coverage', 'payments'],
      record_count: 450000
    },
    status: 'Active',
    createdAt: '2024-11-20T09:15:00Z',
    updatedAt: '2025-05-01T11:45:00Z'
  },
  {
    id: 3,
    name: 'Product Catalog Service',
    type: 'API',
    description: 'Service providing insurance product details and configuration',
    connectionConfig: {
      type: 'GraphQL',
      endpoint: 'https://products-api.insurance.internal/graphql',
      authentication: 'API Key'
    },
    schema: {
      entities: ['Product', 'Option', 'Pricing', 'Availability'],
      operations: ['query', 'mutation']
    },
    status: 'Active',
    createdAt: '2025-01-10T15:30:00Z',
    updatedAt: '2025-04-25T16:20:00Z'
  },
  {
    id: 4,
    name: 'Regulatory Compliance Database',
    type: 'Database',
    description: 'Database of regulatory requirements for benefit coverage',
    connectionConfig: {
      type: 'Oracle',
      host: 'regdb.insurance.internal',
      sid: 'REGCOMP'
    },
    schema: {
      tables: ['regulations', 'coverage_requirements', 'state_mandates'],
      record_count: 75000
    },
    status: 'Inactive',
    createdAt: '2024-08-05T11:00:00Z',
    updatedAt: '2025-03-15T09:30:00Z'
  },
  {
    id: 5,
    name: 'Document Storage System',
    type: 'File',
    description: 'System for storing and retrieving policy documents and claims evidence',
    connectionConfig: {
      type: 'S3 Compatible',
      endpoint: 's3.insurance.internal',
      buckets: ['policy-documents', 'claim-evidence', 'customer-uploads']
    },
    schema: {
      file_types: ['PDF', 'JPEG', 'PNG', 'DOCX'],
      total_size: '1.2TB'
    },
    status: 'Active',
    createdAt: '2024-10-12T08:45:00Z',
    updatedAt: '2025-04-30T10:15:00Z'
  },
  {
    id: 6,
    name: 'Provider Network Service',
    type: 'API',
    description: 'Service for accessing healthcare provider network information',
    connectionConfig: {
      type: 'REST API',
      baseUrl: 'https://providers-api.insurance.internal/v1',
      authentication: 'OAuth2'
    },
    schema: {
      endpoints: ['/providers', '/specialties', '/locations', '/services'],
      average_response_time: 150
    },
    status: 'Active',
    createdAt: '2025-02-18T13:20:00Z',
    updatedAt: '2025-05-08T17:45:00Z'
  }
];

// Data source type icons
const typeIcons = {
  'Database': <Database className="h-5 w-5" />,
  'API': <Network className="h-5 w-5" />,
  'File': <FileIcon className="h-5 w-5" />,
  'Stream': <Sliders className="h-5 w-5" />,
  'Custom': <Webhook className="h-5 w-5" />
};

// Component for displaying a data source card
const DataSourceCard: React.FC<{ dataSource: DataSource }> = ({ dataSource }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              {typeIcons[dataSource.type as keyof typeof typeIcons] || <Database className="h-5 w-5" />}
            </div>
            <CardTitle className="text-lg">{dataSource.name}</CardTitle>
          </div>
          <Badge variant={dataSource.status === 'Active' ? 'default' : 'outline'}>
            {dataSource.status}
          </Badge>
        </div>
        <CardDescription>{dataSource.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>{' '}
            {dataSource.connectionConfig.type}
          </div>
          <div>
            <span className="font-medium text-gray-700">Updated:</span>{' '}
            {new Date(dataSource.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {dataSource.id}</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Data connector card component
const DataConnectorCard: React.FC<{ connector: any }> = ({ connector }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <GitFork className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-lg">{connector.name}</CardTitle>
          </div>
          <Badge variant={connector.status === 'Active' ? 'default' : 'outline'}>
            {connector.status}
          </Badge>
        </div>
        <CardDescription>{connector.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Source:</span>{' '}
            {connector.sourceName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Target:</span>{' '}
            {connector.targetName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Schedule:</span>{' '}
            {connector.schedule}
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Synced:</span>{' '}
            {connector.lastSyncedAt ? new Date(connector.lastSyncedAt).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {connector.id}</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Create data source form component
const CreateDataSourceForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [connectionConfig, setConnectionConfig] = useState('{}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse connection config to ensure it's valid JSON
      const parsedConfig = JSON.parse(connectionConfig);
      
      // In a real application, we would submit to the API
      // await fetch('/api/data-sources', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name,
      //     description,
      //     type,
      //     connectionConfig: parsedConfig
      //   })
      // });
      
      toast({
        title: "Data source created",
        description: `${name} has been created successfully.`,
      });
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error creating data source",
        description: "Please check the connection configuration JSON format.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter data source name" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={setType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select data source type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Database">Database</SelectItem>
            <SelectItem value="API">API</SelectItem>
            <SelectItem value="File">File Storage</SelectItem>
            <SelectItem value="Stream">Data Stream</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter a description" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="connectionConfig">Connection Configuration (JSON)</Label>
        <textarea 
          id="connectionConfig" 
          value={connectionConfig} 
          onChange={(e) => setConnectionConfig(e.target.value)} 
          placeholder='{"host": "example.com", "port": 5432, ...}'
          className="w-full min-h-[100px] p-2 border rounded-md" 
          required 
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Data Source</Button>
      </DialogFooter>
    </form>
  );
};

// Mock data connectors
const mockDataConnectors = [
  {
    id: 1,
    name: 'Claims to Analytics Sync',
    description: 'Synchronizes claims data to analytics database',
    sourceId: 1,
    sourceName: 'Claims Processing API',
    targetId: 7,
    targetName: 'Analytics Warehouse',
    transformations: [
      {
        field: 'claimStatus',
        operation: 'map',
        mapping: { 'PENDING': 'In Progress', 'APPROVED': 'Completed', 'DENIED': 'Rejected' }
      }
    ],
    schedule: 'Every 6 hours',
    lastSyncedAt: '2025-05-12T18:30:00Z',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Customer Data Integration',
    description: 'Integrates customer data from CRM to policy database',
    sourceId: 8,
    sourceName: 'Customer CRM',
    targetId: 2,
    targetName: 'Customer Policies Database',
    transformations: [
      {
        field: 'address',
        operation: 'format',
        template: '{{line1}}, {{city}}, {{state}} {{zip}}'
      }
    ],
    schedule: 'Daily at midnight',
    lastSyncedAt: '2025-05-12T00:00:00Z',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Regulatory Updates Pipeline',
    description: 'Updates regulatory compliance data from external source',
    sourceId: 9,
    sourceName: 'External Regulatory Feed',
    targetId: 4,
    targetName: 'Regulatory Compliance Database',
    transformations: [],
    schedule: 'Weekly on Monday',
    lastSyncedAt: '2025-05-06T08:00:00Z',
    status: 'Active'
  }
];

// Main Data Sources page
export default function DataSourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // In a real application, we would fetch data from the API
  // const { data: dataSources, isLoading, error } = useQuery({
  //   queryKey: ['/api/data-sources'],
  //   queryFn: async () => {
  //     const res = await fetch('/api/data-sources');
  //     if (!res.ok) throw new Error('Failed to fetch data sources');
  //     return res.json();
  //   }
  // });

  // Using mock data for now
  const dataSources = mockDataSources;
  
  // Filter data sources based on search term, type and status
  const filteredDataSources = dataSources.filter(source => {
    const matchesSearch = 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      source.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || source.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Fabric</h1>
          <p className="text-gray-600">Manage data sources and connections for your AI agents</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
              <Plus className="h-4 w-4 mr-2" /> Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Data Source</DialogTitle>
              <DialogDescription>
                Define a new data source to connect your AI agents to external systems.
              </DialogDescription>
            </DialogHeader>
            <CreateDataSourceForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="data-sources" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="connectors">Data Connectors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-sources">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search data sources..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="File">File</SelectItem>
                    <SelectItem value="Stream">Stream</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {filteredDataSources.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">No data sources found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredDataSources.map((source) => (
                  <DataSourceCard key={source.id} dataSource={source} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="connectors">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input placeholder="Search data connectors..." className="pl-9" />
              </div>
              <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                <Plus className="h-4 w-4 mr-2" /> Add Connector
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {mockDataConnectors.map((connector) => (
                <DataConnectorCard key={connector.id} connector={connector} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}