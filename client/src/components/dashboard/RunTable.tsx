import { useState } from "react";
import { Link } from "wouter";
import { Run } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { FileText, Activity, AlertTriangle, LucideIcon } from "lucide-react";

interface RunTableProps {
  runs: Run[];
}

const RunTable = ({ runs }: RunTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const runsPerPage = 10;
  const totalPages = Math.ceil(runs.length / runsPerPage);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-lime-100 text-lime-700" variant="outline">Success</Badge>;
      case 'Failed':
        return <Badge className="bg-rose-100 text-rose-700" variant="outline">Failed</Badge>;
      case 'Needs Approval':
        return <Badge className="bg-yellow-100 text-yellow-700" variant="outline">Needs Approval</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-700" variant="outline">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getAgentIcon = (icon: string): LucideIcon => {
    switch (icon) {
      case 'file-text':
        return FileText;
      case 'activity':
        return Activity;
      case 'alert-triangle':
        return AlertTriangle;
      default:
        return FileText;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => {
              const AgentIcon = getAgentIcon(run.agentIcon);
              
              return (
                <TableRow key={run.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-primary/10 rounded flex items-center justify-center mr-2">
                        <AgentIcon className="h-4 w-4 text-primary" />
                      </div>
                      {run.agentName}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>{run.latency}s</TableCell>
                  <TableCell>${run.cost.toFixed(4)}</TableCell>
                  <TableCell>{run.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/runs/${run.id}`} className="text-primary hover:text-primary/80">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{runsPerPage}</span> of <span className="font-medium">{runs.length}</span> results
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RunTable;
