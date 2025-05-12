import { useState } from "react";
import { Filter, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import GovernanceTable from "@/components/governance/GovernanceTable";
import ReviewDrawer from "@/components/governance/ReviewDrawer";
import { governanceIssues } from "@/lib/mock-data";
import { GovernanceIssue, IssueType } from "@/lib/types";

const GovernanceLog = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [agentFilter, setAgentFilter] = useState('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<IssueType | 'All'>('All');
  const [selectedIssue, setSelectedIssue] = useState<GovernanceIssue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const handleReviewIssue = (issue: GovernanceIssue) => {
    setSelectedIssue(issue);
    setIsDrawerOpen(true);
  };
  
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };
  
  const handleApproveIssue = (issue: GovernanceIssue, notes: string) => {
    console.log(`Approving issue for run ${issue.runId} with notes: ${notes}`);
    setIsDrawerOpen(false);
  };
  
  const handleRejectIssue = (issue: GovernanceIssue, notes: string) => {
    console.log(`Rejecting issue for run ${issue.runId} with notes: ${notes}`);
    setIsDrawerOpen(false);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header 
        title="Governance Log & Approvals"
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="flex items-center">
              <Shield className="mr-2 h-4 w-4" /> Policies
            </Button>
          </div>
        }
      />
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Agent</Label>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="accel-uw">Accelerated UW Agent</SelectItem>
                <SelectItem value="claims-fast">Auto Claims Fast-Track</SelectItem>
                <SelectItem value="fraud-detect">Fraud Detection Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Badge 
              className={`px-3 py-1.5 text-sm font-medium cursor-pointer ${
                issueTypeFilter === 'All' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              variant="outline"
              onClick={() => setIssueTypeFilter('All')}
            >
              All Issues
            </Badge>
            <Badge 
              className={`px-3 py-1.5 text-sm font-medium cursor-pointer ${
                issueTypeFilter === 'Policy Violation' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              variant="outline"
              onClick={() => setIssueTypeFilter('Policy Violation')}
            >
              Policy Violation
            </Badge>
            <Badge 
              className={`px-3 py-1.5 text-sm font-medium cursor-pointer ${
                issueTypeFilter === 'Needs Approval' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              variant="outline"
              onClick={() => setIssueTypeFilter('Needs Approval')}
            >
              Pending Approval
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Governance Table */}
      <GovernanceTable 
        issues={governanceIssues.filter(issue => 
          (issueTypeFilter === 'All' || issue.issueType === issueTypeFilter) &&
          (agentFilter === 'all' || issue.agentId === agentFilter)
        )} 
        onReviewIssue={handleReviewIssue}
      />
      
      {/* Review Drawer */}
      <ReviewDrawer 
        issue={selectedIssue}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApprove={handleApproveIssue}
        onReject={handleRejectIssue}
      />
    </div>
  );
};

export default GovernanceLog;
