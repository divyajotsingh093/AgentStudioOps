import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Network, Plus, AlertTriangle, Check, RotateCw, FileCode, Edit, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Flow = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  version: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export default function AgentOrchestrationIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  const { data: flows, isLoading, isError, refetch } = useQuery<Flow[]>({
    queryKey: ['/api/flows'],
    retry: 1
  });

  const filteredFlows = flows?.filter(flow => {
    const matchesSearch = searchTerm === "" || 
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.description && flow.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || flow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500 hover:bg-green-600";
      case "Draft":
        return "bg-amber-500 hover:bg-amber-600";
      case "Testing":
        return "bg-blue-500 hover:bg-blue-600";
      case "Inactive":
        return "bg-gray-500 hover:bg-gray-600";
      case "Archived":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleDeleteFlow = async (id: number) => {
    try {
      await fetch(`/api/flows/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: "Flow deleted",
        description: "The flow was successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Agent Orchestration</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <RotateCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Agent Orchestration</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <span className="ml-2">Failed to load flows. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agent Orchestration | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Create, manage and monitor agent workflows using Neutrinos AI Agent Orchestration Canvas" />
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Network className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Agent Orchestration</h1>
          </div>
          <Link href="/agent-orchestration/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flow
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Flow Management</CardTitle>
            <CardDescription>
              Create, edit, and manage agent orchestration flows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input
                  id="search"
                  placeholder="Search flows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value || undefined)}
                >
                  <SelectTrigger id="status-filter" className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredFlows.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center">
                  <FileCode className="h-12 w-12 text-gray-400 mb-2" />
                </div>
                <h3 className="text-lg font-medium mb-1">No flows found</h3>
                <p className="text-gray-500">
                  {flows?.length === 0
                    ? "Get started by creating your first agent orchestration flow"
                    : "No flows match your search criteria"}
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlows.map((flow) => (
                      <TableRow key={flow.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{flow.name}</div>
                            {flow.description && (
                              <div className="text-sm text-gray-500">{flow.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(flow.status)}>
                            {flow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{flow.version}</TableCell>
                        <TableCell>{new Date(flow.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/agent-orchestration/${flow.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the flow "{flow.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteFlow(flow.id)} className="bg-red-500 hover:bg-red-600">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-gray-500">
            {flows && (
              <div>
                Showing {filteredFlows.length} of {flows.length} flows
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}