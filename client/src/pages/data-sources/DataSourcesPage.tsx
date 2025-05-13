import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Database, FileIcon, Sliders, ArrowDownUp, Webhook, GitFork, Network, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { ResponsiveDataGrid, Column } from '@/components/shared/ResponsiveDataGrid';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { useResponsive } from '@/hooks/use-responsive';

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

interface DataConnector {
  id: number;
  name: string;
  description: string;
  sourceId: number;
  sourceName: string;
  targetId: number;
  targetName: string;
  transformations: any[];
  schedule: string;
  lastSyncedAt: string | null;
  status: string;
}

// Mock data for demonstration
// This would be replaced with real data from API calls in production
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

// Mock data connectors
const mockDataConnectors: DataConnector[] = [
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

// Data source type icons
const typeIcons = {
  'Database': <Database className="h-5 w-5" />,
  'API': <Network className="h-5 w-5" />,
  'File': <FileIcon className="h-5 w-5" />,
  'Stream': <Sliders className="h-5 w-5" />,
  'Custom': <Webhook className="h-5 w-5" />
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

// Main Data Sources page
export default function DataSourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { isMobile, isTablet } = useResponsive();
  
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
  const isLoading = false;
  
  // Filter data sources based on search term, type and status
  const filteredDataSources = dataSources.filter(source => {
    const matchesSearch = 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      source.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || source.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Data source columns
  const dataSourceColumns: Column<DataSource>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (item: DataSource) => (
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
            {typeIcons[item.type as keyof typeof typeIcons] || <Database className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-gray-500">{item.connectionConfig?.type}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      cell: (item: DataSource) => item.type,
      sortable: true,
      minWidth: "md"
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: DataSource) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      ),
      sortable: true,
      minWidth: "sm"
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      cell: (item: DataSource) => new Date(item.updatedAt).toLocaleDateString(),
      sortable: true,
      minWidth: "lg"
    }
  ];
  
  // Data connector columns
  const dataConnectorColumns: Column<DataConnector>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (item: DataConnector) => (
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg text-green-600 shrink-0">
            <GitFork className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-gray-500">{item.schedule}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'source',
      header: 'Source',
      cell: (item: DataConnector) => item.sourceName,
      sortable: true,
      minWidth: "md"
    },
    {
      key: 'target',
      header: 'Target',
      cell: (item: DataConnector) => item.targetName,
      sortable: true,
      minWidth: "md"
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: DataConnector) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      ),
      sortable: true,
      minWidth: "sm"
    },
    {
      key: 'lastSyncedAt',
      header: 'Last Synced',
      cell: (item: DataConnector) => 
        item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleDateString() : 'Never',
      sortable: true,
      minWidth: "lg"
    }
  ];
  
  // Card view render functions
  const renderDataSourceCard = (item: DataSource, isMobile: boolean) => (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              {typeIcons[item.type as keyof typeof typeIcons] || <Database className="h-5 w-5" />}
            </div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
          </div>
          <Badge variant={item.status === 'Active' ? 'default' : 'outline'}>
            {item.status}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>{' '}
            {item.connectionConfig.type}
          </div>
          <div>
            <span className="font-medium text-gray-700">Updated:</span>{' '}
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {item.id}</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </>
  );
  
  const renderDataConnectorCard = (item: DataConnector, isMobile: boolean) => (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <GitFork className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
          </div>
          <Badge variant={item.status === 'Active' ? 'default' : 'outline'}>
            {item.status}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Source:</span>{' '}
            {item.sourceName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Target:</span>{' '}
            {item.targetName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Schedule:</span>{' '}
            {item.schedule}
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Synced:</span>{' '}
            {item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {item.id}</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </>
  );

  // Filter components
  const dataSourceFilters = (
    <div className={`flex flex-col lg:flex-row gap-2 lg:items-center ${!showFilters && isMobile ? 'hidden' : 'block'}`}>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="API">API</SelectItem>
          <SelectItem value="Database">Database</SelectItem>
          <SelectItem value="File">File Storage</SelectItem>
          <SelectItem value="Stream">Data Stream</SelectItem>
          <SelectItem value="Custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
            <ResponsiveDataGrid
              data={filteredDataSources}
              columns={dataSourceColumns}
              keyField="id"
              title="Data Sources"
              description={`${filteredDataSources.length} data sources available`}
              isLoading={isLoading}
              emptyMessage="No data sources found. Add your first data source to get started."
              onRowClick={(item) => console.log('Clicked', item)}
              initialView="grid"
              gridCardContent={renderDataSourceCard}
              filters={
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex md:items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search data sources..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {isMobile && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!isMobile && dataSourceFilters}
                </div>
              }
              actionBar={isMobile && dataSourceFilters}
            />
          </TabsContent>
          
          <TabsContent value="connectors">
            <ResponsiveDataGrid
              data={mockDataConnectors}
              columns={dataConnectorColumns}
              keyField="id"
              title="Data Connectors"
              description={`${mockDataConnectors.length} connectors configured`}
              isLoading={isLoading}
              emptyMessage="No data connectors found. Create a connector to integrate your data sources."
              onRowClick={(item) => console.log('Clicked', item)}
              initialView="grid"
              gridCardContent={renderDataConnectorCard}
              filters={
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input placeholder="Search data connectors..." className="pl-9" />
                  </div>
                  <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                    <Plus className="h-4 w-4 mr-2" /> Add Connector
                  </Button>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}