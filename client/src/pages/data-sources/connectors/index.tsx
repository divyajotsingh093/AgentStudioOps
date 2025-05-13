import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, GitFork, ArrowLeftRight, Calendar, RefreshCw, Code, Plus, Search, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Mock data connectors (expanded from previous mock data)
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
    status: 'Active',
    createdAt: '2025-04-20T09:15:00Z',
    stats: {
      totalRecords: 125892,
      lastRunDuration: '00:03:45',
      successRate: 0.992,
      averageRuntime: '00:03:21'
    }
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
    status: 'Active',
    createdAt: '2025-02-15T11:30:00Z',
    stats: {
      totalRecords: 23487,
      lastRunDuration: '00:01:12',
      successRate: 1.0,
      averageRuntime: '00:01:18'
    }
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
    status: 'Inactive',
    createdAt: '2024-11-30T14:45:00Z',
    stats: {
      totalRecords: 5781,
      lastRunDuration: '00:00:45',
      successRate: 0.862,
      averageRuntime: '00:00:52'
    }
  },
  {
    id: 4,
    name: 'Provider Network Sync',
    description: 'Synchronizes healthcare provider data between systems',
    sourceId: 5,
    sourceName: 'Provider Management System',
    targetId: 6,
    targetName: 'Provider Network API',
    transformations: [
      {
        field: 'specialty',
        operation: 'normalize',
        rules: 'capitalize,trim'
      },
      {
        field: 'location',
        operation: 'geocode',
        provider: 'internal'
      }
    ],
    schedule: 'Daily at 4am',
    lastSyncedAt: '2025-05-13T04:00:00Z',
    status: 'Active',
    createdAt: '2025-01-10T09:20:00Z',
    stats: {
      totalRecords: 42156,
      lastRunDuration: '00:02:15',
      successRate: 0.984,
      averageRuntime: '00:02:22'
    }
  },
  {
    id: 5,
    name: 'Policy Document Archival',
    description: 'Archives policy documents to long-term storage',
    sourceId: 2,
    sourceName: 'Customer Policies Database',
    targetId: 10,
    targetName: 'Document Archive Storage',
    transformations: [
      {
        field: 'content',
        operation: 'compress',
        algorithm: 'gzip'
      }
    ],
    schedule: 'Monthly on 1st',
    lastSyncedAt: '2025-05-01T01:00:00Z',
    status: 'Active',
    createdAt: '2024-12-05T16:45:00Z',
    stats: {
      totalRecords: 352891,
      lastRunDuration: '00:18:35',
      successRate: 0.998,
      averageRuntime: '00:17:45'
    }
  }
];

// Mock data sources for source/target selection
const mockDataSources = [
  { id: 1, name: 'Claims Processing API', type: 'API' },
  { id: 2, name: 'Customer Policies Database', type: 'Database' },
  { id: 3, name: 'Product Catalog Service', type: 'API' },
  { id: 4, name: 'Regulatory Compliance Database', type: 'Database' },
  { id: 5, name: 'Provider Management System', type: 'Database' },
  { id: 6, name: 'Provider Network API', type: 'API' },
  { id: 7, name: 'Analytics Warehouse', type: 'Database' },
  { id: 8, name: 'Customer CRM', type: 'API' },
  { id: 9, name: 'External Regulatory Feed', type: 'API' },
  { id: 10, name: 'Document Archive Storage', type: 'File' }
];

// Data connector card component
const DataConnectorCard: React.FC<{ connector: any }> = ({ connector }) => {
  const [, setLocation] = useLocation();
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-gray-500">Source</Label>
            <div className="font-medium">{connector.sourceName}</div>
          </div>
          <div>
            <Label className="text-gray-500">Target</Label>
            <div className="font-medium">{connector.targetName}</div>
          </div>
          <div>
            <Label className="text-gray-500">Schedule</Label>
            <div className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {connector.schedule}
            </div>
          </div>
          <div>
            <Label className="text-gray-500">Last Synced</Label>
            <div className="font-medium">
              {connector.lastSyncedAt ? new Date(connector.lastSyncedAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <span className="text-xs text-gray-500">ID: {connector.id}</span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast({
              title: "Sync started",
              description: `Manual sync started for ${connector.name}.`
            })}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation(`/data-sources/connectors/${connector.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Connector create form component
const ConnectorCreateForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [schedule, setSchedule] = useState('Daily');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send data to the API
    toast({
      title: "Connector created",
      description: `${name} connector has been created successfully.`
    });
    
    onClose();
  };
  
  // Filter out the selected source from target options
  const targetOptions = mockDataSources.filter(ds => ds.id.toString() !== sourceId);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter connector name" 
          required 
        />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source Data Source</Label>
          <Select value={sourceId} onValueChange={setSourceId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {mockDataSources.map(source => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  {source.name} ({source.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="target">Target Data Source</Label>
          <Select 
            value={targetId} 
            onValueChange={setTargetId} 
            required
            disabled={!sourceId}
          >
            <SelectTrigger>
              <SelectValue placeholder={sourceId ? "Select target" : "Select source first"} />
            </SelectTrigger>
            <SelectContent>
              {targetOptions.map(target => (
                <SelectItem key={target.id} value={target.id.toString()}>
                  {target.name} ({target.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="schedule">Sync Schedule</Label>
        <Select value={schedule} onValueChange={setSchedule} required>
          <SelectTrigger>
            <SelectValue placeholder="Select schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Manual">Manual only</SelectItem>
            <SelectItem value="Hourly">Hourly</SelectItem>
            <SelectItem value="Daily">Daily</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center justify-between">
          <span>Transformations</span>
          <span className="text-xs text-gray-500">(Optional - can be configured later)</span>
        </Label>
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-sm text-gray-500 mb-2">Configure data transformations after connector creation</p>
          <Button type="button" variant="outline" size="sm" disabled>
            <Code className="h-4 w-4 mr-2" />
            Add Transformation
          </Button>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={!name || !sourceId || !targetId}
        >
          Create Connector
        </Button>
      </DialogFooter>
    </form>
  );
};

// Main page component
export default function DataConnectorsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filter connectors based on search and status
  const filteredConnectors = mockDataConnectors.filter(connector => {
    const matchesSearch = 
      connector.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      connector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || connector.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Connector stats
  const totalConnectors = mockDataConnectors.length;
  const activeConnectors = mockDataConnectors.filter(c => c.status === 'Active').length;
  const inactiveConnectors = totalConnectors - activeConnectors;
  
  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => setLocation('/data-sources')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Data Sources
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Data Connectors</h1>
            <p className="text-gray-600">Manage data flows between different data sources</p>
          </div>
          
          <Button 
            className="bg-neutrinos-blue hover:bg-neutrinos-blue/90"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Connector
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <GitFork className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Connectors</p>
              <p className="text-2xl font-bold">{totalConnectors}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <ArrowLeftRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Connectors</p>
              <p className="text-2xl font-bold">{activeConnectors}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Connectors</p>
              <p className="text-2xl font-bold">{inactiveConnectors}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search connectors..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </div>
        </div>
          
        <TabsContent value="grid">
          {filteredConnectors.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No connectors found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnectors.map((connector) => (
                <DataConnectorCard key={connector.id} connector={connector} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source → Target</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConnectors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No connectors found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConnectors.map((connector) => (
                      <TableRow key={connector.id}>
                        <TableCell className="font-medium">{connector.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{connector.sourceName}</span>
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>{connector.targetName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{connector.schedule}</TableCell>
                        <TableCell>
                          {connector.lastSyncedAt 
                            ? new Date(connector.lastSyncedAt).toLocaleDateString() 
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={connector.status === 'Active' ? 'default' : 'outline'}>
                            {connector.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setLocation(`/data-sources/connectors/${connector.id}`)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast({
                              title: "Sync started",
                              description: `Manual sync started for ${connector.name}.`
                            })}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create connector dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Data Connector</DialogTitle>
            <DialogDescription>
              Define a new data flow between two data sources. You can configure transformations after creating the connector.
            </DialogDescription>
          </DialogHeader>
          
          <ConnectorCreateForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}