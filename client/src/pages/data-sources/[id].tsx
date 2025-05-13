import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Database, Network, FileIcon, Sliders, Edit, Trash2, RefreshCw, Plus, Users, Key, AlertTriangle, CheckCircle, ArrowLeft, Webhook, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Same mock data used in the index page
const mockDataSources = [
  {
    id: 1,
    name: 'Claims Processing API',
    type: 'API',
    description: 'System handling claims processing and benefit utilization',
    connectionConfig: {
      type: 'REST API',
      baseUrl: 'https://claims-api.insurance.internal/v2',
      authentication: 'OAuth2',
      authType: 'Bearer Token',
      tokenUrl: 'https://claims-api.insurance.internal/oauth/token',
      clientId: 'claims-agent-client',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    schema: {
      endpoints: ['/claims', '/benefits/utilization', '/eligibility'],
      average_response_time: 120,
      dataModels: [
        {
          name: 'Claim',
          fields: [
            { name: 'id', type: 'string', description: 'Unique claim identifier' },
            { name: 'policyNumber', type: 'string', description: 'Associated policy number' },
            { name: 'claimType', type: 'string', description: 'Type of claim (e.g., Medical, Dental)' },
            { name: 'submissionDate', type: 'date', description: 'Date the claim was submitted' },
            { name: 'status', type: 'string', description: 'Current claim status' },
            { name: 'amount', type: 'number', description: 'Claim amount requested' }
          ]
        },
        {
          name: 'Benefit',
          fields: [
            { name: 'id', type: 'string', description: 'Unique benefit identifier' },
            { name: 'name', type: 'string', description: 'Benefit name' },
            { name: 'coveragePercentage', type: 'number', description: 'Percentage of coverage' },
            { name: 'annualLimit', type: 'number', description: 'Annual limit amount' }
          ]
        }
      ]
    },
    status: 'Active',
    lastChecked: '2025-05-13T08:30:00Z',
    healthStatus: 'Healthy',
    createdAt: '2025-04-15T10:00:00Z',
    updatedAt: '2025-05-10T14:30:00Z',
    createdBy: 'John Doe',
    recentActivity: [
      { type: 'Connection Test', status: 'Success', timestamp: '2025-05-13T08:30:00Z', details: 'Response time: 115ms' },
      { type: 'Schema Update', status: 'Success', timestamp: '2025-05-10T14:30:00Z', details: 'Added 2 new endpoints' },
      { type: 'Connection Error', status: 'Failure', timestamp: '2025-05-08T22:15:00Z', details: 'Timeout after 30s' }
    ]
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
      database: 'policies_production',
      username: 'policy_reader',
      ssl: true,
      connectionPoolSize: 10
    },
    schema: {
      tables: ['policies', 'customers', 'coverage', 'payments'],
      record_count: 450000,
      relationships: [
        { source: 'policies', target: 'customers', relationship: 'many-to-one' },
        { source: 'policies', target: 'coverage', relationship: 'one-to-many' },
        { source: 'policies', target: 'payments', relationship: 'one-to-many' }
      ],
      tableDetails: [
        {
          name: 'policies',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'customer_id', type: 'UUID', isReference: true },
            { name: 'policy_number', type: 'VARCHAR(20)', isUnique: true },
            { name: 'start_date', type: 'DATE' },
            { name: 'end_date', type: 'DATE' },
            { name: 'status', type: 'VARCHAR(10)' },
            { name: 'premium', type: 'DECIMAL(10,2)' }
          ]
        },
        {
          name: 'customers',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'first_name', type: 'VARCHAR(100)' },
            { name: 'last_name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(255)', isUnique: true },
            { name: 'date_of_birth', type: 'DATE' },
            { name: 'address', type: 'TEXT' }
          ]
        }
      ]
    },
    status: 'Active',
    lastChecked: '2025-05-13T09:15:00Z',
    healthStatus: 'Healthy',
    createdAt: '2024-11-20T09:15:00Z',
    updatedAt: '2025-05-01T11:45:00Z',
    createdBy: 'Jane Smith',
    recentActivity: [
      { type: 'Connection Test', status: 'Success', timestamp: '2025-05-13T09:15:00Z', details: 'Response time: 45ms' },
      { type: 'Table Changed', status: 'Info', timestamp: '2025-05-01T11:45:00Z', details: 'Added column to payments table' }
    ]
  },
  {
    id: 3,
    name: 'Product Catalog Service',
    type: 'API',
    description: 'Service providing insurance product details and configuration',
    connectionConfig: {
      type: 'GraphQL',
      endpoint: 'https://products-api.insurance.internal/graphql',
      authentication: 'API Key',
      apiKeyHeaderName: 'X-API-Key',
      headers: {
        'Content-Type': 'application/json'
      },
      defaultTimeout: 5000
    },
    schema: {
      entities: ['Product', 'Option', 'Pricing', 'Availability'],
      operations: ['query', 'mutation'],
      queries: [
        { name: 'getProduct', description: 'Fetch product by ID' },
        { name: 'listProducts', description: 'Fetch all products with filtering' },
        { name: 'getProductOptions', description: 'Fetch options for a product' }
      ]
    },
    status: 'Active',
    lastChecked: '2025-05-13T07:45:00Z',
    healthStatus: 'Healthy',
    createdAt: '2025-01-10T15:30:00Z',
    updatedAt: '2025-04-25T16:20:00Z',
    createdBy: 'Michael Chen',
    recentActivity: [
      { type: 'Connection Test', status: 'Success', timestamp: '2025-05-13T07:45:00Z', details: 'Response time: 220ms' },
      { type: 'Schema Update', status: 'Success', timestamp: '2025-04-25T16:20:00Z', details: 'Added new query' }
    ]
  },
  {
    id: 4,
    name: 'Regulatory Compliance Database',
    type: 'Database',
    description: 'Database of regulatory requirements for benefit coverage',
    connectionConfig: {
      type: 'Oracle',
      host: 'regdb.insurance.internal',
      sid: 'REGCOMP',
      username: 'compliance_reader',
      port: 1521,
      ssl: true
    },
    schema: {
      tables: ['regulations', 'coverage_requirements', 'state_mandates'],
      record_count: 75000
    },
    status: 'Inactive',
    lastChecked: '2025-05-10T14:30:00Z',
    healthStatus: 'Unhealthy',
    createdAt: '2024-08-05T11:00:00Z',
    updatedAt: '2025-03-15T09:30:00Z',
    createdBy: 'Sarah Johnson',
    recentActivity: [
      { type: 'Connection Test', status: 'Failure', timestamp: '2025-05-10T14:30:00Z', details: 'Connection refused' },
      { type: 'Status Change', status: 'Warning', timestamp: '2025-05-10T14:35:00Z', details: 'Source marked as Inactive' }
    ]
  }
];

// Mock permissions data
const mockPermissions = [
  { id: 1, dataSourceId: 1, userId: 101, userName: 'John Doe', agentId: 'accel-uw', agentName: 'Accelerated UW Agent', permissionType: 'Read', createdAt: '2025-04-20T10:15:00Z' },
  { id: 2, dataSourceId: 1, userId: 102, userName: 'Jane Smith', agentId: null, agentName: null, permissionType: 'Admin', createdAt: '2025-04-22T14:30:00Z' },
  { id: 3, dataSourceId: 1, userId: null, userName: null, agentId: 'claims-fast', agentName: 'Fast Claims Processor', permissionType: 'Read', createdAt: '2025-05-01T09:45:00Z' }
];

// Data source type icons
const typeIcons = {
  'Database': <Database className="h-5 w-5" />,
  'API': <Network className="h-5 w-5" />,
  'File': <FileIcon className="h-5 w-5" />,
  'Stream': <Sliders className="h-5 w-5" />,
  'Custom': <Webhook className="h-5 w-5" />
};

// Permission form component
const PermissionForm: React.FC<{ onClose: () => void, dataSourceId: number }> = ({ onClose, dataSourceId }) => {
  const [permissionType, setPermissionType] = useState('Read');
  const [userOrAgent, setUserOrAgent] = useState('agent');
  const [selectedId, setSelectedId] = useState('');
  
  // Mock users and agents for select inputs
  const users = [
    { id: 101, name: 'John Doe' },
    { id: 102, name: 'Jane Smith' },
    { id: 103, name: 'Michael Chen' },
    { id: 104, name: 'Sarah Johnson' }
  ];
  
  const agents = [
    { id: 'accel-uw', name: 'Accelerated UW Agent' },
    { id: 'claims-fast', name: 'Fast Claims Processor' },
    { id: 'service-bot', name: 'Customer Service Bot' },
    { id: 'fraud-detect', name: 'Fraud Detection Agent' }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the permission object based on form state
    const permission = {
      dataSourceId,
      permissionType,
      ...(userOrAgent === 'user' 
        ? { userId: parseInt(selectedId), userName: users.find(u => u.id.toString() === selectedId)?.name }
        : { agentId: selectedId, agentName: agents.find(a => a.id === selectedId)?.name })
    };
    
    // In a real app, we would submit this to the API
    toast({
      title: "Permission granted",
      description: `${permissionType} access granted to ${userOrAgent === 'user' ? 'user' : 'agent'} ${permission.userName || permission.agentName}`,
    });
    
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Grant access to</Label>
        <div className="flex gap-4">
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              checked={userOrAgent === 'user'}
              onChange={() => setUserOrAgent('user')}
              className="h-4 w-4"
            />
            User
          </Label>
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              checked={userOrAgent === 'agent'}
              onChange={() => setUserOrAgent('agent')}
              className="h-4 w-4"
            />
            AI Agent
          </Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="entity">{userOrAgent === 'user' ? 'Select User' : 'Select Agent'}</Label>
        <Select value={selectedId} onValueChange={setSelectedId} required>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${userOrAgent === 'user' ? 'a user' : 'an agent'}`} />
          </SelectTrigger>
          <SelectContent>
            {userOrAgent === 'user' 
              ? users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                ))
              : agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))
            }
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="permissionType">Permission Level</Label>
        <Select value={permissionType} onValueChange={setPermissionType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select permission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Read">Read</SelectItem>
            <SelectItem value="Write">Write</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!selectedId}>Grant Access</Button>
      </DialogFooter>
    </form>
  );
};

// Main DataSource detail page component
export default function DataSourceDetail() {
  const [params] = useParams();
  const [, setLocation] = useLocation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  const dataSourceId = parseInt(params.id);
  const dataSource = mockDataSources.find(ds => ds.id === dataSourceId);
  
  // If data source not found, show 404
  if (!dataSource) {
    return (
      <div className="container py-12 mx-auto text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Data Source Not Found</h1>
        <p className="text-gray-600 mb-6">The data source you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation('/data-sources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Data Sources
        </Button>
      </div>
    );
  }
  
  const testConnection = () => {
    setConnectionTestStatus('testing');
    
    // Simulate a connection test
    setTimeout(() => {
      // Determine result based on current status
      if (dataSource.status === 'Active' && dataSource.healthStatus === 'Healthy') {
        setConnectionTestStatus('success');
        toast({
          title: "Connection successful",
          description: `Connected to ${dataSource.name} successfully.`,
        });
      } else {
        setConnectionTestStatus('error');
        toast({
          title: "Connection failed",
          description: "Could not establish connection. Check configuration and try again.",
          variant: "destructive"
        });
      }
      
      // Reset after 3 seconds
      setTimeout(() => {
        setConnectionTestStatus('idle');
      }, 3000);
    }, 2000);
  };
  
  const handleDelete = () => {
    // In a real app, we would submit a delete request to the API
    toast({
      title: "Data source deleted",
      description: `${dataSource.name} has been deleted.`,
    });
    
    setShowDeleteDialog(false);
    setLocation('/data-sources');
  };
  
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
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${dataSource.status === 'Active' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {typeIcons[dataSource.type as keyof typeof typeIcons] || <Database className="h-6 w-6 text-blue-600" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{dataSource.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>ID: {dataSource.id}</span>
                <span>•</span>
                <span>Type: {dataSource.type}</span>
                <span>•</span>
                <Badge variant={dataSource.status === 'Active' ? 'default' : 'secondary'}>
                  {dataSource.status}
                </Badge>
                {dataSource.healthStatus && (
                  <Badge variant={dataSource.healthStatus === 'Healthy' ? 'outline' : 'destructive'}>
                    {dataSource.healthStatus}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={connectionTestStatus === 'testing'}
            >
              {connectionTestStatus === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : connectionTestStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Connected
                </>
              ) : connectionTestStatus === 'error' ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  Failed
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Description</h3>
                    <p>{dataSource.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Connection Configuration</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                          <dd>{dataSource.connectionConfig.type}</dd>
                        </div>
                        
                        {Object.entries(dataSource.connectionConfig)
                          .filter(([key]) => key !== 'type')
                          .map(([key, value]) => {
                            // Skip sensitive fields or provide masked values
                            if (['password', 'apiKey', 'clientSecret'].includes(key)) {
                              value = '••••••••••••';
                            }
                            
                            return (
                              <div key={key}>
                                <dt className="text-sm font-medium text-gray-500">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                </dt>
                                <dd className="break-all">
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value)
                                    : String(value)
                                  }
                                </dd>
                              </div>
                            );
                          })
                        }
                      </dl>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Created</h3>
                      <p>{new Date(dataSource.createdAt).toLocaleString()}</p>
                      {dataSource.createdBy && <p className="text-sm text-gray-500">by {dataSource.createdBy}</p>}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Last Updated</h3>
                      <p>{new Date(dataSource.updatedAt).toLocaleString()}</p>
                    </div>
                    
                    {dataSource.lastChecked && (
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Last Checked</h3>
                        <p>{new Date(dataSource.lastChecked).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schema">
              <Card>
                <CardHeader>
                  <CardTitle>Schema Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dataSource.type === 'Database' && dataSource.schema.tables && (
                    <>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Tables</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {Array.isArray(dataSource.schema.tables) && dataSource.schema.tables.map(table => (
                            <Badge key={table} variant="outline" className="justify-start">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {dataSource.schema.relationships && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-500 mb-2">Relationships</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Source Table</TableHead>
                                <TableHead>Target Table</TableHead>
                                <TableHead>Relationship</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dataSource.schema.relationships.map((rel, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{rel.source}</TableCell>
                                  <TableCell>{rel.target}</TableCell>
                                  <TableCell>{rel.relationship}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {dataSource.schema.tableDetails && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-500 mb-4">Table Structure</h3>
                          
                          {dataSource.schema.tableDetails.map(table => (
                            <div key={table.name} className="mb-6">
                              <h4 className="font-medium mb-2">{table.name}</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Column</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Attributes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {table.columns.map(column => (
                                    <TableRow key={column.name}>
                                      <TableCell>{column.name}</TableCell>
                                      <TableCell>{column.type}</TableCell>
                                      <TableCell>
                                        {column.isPrimary && <Badge className="mr-1">Primary Key</Badge>}
                                        {column.isUnique && <Badge variant="outline" className="mr-1">Unique</Badge>}
                                        {column.isReference && <Badge variant="secondary" className="mr-1">Foreign Key</Badge>}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {dataSource.type === 'API' && (
                    <>
                      {dataSource.schema.endpoints && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-500 mb-2">Endpoints</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dataSource.schema.endpoints.map(endpoint => (
                              <Badge key={endpoint} variant="outline" className="justify-start font-mono">
                                {endpoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {dataSource.schema.queries && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-500 mb-2">Available Queries</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dataSource.schema.queries.map(query => (
                                <TableRow key={query.name}>
                                  <TableCell><code>{query.name}</code></TableCell>
                                  <TableCell>{query.description}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {dataSource.schema.dataModels && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-500 mb-4">Data Models</h3>
                          
                          {dataSource.schema.dataModels.map(model => (
                            <div key={model.name} className="mb-6">
                              <h4 className="font-medium mb-2">{model.name}</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {model.fields.map(field => (
                                    <TableRow key={field.name}>
                                      <TableCell>{field.name}</TableCell>
                                      <TableCell>{field.type}</TableCell>
                                      <TableCell>{field.description}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show metadata if available */}
                  {dataSource.schema.average_response_time && (
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Performance</h3>
                      <p>Average Response Time: {dataSource.schema.average_response_time}ms</p>
                    </div>
                  )}
                  
                  {dataSource.schema.record_count && (
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Size</h3>
                      <p>Total Records: {dataSource.schema.record_count.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Access Permissions</CardTitle>
                  <Button size="sm" onClick={() => setShowPermissionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permission
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Permission</TableHead>
                        <TableHead>Granted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPermissions
                        .filter(p => p.dataSourceId === dataSourceId)
                        .map(permission => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              {permission.userId ? (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>User</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Bot className="h-4 w-4" />
                                  <span>Agent</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {permission.userName || permission.agentName}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  permission.permissionType === 'Admin' 
                                    ? 'destructive'
                                    : permission.permissionType === 'Write'
                                      ? 'default'
                                      : 'outline'
                                }
                              >
                                {permission.permissionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(permission.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {dataSource.recentActivity ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataSource.recentActivity.map((activity, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {new Date(activity.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{activity.type}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  activity.status === 'Success' 
                                    ? 'outline'
                                    : activity.status === 'Failure'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{activity.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No activity recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Usage & Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-2">Connected Agents</h3>
                <div className="space-y-2">
                  {mockPermissions
                    .filter(p => p.dataSourceId === dataSourceId && p.agentId)
                    .map(permission => (
                      <div key={permission.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span>{permission.agentName}</span>
                        </div>
                        <Badge variant="outline">{permission.permissionType}</Badge>
                      </div>
                    ))}
                  
                  {mockPermissions.filter(p => p.dataSourceId === dataSourceId && p.agentId).length === 0 && (
                    <p className="text-sm text-gray-500">No agents connected</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setShowPermissionDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Agent
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-2">Data Connections</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No data connections configured</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Connection
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-2">API Access</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Data Source ID</span>
                      <span className="text-xs text-gray-500">Required for API calls</span>
                    </div>
                    <code className="block p-2 bg-gray-100 rounded text-sm">{dataSource.id}</code>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Data Source</DialogTitle>
          </DialogHeader>
          
          <div className="py-3">
            <p className="mb-2">Are you sure you want to delete this data source?</p>
            <p className="text-gray-500 text-sm">
              This will remove <strong>{dataSource.name}</strong> and all associated permissions.
              This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add permission dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Grant Access Permission</DialogTitle>
            <DialogDescription>
              Allow a user or AI agent to access this data source.
            </DialogDescription>
          </DialogHeader>
          
          <PermissionForm 
            onClose={() => setShowPermissionDialog(false)} 
            dataSourceId={dataSourceId} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}