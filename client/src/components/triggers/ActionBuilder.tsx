import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, PlayCircle, ArrowRight, Plus, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ActionConfig {
  type: string;
  target: {
    id: string;
    name?: string;
    type?: string;
  };
  parameters: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

interface ActionBuilderProps {
  value: ActionConfig;
  onChange: (value: ActionConfig) => void;
}

export const ActionBuilder: React.FC<ActionBuilderProps> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Fetch agents for selection
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
  });
  
  // Fetch tools for selection
  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ['/api/tools'],
  });
  
  const actionTypes = [
    { value: 'runAgent', label: 'Run Agent' },
    { value: 'executeTool', label: 'Execute Tool' },
    { value: 'sendWebhook', label: 'Send Webhook' },
    { value: 'updateDatabase', label: 'Update Database' },
    { value: 'sendNotification', label: 'Send Notification' },
  ];
  
  // Get available targets based on the selected action type
  const getAvailableTargets = () => {
    switch (value.type) {
      case 'runAgent':
        return agents || [];
      case 'executeTool':
        return tools || [];
      case 'sendWebhook':
        return [
          { id: 'custom', name: 'Custom URL' },
          { id: 'slack', name: 'Slack' },
          { id: 'teams', name: 'Microsoft Teams' },
        ];
      default:
        return [];
    }
  };
  
  // Get parameter fields based on the selected action type and target
  const getParameterFields = () => {
    switch (value.type) {
      case 'runAgent':
        return [
          { name: 'input', label: 'Input', type: 'textarea', placeholder: 'Enter input for the agent' },
          { name: 'async', label: 'Run Asynchronously', type: 'boolean', defaultValue: false },
        ];
      case 'executeTool':
        return [
          { name: 'parameters', label: 'Parameters', type: 'json', placeholder: '{"key": "value"}' },
          { name: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 30000 },
        ];
      case 'sendWebhook':
        if (value.target.id === 'custom') {
          return [
            { name: 'url', label: 'URL', type: 'text', placeholder: 'https://' },
            { name: 'method', label: 'Method', type: 'select', options: ['POST', 'PUT', 'PATCH'], defaultValue: 'POST' },
            { name: 'payload', label: 'Payload', type: 'json', placeholder: '{"key": "value"}' },
            { name: 'headers', label: 'Headers', type: 'json', placeholder: '{"Content-Type": "application/json"}' },
          ];
        } else if (value.target.id === 'slack') {
          return [
            { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
            { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Enter message text' },
          ];
        }
        return [];
      case 'sendNotification':
        return [
          { name: 'title', label: 'Title', type: 'text', placeholder: 'Notification Title' },
          { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Notification message' },
          { name: 'recipients', label: 'Recipients', type: 'text', placeholder: 'user@example.com, admin@example.com' },
          { name: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'error'], defaultValue: 'info' },
        ];
      default:
        return [];
    }
  };
  
  // Handle changes to the basic configuration
  const handleTypeChange = (newType: string) => {
    onChange({
      ...value,
      type: newType,
      target: { id: '' },
      parameters: {},
    });
  };
  
  const handleTargetChange = (targetId: string) => {
    const targets = getAvailableTargets();
    const selectedTarget = targets.find((t) => t.id === targetId) || { id: targetId };
    
    onChange({
      ...value,
      target: {
        id: targetId,
        name: selectedTarget.name,
        type: selectedTarget.type,
      },
      parameters: {},
    });
  };
  
  // Handle changes to parameter values
  const handleParameterChange = (paramName: string, paramValue: any) => {
    onChange({
      ...value,
      parameters: {
        ...value.parameters,
        [paramName]: paramValue,
      },
    });
  };
  
  // Handle changes to retry policy
  const handleRetryPolicyChange = (field: string, val: any) => {
    onChange({
      ...value,
      retryPolicy: {
        ...(value.retryPolicy || { maxRetries: 3, backoffMultiplier: 2 }),
        [field]: val,
      },
    });
  };
  
  // Render a parameter field based on its type
  const renderParameterField = (param: any) => {
    const paramValue = value.parameters[param.name] !== undefined 
      ? value.parameters[param.name] 
      : param.defaultValue;
    
    switch (param.type) {
      case 'text':
        return (
          <Input
            id={`param-${param.name}`}
            value={paramValue || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.placeholder}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={`param-${param.name}`}
            value={paramValue || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.placeholder}
            rows={4}
          />
        );
      case 'number':
        return (
          <Input
            id={`param-${param.name}`}
            type="number"
            value={paramValue || param.defaultValue}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
          />
        );
      case 'boolean':
        return (
          <Select
            value={paramValue ? 'true' : 'false'}
            onValueChange={(val) => handleParameterChange(param.name, val === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'select':
        return (
          <Select
            value={paramValue || param.defaultValue}
            onValueChange={(val) => handleParameterChange(param.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {param.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'json':
        return (
          <Textarea
            id={`param-${param.name}`}
            value={paramValue ? JSON.stringify(paramValue, null, 2) : ''}
            onChange={(e) => {
              try {
                const jsonValue = e.target.value.trim() ? JSON.parse(e.target.value) : {};
                handleParameterChange(param.name, jsonValue);
              } catch (error) {
                // Don't update on invalid JSON
                console.log('Invalid JSON');
              }
            }}
            placeholder={param.placeholder}
            rows={4}
            className="font-mono text-sm"
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Action Configuration</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="action-type">Action Type</Label>
                <Select
                  value={value.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger id="action-type">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {value.type && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label htmlFor="action-target">Target {value.type === 'runAgent' ? 'Agent' : value.type === 'executeTool' ? 'Tool' : ''}</Label>
                    <Select
                      value={value.target.id}
                      onValueChange={handleTargetChange}
                    >
                      <SelectTrigger id="action-target">
                        <SelectValue placeholder={`Select ${value.type === 'runAgent' ? 'agent' : value.type === 'executeTool' ? 'tool' : 'target'}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(agentsLoading || toolsLoading) ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          getAvailableTargets().map((target) => (
                            <SelectItem key={target.id} value={target.id}>
                              {target.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {value.target.id && getParameterFields().map((param) => (
                    <motion.div
                      key={param.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1"
                    >
                      <Label htmlFor={`param-${param.name}`}>{param.label}</Label>
                      {renderParameterField(param)}
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {!value.type && (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <AlertTriangle size={32} className="text-gray-400 mb-3" />
                  <p className="text-gray-500 text-center">
                    Select an action type to configure how this trigger will respond when activated.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <Label>Retry Policy</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="max-retries" className="text-xs">
                      Max Retries
                    </Label>
                    <Input
                      id="max-retries"
                      type="number"
                      min={0}
                      max={10}
                      value={(value.retryPolicy?.maxRetries ?? 3).toString()}
                      onChange={(e) => handleRetryPolicyChange('maxRetries', Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="backoff-multiplier" className="text-xs">
                      Backoff Multiplier
                    </Label>
                    <Input
                      id="backoff-multiplier"
                      type="number"
                      min={1}
                      step={0.5}
                      value={(value.retryPolicy?.backoffMultiplier ?? 2).toString()}
                      onChange={(e) => handleRetryPolicyChange('backoffMultiplier', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    onChange({
                      ...value,
                      retryPolicy: {
                        maxRetries: 3,
                        backoffMultiplier: 2,
                      },
                    });
                  }}
                >
                  <RefreshCcw size={14} className="mr-1" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {value.type && value.target.id && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <PlayCircle size={16} className="mr-2 text-indigo-500" />
              When triggered:
              <span className="font-medium mx-1">
                {actionTypes.find((t) => t.value === value.type)?.label}
              </span>
              <ArrowRight size={14} className="mx-1" />
              <span className="font-medium">
                {value.target.name || value.target.id}
              </span>
            </div>
            
            <Button type="button" size="sm" className="h-8">
              <Plus size={14} className="mr-1" />
              Add Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionBuilder;