import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Helmet } from "react-helmet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ToolCard from "@/components/tools/ToolCard";
import ToolFilters from "@/components/tools/ToolFilters";
import { useToast } from "@/hooks/use-toast";
import { AgentTool } from "@shared/schema";

const ToolsPage: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [toolToDelete, setToolToDelete] = useState<number | null>(null);

  // Fetch tools
  const { data: tools = [], isLoading, error } = useQuery<AgentTool[]>({
    queryKey: ["/api/tools"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Tool deleted",
        description: "The tool has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      setToolToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter tools based on search, type, and status
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = search
      ? tool.name.toLowerCase().includes(search.toLowerCase()) ||
        (tool.description?.toLowerCase() || "").includes(search.toLowerCase())
      : true;
    const matchesType = type ? tool.type === type : true;
    const matchesStatus = status ? tool.status === status : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteTool = (id: number) => {
    setToolToDelete(id);
  };

  const confirmDelete = () => {
    if (toolToDelete !== null) {
      deleteMutation.mutate(toolToDelete);
    }
  };

  const cancelDelete = () => {
    setToolToDelete(null);
  };

  return (
    <>
      <Helmet>
        <title>Tools | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Manage AI agent tools and integrations with Neutrinos AI Agent Studio" />
      </Helmet>

      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tools</h1>
            <p className="text-gray-500">Manage external integrations and tools for your agents</p>
          </div>
        </div>

        <ToolFilters
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading tools: {(error as Error).message}</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="p-8 text-center border rounded-lg">
            <h3 className="text-lg font-medium">No tools found</h3>
            <p className="text-gray-500 mt-1">
              {search || type || status
                ? "Try adjusting your filters"
                : "Get started by adding your first tool"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onDelete={handleDeleteTool} />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={toolToDelete !== null} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tool and remove it from any agents using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ToolsPage;