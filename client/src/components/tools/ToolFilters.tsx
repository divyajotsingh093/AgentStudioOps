import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ToolFiltersProps {
  filters: {
    type: string;
    status: string;
    search: string;
  };
  onChange: (filters: { type: string; status: string; search: string }) => void;
  className?: string;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({ filters, onChange, className }) => {
  const handleChange = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className={cn("p-4 border rounded-lg bg-card", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name or description"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tool-type">Tool Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger id="tool-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Function">Function</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Integration">Integration</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tool-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger id="tool-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;