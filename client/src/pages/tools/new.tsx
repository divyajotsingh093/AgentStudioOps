import React from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ToolForm from "@/components/tools/ToolForm";
import { insertToolSchema } from "@shared/schema";
import { z } from "zod";
import { Helmet } from "react-helmet";

type FormValues = z.infer<typeof insertToolSchema>;

const NewToolPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest('/api/tools', {
        method: 'POST',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({
        title: "Tool created",
        description: "New tool has been successfully created",
      });
      navigate("/tools");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create the tool. Please check your input and try again.",
        variant: "destructive",
      });
      console.error("Create error:", error);
    },
  });

  const handleSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Helmet>
        <title>Create New Tool | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Create a new tool or integration for your AI agents to enhance their capabilities." />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Tool</h1>
        <p className="text-gray-600 mt-1">
          Add a new tool or integration that agents can use to enhance their capabilities
        </p>
      </div>

      <ToolForm 
        onSubmit={handleSubmit} 
        isSubmitting={mutation.isPending} 
      />
    </div>
  );
};

export default NewToolPage;