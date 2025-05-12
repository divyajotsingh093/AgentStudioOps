import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import AgentSearch from "@/components/agents/AgentSearch";
import AgentFilter from "@/components/agents/AgentFilter";
import AgentList from "@/components/agents/AgentList";
import { agents } from "@/lib/mock-data";
import { AgentType } from "@/lib/types";

const AgentsLanding = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AgentType | 'All'>('All');
  
  // Filter agents based on search query and selected filter
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || agent.type.includes(selectedFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header 
        title="Agent Catalog"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        }
      />
      
      {/* Search and Filters */}
      <div className="mb-6">
        <AgentSearch value={searchQuery} onChange={setSearchQuery} />
        <AgentFilter 
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>
      
      {/* Agent Cards Grid */}
      <AgentList agents={filteredAgents} />
    </div>
  );
};

export default AgentsLanding;
