import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Webhook, Clock, Database, Bell } from 'lucide-react';

// Import drag-and-drop components
import DraggableConditionBuilder, { ConditionGroup } from '@/components/triggers/DraggableConditionBuilder';
import ActionBuilder, { ActionConfig } from '@/components/triggers/ActionBuilder';

// Define the form schema with Zod
const triggerFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().nullable().optional(),
  type: z.enum(['Webhook', 'Schedule', 'Event', 'DataChange', 'Manual']),
  status: z.enum(['Active', 'Inactive', 'Draft']),
  agentId: z.string().nullable().optional(),
  conditions: z.any(),
  action: z.any(),
  metadata: z.any().optional(),
});

type TriggerFormValues = z.infer<typeof triggerFormSchema>;

interface TriggerFormProps {
  triggerId?: number;
  defaultValues?: Partial<TriggerFormValues>;
}

export function TriggerForm({ triggerId, defaultValues }: TriggerFormProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [, navigate] = useLocation();

  // Fetch trigger metadata (statuses, types)
  const { data: metadata } = useQuery({
    queryKey: ['/api/trigger-metadata'],
  });

  // Fetch available agents
  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  // If editing, fetch the existing trigger
  const { data: trigger, isLoading: isLoadingTrigger } = useQuery({
    queryKey: ['/api/triggers', triggerId],
    enabled: !!triggerId,
  });

  // Form setup
  const form = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      type: 'Webhook',
      status: 'Draft',
      agentId: null,
      conditions: {},
      action: {},
      metadata: {},
    },
  });

  // Update form when trigger data is loaded
  useEffect(() => {
    if (trigger && !form.formState.isDirty) {
      form.reset({
        name: trigger.name,
        description: trigger.description,
        type: trigger.type,
        status: trigger.status,
        agentId: trigger.agentId,
        conditions: trigger.conditions || {},
        action: trigger.action || {},
        metadata: trigger.metadata || {},
      });
    }
  }, [trigger, form]);

  // Create or update trigger mutation
  const mutation = useMutation({
    mutationFn: async (values: TriggerFormValues) => {
      if (triggerId) {
        return apiRequest(`/api/triggers/${triggerId}`, 'PUT', values);
      } else {
        return apiRequest('/api/triggers', 'POST', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/triggers'] });
      toast({
        title: triggerId ? 'Trigger Updated' : 'Trigger Created',
        description: triggerId
          ? 'Your trigger has been updated successfully.'
          : 'Your new trigger has been created.',
      });
      navigate('/triggers');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save the trigger. Please try again.',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: TriggerFormValues) {
    mutation.mutate(values);
  }

  // Form for webhook triggers
  const renderWebhookForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="metadata.endpoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Webhook URL Path</FormLabel>
            <FormControl>
              <Input placeholder="/webhook/my-endpoint" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              The path where this webhook will be accessible (e.g., /webhook/my-endpoint)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HTTP Method</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || 'POST'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select HTTP method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The HTTP method that will activate this webhook
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.authRequired"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Authentication Required</FormLabel>
              <FormDescription>
                Require API key authentication for this webhook
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );

  // Form for scheduled triggers
  const renderScheduleForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="metadata.schedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CRON Schedule</FormLabel>
            <FormControl>
              <Input placeholder="0 0 * * *" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              CRON expression for trigger execution (e.g., 0 0 * * * for daily at midnight)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.timezone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Timezone</FormLabel>
            <FormControl>
              <Input placeholder="UTC" {...field} value={field.value || 'UTC'} />
            </FormControl>
            <FormDescription>
              Timezone for schedule evaluation (default: UTC)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Form for data change triggers
  const renderDataChangeForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="metadata.dataSourceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data Source</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="claims_database">Claims Database</SelectItem>
                <SelectItem value="policy_database">Policy Database</SelectItem>
                <SelectItem value="customer_database">Customer Database</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The data source to monitor for changes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.entity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Entity</FormLabel>
            <FormControl>
              <Input placeholder="claims" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              The entity or table to monitor (e.g., claims, policies)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.operation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operation</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || 'any'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="any">Any Change</SelectItem>
                <SelectItem value="insert">Insert</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The database operation that will trigger this event
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Form for event triggers
  const renderEventForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="metadata.eventType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                <SelectItem value="policy_created">Policy Created</SelectItem>
                <SelectItem value="claim_filed">Claim Filed</SelectItem>
                <SelectItem value="claim_approved">Claim Approved</SelectItem>
                <SelectItem value="claim_denied">Claim Denied</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The type of system event that will trigger this automation
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata.filter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Filter (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder={'{\n  "policyType": "auto",\n  "status": "active"\n}'}
                className="font-mono"
                rows={5}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Optional JSON filter to match specific events (leave empty to match all events of the selected type)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {triggerId ? 'Edit Trigger' : 'Create New Trigger'}
            </CardTitle>
            <CardDescription>
              {triggerId
                ? 'Update the configuration for this trigger'
                : 'Define a new automation trigger'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Daily Policy Review"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this trigger
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="This trigger runs daily to process new policies..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description explaining the purpose of this trigger
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Initialize type-specific metadata
                            const initialMetadata: Record<string, any> = {};
                            if (value === 'Webhook') {
                              initialMetadata.method = 'POST';
                              initialMetadata.authRequired = false;
                            } else if (value === 'Schedule') {
                              initialMetadata.schedule = '0 0 * * *';
                              initialMetadata.timezone = 'UTC';
                            }
                            
                            form.setValue('metadata', initialMetadata);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select trigger type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {metadata?.types?.map((type: string) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of event that will activate this trigger
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {metadata?.statuses?.map((status: string) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Only Active triggers will be executed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Agent</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {agents?.map((agent: any) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The agent that will be triggered (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="configuration" className="pt-4">
                {form.watch('type') === 'Webhook' && renderWebhookForm()}
                {form.watch('type') === 'Schedule' && renderScheduleForm()}
                {form.watch('type') === 'DataChange' && renderDataChangeForm()}
                {form.watch('type') === 'Event' && renderEventForm()}
                {form.watch('type') === 'Manual' && (
                  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">Manual Trigger</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This trigger can only be activated manually from the UI or API. No additional configuration needed.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="pt-4 space-y-6">
                <div className="pb-2">
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                    Trigger Conditions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define the specific conditions that must be met for this trigger to activate.
                    Drag and drop to create complex condition groups.
                  </p>
                
                  <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DraggableConditionBuilder
                            value={field.value as ConditionGroup || {
                              id: `root-${Date.now()}`,
                              operator: 'AND',
                              conditions: []
                            }}
                            onChange={field.onChange}
                            availableFields={[
                              { name: 'event.type', type: 'string' },
                              { name: 'event.timestamp', type: 'date' },
                              { name: 'event.source', type: 'string' },
                              { name: 'event.payload.id', type: 'string' },
                              { name: 'event.payload.status', type: 'string' },
                              { name: 'event.payload.amount', type: 'number' },
                              { name: 'event.payload.priority', type: 'string' },
                              { name: 'event.payload.documentType', type: 'string' },
                              { name: 'event.payload.customerId', type: 'string' },
                              { name: 'event.payload.policyNumber', type: 'string' },
                              { name: 'event.payload.claimNumber', type: 'string' }
                            ]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <Separator className="my-6" />
                
                <div className="pb-2">
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <PlayCircle className="w-5 h-5 mr-2 text-indigo-500" />
                    Trigger Actions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure the actions to be performed when this trigger is activated.
                  </p>
                
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ActionBuilder
                            value={field.value as ActionConfig || {
                              type: '',
                              target: { id: '' },
                              parameters: {}
                            }}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/triggers')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Saving...'
                : triggerId
                ? 'Update Trigger'
                : 'Create Trigger'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}