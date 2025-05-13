import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Link } from "wouter";
import { toolTypeEnum, toolStatusEnum } from "@shared/schema";

interface ToolFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  type: string;
  setType: (type: string) => void;
  status: string;
  setStatus: (status: string) => void;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({
  search,
  setSearch,
  type,
  setType,
  status,
  setStatus,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-1 gap-3 flex-col sm:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tools..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {Object.values(toolTypeEnum.Values).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.values(toolStatusEnum.Values).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button asChild>
        <Link href="/tools/new">
          <Plus className="h-4 w-4 mr-2" />
          New Tool
        </Link>
      </Button>
    </div>
  );
};

export default ToolFilters;