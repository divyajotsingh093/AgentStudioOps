import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Filter, Trash2 } from "lucide-react";
import { ResponsiveDataGrid } from "@/components/shared/ResponsiveDataGrid";
import ToolCard from "@/components/tools/ToolCard";
import ToolFilters from "@/components/tools/ToolFilters";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AgentTool } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Helmet } from "react-helmet";

const ToolsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });

  const { data: tools = [], isLoading } = useQuery<AgentTool[]>({
    queryKey: ['/api/tools'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/tools/${id}`, {
        method: 'DELETE',
        data: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({
        title: "Tool deleted",
        description: "The tool has been successfully deleted",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the tool. It may be in use by one or more agents.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDelete = (id: number) => {
    setSelectedToolId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedToolId !== null) {
      deleteMutation.mutate(selectedToolId);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesType = filters.type ? tool.type === filters.type : true;
    const matchesStatus = filters.status ? tool.status === filters.status : true;
    const matchesSearch = filters.search 
      ? tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(filters.search.toLowerCase()))
      : true;
    
    return matchesType && matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Helmet>
        <title>Tool Management | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Manage custom tools and integrations for your AI agents." />
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tool Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage tools that agents can use to interact with external systems
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Link href="/tools/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Tool
            </Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <ToolFilters
          filters={filters}
          onChange={setFilters}
          className="mb-6"
        />
      )}

      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4 text-center">
            {tools.length === 0
              ? "No tools have been created yet."
              : "No tools match your current filters."}
          </p>
          {tools.length === 0 ? (
            <Link href="/tools/new">
              <Button>Create your first tool</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={() => setFilters({ type: "", status: "", search: "" })}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <ResponsiveDataGrid
          items={filteredTools}
          minWidth={300}
          gap={6}
          renderItem={(tool) => (
            <ToolCard
              tool={tool}
              onDelete={() => handleDelete(tool.id)}
            />
          )}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tool and remove it 
              from any agents that may be using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToolsPage;