import { useParams } from "wouter";
import { Shell } from "@/components/layout/Shell";
import AgentExecutionPage from "@/components/agents/execution/AgentExecutionPage";

export default function AgentExecutionRoute() {
  return (
    <Shell>
      <AgentExecutionPage />
    </Shell>
  );
}