import React, { useState } from "react";
import { useLocation } from "wouter";
import { Network, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const flowSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["Draft", "Testing", "Active", "Inactive", "Archived"]).default("Draft"),
  version: z.string().default("1.0.0"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof flowSchema>;

export default function NewFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(flowSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Draft",
      version: "1.0.0",
      tags: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];

      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create flow');
      }

      const result = await response.json();
      
      toast({
        title: "Flow Created",
        description: "Your new agent orchestration flow has been created successfully.",
      });
      
      navigate(`/agent-orchestration/${result.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create New Flow | Agent Orchestration | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Create a new agent orchestration flow for your AI agents" />
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/agent-orchestration')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flows
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Create New Flow</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Flow Details</CardTitle>
            <CardDescription>
              Define the basic information for your new agent orchestration flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for your flow" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name that identifies the purpose of this flow
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
                          placeholder="Describe what this flow does"
                          className="min-h-24"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description explaining the purpose and function of this flow
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current status of the flow
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
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Version number for this flow (e.g., 1.0.0)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Claims, Underwriting, Fraud, etc."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags to categorize this flow
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/agent-orchestration')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Flow"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}