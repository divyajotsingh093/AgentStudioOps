import { Agent } from "@/lib/types";
import AgentCard from "./AgentCard";

interface AgentListProps {
  agents: Agent[];
}

const AgentList = ({ agents }: AgentListProps) => {
  if (agents.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No agents found. Try adjusting your filters.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
};

export default AgentList;
