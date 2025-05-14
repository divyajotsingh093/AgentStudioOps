import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, X, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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

interface DraggableConditionBuilderProps {
  value: ConditionGroup;
  onChange: (value: ConditionGroup) => void;
  availableFields?: { name: string; type: string }[];
}

// Component to render a single draggable condition item
const SortableConditionItem = ({
  condition,
  index,
  onRemove,
  onChange,
  availableFields,
}: {
  condition: ConditionItem;
  index: number;
  onRemove: () => void;
  onChange: (updatedCondition: ConditionItem) => void;
  availableFields?: { name: string; type: string }[];
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: condition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const comparatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
    { value: 'not_exists', label: 'Not Exists' },
  ];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 bg-white rounded-lg shadow-sm border p-4 relative"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="cursor-grab p-2 hover:bg-gray-50 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <Label className="text-sm font-medium flex-grow">Condition {index + 1}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 rounded-full"
        >
          <X size={16} className="text-gray-500" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-5">
          <Label htmlFor={`field-${condition.id}`} className="text-xs mb-1 block">
            Field
          </Label>
          <Select
            value={condition.field}
            onValueChange={(value) => onChange({ ...condition, field: value })}
          >
            <SelectTrigger id={`field-${condition.id}`}>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields ? (
                availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.name} <span className="text-xs text-gray-500">({field.type})</span>
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="event.type">event.type</SelectItem>
                  <SelectItem value="event.timestamp">event.timestamp</SelectItem>
                  <SelectItem value="event.payload.id">event.payload.id</SelectItem>
                  <SelectItem value="event.payload.status">event.payload.status</SelectItem>
                  <SelectItem value="event.payload.amount">event.payload.amount</SelectItem>
                  <SelectItem value="event.source">event.source</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3">
          <Label htmlFor={`comparator-${condition.id}`} className="text-xs mb-1 block">
            Comparator
          </Label>
          <Select
            value={condition.comparator}
            onValueChange={(value) => onChange({ ...condition, comparator: value as ConditionComparatorType })}
          >
            <SelectTrigger id={`comparator-${condition.id}`}>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {comparatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-4">
          <Label htmlFor={`value-${condition.id}`} className="text-xs mb-1 block">
            Value
          </Label>
          <Input
            id={`value-${condition.id}`}
            value={condition.value as string}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            disabled={['exists', 'not_exists'].includes(condition.comparator)}
            placeholder={['exists', 'not_exists'].includes(condition.comparator) ? 'N/A' : 'Enter value'}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Component to render a group of conditions with an operator (AND/OR)
const SortableConditionGroup = ({
  group,
  onUpdate,
  onRemove,
  depth = 0,
  availableFields,
}: {
  group: ConditionGroup;
  onUpdate: (updatedGroup: ConditionGroup) => void;
  onRemove?: () => void;
  depth?: number;
  availableFields?: { name: string; type: string }[];
}) => {
  const isRootLevel = depth === 0;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ConditionItem | null>(null);

  // Generate a new unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new condition
  const addCondition = () => {
    const newCondition: ConditionItem = {
      id: generateId(),
      field: '',
      comparator: 'equals',
      value: '',
    };

    onUpdate({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  // Add a new nested group
  const addGroup = () => {
    const newGroup: ConditionGroup = {
      id: generateId(),
      operator: 'AND',
      conditions: [],
    };

    onUpdate({
      ...group,
      conditions: [...group.conditions, newGroup],
    });
  };

  // Update a specific condition
  const updateCondition = (id: string, updatedCondition: ConditionItem | ConditionGroup) => {
    onUpdate({
      ...group,
      conditions: group.conditions.map((condition) =>
        condition.id === id ? updatedCondition : condition
      ),
    });
  };

  // Remove a specific condition
  const removeCondition = (id: string) => {
    onUpdate({
      ...group,
      conditions: group.conditions.filter((condition) => condition.id !== id),
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const draggedItem = group.conditions.find((item) => item.id === active.id) as ConditionItem;
    if (draggedItem && 'field' in draggedItem) {
      setActiveItem(draggedItem);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = group.conditions.findIndex((item) => item.id === active.id);
      const newIndex = group.conditions.findIndex((item) => item.id === over.id);
      
      onUpdate({
        ...group,
        conditions: arrayMove(group.conditions, oldIndex, newIndex),
      });
    }
    
    setActiveId(null);
    setActiveItem(null);
  };

  const itemsEmpty = group.conditions.length === 0;

  return (
    <Card className={`mb-4 ${depth > 0 ? 'border-indigo-100' : 'border'}`}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base">
            {isRootLevel ? 'Condition Builder' : `Group (Depth: ${depth})`}
          </CardTitle>
          <div className="flex gap-2">
            <Select 
              value={group.operator} 
              onValueChange={(value) => onUpdate({ ...group, operator: value as ConditionOperatorType })}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="AND" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            {group.conditions.length > 0 && (
              <Badge variant="outline" className="h-8 px-3 flex items-center">
                {group.conditions.length} {group.conditions.length === 1 ? 'Condition' : 'Conditions'}
              </Badge>
            )}
          </div>
        </div>
        
        {!isRootLevel && onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 h-8 w-8">
            <Trash2 size={16} />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className={`pt-0 px-4 pb-4 ${depth > 0 ? 'bg-indigo-50/20' : ''}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={group.conditions.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {group.conditions.map((condition, index) => {
                if ('field' in condition) {
                  // This is a condition item
                  return (
                    <SortableConditionItem
                      key={condition.id}
                      condition={condition}
                      index={index}
                      onRemove={() => removeCondition(condition.id)}
                      onChange={(updatedCondition) => updateCondition(condition.id, updatedCondition)}
                      availableFields={availableFields}
                    />
                  );
                } else {
                  // This is a nested condition group
                  return (
                    <SortableConditionGroup
                      key={condition.id}
                      group={condition}
                      onUpdate={(updatedGroup) => updateCondition(condition.id, updatedGroup)}
                      onRemove={() => removeCondition(condition.id)}
                      depth={depth + 1}
                      availableFields={availableFields}
                    />
                  );
                }
              })}
            </AnimatePresence>
          </SortableContext>

          {activeId && activeItem && (
            <DragOverlay>
              <div className="bg-white border rounded-lg shadow-lg p-4 opacity-80 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">
                    {activeItem.field || 'New condition'}
                  </span>
                </div>
              </div>
            </DragOverlay>
          )}
        </DndContext>

        {itemsEmpty && (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <AlertTriangle size={32} className="text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4 text-center">
              No conditions added yet. Add a condition or group to define when this trigger should activate.
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="shadow-none"
          >
            <Plus size={16} className="mr-1" />
            Add Condition
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="shadow-none bg-indigo-50/50"
          >
            <Plus size={16} className="mr-1" />
            Add Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DraggableConditionBuilder: React.FC<DraggableConditionBuilderProps> = ({
  value,
  onChange,
  availableFields,
}) => {
  // Initialize with default values if not provided
  const initialValue = value || {
    id: `group-${Date.now()}`,
    operator: 'AND' as ConditionOperatorType,
    conditions: [],
  };

  return (
    <div className="condition-builder">
      <SortableConditionGroup
        group={initialValue}
        onUpdate={onChange}
        availableFields={availableFields}
      />
    </div>
  );
};

export default DraggableConditionBuilder;