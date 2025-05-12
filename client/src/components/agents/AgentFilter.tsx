import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AgentType } from "@/lib/types";

interface AgentFilterProps {
  selectedFilter: AgentType | 'All';
  onFilterChange: (filter: AgentType | 'All') => void;
}

const AgentFilter = ({ selectedFilter, onFilterChange }: AgentFilterProps) => {
  const filters: (AgentType | 'All')[] = ['All', 'Claims', 'UW', 'Service', 'Fraud'];
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Badge
          key={filter}
          className={cn(
            "px-3 py-1 text-sm font-medium cursor-pointer",
            selectedFilter === filter 
              ? "bg-primary/10 text-primary" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          variant="outline"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </Badge>
      ))}
    </div>
  );
};

export default AgentFilter;
