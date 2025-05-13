import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, GitFork, RefreshCw, AlertTriangle, ArrowLeftRight, Calendar, 
  Clock, CheckCircle, XCircle, Edit, Trash2, Play, Pause, Code 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data connector (extended from the connectors page)
const mockDataConnectors = [
  {
    id: 1,
    name: 'Claims to Analytics Sync',
    description: 'Synchronizes claims data to analytics database for business intelligence and reporting',
    sourceId: 1,
    sourceName: 'Claims Processing API',
    sourceType: 'API',
    targetId: 7,
    targetName: 'Analytics Warehouse',
    targetType: 'Database',
    transformations: [
      {
        id: 'transform-1',
        name: 'Map Claim Status',
        field: 'claimStatus',
        operation: 'map',
        mapping: { 'PENDING': 'In Progress', 'APPROVED': 'Completed', 'DENIED': 'Rejected' }
      },
      {
        id: 'transform-2',
        name: 'Format Dates',
        field: 'submissionDate',
        operation: 'format',
        format: 'YYYY-MM-DD'
      }
    ],
    schedule: 'Every 6 hours',
    cronExpression: '0 */6 * * *',
    lastSyncedAt: '2025-05-13T00:30:00Z',
    nextSyncAt: '2025-05-13T06:30:00Z',
    status: 'Active',
    createdAt: '2025-04-20T09:15:00Z',
    updatedAt: '2025-05-10T11:45:00Z',
    createdBy: 'John Smith',
    stats: {
      totalRecords: 125892,
      lastRunDuration: '00:03:45',
      successRate: 0.992,
      averageRuntime: '00:03:21',
      processingSpeed: '560 records/sec'
    },
    syncHistory: [
      {
        id: 'sync-001',
        startTime: '2025-05-13T00:30:00Z',
        endTime: '2025-05-13T00:33:45Z',
        status: 'Success',
        recordsProcessed: 1253,
        errors: 0
      },
      {
        id: 'sync-002',
        startTime: '2025-05-12T18:30:00Z',
        endTime: '2025-05-12T18:34:12Z',
        status: 'Success',
        recordsProcessed: 1425,
        errors: 0
      },
      {
        id: 'sync-003',
        startTime: '2025-05-12T12:30:00Z',
        endTime: '2025-05-12T12:35:06Z',
        status: 'Success',
        recordsProcessed: 1587,
        errors: 12
      },
      {
        id: 'sync-004',
        startTime: '2025-05-12T06:30:00Z',
        endTime: '2025-05-12T06:33:45Z',
        status: 'Success',
        recordsProcessed: 1325,
        errors: 0
      },
      {
        id: 'sync-005',
        startTime: '2025-05-12T00:30:00Z',
        endTime: '2025-05-12T00:34:22Z',
        status: 'Success',
        recordsProcessed: 1519,
        errors: 0
      }
    ]
  },
  {
    id: 2,
    name: 'Customer Data Integration',
    description: 'Integrates customer data from CRM to policy database',
    sourceId: 8,
    sourceName: 'Customer CRM',
    sourceType: 'API',
    targetId: 2,
    targetName: 'Customer Policies Database',
    targetType: 'Database',
    transformations: [
      {
        id: 'transform-1',
        name: 'Format Address',
        field: 'address',
        operation: 'format',
        template: '{{line1}}, {{city}}, {{state}} {{zip}}'
      },
      {
        id: 'transform-2',
        name: 'Normalize Phone',
        field: 'phoneNumber',
        operation: 'normalize',
        format: '+1 (###) ###-####'
      }
    ],
    schedule: 'Daily at midnight',
    cronExpression: '0 0 * * *',
    lastSyncedAt: '2025-05-13T00:00:00Z',
    nextSyncAt: '2025-05-14T00:00:00Z',
    status: 'Active',
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-04-20T15:35:00Z',
    createdBy: 'Sarah Johnson',
    stats: {
      totalRecords: 23487,
      lastRunDuration: '00:01:12',
      successRate: 1.0,
      averageRuntime: '00:01:18',
      processingSpeed: '312 records/sec'
    },
    syncHistory: [
      {
        id: 'sync-001',
        startTime: '2025-05-13T00:00:00Z',
        endTime: '2025-05-13T00:01:12Z',
        status: 'Success',
        recordsProcessed: 352,
        errors: 0
      },
      {
        id: 'sync-002',
        startTime: '2025-05-12T00:00:00Z',
        endTime: '2025-05-12T00:01:24Z',
        status: 'Success',
        recordsProcessed: 425,
        errors: 0
      },
      {
        id: 'sync-003',
        startTime: '2025-05-11T00:00:00Z',
        endTime: '2025-05-11T00:01:18Z',
        status: 'Success',
        recordsProcessed: 398,
        errors: 0
      }
    ]
  }
];

// Edit transformation form component
const EditTransformationForm: React.FC<{ 
  transformation: any,
  onSave: (transformation: any) => void,
  onClose: () => void
}> = ({ transformation, onSave, onClose }) => {
  const [name, setName] = useState(transformation.name);
  const [field, setField] = useState(transformation.field);
  const [operation, setOperation] = useState(transformation.operation);
  const [config, setConfig] = useState(
    transformation.mapping 
      ? JSON.stringify(transformation.mapping, null, 2)
      : transformation.template || transformation.format || ''
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let configData;
    try {
      // Try to parse as JSON if mapping
      if (operation === 'map') {
        configData = JSON.parse(config);
      } else {
        configData = config;
      }
      
      const updatedTransformation = {
        ...transformation,
        name,
        field,
        operation,
        ...(operation === 'map' ? { mapping: configData } 
            : operation === 'format' ? { template: configData }
            : { format: configData })
      };
      
      onSave(updatedTransformation);
      onClose();
    } catch (error) {
      toast({
        title: "Invalid configuration",
        description: "Please check your configuration format.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Transformation Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter name" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="field">Field Name</Label>
        <Input 
          id="field" 
          value={field} 
          onChange={(e) => setField(e.target.value)} 
          placeholder="Enter field name" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="operation">Operation Type</Label>
        <select
          id="operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="map">Map Values</option>
          <option value="format">Format</option>
          <option value="normalize">Normalize</option>
          <option value="transform">Transform</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="config">
          {operation === 'map' 
            ? 'Mapping Configuration (JSON)' 
            : operation === 'format' 
              ? 'Format Template' 
              : 'Configuration'
          }
        </Label>
        <textarea 
          id="config"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          className="w-full min-h-[120px] p-2 border rounded-md font-mono text-sm"
          placeholder={
            operation === 'map' 
              ? '{"sourceValue": "targetValue", ...}' 
              : operation === 'format' 
                ? '{{field1}}, {{field2}}' 
                : 'Enter configuration'
          }
          required
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};

// Connector detail page component
export default function ConnectorDetailPage() {
  const [params] = useParams();
  const [, setLocation] = useLocation();
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTransformDialog, setShowEditTransformDialog] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);
  
  const connectorId = parseInt(params.id);
  const connector = mockDataConnectors.find(c => c.id === connectorId);
  
  // If connector not found, show not found page
  if (!connector) {
    return (
      <div className="container py-12 mx-auto text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Connector Not Found</h1>
        <p className="text-gray-600 mb-6">The data connector you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation('/data-sources/connectors')}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Connectors
        </Button>
      </div>
    );
  }
  
  const startManualSync = () => {
    toast({
      title: "Sync started",
      description: `Manual sync started for ${connector.name}.`
    });
    setShowRunDialog(false);
  };
  
  const handleDelete = () => {
    toast({
      title: "Connector deleted",
      description: `${connector.name} has been deleted.`
    });
    setShowDeleteDialog(false);
    setLocation('/data-sources/connectors');
  };
  
  const handleStatusToggle = () => {
    const newStatus = connector.status === 'Active' ? 'Inactive' : 'Active';
    toast({
      title: `Connector ${newStatus === 'Active' ? 'activated' : 'deactivated'}`,
      description: `${connector.name} has been ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`
    });
  };
  
  const openEditTransformation = (transformation: any) => {
    setSelectedTransformation(transformation);
    setShowEditTransformDialog(true);
  };
  
  const handleSaveTransformation = (updatedTransformation: any) => {
    toast({
      title: "Transformation updated",
      description: `${updatedTransformation.name} has been updated.`
    });
  };
  
  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => setLocation('/data-sources/connectors')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Connectors
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${connector.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <GitFork className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{connector.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>ID: {connector.id}</span>
                <span>•</span>
                <span>Created: {new Date(connector.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant={connector.status === 'Active' ? 'default' : 'outline'}>
                  {connector.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRunDialog(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Now
            </Button>
            <Button 
              variant={connector.status === 'Active' ? 'destructive' : 'default'}
              onClick={handleStatusToggle}
            >
              {connector.status === 'Active' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast({ title: "Not implemented", description: "Edit functionality not implemented yet" })}
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
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
              <TabsTrigger value="history">Sync History</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Connector Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Description</h3>
                    <p>{connector.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-gray-500">Source</h3>
                      <Card className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{connector.sourceType}</Badge>
                            <h4 className="font-medium">{connector.sourceName}</h4>
                          </div>
                          <p className="text-sm text-gray-600">ID: {connector.sourceId}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-gray-500">Target</h3>
                      <Card className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{connector.targetType}</Badge>
                            <h4 className="font-medium">{connector.targetName}</h4>
                          </div>
                          <p className="text-sm text-gray-600">ID: {connector.targetId}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Schedule</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{connector.schedule}</span>
                      </div>
                      {connector.cronExpression && (
                        <p className="text-xs text-gray-500 mt-1">Cron: {connector.cronExpression}</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Last Synced</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{new Date(connector.lastSyncedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">Next Sync</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(connector.nextSyncAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-3">Performance Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Records</p>
                        <p className="font-medium">{connector.stats.totalRecords.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-xs text-gray-500 mb-1">Last Run Duration</p>
                        <p className="font-medium">{connector.stats.lastRunDuration}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                        <p className="font-medium">{(connector.stats.successRate * 100).toFixed(1)}%</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-xs text-gray-500 mb-1">Processing Speed</p>
                        <p className="font-medium">{connector.stats.processingSpeed}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transformations">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Data Transformations</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => toast({ title: "Not implemented", description: "Add transformation functionality not implemented yet" })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transformation
                  </Button>
                </CardHeader>
                <CardContent>
                  {connector.transformations && connector.transformations.length > 0 ? (
                    <div className="space-y-4">
                      {connector.transformations.map(transformation => (
                        <Card key={transformation.id} className="bg-gray-50">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{transformation.name}</CardTitle>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openEditTransformation(transformation)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toast({ title: "Not implemented", description: "Delete transformation functionality not implemented yet" })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription className="flex gap-2 items-center">
                              <Badge variant="outline" className="text-xs">
                                {transformation.field}
                              </Badge>
                              <Badge className="text-xs capitalize">
                                {transformation.operation}
                              </Badge>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-0">
                            <div className="bg-gray-100 p-3 rounded-md">
                              {transformation.operation === 'map' && (
                                <div className="text-sm font-mono">
                                  {Object.entries(transformation.mapping).map(([key, value], idx) => (
                                    <div key={idx}>
                                      <span className="text-blue-600">"{key}"</span>
                                      <span className="text-gray-500"> → </span>
                                      <span className="text-green-600">"{value}"</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {transformation.operation === 'format' && (
                                <div className="text-sm font-mono">
                                  <span className="text-gray-700">Template: </span>
                                  <span>{transformation.template}</span>
                                </div>
                              )}
                              {transformation.operation === 'normalize' && (
                                <div className="text-sm font-mono">
                                  <span className="text-gray-700">Rules: </span>
                                  <span>{transformation.rules}</span>
                                </div>
                              )}
                              {transformation.operation === 'geocode' && (
                                <div className="text-sm font-mono">
                                  <span className="text-gray-700">Provider: </span>
                                  <span>{transformation.provider}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">No transformations configured</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Configure data transformations to modify data during sync
                      </p>
                      <Button onClick={() => toast({ title: "Not implemented", description: "Add transformation functionality not implemented yet" })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transformation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Sync History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connector.syncHistory && connector.syncHistory.length > 0 ? (
                        connector.syncHistory.map(sync => {
                          const startTime = new Date(sync.startTime);
                          const endTime = new Date(sync.endTime);
                          const durationMs = endTime.getTime() - startTime.getTime();
                          const minutes = Math.floor(durationMs / 60000);
                          const seconds = Math.floor((durationMs % 60000) / 1000);
                          const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                          
                          return (
                            <TableRow key={sync.id}>
                              <TableCell>{startTime.toLocaleString()}</TableCell>
                              <TableCell>{endTime.toLocaleString()}</TableCell>
                              <TableCell>{formattedDuration}</TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-medium">{sync.recordsProcessed.toLocaleString()}</span>
                                  {sync.errors > 0 && (
                                    <span className="ml-2 text-xs text-red-500">
                                      ({sync.errors} errors)
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {sync.status === 'Success' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span>{sync.status}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toast({ title: "Not implemented", description: "View details functionality not implemented yet" })}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No sync history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm h-[400px] overflow-y-auto">
                    <p className="text-gray-400"># Logs from most recent sync ({new Date(connector.lastSyncedAt).toLocaleString()})</p>
                    <p className="text-gray-400 mb-4"># Showing most recent 20 log entries</p>
                    
                    <p className="text-green-400">[{new Date(connector.lastSyncedAt).toLocaleTimeString()}] INFO: Starting connector sync: {connector.name}</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 1000).toLocaleTimeString()}] INFO: Connecting to source: {connector.sourceName}</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 2000).toLocaleTimeString()}] INFO: Connection established successfully</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 3000).toLocaleTimeString()}] INFO: Fetching data from source</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 10000).toLocaleTimeString()}] INFO: Retrieved {connector.syncHistory[0].recordsProcessed} records from source</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 11000).toLocaleTimeString()}] INFO: Applying transformation: Map Claim Status</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 15000).toLocaleTimeString()}] INFO: Transformation applied successfully</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 16000).toLocaleTimeString()}] INFO: Applying transformation: Format Dates</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 20000).toLocaleTimeString()}] INFO: Transformation applied successfully</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 21000).toLocaleTimeString()}] INFO: Connecting to target: {connector.targetName}</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 22000).toLocaleTimeString()}] INFO: Connection established successfully</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 23000).toLocaleTimeString()}] INFO: Starting data import to target</p>
                    <p className="text-yellow-400">[{new Date(new Date(connector.lastSyncedAt).getTime() + 100000).toLocaleTimeString()}] WARN: Slow batch detected (500ms)</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 120000).toLocaleTimeString()}] INFO: Processing: 500/{connector.syncHistory[0].recordsProcessed} records (40%)</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 150000).toLocaleTimeString()}] INFO: Processing: 750/{connector.syncHistory[0].recordsProcessed} records (60%)</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 180000).toLocaleTimeString()}] INFO: Processing: 1000/{connector.syncHistory[0].recordsProcessed} records (80%)</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 220000).toLocaleTimeString()}] INFO: Processing: {connector.syncHistory[0].recordsProcessed}/{connector.syncHistory[0].recordsProcessed} records (100%)</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 223000).toLocaleTimeString()}] INFO: Verifying data integrity</p>
                    <p>[{new Date(new Date(connector.lastSyncedAt).getTime() + 224000).toLocaleTimeString()}] INFO: Committing changes to target</p>
                    <p className="text-green-400">[{new Date(new Date(connector.lastSyncedAt).getTime() + 225000).toLocaleTimeString()}] INFO: Sync completed successfully</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Health</h3>
                    <Badge variant="outline" className="bg-green-50">Healthy</Badge>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Last Sync</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Successful</span>
                    <span className="text-gray-500">•</span>
                    <span>{new Date(connector.lastSyncedAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Next Scheduled Sync</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(connector.nextSyncAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${connector.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{connector.status}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={connector.status === 'Active' ? 'destructive' : 'default'}
                  onClick={handleStatusToggle}
                >
                  {connector.status === 'Active' ? 'Deactivate' : 'Activate'} Connector
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs text-gray-500">Success Rate</h3>
                    <span className="text-sm font-medium">{(connector.stats.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={connector.stats.successRate * 100} className="h-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Avg. Duration</h3>
                    <p className="font-medium">{connector.stats.averageRuntime}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Speed</h3>
                    <p className="font-medium">{connector.stats.processingSpeed}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs text-gray-500 mb-1">Total Records Processed</h3>
                  <p className="font-medium">{connector.stats.totalRecords.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowRunDialog(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Manual Sync
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Not implemented", description: "Edit functionality not implemented yet" })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Connector
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Not implemented", description: "Duplicate functionality not implemented yet" })}
                >
                  <GitFork className="h-4 w-4 mr-2" />
                  Duplicate Connector
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Connector
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Run Manual Sync Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Manual Sync</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to run a manual sync for this connector?</p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeftRight className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{connector.sourceName}</p>
                  <p className="text-sm text-gray-500">to {connector.targetName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This will initiate an immediate data synchronization regardless of the schedule.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDialog(false)}>Cancel</Button>
            <Button onClick={startManualSync}>Run Sync</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Connector Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Connector</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Are you sure you want to delete this connector?</p>
            <p className="text-gray-500 text-sm mb-4">
              This will permanently delete the connector "{connector.name}" and all its configuration.
              This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-100 p-4 rounded-md">
              <p className="text-sm text-red-600">
                Warning: Deleting this connector will stop all scheduled data synchronization between
                {' '}{connector.sourceName} and {connector.targetName}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Transformation Dialog */}
      <Dialog open={showEditTransformDialog} onOpenChange={setShowEditTransformDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Transformation</DialogTitle>
          </DialogHeader>
          
          {selectedTransformation && (
            <EditTransformationForm 
              transformation={selectedTransformation}
              onSave={handleSaveTransformation}
              onClose={() => setShowEditTransformDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}