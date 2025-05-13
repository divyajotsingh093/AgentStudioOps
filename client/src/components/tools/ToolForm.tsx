import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { AgentTool, insertToolSchema, updateToolSchema } from "@shared/schema";

interface ToolFormProps {
  defaultValues?: AgentTool;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  type: z.enum(["API", "Function", "Service", "Integration", "Custom"], {
    required_error: "Please select a tool type",
  }),
  status: z.enum(["Active", "Inactive", "Draft", "Deprecated"], {
    required_error: "Please select a status",
  }),
  version: z.string().min(1, { message: "Version is required" }),
  authType: z.enum(["None", "Custom", "ApiKey", "OAuth", "Basic"], {
    required_error: "Please select an authentication type",
  }),
  endpoint: z.string().url({ message: "Please enter a valid URL" }).optional().nullable(),
  parameters: z.any().optional(),
  authConfig: z.any().optional(),
  responseSchema: z.any().optional(),
});

const ToolForm: React.FC<ToolFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      type: "API",
      status: "Draft",
      version: "1.0.0",
      authType: "None",
      endpoint: "",
      parameters: [],
      authConfig: {},
      responseSchema: {},
    },
  });

  // Determine if an API endpoint is required based on the tool type
  const isEndpointRequired = form.watch("type") === "API";
  
  // Track active parameter editing sections
  const [activeParameterSection, setActiveParameterSection] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about this tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tool name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for this tool
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
                        placeholder="Describe what this tool does..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear description of the tool's functionality
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
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="Function">Function</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Integration">Integration</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      The version of this tool
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
              <CardDescription>
                Configure how the tool connects to external systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="authType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select authentication type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="ApiKey">API Key</SelectItem>
                        <SelectItem value="OAuth">OAuth</SelectItem>
                        <SelectItem value="Basic">Basic Auth</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How this tool authenticates with external systems
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Endpoint {isEndpointRequired && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://api.example.com/v1/resource" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL endpoint for this tool (required for API type tools)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* For simplicity, we're using a textarea for parameters and auth config */}
              <FormField
                control={form.control}
                name="parameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='[{"name": "param1", "type": "string", "required": true}]'
                        className="min-h-24 font-mono text-xs"
                        {...field}
                        value={
                          typeof field.value === 'string'
                            ? field.value
                            : JSON.stringify(field.value, null, 2)
                        }
                        onChange={(e) => {
                          try {
                            const value = e.target.value ? JSON.parse(e.target.value) : [];
                            field.onChange(value);
                          } catch (error) {
                            // Allow invalid JSON during typing
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The parameters this tool accepts (in JSON format)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <Link href="/tools">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? "Update Tool" : "Create Tool"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ToolForm;