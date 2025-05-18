import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Hourglass,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Plus
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ActionCard } from './ActionCard';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for tasks
const mockTasks = [
  {
    id: 'task-1',
    title: 'Analyze policy for customer XYZ123',
    description: 'Evaluate premium calculation and risk assessment',
    agentId: 'accel-uw',
    status: 'Running',
    createdAt: new Date(Date.now() - 30 * 60000),
    priority: 'High',
    metadata: {
      policyId: 'POL-12345',
      customer: 'XYZ Corp',
      premium: '$5,400'
    },
    actions: [
      {
        id: 'action-1',
        taskId: 'task-1',
        name: 'Extract policy details',
        type: 'DataFetch',
        status: 'Completed',
        startedAt: new Date(Date.now() - 25 * 60000),
        completedAt: new Date(Date.now() - 24 * 60000),
        latency: 12500,
        metadata: {
          source: 'PolicyDB',
          recordCount: 3,
          documentType: 'Auto Policy'
        },
        sequence: 1
      },
      {
        id: 'action-2',
        taskId: 'task-1',
        name: 'Calculate risk score',
        type: 'Tool',
        status: 'Completed',
        startedAt: new Date(Date.now() - 23 * 60000),
        completedAt: new Date(Date.now() - 22 * 60000),
        latency: 45200,
        metadata: {
          model: 'riskScoreV2',
          score: 78.5,
          confidence: 0.92
        },
        sequence: 2
      },
      {
        id: 'action-3',
        taskId: 'task-1',
        name: 'LLM analysis of policy terms',
        type: 'LLM',
        status: 'Running',
        startedAt: new Date(Date.now() - 21 * 60000),
        latency: 0,
        metadata: {
          model: 'gpt-4o',
          tokens: 1534
        },
        sequence: 3
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Approve claim #CLM-78912',
    description: 'Medical claim for policyholder Jane Doe',
    agentId: 'claims-processor',
    status: 'Needs Approval',
    createdAt: new Date(Date.now() - 120 * 60000),
    priority: 'Critical',
    metadata: {
      claimAmount: '$3,450',
      claimId: 'CLM-78912',
      policyHolder: 'Jane Doe'
    },
    actions: [
      {
        id: 'action-4',
        taskId: 'task-2',
        name: 'Validate claim documentation',
        type: 'Tool',
        status: 'Completed',
        startedAt: new Date(Date.now() - 115 * 60000),
        completedAt: new Date(Date.now() - 114 * 60000),
        latency: 32100,
        metadata: {
          documentCount: 5,
          validationScore: 0.97
        },
        sequence: 1
      },
      {
        id: 'action-5',
        taskId: 'task-2',
        name: 'Check policy coverage',
        type: 'DataFetch',
        status: 'Completed',
        startedAt: new Date(Date.now() - 113 * 60000),
        completedAt: new Date(Date.now() - 112 * 60000),
        latency: 8700,
        metadata: {
          coverageLimit: '$10,000',
          deductible: '$500',
          covered: true
        },
        sequence: 2
      },
      {
        id: 'action-6',
        taskId: 'task-2',
        name: 'Calculate payment amount',
        type: 'Tool',
        status: 'Completed',
        startedAt: new Date(Date.now() - 111 * 60000),
        completedAt: new Date(Date.now() - 110 * 60000),
        latency: 4300,
        metadata: {
          originalAmount: '$3,450',
          approved: '$2,950',
          notes: 'After deductible'
        },
        sequence: 3
      },
      {
        id: 'action-7',
        taskId: 'task-2',
        name: 'Requesting manager approval',
        type: 'Tool',
        status: 'Completed',
        startedAt: new Date(Date.now() - 109 * 60000),
        completedAt: new Date(Date.now() - 108 * 60000),
        latency: 2100,
        metadata: {
          reason: 'Amount over $2,000',
          approvalType: 'Manual'
        },
        sequence: 4
      }
    ]
  },
  {
    id: 'task-3',
    title: 'Schedule policy renewal notification',
    description: 'Send reminder for policy ABC-56789',
    agentId: 'communication-agent',
    status: 'Queued',
    createdAt: new Date(Date.now() - 48 * 60000),
    scheduledFor: new Date(Date.now() + 24 * 60 * 60000), // Tomorrow
    priority: 'Medium',
    metadata: {
      policyId: 'ABC-56789',
      customer: 'Acme Industries',
      channelPreference: 'Email'
    },
    actions: [
      {
        id: 'action-8',
        taskId: 'task-3',
        name: 'Initialize renewal notification',
        type: 'Tool',
        status: 'Queued',
        metadata: {},
        sequence: 1
      }
    ]
  },
  {
    id: 'task-4',
    title: 'Fraud detection on claim #CLM-54637',
    description: 'Run anomaly detection on recent claim submission',
    agentId: 'fraud-detector',
    status: 'Done',
    createdAt: new Date(Date.now() - 240 * 60000),
    completedAt: new Date(Date.now() - 230 * 60000),
    priority: 'High',
    metadata: {
      claimId: 'CLM-54637',
      fraudScore: 0.12,
      flagged: false
    },
    actions: [
      {
        id: 'action-9',
        taskId: 'task-4',
        name: 'Gather claim history',
        type: 'DataFetch',
        status: 'Completed',
        startedAt: new Date(Date.now() - 239 * 60000),
        completedAt: new Date(Date.now() - 238 * 60000),
        latency: 9200,
        metadata: {
          claimCount: 3,
          policyYears: 4
        },
        sequence: 1
      },
      {
        id: 'action-10',
        taskId: 'task-4',
        name: 'Apply fraud detection model',
        type: 'Tool',
        status: 'Completed',
        startedAt: new Date(Date.now() - 237 * 60000),
        completedAt: new Date(Date.now() - 235 * 60000),
        latency: 128000,
        metadata: {
          model: 'FraudNetV3',
          score: 0.12,
          threshold: 0.75
        },
        sequence: 2
      },
      {
        id: 'action-11',
        taskId: 'task-4',
        name: 'Update claim record',
        type: 'DataFetch',
        status: 'Completed',
        startedAt: new Date(Date.now() - 234 * 60000),
        completedAt: new Date(Date.now() - 233 * 60000),
        latency: 3100,
        metadata: {
          update: 'Fraud check passed'
        },
        sequence: 3
      }
    ]
  },
  {
    id: 'task-5',
    title: 'Generate monthly premium report',
    description: 'Create executive summary of premium collections',
    agentId: 'reporting-agent',
    status: 'Failed',
    createdAt: new Date(Date.now() - 180 * 60000),
    priority: 'Medium',
    metadata: {
      reportType: 'Monthly Premium',
      period: 'May 2025'
    },
    actions: [
      {
        id: 'action-12',
        taskId: 'task-5',
        name: 'Query financial database',
        type: 'DataFetch',
        status: 'Completed',
        startedAt: new Date(Date.now() - 179 * 60000),
        completedAt: new Date(Date.now() - 178 * 60000),
        latency: 42300,
        metadata: {
          records: 1437,
          timeframe: 'May 1-31'
        },
        sequence: 1
      },
      {
        id: 'action-13',
        taskId: 'task-5',
        name: 'Calculate aggregate statistics',
        type: 'Tool',
        status: 'Failed',
        startedAt: new Date(Date.now() - 177 * 60000),
        completedAt: new Date(Date.now() - 176 * 60000),
        error: 'Division by zero error in regional calculation',
        latency: 15200,
        metadata: {
          error: 'CALC_ERROR_DIV_ZERO'
        },
        sequence: 2
      }
    ]
  }
];

interface TaskTimelineBoardProps {
  onViewTaskDetail?: (taskId: string) => void;
  onApproveTask?: (taskId: string) => void;
  onRerunTask?: (taskId: string) => void;
}

export function TaskTimelineBoard({ 
  onViewTaskDetail, 
  onApproveTask, 
  onRerunTask 
}: TaskTimelineBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  
  // In a real app, this would be fetched from an API
  const { data: tasks = mockTasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      // This would be a fetch call in a real app
      return mockTasks;
    }
  });
  
  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    let match = true;
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        Object.entries(task.metadata).some(([key, value]) => 
          key.toLowerCase().includes(searchLower) || 
          String(value).toLowerCase().includes(searchLower)
        );
      
      if (!matchesSearch) match = false;
    }
    
    // Status filter
    if (statusFilter && task.status !== statusFilter) match = false;
    
    // Agent filter
    if (agentFilter && task.agentId !== agentFilter) match = false;
    
    // Date filter
    if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate.getTime() !== today.getTime()) match = false;
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate.getTime() !== yesterday.getTime()) match = false;
      } else if (dateFilter === 'this_week') {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const taskDate = new Date(task.createdAt);
        if (taskDate < weekStart) match = false;
      }
    }
    
    return match;
  });
  
  const queuedTasks = filteredTasks.filter(task => task.status === 'Queued');
  const runningTasks = filteredTasks.filter(task => task.status === 'Running');
  const approvalTasks = filteredTasks.filter(task => task.status === 'Needs Approval');
  const doneTasks = filteredTasks.filter(task => task.status === 'Done' || task.status === 'Completed');
  const failedTasks = filteredTasks.filter(task => task.status === 'Failed');
  
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };
  
  const handleActionClick = (action: any) => {
    setSelectedAction(action);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'Queued':
        return <Hourglass className="h-4 w-4 text-gray-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Needs Approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'Running':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 animate-pulse">⟳ Running</Badge>;
      case 'Queued':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">⏱ Queued</Badge>;
      case 'Failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800">✕ Failed</Badge>;
      case 'Needs Approval':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">⚠ Needs Approval</Badge>;
      default:
        return null;
    }
  };
  
  const TaskCard = ({ task }: { task: any }) => (
    <Card 
      className={`mb-4 w-full border-l-4 ${
        task.status === 'Done' || task.status === 'Completed' ? 'border-l-green-500' :
        task.status === 'Running' ? 'border-l-blue-500' :
        task.status === 'Needs Approval' ? 'border-l-yellow-500' :
        task.status === 'Failed' ? 'border-l-red-500' :
        'border-l-gray-300'
      } hover:shadow-md cursor-pointer`}
      onClick={() => handleTaskClick(task)}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-md font-semibold">{task.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge(task.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="text-sm text-gray-500 mb-2">
          {task.description || "No description"}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {task.agentId && (
            <Badge variant="outline" className="text-xs">
              Agent: {task.agentId}
            </Badge>
          )}
          
          {task.priority && (
            <Badge variant="outline" className={`text-xs ${
              task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
              task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
              task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {task.priority}
            </Badge>
          )}
          
          {task.scheduledFor && (
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
              <Calendar className="h-3 w-3 mr-1" />
              Scheduled
            </Badge>
          )}
        </div>
        
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <span>
            {new Date(task.createdAt).toLocaleString()}
          </span>
          <span>
            {task.actions?.length || 0} actions
          </span>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderTaskDrawer = () => {
    if (!selectedTask) return null;
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
            <p className="text-gray-500 mt-1">{selectedTask.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTask.status)}
            {selectedTask.status === 'Needs Approval' && onApproveTask && (
              <Button onClick={() => onApproveTask(selectedTask.id)}>
                Approve
              </Button>
            )}
            {['Failed', 'Done', 'Completed'].includes(selectedTask.status) && onRerunTask && (
              <Button variant="outline" onClick={() => onRerunTask(selectedTask.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Details</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">ID:</div>
                <div>{selectedTask.id}</div>
                <div className="text-gray-500">Agent:</div>
                <div>{selectedTask.agentId}</div>
                <div className="text-gray-500">Created:</div>
                <div>{new Date(selectedTask.createdAt).toLocaleString()}</div>
                {selectedTask.completedAt && (
                  <>
                    <div className="text-gray-500">Completed:</div>
                    <div>{new Date(selectedTask.completedAt).toLocaleString()}</div>
                  </>
                )}
                {selectedTask.scheduledFor && (
                  <>
                    <div className="text-gray-500">Scheduled:</div>
                    <div>{new Date(selectedTask.scheduledFor).toLocaleString()}</div>
                  </>
                )}
                <div className="text-gray-500">Priority:</div>
                <div>{selectedTask.priority}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Metadata</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {Object.keys(selectedTask.metadata).length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedTask.metadata).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="text-gray-500">{key}:</div>
                      <div>{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No metadata available</div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="actions">
          <TabsList className="mb-4">
            <TabsTrigger value="actions">Actions ({selectedTask.actions?.length || 0})</TabsTrigger>
            <TabsTrigger value="trace">Execution Trace</TabsTrigger>
          </TabsList>
          
          <TabsContent value="actions">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Action Timeline</h3>
              {selectedTask.actions?.map((action: any) => (
                <ActionCard 
                  key={action.id} 
                  action={action}
                  onClick={() => handleActionClick(action)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trace">
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify({
                  task: selectedTask.id,
                  status: selectedTask.status,
                  actions: selectedTask.actions?.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    sequence: a.sequence,
                    startedAt: a.startedAt,
                    completedAt: a.completedAt,
                    latency: a.latency
                  }))
                }, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  const renderActionDrawer = () => {
    if (!selectedAction) return null;
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{selectedAction.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{selectedAction.type}</Badge>
              {getStatusBadge(selectedAction.status)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Action Details</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">ID:</div>
                <div>{selectedAction.id}</div>
                <div className="text-gray-500">Sequence:</div>
                <div>#{selectedAction.sequence}</div>
                <div className="text-gray-500">Type:</div>
                <div>{selectedAction.type}</div>
                <div className="text-gray-500">Status:</div>
                <div>{selectedAction.status}</div>
                {selectedAction.startedAt && (
                  <>
                    <div className="text-gray-500">Started:</div>
                    <div>{new Date(selectedAction.startedAt).toLocaleString()}</div>
                  </>
                )}
                {selectedAction.completedAt && (
                  <>
                    <div className="text-gray-500">Completed:</div>
                    <div>{new Date(selectedAction.completedAt).toLocaleString()}</div>
                  </>
                )}
                {selectedAction.latency && (
                  <>
                    <div className="text-gray-500">Latency:</div>
                    <div>{selectedAction.latency < 1000 ? 
                      `${selectedAction.latency}ms` : 
                      `${(selectedAction.latency / 1000).toFixed(2)}s`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Metadata</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {Object.keys(selectedAction.metadata).length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedAction.metadata).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="text-gray-500">{key}:</div>
                      <div>{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No metadata available</div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="input">
          <TabsList className="mb-4">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            {selectedAction.error && <TabsTrigger value="error">Error</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="input">
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(selectedAction.inputData || {
                  message: "Input data not available or was not captured"
                }, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="output">
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(selectedAction.outputData || {
                  message: "Output data not available or was not captured"
                }, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          {selectedAction.error && (
            <TabsContent value="error">
              <div className="bg-red-50 p-4 rounded-md">
                <div className="text-red-600 font-medium mb-2">Error:</div>
                <pre className="text-xs overflow-auto max-h-96 text-red-600">
                  {selectedAction.error}
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Task Timeline</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="Queued">Queued</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Needs Approval">Needs Approval</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={agentFilter || ''} onValueChange={(value) => setAgentFilter(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Agent: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Agents</SelectItem>
              <SelectItem value="accel-uw">Accelerated UW</SelectItem>
              <SelectItem value="claims-processor">Claims Processor</SelectItem>
              <SelectItem value="communication-agent">Communications</SelectItem>
              <SelectItem value="fraud-detector">Fraud Detector</SelectItem>
              <SelectItem value="reporting-agent">Reporting Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={dateFilter || ''} onValueChange={(value) => setDateFilter(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Date: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Queued column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center">
              <Hourglass className="h-4 w-4 mr-2 text-gray-500" />
              Queued
              <Badge className="ml-2">{queuedTasks.length}</Badge>
            </h2>
          </div>
          <div className="space-y-4">
            {queuedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {queuedTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No queued tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Running column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-blue-500 animate-spin" />
              Running
              <Badge className="ml-2">{runningTasks.length}</Badge>
            </h2>
          </div>
          <div className="space-y-4">
            {runningTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {runningTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No running tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Needs Approval column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Needs Approval
              <Badge className="ml-2">{approvalTasks.length}</Badge>
            </h2>
          </div>
          <div className="space-y-4">
            {approvalTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {approvalTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No tasks pending approval
              </div>
            )}
          </div>
        </div>
        
        {/* Done column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Done
              <Badge className="ml-2">{doneTasks.length}</Badge>
            </h2>
          </div>
          <div className="space-y-4">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {doneTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No completed tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Failed column */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Failed
              <Badge className="ml-2">{failedTasks.length}</Badge>
            </h2>
          </div>
          <div className="space-y-4">
            {failedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {failedTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No failed tasks
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Task Details Drawer */}
      <Drawer open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-2 mb-2">
            <DrawerTitle>Task Details</DrawerTitle>
          </DrawerHeader>
          {renderTaskDrawer()}
        </DrawerContent>
      </Drawer>
      
      {/* Action Details Drawer */}
      <Drawer open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-2 mb-2">
            <DrawerTitle>Action Details</DrawerTitle>
          </DrawerHeader>
          {renderActionDrawer()}
        </DrawerContent>
      </Drawer>
    </div>
  );
}