import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertToolSchema, toolTypeEnum, toolStatusEnum, toolAuthTypeEnum, AgentTool } from "@shared/schema";

// Extended schema with validation
const formSchema = insertToolSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(toolTypeEnum.options),
  status: z.enum(toolStatusEnum.options),
  authType: z.enum(toolAuthTypeEnum.options),
  endpoint: z.string().url("Must be a valid URL").nullable().optional(),
  // Added more complex validation for the JSON fields
  authConfig: z.any(),
  parameters: z.any(),
  responseSchema: z.any(),
  metadata: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

interface ToolFormProps {
  defaultValues?: Partial<AgentTool>;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const ToolForm: React.FC<ToolFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
}) => {
  const isEditMode = !!defaultValues?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      type: defaultValues?.type || "API",
      status: defaultValues?.status || "Draft",
      version: defaultValues?.version || "1.0.0",
      endpoint: defaultValues?.endpoint || "",
      authType: defaultValues?.authType || "None",
      authConfig: defaultValues?.authConfig || {},
      parameters: defaultValues?.parameters || [],
      responseSchema: defaultValues?.responseSchema || {},
      metadata: defaultValues?.metadata || {},
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weather API" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for the tool
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      Semantic version (e.g., 1.0.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provides weather information for a specified location"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain what this tool does and how agents can use it
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(toolTypeEnum.Values).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of integration
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
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(toolStatusEnum.Values).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of this tool
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endpoint"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/v1/weather" {...field} />
                    </FormControl>
                    <FormDescription>
                      The API endpoint for this tool (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(toolAuthTypeEnum.Values).map((authType) => (
                          <SelectItem key={authType} value={authType}>
                            {authType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How this tool authenticates with the service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="auth">Auth Configuration</TabsTrigger>
            <TabsTrigger value="response">Response Schema</TabsTrigger>
          </TabsList>
          <TabsContent value="parameters">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="parameters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parameters JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono h-64"
                          placeholder={JSON.stringify([
                            {
                              name: "location",
                              type: "string",
                              description: "City name or coordinates",
                              required: true
                            }
                          ], null, 2)}
                          value={typeof field.value === 'string' 
                            ? field.value 
                            : JSON.stringify(field.value, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              field.onChange(parsed);
                            } catch (err) {
                              // If it's not valid JSON yet, just store as string temporarily
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the parameters this tool accepts (JSON format)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="auth">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="authConfig"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Configuration JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono h-64"
                          placeholder={JSON.stringify({
                            apiKeyName: "X-API-Key",
                            apiKeyLocation: "header"
                          }, null, 2)}
                          value={typeof field.value === 'string' 
                            ? field.value 
                            : JSON.stringify(field.value, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              field.onChange(parsed);
                            } catch (err) {
                              // If it's not valid JSON yet, just store as string temporarily
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Configuration for authentication (JSON format)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="response">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="responseSchema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Schema JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono h-64"
                          placeholder={JSON.stringify({
                            type: "object",
                            properties: {
                              temperature: { type: "number" },
                              condition: { type: "string" }
                            }
                          }, null, 2)}
                          value={typeof field.value === 'string' 
                            ? field.value 
                            : JSON.stringify(field.value, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              field.onChange(parsed);
                            } catch (err) {
                              // If it's not valid JSON yet, just store as string temporarily
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the expected response format (JSON schema)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <a href="/tools">Cancel</a>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update Tool" : "Create Tool"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ToolForm;