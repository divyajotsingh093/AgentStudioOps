import React from 'react';
import { Shield, Info, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PolicyDetailsProps {
  onClose?: () => void;
}

const PolicyDetails: React.FC<PolicyDetailsProps> = ({ onClose }) => {
  // Example policy details - this would come from the API in a real implementation
  const policyDetails = {
    name: "Underwriting Guidelines Policy",
    description: "Standard operating procedures for life insurance underwriting",
    version: "3.2",
    lastUpdated: "May 10, 2025",
    status: "Active",
    rules: [
      {
        id: "rule-1",
        name: "Maximum Automated Approval Limit",
        description: "Policies exceeding $500,000 in coverage require human approval",
        severity: "High",
        isActive: true,
        isViolated: true
      },
      {
        id: "rule-2",
        name: "Medical Data Requirements",
        description: "Applications missing required medical data must be flagged for review",
        severity: "Medium",
        isActive: true,
        isViolated: false
      },
      {
        id: "rule-3",
        name: "Age Restrictions",
        description: "Applicants over 65 years old require additional health assessment",
        severity: "Medium",
        isActive: true,
        isViolated: false
      },
      {
        id: "rule-4",
        name: "Risk Classification Standards",
        description: "Standard Plus or better classifications must meet all criteria without exceptions",
        severity: "High",
        isActive: true,
        isViolated: false
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-neutrinos-blue mr-2" />
          <h3 className="font-medium text-gray-900">Policy Details</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium">{policyDetails.name}</h4>
              <p className="text-xs text-gray-500">{policyDetails.description}</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {policyDetails.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Version:</span>
              <span className="ml-1 font-medium">{policyDetails.version}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-1 font-medium">{policyDetails.lastUpdated}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h5 className="text-xs font-medium uppercase text-gray-500">Policy Rules</h5>
            
            {policyDetails.rules.map(rule => (
              <Card 
                key={rule.id} 
                className={`border ${rule.isViolated ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {rule.isViolated ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <h6 className="text-sm font-medium">{rule.name}</h6>
                        <p className="text-xs text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        rule.severity === 'High' 
                          ? 'bg-red-50 text-red-600 border-red-200' 
                          : rule.severity === 'Medium'
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}
                    >
                      {rule.severity}
                    </Badge>
                  </div>
                  
                  {rule.isViolated && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                      This rule is currently being violated. Manual review or approval is required.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PolicyDetails;