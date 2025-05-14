import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, GripVertical, Plus, Trash2, Filter, SquareBrackets, CircleDashed, CircleEqual } from 'lucide-react';

// Define types for our condition builder
export type ConditionOperatorType = 'AND' | 'OR';
export type ConditionComparatorType = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';

export interface ConditionItem {
  id: string;
  field: string;
  comparator: ConditionComparatorType;
  value: string | number | boolean;
}

export interface ConditionGroup {
  id: string;
  operator: ConditionOperatorType;
  conditions: (ConditionItem | ConditionGroup)[];
}

interface ConditionFieldProps {
  condition: ConditionItem;
  onChange: (updatedCondition: ConditionItem) => void;
  onRemove: () => void;
  availableFields?: { name: string; type: string }[];
}

// Component for a single condition
const ConditionField: React.FC<ConditionFieldProps> = ({ condition, onChange, onRemove, availableFields = [] }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: condition.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldType = availableFields.find(f => f.name === condition.field)?.type || 'string';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center space-x-2 p-3 border rounded-md bg-white dark:bg-slate-900 mb-2"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-slate-400" />
      </div>
      
      <Select
        value={condition.field}
        onValueChange={(value) => onChange({ ...condition, field: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((field) => (
            <SelectItem key={field.name} value={field.name}>
              {field.name}
              <Badge variant="outline" className="ml-2 text-xs">{field.type}</Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={condition.comparator}
        onValueChange={(value) => onChange({ ...condition, comparator: value as ConditionComparatorType })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Comparator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">Equals</SelectItem>
          <SelectItem value="not_equals">Not Equals</SelectItem>
          <SelectItem value="contains">Contains</SelectItem>
          <SelectItem value="greater_than">Greater Than</SelectItem>
          <SelectItem value="less_than">Less Than</SelectItem>
          <SelectItem value="exists">Exists</SelectItem>
          <SelectItem value="not_exists">Not Exists</SelectItem>
        </SelectContent>
      </Select>
      
      {condition.comparator !== 'exists' && condition.comparator !== 'not_exists' && (
        <Input
          type={fieldType === 'number' ? 'number' : 'text'}
          value={condition.value.toString()}
          onChange={(e) => {
            const value = fieldType === 'number' 
              ? parseFloat(e.target.value) 
              : e.target.value;
            onChange({ ...condition, value });
          }}
          className="w-[180px]"
          placeholder="Value"
        />
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRemove} 
        className="text-slate-400 hover:text-red-500"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

interface ConditionGroupProps {
  group: ConditionGroup;
  onUpdate: (updatedGroup: ConditionGroup) => void;
  onRemove?: () => void;
  depth?: number;
  availableFields?: { name: string; type: string }[];
}

// Component for a group of conditions
const ConditionGroupComponent: React.FC<ConditionGroupProps> = ({ 
  group, 
  onUpdate, 
  onRemove,
  depth = 0,
  availableFields = []
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ConditionItem | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getConditionIds = () => {
    return group.conditions
      .filter(item => 'field' in item) // Only include ConditionItems, not nested groups
      .map(item => (item as ConditionItem).id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const draggedItem = group.conditions.find(item => 
      'field' in item && (item as ConditionItem).id === active.id
    ) as ConditionItem;
    
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = group.conditions.findIndex(item => 
        'field' in item && (item as ConditionItem).id === active.id
      );
      const newIndex = group.conditions.findIndex(item => 
        'field' in item && (item as ConditionItem).id === over.id
      );
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newConditions = [...group.conditions];
        const [removed] = newConditions.splice(oldIndex, 1);
        newConditions.splice(newIndex, 0, removed);
        
        onUpdate({
          ...group,
          conditions: newConditions
        });
      }
    }
    
    setActiveId(null);
    setActiveItem(null);
  };

  const handleAddCondition = () => {
    const newCondition: ConditionItem = {
      id: `condition-${Date.now()}`,
      field: availableFields.length > 0 ? availableFields[0].name : '',
      comparator: 'equals',
      value: ''
    };
    
    onUpdate({
      ...group,
      conditions: [...group.conditions, newCondition]
    });
  };

  const handleAddGroup = () => {
    const newGroup: ConditionGroup = {
      id: `group-${Date.now()}`,
      operator: 'AND',
      conditions: []
    };
    
    onUpdate({
      ...group,
      conditions: [...group.conditions, newGroup]
    });
  };

  const handleOperatorChange = (value: ConditionOperatorType) => {
    onUpdate({
      ...group,
      operator: value
    });
  };

  const handleUpdateCondition = (index: number, updatedCondition: ConditionItem) => {
    const newConditions = [...group.conditions];
    newConditions[index] = updatedCondition;
    
    onUpdate({
      ...group,
      conditions: newConditions
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = [...group.conditions];
    newConditions.splice(index, 1);
    
    onUpdate({
      ...group,
      conditions: newConditions
    });
  };

  const handleUpdateNestedGroup = (index: number, updatedGroup: ConditionGroup) => {
    const newConditions = [...group.conditions];
    newConditions[index] = updatedGroup;
    
    onUpdate({
      ...group,
      conditions: newConditions
    });
  };

  const handleRemoveNestedGroup = (index: number) => {
    const newConditions = [...group.conditions];
    newConditions.splice(index, 1);
    
    onUpdate({
      ...group,
      conditions: newConditions
    });
  };

  const isRoot = depth === 0;
  const bgColor = depth % 2 === 0 
    ? 'bg-slate-50 dark:bg-slate-900' 
    : 'bg-white dark:bg-slate-800';

  return (
    <Card className={`border ${isRoot ? 'border-indigo-100 dark:border-indigo-900' : 'border-slate-200 dark:border-slate-700'} ${bgColor}`}>
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          {group.operator === 'AND' ? (
            <CircleEqual className="h-5 w-5 text-indigo-500" />
          ) : (
            <CircleDashed className="h-5 w-5 text-orange-500" />
          )}
          <CardTitle className="text-base">
            <Select value={group.operator} onValueChange={(value) => handleOperatorChange(value as ConditionOperatorType)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">
                  <div className="flex items-center">
                    <CircleEqual className="h-4 w-4 mr-2 text-indigo-500" />
                    AND
                  </div>
                </SelectItem>
                <SelectItem value="OR">
                  <div className="flex items-center">
                    <CircleDashed className="h-4 w-4 mr-2 text-orange-500" />
                    OR
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </div>
        
        {!isRoot && onRemove && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove} 
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-3 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={getConditionIds()}
            strategy={verticalListSortingStrategy}
          >
            {group.conditions.map((condition, index) => {
              if ('operator' in condition) {
                // Render nested condition group
                return (
                  <ConditionGroupComponent
                    key={condition.id}
                    group={condition}
                    onUpdate={(updatedGroup) => handleUpdateNestedGroup(index, updatedGroup)}
                    onRemove={() => handleRemoveNestedGroup(index)}
                    depth={depth + 1}
                    availableFields={availableFields}
                  />
                );
              } else if ('field' in condition) {
                // Render condition item
                return (
                  <ConditionField
                    key={condition.id}
                    condition={condition}
                    onChange={(updatedCondition) => handleUpdateCondition(index, updatedCondition)}
                    onRemove={() => handleRemoveCondition(index)}
                    availableFields={availableFields}
                  />
                );
              }
              return null;
            })}
          </SortableContext>
          
          <DragOverlay>
            {activeId && activeItem && (
              <div className="opacity-80">
                <ConditionField
                  condition={activeItem}
                  onChange={() => {}}
                  onRemove={() => {}}
                  availableFields={availableFields}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
        <div className="flex items-center space-x-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddCondition} 
            className="flex items-center text-slate-700 dark:text-slate-300"
          >
            <Filter className="h-4 w-4 mr-1" />
            Add Condition
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddGroup} 
            className="flex items-center text-slate-700 dark:text-slate-300"
          >
            <SquareBrackets className="h-4 w-4 mr-1" />
            Add Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DraggableConditionBuilderProps {
  value: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
  availableFields?: { name: string; type: string }[];
}

export const DraggableConditionBuilder: React.FC<DraggableConditionBuilderProps> = ({
  value,
  onChange,
  availableFields = []
}) => {
  // Ensure the group has an operator
  const group = value ? value : {
    id: `root-${Date.now()}`,
    operator: 'AND' as ConditionOperatorType,
    conditions: []
  };

  return (
    <div className="w-full">
      <ConditionGroupComponent
        group={group}
        onUpdate={onChange}
        availableFields={availableFields}
      />
    </div>
  );
};

export default DraggableConditionBuilder;