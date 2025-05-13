import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AgentComponent, ComponentCategory } from './AgentComponentManager';

// Define the schema for component editing
const componentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["Context", "Tools", "Prompt", "Capability"]),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Available", "Restricted", "Draft"]).default("Draft"),
  type: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

type ComponentFormValues = z.infer<typeof componentFormSchema>;

interface ComponentEditorProps {
  open: boolean;
  onClose: () => void;
  component?: AgentComponent;
  onSave: (component: AgentComponent) => void;
  title?: string;
}

const ComponentEditor: React.FC<ComponentEditorProps> = ({
  open,
  onClose,
  component,
  onSave,
  title
}) => {
  // Initialize form with default values or existing component
  const form = useForm<ComponentFormValues>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      name: component?.name || "",
      category: (component?.category as any) || "Capability",
      description: component?.description || "",
      status: (component?.status as any) || "Draft",
      type: component?.type || "",
      details: component?.details || {},
    },
  });

  // Keep form values in sync with component
  useEffect(() => {
    if (component) {
      form.reset({
        name: component.name,
        category: component.category,
        description: component.description,
        status: (component.status as any) || "Draft",
        type: component.type || "",
        details: component.details || {},
      });
    } else {
      form.reset({
        name: "",
        category: "Capability",
        description: "",
        status: "Draft",
        type: "",
        details: {},
      });
    }
  }, [component, form]);

  // Extra fields for details that can be added dynamically
  const [detailFields, setDetailFields] = useState<{ key: string; value: string }[]>([]);

  // Initialize detail fields from component
  useEffect(() => {
    if (component?.details) {
      const fields = Object.entries(component.details).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setDetailFields(fields);
    } else {
      setDetailFields([]);
    }
  }, [component]);

  // Add a new detail field
  const addDetailField = () => {
    setDetailFields([...detailFields, { key: "", value: "" }]);
  };

  // Remove a detail field
  const removeDetailField = (index: number) => {
    const newFields = [...detailFields];
    newFields.splice(index, 1);
    setDetailFields(newFields);
  };

  // Update a detail field
  const updateDetailField = (index: number, key: string, value: string) => {
    const newFields = [...detailFields];
    newFields[index] = { key, value };
    setDetailFields(newFields);
  };

  // Handle form submission
  const onSubmit = (values: ComponentFormValues) => {
    // Convert detail fields to object
    const details = detailFields.reduce((acc, field) => {
      if (field.key) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Create or update component
    const updatedComponent: AgentComponent = {
      id: component?.id || `component-${Date.now()}`,
      name: values.name,
      category: values.category as ComponentCategory,
      description: values.description,
      status: values.status,
      type: values.type,
      details,
    };

    onSave(updatedComponent);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || (component ? "Edit Component" : "Add Component")}</DialogTitle>
          <DialogDescription>
            {component
              ? "Update the component details below."
              : "Fill in the details to create a new component."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Component name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Context">Context</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Prompt">Prompt</SelectItem>
                      <SelectItem value="Capability">Capability</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Describe the purpose and functionality of this component"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
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
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Restricted">Restricted</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Component type" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specific type or classification of this component
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Component Details</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addDetailField}
                >
                  Add Detail
                </Button>
              </div>
              
              {detailFields.map((field, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 mb-2"
                >
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateDetailField(index, e.target.value, field.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateDetailField(index, field.key, e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeDetailField(index)}
                    className="px-2"
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                {component ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentEditor;