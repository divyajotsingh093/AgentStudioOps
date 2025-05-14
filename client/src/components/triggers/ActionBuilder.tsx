import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Play,
  Settings,
  Code,
  FileJson,
  RotateCcw,
  Bot,
  Database,
  Webhook,
  Server,
  PuzzlePiece,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [actionType, setActionType] = useState<string>(value.type || '');
  const [selectedTarget, setSelectedTarget] = useState<{id: string, name?: string, type?: string}>(
    value.target || { id: '' }
  );
  const [parameters, setParameters] = useState<Record<string, any>>(value.parameters || {});
  const [enableRetry, setEnableRetry] = useState<boolean>(!!value.retryPolicy);
  const [maxRetries, setMaxRetries] = useState<number>(value.retryPolicy?.maxRetries || 3);
  const [backoffMultiplier, setBackoffMultiplier] = useState<number>(
    value.retryPolicy?.backoffMultiplier || 1.5
  );
  const [parametersJson, setParametersJson] = useState<string>(
    JSON.stringify(parameters, null, 2)
  );
  const [activeTab, setActiveTab] = useState('visual');

  // Fetch agents, tools, functions available in the system
  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  const { data: tools } = useQuery({
    queryKey: ['/api/tools'],
  });

  const { data: functions } = useQuery({
    queryKey: ['/api/functions'],
  });

  useEffect(() => {
    // When the value prop changes, update the component state
    setActionType(value.type || '');
    setSelectedTarget(value.target || { id: '' });
    setParameters(value.parameters || {});
    setEnableRetry(!!value.retryPolicy);
    setMaxRetries(value.retryPolicy?.maxRetries || 3);
    setBackoffMultiplier(value.retryPolicy?.backoffMultiplier || 1.5);
    setParametersJson(JSON.stringify(value.parameters || {}, null, 2));
  }, [value]);

  useEffect(() => {
    // Update the parent component when any of the main parameters change
    const newValue: ActionConfig = {
      type: actionType,
      target: selectedTarget,
      parameters: activeTab === 'visual' ? parameters : JSON.parse(parametersJson),
    };

    if (enableRetry) {
      newValue.retryPolicy = {
        maxRetries,
        backoffMultiplier,
      };
    }

    onChange(newValue);
  }, [
    actionType,
    selectedTarget,
    parameters,
    enableRetry,
    maxRetries,
    backoffMultiplier,
    activeTab,
    parametersJson,
    onChange,
  ]);

  const handleTargetChange = (targetId: string) => {
    // Find the target details based on the selected action type
    let targetDetails = { id: targetId };
    
    if (actionType === 'invoke_agent') {
      const agentInfo = agents?.find(t => t.id === targetId);
      if (agentInfo) {
        targetDetails = { ...targetDetails, name: agentInfo.name, type: 'agent' };
      }
    } else if (actionType === 'execute_tool') {
      const toolInfo = tools?.find(t => t.id === targetId);
      if (toolInfo) {
        targetDetails = { ...targetDetails, name: toolInfo.name, type: toolInfo.type };
      }
    } else if (actionType === 'call_function') {
      const funcInfo = functions?.find(t => t.id === targetId);
      if (funcInfo) {
        targetDetails = { ...targetDetails, name: funcInfo.name, type: 'function' };
      }
    }
    
    setSelectedTarget(targetDetails);
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleJsonParametersChange = (json: string) => {
    setParametersJson(json);
    try {
      const parsed = JSON.parse(json);
      setParameters(parsed);
    } catch (error) {
      // Invalid JSON, just update the text but don't parse it yet
    }
  };

  const getTargetOptions = () => {
    switch (actionType) {
      case 'invoke_agent':
        return agents || [];
      case 'execute_tool':
        return tools || [];
      case 'call_function':
        return functions || [];
      default:
        return [];
    }
  };

  const getParameterFields = () => {
    // This is a simplified example - in a real app you'd get parameter specs from the API
    switch (actionType) {
      case 'invoke_agent':
        return [
          { key: 'input', label: 'Input Data', type: 'text', placeholder: '$event.data' },
          { key: 'context', label: 'Context', type: 'textarea', placeholder: 'Additional context...' },
        ];
      case 'execute_tool':
        // For tools, parameter fields could be dynamic based on the selected tool
        return [
          { key: 'input', label: 'Input', type: 'text', placeholder: 'Tool input...' },
          { key: 'options', label: 'Options', type: 'json', placeholder: '{"timeout": 30}' },
        ];
      case 'call_function':
        return [
          { key: 'args', label: 'Arguments', type: 'json', placeholder: '[123, "test"]' },
          { key: 'timeout', label: 'Timeout (seconds)', type: 'number', placeholder: '30' },
        ];
      case 'webhook':
        return [
          { key: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://example.com/webhook' },
          { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'GET'] },
          { key: 'headers', label: 'Headers', type: 'json', placeholder: '{"Content-Type": "application/json"}' },
          { key: 'payload', label: 'Payload', type: 'json', placeholder: '{"data": "$event.data"}' },
        ];
      default:
        return [];
    }
  };

  const renderActionIcon = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return <Bot className="h-5 w-5 text-indigo-500" />;
      case 'execute_tool':
        return <PuzzlePiece className="h-5 w-5 text-green-500" />;
      case 'call_function':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'webhook':
        return <Webhook className="h-5 w-5 text-purple-500" />;
      case 'database_operation':
        return <Database className="h-5 w-5 text-amber-500" />;
      default:
        return <Play className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderTargetSelector = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {renderActionIcon(actionType)}
        <h3 className="text-md font-medium">{getActionTypeLabel(actionType)}</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="target">Select Target</Label>
        <Select
          value={selectedTarget.id}
          onValueChange={handleTargetChange}
        >
          <SelectTrigger id="target" className="w-full">
            <SelectValue placeholder="Select target..." />
          </SelectTrigger>
          <SelectContent>
            {getTargetOptions().map((target: any) => (
              <SelectItem key={target.id} value={target.id}>
                <div className="flex justify-between items-center w-full">
                  <span>{target.name}</span>
                  {target.type && (
                    <Badge variant="outline" className="ml-2">
                      {target.type}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return 'Invoke AI Agent';
      case 'execute_tool':
        return 'Execute Tool';
      case 'call_function':
        return 'Call Function';
      case 'webhook':
        return 'Send Webhook';
      case 'database_operation':
        return 'Database Operation';
      default:
        return 'Select Action Type';
    }
  };

  const renderParameterField = (field: any) => {
    const value = parameters[field.key] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.key}
            id={`param-${field.key}`}
            value={value as string}
            placeholder={field.placeholder}
            onChange={(e) => handleParameterChange(field.key, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.key}
            id={`param-${field.key}`}
            value={value as string}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => handleParameterChange(field.key, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            key={field.key}
            id={`param-${field.key}`}
            type="number"
            value={value as string}
            placeholder={field.placeholder}
            onChange={(e) => handleParameterChange(field.key, parseFloat(e.target.value))}
          />
        );
      case 'select':
        return (
          <Select
            key={field.key}
            value={value as string}
            onValueChange={(val) => handleParameterChange(field.key, val)}
          >
            <SelectTrigger id={`param-${field.key}`}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option: string) => (
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
            key={field.key}
            id={`param-${field.key}`}
            className="font-mono text-sm"
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value as string}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParameterChange(field.key, parsed);
              } catch {
                handleParameterChange(field.key, e.target.value);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderParameterForm = () => (
    <div className="space-y-4 pt-2">
      {getParameterFields().map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`param-${field.key}`}>{field.label}</Label>
          {renderParameterField(field)}
        </div>
      ))}
    </div>
  );

  const renderRetryPolicy = () => (
    <div className="space-y-4 pt-2 mt-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label className="text-base">Retry Policy</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure automatic retry behavior</p>
        </div>
        <Switch
          checked={enableRetry}
          onCheckedChange={setEnableRetry}
        />
      </div>
      
      {enableRetry && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max-retries">Max Retries</Label>
            <Input
              id="max-retries"
              type="number"
              min={1}
              max={10}
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backoff">Backoff Multiplier</Label>
            <Input
              id="backoff"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={backoffMultiplier}
              onChange={(e) => setBackoffMultiplier(parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderJsonEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Parameters (JSON)</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setParametersJson(JSON.stringify(parameters, null, 2))}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Sync
        </Button>
      </div>
      <Textarea
        className="font-mono text-sm"
        rows={12}
        value={parametersJson}
        onChange={(e) => handleJsonParametersChange(e.target.value)}
      />
    </div>
  );

  return (
    <Card className="border border-indigo-100 dark:border-indigo-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Action Configuration
          </CardTitle>
        </div>
        <CardDescription>
          Configure what action will be performed when the trigger conditions are met
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="action-type">Action Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Button
              type="button"
              variant={actionType === 'invoke_agent' ? 'secondary' : 'outline'}
              className={`flex flex-col items-center justify-center h-24 px-3 ${
                actionType === 'invoke_agent' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
              }`}
              onClick={() => setActionType('invoke_agent')}
            >
              <Bot className="h-8 w-8 mb-2 text-indigo-500" />
              <span className="text-sm">Invoke Agent</span>
            </Button>
            
            <Button
              type="button"
              variant={actionType === 'execute_tool' ? 'secondary' : 'outline'}
              className={`flex flex-col items-center justify-center h-24 px-3 ${
                actionType === 'execute_tool' ? 'bg-green-50 dark:bg-green-900/30' : ''
              }`}
              onClick={() => setActionType('execute_tool')}
            >
              <PuzzlePiece className="h-8 w-8 mb-2 text-green-500" />
              <span className="text-sm">Execute Tool</span>
            </Button>
            
            <Button
              type="button"
              variant={actionType === 'call_function' ? 'secondary' : 'outline'}
              className={`flex flex-col items-center justify-center h-24 px-3 ${
                actionType === 'call_function' ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => setActionType('call_function')}
            >
              <Code className="h-8 w-8 mb-2 text-blue-500" />
              <span className="text-sm">Call Function</span>
            </Button>
            
            <Button
              type="button"
              variant={actionType === 'webhook' ? 'secondary' : 'outline'}
              className={`flex flex-col items-center justify-center h-24 px-3 ${
                actionType === 'webhook' ? 'bg-purple-50 dark:bg-purple-900/30' : ''
              }`}
              onClick={() => setActionType('webhook')}
            >
              <Webhook className="h-8 w-8 mb-2 text-purple-500" />
              <span className="text-sm">Send Webhook</span>
            </Button>
            
            <Button
              type="button"
              variant={actionType === 'database_operation' ? 'secondary' : 'outline'}
              className={`flex flex-col items-center justify-center h-24 px-3 ${
                actionType === 'database_operation' ? 'bg-amber-50 dark:bg-amber-900/30' : ''
              }`}
              onClick={() => setActionType('database_operation')}
            >
              <Database className="h-8 w-8 mb-2 text-amber-500" />
              <span className="text-sm">Database Op</span>
            </Button>
          </div>
        </div>
        
        {actionType && (
          <>
            <Separator className="my-6" />
            
            <div className="space-y-6">
              {renderTargetSelector()}
              
              {selectedTarget.id && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="visual" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Visual Editor
                    </TabsTrigger>
                    <TabsTrigger value="json" className="flex items-center">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON Editor
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visual" className="pt-4">
                    <ScrollArea className="h-[320px] pr-4">
                      {renderParameterForm()}
                      {renderRetryPolicy()}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="json" className="pt-4">
                    <ScrollArea className="h-[320px] pr-4">
                      {renderJsonEditor()}
                      {renderRetryPolicy()}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </>
        )}
        
        {!actionType && (
          <div className="flex items-center justify-center p-8 border border-dashed rounded-md text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <span>Select an action type to continue</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionBuilder;