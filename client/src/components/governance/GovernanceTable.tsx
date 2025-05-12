import { useState } from "react";
import { GovernanceIssue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { FileText, Activity, AlertTriangle, LucideIcon } from "lucide-react";

interface GovernanceTableProps {
  issues: GovernanceIssue[];
  onReviewIssue: (issue: GovernanceIssue) => void;
}

const GovernanceTable = ({ issues, onReviewIssue }: GovernanceTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 10;
  const totalPages = Math.ceil(issues.length / issuesPerPage);
  
  const getIssueTypeBadge = (type: string) => {
    switch (type) {
      case 'Policy Violation':
        return <Badge className="bg-rose-100 text-rose-700" variant="outline">Policy Violation</Badge>;
      case 'Needs Approval':
        return <Badge className="bg-yellow-100 text-yellow-700" variant="outline">Needs Approval</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-blue-100 text-blue-700" variant="outline">Pending</Badge>;
      case 'Approved':
        return <Badge className="bg-lime-100 text-lime-700" variant="outline">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-rose-100 text-rose-700" variant="outline">Rejected</Badge>;
      case 'Resolved':
        return <Badge className="bg-lime-100 text-lime-700" variant="outline">Resolved</Badge>;
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
              <TableHead>Issue Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => {
              const AgentIcon = getAgentIcon(issue.agentIcon);
              
              return (
                <TableRow key={issue.runId} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{issue.runId}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-primary/10 rounded flex items-center justify-center mr-2">
                        <AgentIcon className="h-4 w-4 text-primary" />
                      </div>
                      {issue.agentName}
                    </div>
                  </TableCell>
                  <TableCell>{getIssueTypeBadge(issue.issueType)}</TableCell>
                  <TableCell className="max-w-md truncate">{issue.description}</TableCell>
                  <TableCell>{issue.timestamp}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(issue.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary/80 p-0"
                      onClick={() => onReviewIssue(issue)}
                    >
                      {issue.status === 'Pending' ? 'Review' : 'View'}
                    </Button>
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
          Showing <span className="font-medium">1</span> to <span className="font-medium">{issuesPerPage}</span> of <span className="font-medium">{issues.length}</span> results
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

export default GovernanceTable;
