import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import AgentsLanding from "@/pages/agents/AgentsLanding";
import AgentStudio from "@/pages/agents/AgentStudio";
import AgentBuilderPage from "@/pages/agents/AgentBuilderPage";
import RunDashboard from "@/pages/dashboard/RunDashboard";
import RunDetail from "@/pages/runs/RunDetail";
import GovernanceLog from "@/pages/governance/GovernanceLog";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={AgentsLanding} />
        <Route path="/agents" component={AgentsLanding} />
        <Route path="/agents/builder/:id" component={AgentBuilderPage} />
        <Route path="/agents/:id" component={AgentStudio} />
        <Route path="/dashboard" component={RunDashboard} />
        <Route path="/runs/:id" component={RunDetail} />
        <Route path="/governance" component={GovernanceLog} />
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
