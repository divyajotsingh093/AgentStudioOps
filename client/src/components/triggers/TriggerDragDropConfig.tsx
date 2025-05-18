import React, { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Webhook, 
  Calendar, 
  Database, 
  Code, 
  AlertCircle, 
  BellRing, 
  Trash2, 
  Plus, 
  ArrowDownUp, 
  MoveHorizontal,
  Cog
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface TriggerTemplate {
  id: string;
  type: 'Webhook' | 'Schedule' | 'Event' | 'DataChange' | 'Manual';
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface TriggerCondition {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
}

interface TriggerAction {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
}

interface TriggerConfig {
  id: string;
  name: string;
  description: string;
  type: 'Webhook' | 'Schedule' | 'Event' | 'DataChange' | 'Manual';
  status: 'Active' | 'Inactive' | 'Draft';
  conditions: TriggerCondition[];
  actions: TriggerAction[];
}

// Utility function to get icon for trigger type
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

// Available trigger templates
const triggerTemplates: TriggerTemplate[] = [
  {
    id: 'webhook',
    type: 'Webhook',
    name: 'Webhook',
    description: 'Trigger based on external HTTP requests',
    icon: <Webhook className="h-4 w-4" />
  },
  {
    id: 'schedule',
    type: 'Schedule',
    name: 'Schedule',
    description: 'Trigger on a time-based schedule',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'event',
    type: 'Event',
    name: 'Event',
    description: 'Trigger based on system events',
    icon: <BellRing className="h-4 w-4" />
  },
  {
    id: 'datachange',
    type: 'DataChange',
    name: 'Data Change',
    description: 'Trigger when data changes',
    icon: <Database className="h-4 w-4" />
  },
  {
    id: 'manual',
    type: 'Manual',
    name: 'Manual',
    description: 'Trigger manually',
    icon: <Code className="h-4 w-4" />
  }
];

// Available condition templates
const conditionTemplates = [
  {
    id: 'data-condition',
    name: 'Data Condition',
    description: 'Check if data meets specific criteria',
    type: 'condition',
    config: { field: '', operator: 'equals', value: '' }
  },
  {
    id: 'time-condition',
    name: 'Time Condition',
    description: 'Check if the current time meets criteria',
    type: 'condition',
    config: { dayOfWeek: 'weekday', timeRange: '9-17' }
  },
  {
    id: 'policy-condition',
    name: 'Policy Condition',
    description: 'Check if a policy is in a specific state',
    type: 'condition',
    config: { policyType: 'auto', status: 'active' }
  }
];

// Available action templates
const actionTemplates = [
  {
    id: 'notify-action',
    name: 'Send Notification',
    description: 'Send a notification to a user or channel',
    type: 'action',
    config: { recipient: '', message: '', channel: 'email' }
  },
  {
    id: 'update-data-action',
    name: 'Update Data',
    description: 'Update data in the system',
    type: 'action',
    config: { entity: '', field: '', value: '' }
  },
  {
    id: 'run-agent-action',
    name: 'Run Agent',
    description: 'Execute an AI agent with parameters',
    type: 'action',
    config: { agentId: '', params: {} }
  }
];

// Draggable item component for triggers, conditions, and actions
const DraggableItem = ({ id, type, children }: { id: string, type: string, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { type }
  });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
};

// Sortable item for the workflow canvas
const SortableItem = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2"
    >
      {children}
    </div>
  );
};

// Canvas dropzone component
const CanvasDropzone = ({ children, onDrop }: { children: React.ReactNode, onDrop: (id: string, type: string) => void }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
    data: { accepts: ['trigger', 'condition', 'action'] },
    onDrop: (event) => {
      if (event.active && event.active.data.current) {
        const { id } = event.active;
        const { type } = event.active.data.current as { type: string };
        onDrop(id.toString(), type);
      }
    }
  });
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] bg-gray-50 rounded-lg p-4 ${isOver ? 'border-2 border-dashed border-primary' : 'border border-dashed border-gray-300'}`}
    >
      {children}
    </div>
  );
};

// Main component
export function TriggerDragDropConfig() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig | null>(null);
  const [conditions, setConditions] = useState<TriggerCondition[]>([]);
  const [actions, setActions] = useState<TriggerAction[]>([]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    if (event.active.data.current) {
      setActiveType((event.active.data.current as { type: string }).type);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);

    // Handle sorting within the canvas
    if (event.over && event.over.id === 'canvas') {
      // Handle dropping from palette to canvas
      if (event.active.data.current) {
        const { id } = event.active;
        const { type } = event.active.data.current as { type: string };
        handleDrop(id.toString(), type);
      }
    }

    // Handle reordering of conditions
    if (event.active.data.current && (event.active.data.current as any).type === 'condition' && 
        conditions.some(c => c.id === event.active.id) && event.over) {
      const oldIndex = conditions.findIndex(c => c.id === event.active.id);
      const newIndex = conditions.findIndex(c => c.id === event.over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setConditions(arrayMove(conditions, oldIndex, newIndex));
      }
    }
    
    // Handle reordering of actions
    if (event.active.data.current && (event.active.data.current as any).type === 'action' && 
        actions.some(a => a.id === event.active.id) && event.over) {
      const oldIndex = actions.findIndex(a => a.id === event.active.id);
      const newIndex = actions.findIndex(a => a.id === event.over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setActions(arrayMove(actions, oldIndex, newIndex));
      }
    }
  };

  // Handle drop from palette to canvas
  const handleDrop = (id: string, type: string) => {
    // Handle trigger selection (can only have one trigger)
    if (type === 'trigger') {
      const template = triggerTemplates.find(t => t.id === id);
      if (template) {
        setTriggerConfig({
          id: `trigger-${Date.now()}`,
          name: template.name,
          description: template.description,
          type: template.type,
          status: 'Draft',
          conditions: [],
          actions: []
        });
      }
    }
    
    // Handle condition addition
    if (type === 'condition') {
      const template = conditionTemplates.find(c => c.id === id);
      if (template) {
        setConditions([...conditions, {
          ...template,
          id: `${template.id}-${Date.now()}`
        }]);
      }
    }
    
    // Handle action addition
    if (type === 'action') {
      const template = actionTemplates.find(a => a.id === id);
      if (template) {
        setActions([...actions, {
          ...template,
          id: `${template.id}-${Date.now()}`
        }]);
      }
    }
  };

  // Handle removal of a condition
  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  // Handle removal of an action
  const handleRemoveAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  // Handle removal of the trigger
  const handleRemoveTrigger = () => {
    setTriggerConfig(null);
  };

  // Render function for drag overlay
  const renderDragOverlay = () => {
    if (!activeId || !activeType) return null;

    if (activeType === 'trigger') {
      const template = triggerTemplates.find(t => t.id === activeId);
      if (template) {
        return (
          <Card className="w-60 shadow-lg opacity-80">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {template.icon}
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      }
    }

    if (activeType === 'condition') {
      const template = conditionTemplates.find(c => c.id === activeId) || 
                      conditions.find(c => c.id === activeId);
      if (template) {
        return (
          <Card className="w-60 shadow-lg opacity-80">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      }
    }

    if (activeType === 'action') {
      const template = actionTemplates.find(a => a.id === activeId) ||
                      actions.find(a => a.id === activeId);
      if (template) {
        return (
          <Card className="w-60 shadow-lg opacity-80">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cog className="h-4 w-4" />
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      }
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trigger Configuration</CardTitle>
          <CardDescription>
            Drag and drop components to create your trigger workflow
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar - Components palette */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Components</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <h3 className="text-sm font-semibold mb-2">Triggers</h3>
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="space-y-2 mb-4">
                  {triggerTemplates.map((template) => (
                    <DraggableItem key={template.id} id={template.id} type="trigger">
                      <Card className="border border-gray-200 hover:border-primary transition-colors">
                        <CardHeader className="p-3">
                          <div className="flex items-center space-x-2">
                            {template.icon}
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    </DraggableItem>
                  ))}
                </div>

                <Separator className="my-4" />

                <h3 className="text-sm font-semibold mb-2">Conditions</h3>
                <div className="space-y-2 mb-4">
                  {conditionTemplates.map((condition) => (
                    <DraggableItem key={condition.id} id={condition.id} type="condition">
                      <Card className="border border-gray-200 hover:border-primary transition-colors">
                        <CardHeader className="p-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <CardTitle className="text-sm">{condition.name}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    </DraggableItem>
                  ))}
                </div>

                <Separator className="my-4" />

                <h3 className="text-sm font-semibold mb-2">Actions</h3>
                <div className="space-y-2">
                  {actionTemplates.map((action) => (
                    <DraggableItem key={action.id} id={action.id} type="action">
                      <Card className="border border-gray-200 hover:border-primary transition-colors">
                        <CardHeader className="p-3">
                          <div className="flex items-center space-x-2">
                            <Cog className="h-4 w-4" />
                            <CardTitle className="text-sm">{action.name}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    </DraggableItem>
                  ))}
                </div>

                <DragOverlay>{renderDragOverlay()}</DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Right area - Canvas */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle>Workflow Canvas</CardTitle>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Test this trigger configuration</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="default" size="sm">
                          Save
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save this trigger configuration</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardDescription>
                Drop components here to build your trigger workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <CanvasDropzone onDrop={handleDrop}>
                  <div className="space-y-4">
                    {/* Selected Trigger */}
                    {triggerConfig ? (
                      <Card className="border border-primary bg-primary/5">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(triggerConfig.type)}
                              <CardTitle className="text-sm">{triggerConfig.name}</CardTitle>
                              <Badge variant="outline" className="ml-2">Trigger</Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleRemoveTrigger}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-xs text-gray-600">{triggerConfig.description}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">Drag a trigger here to start</p>
                      </div>
                    )}

                    {/* Divider */}
                    {triggerConfig && (
                      <div className="flex justify-center">
                        <ArrowDownUp className="h-5 w-5 text-gray-400 rotate-90" />
                      </div>
                    )}

                    {/* Conditions */}
                    {triggerConfig && (
                      <Card className="border border-gray-200">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Conditions</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="py-0">
                          <SortableContext items={conditions.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            {conditions.length > 0 ? (
                              <div className="space-y-2">
                                {conditions.map((condition) => (
                                  <SortableItem key={condition.id} id={condition.id}>
                                    <Card className="border border-blue-200 bg-blue-50">
                                      <CardHeader className="py-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <MoveHorizontal className="h-4 w-4 text-gray-400 cursor-move" />
                                            <AlertCircle className="h-4 w-4 text-blue-500" />
                                            <CardTitle className="text-sm">{condition.name}</CardTitle>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveCondition(condition.id)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="py-1">
                                        <p className="text-xs text-gray-600">{condition.description}</p>
                                      </CardContent>
                                    </Card>
                                  </SortableItem>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-lg mb-4">
                                <p className="text-gray-500">Drag conditions here</p>
                              </div>
                            )}
                          </SortableContext>
                        </CardContent>
                      </Card>
                    )}

                    {/* Divider */}
                    {triggerConfig && (
                      <div className="flex justify-center">
                        <ArrowDownUp className="h-5 w-5 text-gray-400 rotate-90" />
                      </div>
                    )}

                    {/* Actions */}
                    {triggerConfig && (
                      <Card className="border border-gray-200">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Actions</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="py-0">
                          <SortableContext items={actions.map(a => a.id)} strategy={verticalListSortingStrategy}>
                            {actions.length > 0 ? (
                              <div className="space-y-2">
                                {actions.map((action) => (
                                  <SortableItem key={action.id} id={action.id}>
                                    <Card className="border border-green-200 bg-green-50">
                                      <CardHeader className="py-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <MoveHorizontal className="h-4 w-4 text-gray-400 cursor-move" />
                                            <Cog className="h-4 w-4 text-green-500" />
                                            <CardTitle className="text-sm">{action.name}</CardTitle>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveAction(action.id)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="py-1">
                                        <p className="text-xs text-gray-600">{action.description}</p>
                                      </CardContent>
                                    </Card>
                                  </SortableItem>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-lg mb-4">
                                <p className="text-gray-500">Drag actions here</p>
                              </div>
                            )}
                          </SortableContext>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CanvasDropzone>
                <DragOverlay>{renderDragOverlay()}</DragOverlay>
              </DndContext>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}