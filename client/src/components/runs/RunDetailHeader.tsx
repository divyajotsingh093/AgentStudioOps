import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Run } from "@/lib/types";

interface RunDetailHeaderProps {
  run: Run;
}

const RunDetailHeader = ({ run }: RunDetailHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return "bg-lime-100 text-lime-700";
      case 'Failed':
        return "bg-rose-100 text-rose-700";
      case 'Needs Approval':
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  
  return (
    <div className="flex items-center mb-6">
      <Link href="/dashboard">
        <a className="mr-3 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </a>
      </Link>
      <h1 className="text-2xl font-semibold">Run Details: {run.id}</h1>
      <Badge 
        className={`ml-3 ${getStatusColor(run.status)}`}
        variant="outline"
      >
        {run.status}
      </Badge>
    </div>
  );
};

export default RunDetailHeader;
