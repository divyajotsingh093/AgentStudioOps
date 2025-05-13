import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ToolForm from "@/components/tools/ToolForm";
import { updateToolSchema, AgentTool } from "@shared/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

type FormValues = z.infer<typeof updateToolSchema>;

const EditToolPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const toolId = parseInt(params.id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: tool, isLoading, error } = useQuery<AgentTool>({
    queryKey: [`/api/tools/${toolId}`],
    enabled: !isNaN(toolId),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest(`/api/tools/${toolId}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolId}`] });
      toast({
        title: "Tool updated",
        description: "The tool has been successfully updated",
      });
      navigate("/tools");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the tool. Please check your input and try again.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const handleSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tool not found</h3>
        <p className="text-gray-500 mb-4">
          The tool you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <a href="/tools" className="text-primary hover:underline">
          Return to tools
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Helmet>
        <title>Edit Tool: {tool.name} | Neutrinos AI Agent Studio</title>
        <meta name="description" content={`Edit settings for ${tool.name} tool and update its configuration.`} />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Tool: {tool.name}</h1>
        <p className="text-gray-600 mt-1">
          Update the configuration and settings for this tool
        </p>
      </div>

      <ToolForm 
        defaultValues={tool} 
        onSubmit={handleSubmit} 
        isSubmitting={mutation.isPending} 
      />
    </div>
  );
};

export default EditToolPage;