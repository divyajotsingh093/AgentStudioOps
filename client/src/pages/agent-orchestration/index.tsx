import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, Layers, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Dashboard from "@/components/dashboard/Dashboard";

export default function AgentOrchestrationIndex() {
  const { data: flows, isLoading, error } = useQuery({
    queryKey: ["/api/flows"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Agent Orchestration Canvas</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-50 animate-pulse">
              <CardHeader className="h-24" />
              <CardContent />
              <CardFooter />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading flows",
      description: "Could not load agent orchestration flows. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <Dashboard
      title="Agent Orchestration Canvas"
      description="Design, configure, and monitor agent workflows"
      createButtonText="Create New Flow"
      createButtonLink="/agent-orchestration/new"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(flows?.length || 0) > 0 ? (
          flows?.map((flow: any) => (
            <Link
              key={flow.id}
              href={`/agent-orchestration/${flow.id}`}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{flow.name}</CardTitle>
                    <Badge variant={flow.status === "Active" ? "default" : "outline"}>
                      {flow.status}
                    </Badge>
                  </div>
                  <CardDescription>{flow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Layers size={16} />
                    <span>{flow.nodeCount || 0} nodes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                    <Activity size={16} />
                    <span>{flow.executionCount || 0} executions</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(flow.updatedAt).toLocaleString()}
                  </span>
                  <Button variant="ghost" size="sm">
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No flows yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first agent orchestration flow to get started
            </p>
            <Link href="/agent-orchestration/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Flow
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Dashboard>
  );
}