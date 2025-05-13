import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { mockAgents } from "@/lib/mock-agents";
import AgentGrid from "@/components/agents/overview/AgentGrid";

type AgentFilterType = 'UW' | 'Claims' | 'Service' | 'Fraud' | 'All';

const AgentsLanding = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AgentFilterType>('All');
  
  // Filter agents based on search query and selected filter
  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'All' || agent.type.includes(selectedFilter as any);
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Agent Catalog</h1>
            <p className="text-gray-600">Create and manage your insurance AI agents</p>
          </div>
          <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
            <Plus className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search agents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as AgentFilterType)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="UW">Underwriting</SelectItem>
              <SelectItem value="Claims">Claims</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Fraud">Fraud</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Agent Cards Grid */}
        <AgentGrid 
          agents={filteredAgents} 
          title={
            selectedFilter === 'All' 
              ? 'All Insurance Agents' 
              : `${selectedFilter} Agents`
          }
          description={
            `Showing ${filteredAgents.length} ${selectedFilter === 'All' ? '' : selectedFilter + ' '}agents`
          }
        />
      </div>
    </ResponsiveContainer>
  );
};

export default AgentsLanding;
