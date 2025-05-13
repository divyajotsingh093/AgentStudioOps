import React from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import ToolForm from "@/components/tools/ToolForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { updateToolSchema, AgentTool } from "@shared/schema";

type FormValues = z.infer<typeof updateToolSchema>;

const EditToolPage: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/tools/:id");

  const toolId = match ? parseInt(params.id) : null;

  // Fetch tool details
  const { data: tool, isLoading, error } = useQuery<AgentTool>({
    queryKey: ["/api/tools", toolId],
    enabled: !!toolId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tool");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tool updated",
        description: "The tool has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools", toolId] });
      navigate("/tools");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tool: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Tool not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Tool | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Edit an existing tool or integration for AI agents" />
      </Helmet>

      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Edit Tool</h1>
          <p className="text-gray-500">
            Update configuration for "{tool.name}"
          </p>
        </div>

        <ToolForm 
          defaultValues={tool} 
          onSubmit={handleSubmit} 
          isSubmitting={updateMutation.isPending} 
        />
      </div>
    </>
  );
};

export default EditToolPage;