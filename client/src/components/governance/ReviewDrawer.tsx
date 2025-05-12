import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GovernanceIssue } from "@/lib/types";

interface ReviewDrawerProps {
  issue: GovernanceIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (issue: GovernanceIssue, notes: string) => void;
  onReject: (issue: GovernanceIssue, notes: string) => void;
}

const ReviewDrawer = ({ 
  issue, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: ReviewDrawerProps) => {
  const [notes, setNotes] = useState('');
  
  if (!issue) return null;
  
  const handleApprove = () => {
    onApprove(issue, notes);
  };
  
  const handleReject = () => {
    onReject(issue, notes);
  };
  
  return (
    <div 
      className={`fixed inset-0 overflow-hidden z-50 bg-black bg-opacity-25 ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl drawer-slide">
            {/* Drawer Header */}
            <div className="px-4 py-6 bg-primary text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Review Approval Request</h2>
                <button 
                  className="text-white hover:text-gray-200"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-primary-100 mt-1">Run ID: {issue.runId}</p>
            </div>
            
            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Issue Details</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-yellow-800">{issue.description}</p>
                  <p className="mt-1 text-yellow-700">
                    {issue.issueType === 'Needs Approval' 
                      ? 'Requires manual review by an authorized user.' 
                      : 'Policy violation detected by governance rules.'}
                  </p>
                  <p className="mt-1 text-yellow-600">Policy: GOV-FR-001</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Conversation Context</h3>
                <div className="border border-gray-200 rounded-lg p-3 h-64 overflow-y-auto">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">User</p>
                    <p className="text-sm">Please analyze this claim for potential fraud indicators.</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Agent</p>
                    <p className="text-sm">I'll analyze this claim for potential fraud indicators. Let me check for patterns and anomalies in the data.</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Agent (Tool: Document Intelligence)</p>
                    <p className="text-sm">I've analyzed the claim documents and found several inconsistencies:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      <li>Medical report dates don't match claim submission</li>
                      <li>Multiple treatment facilities with conflicting records</li>
                      <li>Previous claims with similar patterns identified</li>
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Agent (Tool: Fraud Score API)</p>
                    <p className="text-sm">Fraud analysis score: 0.82 (High Risk)</p>
                    <p className="text-sm mt-1">Factors contributing to score:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      <li>Pattern matches known fraud schemes (0.35)</li>
                      <li>Geographical anomaly in treatment locations (0.28)</li>
                      <li>Timing inconsistencies in documentation (0.19)</li>
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Agent (Needs Approval)</p>
                    <p className="text-sm">Based on my analysis, this claim shows significant fraud indicators with a fraud score of 0.82, which exceeds our threshold of 0.75. This requires manual review by a fraud specialist. I recommend placing this claim on hold and initiating a detailed investigation.</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Review Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full"
                  rows={4}
                  placeholder="Add your review notes here..."
                />
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="border-t border-gray-200 p-4 flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button 
                className="flex-1"
                onClick={handleApprove}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDrawer;
