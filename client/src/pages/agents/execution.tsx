import { useParams } from "wouter";
import { AgentExecution } from "@/components/agents/AgentExecution";

export default function AgentExecutionRoute() {
  const { id } = useParams();
  // This route is for direct navigation to the execution page
  return (
    <AgentExecution agentName="Agent Execution" agentId={id || ""} />
  );
}