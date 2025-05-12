import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AgentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const AgentSearch = ({ value, onChange }: AgentSearchProps) => {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search agents..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 py-3 rounded-xl"
      />
      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    </div>
  );
};

export default AgentSearch;
