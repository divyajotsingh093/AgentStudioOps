import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import AgentsLanding from "@/pages/agents/AgentsLanding";
import AgentStudio from "@/pages/agents/AgentStudio";
import AgentBuilderPage from "@/pages/agents/AgentBuilderPage";
import AgentComponentsPage from "@/pages/agents/components/AgentComponentsPage";
import RunDashboard from "@/pages/dashboard/RunDashboard";
import RunDetail from "@/pages/runs/RunDetail";
import GovernanceLog from "@/pages/governance/GovernanceLog";
import DataSourcesPage from "@/pages/data-sources";
import DataSourceDetail from "@/pages/data-sources/[id]";
import DataConnectorsPage from "@/pages/data-sources/connectors";
import ConnectorDetailPage from "@/pages/data-sources/connectors/[id]";
import DataFabricDashboard from "@/pages/data-fabric";
import DataModelsIndex from "@/pages/data-fabric/models";
import DataPoliciesIndex from "@/pages/data-fabric/policies";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={AgentsLanding} />
        <Route path="/agents" component={AgentsLanding} />
        <Route path="/agents/builder/:id" component={AgentBuilderPage} />
        <Route path="/agents/components" component={AgentComponentsPage} />
        <Route path="/agents/:id/execution" component={lazy(() => import('@/pages/agents/execution'))} />
        <Route path="/agents/:id" component={AgentStudio} />
        <Route path="/dashboard" component={RunDashboard} />
        <Route path="/runs/:id" component={RunDetail} />
        <Route path="/governance" component={GovernanceLog} />
        
        {/* Data Sources & Connectors */}
        <Route path="/data-sources" component={DataSourcesPage} />
        <Route path="/data-sources/connectors" component={DataConnectorsPage} />
        <Route path="/data-sources/connectors/:id" component={ConnectorDetailPage} />
        <Route path="/data-sources/:id" component={DataSourceDetail} />
        
        {/* Data Fabric */}
        <Route path="/data-fabric" component={DataFabricDashboard} />
        <Route path="/data-fabric/models" component={DataModelsIndex} />
        <Route path="/data-fabric/policies" component={DataPoliciesIndex} />
        
        {/* Tools */}
        <Route path="/tools" component={lazy(() => import('@/pages/tools'))} />
        <Route path="/tools/new" component={lazy(() => import('@/pages/tools/new'))} />
        <Route path="/tools/:id" component={lazy(() => import('@/pages/tools/[id]'))} />
        
        {/* Triggers */}
        <Route path="/triggers" component={lazy(() => import('@/pages/triggers'))} />
        <Route path="/triggers/new" component={lazy(() => import('@/pages/triggers/new'))} />
        <Route path="/triggers/:id" component={lazy(() => import('@/pages/triggers/[id]'))} />
        
        {/* Agent Orchestration */}
        <Route path="/agent-orchestration" component={lazy(() => import('@/pages/agent-orchestration'))} />
        <Route path="/agent-orchestration/new" component={lazy(() => import('@/pages/agent-orchestration/new'))} />
        <Route path="/agent-orchestration/:id" component={lazy(() => import('@/pages/agent-orchestration/[id]'))} />
        
        {/* Identity Providers (IDP) */}
        <Route path="/idp" component={lazy(() => import('@/pages/idp'))} />
        <Route path="/idp/providers/new" component={lazy(() => import('@/pages/idp/providers/new'))} />
        <Route path="/idp/providers/:id/edit" component={lazy(() => import('@/pages/idp/providers/[id]/edit'))} />
        <Route path="/idp/providers/:id" component={lazy(() => import('@/pages/idp/providers/[id]'))} />
        
        {/* Chat */}
        <Route path="/chat" component={lazy(() => import('@/pages/chat'))} />
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
