import React from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import ToolForm from "@/components/tools/ToolForm";
import { z } from "zod";
import { insertToolSchema } from "@shared/schema";

type FormValues = z.infer<typeof insertToolSchema>;

const NewToolPage: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create tool");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tool created",
        description: "The tool has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      navigate("/tools");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>New Tool | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Create a new tool or integration for AI agents" />
      </Helmet>

      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Create New Tool</h1>
          <p className="text-gray-500">
            Add a new external tool or integration for your agents
          </p>
        </div>

        <ToolForm 
          onSubmit={handleSubmit} 
          isSubmitting={createMutation.isPending} 
        />
      </div>
    </>
  );
};

export default NewToolPage;