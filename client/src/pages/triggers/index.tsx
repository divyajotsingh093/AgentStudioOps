import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, Calendar, Clock, Webhook, Code, Database, BellRing } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

type Trigger = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  type: 'Webhook' | 'Schedule' | 'Event' | 'DataChange' | 'Manual';
  status: 'Active' | 'Inactive' | 'Draft';
  agentId: string | null;
  conditions: any;
  action: any;
  lastExecuted: string | null;
  metadata: any;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Webhook':
      return <Webhook className="h-4 w-4" />;
    case 'Schedule':
      return <Calendar className="h-4 w-4" />;
    case 'Event':
      return <BellRing className="h-4 w-4" />;
    case 'DataChange':
      return <Database className="h-4 w-4" />;
    case 'Manual':
      return <Code className="h-4 w-4" />;
    default:
      return <Code className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500';
    case 'Inactive':
      return 'bg-gray-500';
    case 'Draft':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

function TriggerCard({ trigger }: { trigger: Trigger }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getTypeIcon(trigger.type)}
            <CardTitle>{trigger.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(trigger.status)}>{trigger.status}</Badge>
        </div>
        <CardDescription>{trigger.description || 'No description provided'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="font-semibold mr-2">Type:</span>
            <span>{trigger.type}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-semibold mr-2">Agent:</span>
            <span>{trigger.agentId || 'Not assigned'}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-semibold mr-2">Created:</span>
            <span>{format(new Date(trigger.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {trigger.lastExecuted && (
            <div className="flex items-center text-sm">
              <span className="font-semibold mr-2">Last executed:</span>
              <span>{format(new Date(trigger.lastExecuted), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/triggers/${trigger.id}`}>View Details</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/triggers/${trigger.id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TriggersPage() {
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const {
    data: triggers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/triggers'],
    select: (data: Trigger[]) => {
      return data.filter((trigger) => {
        let match = true;
        if (agentFilter && trigger.agentId !== agentFilter) match = false;
        if (statusFilter && trigger.status !== statusFilter) match = false;
        if (typeFilter && trigger.type !== typeFilter) match = false;
        return match;
      });
    },
  });

  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  const { data: metadata } = useQuery({
    queryKey: ['/api/trigger-metadata'],
  });

  const handleDeleteTrigger = async (id: number) => {
    try {
      await fetch(`/api/triggers/${id}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/triggers'] });
      toast({
        title: 'Trigger deleted',
        description: 'The trigger has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the trigger. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Triggers</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load triggers.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Triggers</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/triggers/drag-drop-config">
              <Code className="h-4 w-4 mr-2" />
              Drag & Drop Designer
            </Link>
          </Button>
          <Button asChild>
            <Link href="/triggers/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Trigger
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="">All Statuses</SelectItem>
                  {metadata?.statuses?.map((status: string) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={typeFilter || ''} onValueChange={(value) => setTypeFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="">All Types</SelectItem>
                  {metadata?.types?.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={agentFilter || ''} onValueChange={(value) => setAgentFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Agent</SelectLabel>
                  <SelectItem value="">All Agents</SelectItem>
                  {agents?.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Triggers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-[100px]" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : triggers && triggers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {triggers.map((trigger) => (
                <TriggerCard key={trigger.id} trigger={trigger} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-md">
              <BellRing className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No triggers found</h3>
              <p className="text-gray-500 mt-2 mb-6 text-center max-w-md">
                There are no triggers matching your filters. Try adjusting your filters or create a new trigger.
              </p>
              <Button asChild>
                <Link href="/triggers/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a Trigger
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="active">
          {/* Show only active triggers */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-[100px]" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {triggers
                ?.filter((trigger) => trigger.status === 'Active')
                .map((trigger) => (
                  <TriggerCard key={trigger.id} trigger={trigger} />
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="scheduled">
          {/* Show only scheduled triggers */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-[100px]" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {triggers
                ?.filter((trigger) => trigger.type === 'Schedule')
                .map((trigger) => (
                  <TriggerCard key={trigger.id} trigger={trigger} />
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="webhooks">
          {/* Show only webhook triggers */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-[100px]" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {triggers
                ?.filter((trigger) => trigger.type === 'Webhook')
                .map((trigger) => (
                  <TriggerCard key={trigger.id} trigger={trigger} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}