import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  DollarSign, 
  Tool, 
  AlertTriangle, 
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for policy insights
const mockPolicyData = {
  piiMask: true,
  maxPayout: 2000,
  tools: [
    "data_fabric.query",
    "workflow.trigger",
    "rules.evaluate",
    "idp.extract",
    "case.update"
  ],
  violations: [
    {run: "run-9Y57", rule: "PII mask", timestamp: "2025-05-15T14:22:15"},
    {run: "run-8Y42", rule: "Max payout", timestamp: "2025-05-12T09:14:32"},
    {run: "run-7Y31", rule: "Tool allowlist", timestamp: "2025-05-10T11:03:45"}
  ]
};

const AgentPolicyInsights = () => {
  const { toast } = useToast();
  
  const handleDownloadPolicy = () => {
    toast({
      title: "Policy downloaded",
      description: "Policy JSON has been downloaded successfully.",
    });
  };
  
  const handleViewViolation = (runId: string) => {
    toast({
      title: "Opening run details",
      description: `Opening details for ${runId}...`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Policy Summary */}
      <div className="flex flex-wrap gap-3">
        <Badge className="py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-default flex items-center">
          <ShieldCheck className="mr-1 h-4 w-4" />
          PII Mask ON
        </Badge>
        
        <Badge className="py-2 bg-green-100 text-green-700 hover:bg-green-200 cursor-default flex items-center">
          <DollarSign className="mr-1 h-4 w-4" />
          Max ${mockPolicyData.maxPayout} Payout
        </Badge>
        
        <Badge className="py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-default flex items-center">
          <Tool className="mr-1 h-4 w-4" />
          Tools Allow-List ({mockPolicyData.tools.length})
        </Badge>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={handleDownloadPolicy}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Policy JSON
        </Button>
      </div>
      
      {/* Policy Violations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Policy Violations Timeline</CardTitle>
          <CardDescription>Recent events where policy enforcement was triggered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {mockPolicyData.violations.map((violation, index) => {
                const date = new Date(violation.timestamp);
                
                return (
                  <div key={index} className="ml-10 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 border border-red-200">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{violation.rule} violation</h3>
                        <p className="text-sm text-gray-500">Run ID: {violation.run}</p>
                      </div>
                      
                      <div className="flex items-center mt-1 sm:mt-0">
                        <span className="text-xs text-gray-500 mr-3">
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewViolation(violation.run)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Policy Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tools Allow-List</CardTitle>
            <CardDescription>Tools the agent is permitted to use</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockPolicyData.tools.map((tool, index) => (
                <li key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mr-2"></div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{tool}</code>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>PII Protection Rules</CardTitle>
            <CardDescription>Patterns used to mask personally identifiable information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700">SSN Pattern</p>
                <code className="text-xs text-gray-600 block mt-1">
                  \b(?!000|666|9\d{2})([0-8]\d{2}|7([0-6]\d|7[012]))([-]?|\s{1})(?!00)\d\d\2(?!0000)\d{4}\b
                </code>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700">Credit Card Pattern</p>
                <code className="text-xs text-gray-600 block mt-1">
                  \b(?:\d[ -]*?){13,16}\b
                </code>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700">Phone Number Pattern</p>
                <code className="text-xs text-gray-600 block mt-1">
                  \b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentPolicyInsights;