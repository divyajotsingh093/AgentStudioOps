import React from 'react';
import { 
  Search, 
  Database, 
  Calculator, 
  FileText, 
  Mail, 
  Shield,
  Zap,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AvailableActionProps {
  onActionSelect: (actionId: string) => void;
}

const AvailableActions: React.FC<AvailableActionProps> = ({ onActionSelect }) => {
  // Example actions - these would come from the API in a real implementation
  const actionGroups = [
    {
      name: "Data Fabric",
      items: [
        {
          id: "query-customer-data",
          title: "Query Customer Data",
          description: "Search for customer records in the CRM",
          icon: <Database className="h-4 w-4 text-neutrinos-blue" />,
          tags: ["Customer", "CRM"]
        },
        {
          id: "query-policy-data",
          title: "Query Policy Data",
          description: "Retrieve policy information from database",
          icon: <Database className="h-4 w-4 text-neutrinos-blue" />,
          tags: ["Policy", "Database"]
        }
      ]
    },
    {
      name: "Risk Assessment",
      items: [
        {
          id: "calculate-risk-score",
          title: "Calculate Risk Score",
          description: "Perform risk assessment based on applicant data",
          icon: <Calculator className="h-4 w-4 text-purple-600" />,
          tags: ["Risk", "Underwriting"]
        },
        {
          id: "verify-eligibility",
          title: "Verify Eligibility",
          description: "Check if applicant meets basic eligibility criteria",
          icon: <Calculator className="h-4 w-4 text-purple-600" />,
          tags: ["Eligibility", "Criteria"]
        }
      ]
    },
    {
      name: "Document Processing",
      items: [
        {
          id: "extract-medical-data",
          title: "Extract Medical Data",
          description: "Extract structured data from medical records",
          icon: <FileText className="h-4 w-4 text-green-600" />,
          tags: ["Medical", "Extraction"]
        },
        {
          id: "analyze-lab-results",
          title: "Analyze Lab Results",
          description: "Extract and analyze medical lab test results",
          icon: <FileText className="h-4 w-4 text-green-600" />,
          tags: ["Labs", "Medical"]
        }
      ]
    },
    {
      name: "Notifications",
      items: [
        {
          id: "notify-underwriter",
          title: "Notify Underwriter",
          description: "Send notification to human underwriter for review",
          icon: <Mail className="h-4 w-4 text-orange-500" />,
          tags: ["Email", "Notification"]
        }
      ]
    },
    {
      name: "Governance",
      items: [
        {
          id: "check-policy-compliance",
          title: "Check Policy Compliance",
          description: "Verify compliance with underwriting guidelines",
          icon: <Shield className="h-4 w-4 text-red-500" />,
          tags: ["Compliance", "Policy"]
        },
        {
          id: "request-approval",
          title: "Request Approval",
          description: "Submit for approval when thresholds are exceeded",
          icon: <Shield className="h-4 w-4 text-red-500" />,
          tags: ["Approval", "Governance"]
        }
      ]
    },
    {
      name: "Actions",
      items: [
        {
          id: "generate-quote",
          title: "Generate Quote",
          description: "Calculate and generate insurance quote",
          icon: <Zap className="h-4 w-4 text-yellow-500" />,
          tags: ["Quote", "Pricing"]
        },
        {
          id: "issue-policy",
          title: "Issue Policy",
          description: "Create and issue approved insurance policy",
          icon: <Zap className="h-4 w-4 text-yellow-500" />,
          tags: ["Issue", "Policy"]
        }
      ]
    }
  ];

  // Simple filtering functionality
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredActionGroups = searchTerm.trim() === '' 
    ? actionGroups 
    : actionGroups.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(group => group.items.length > 0);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900 mb-2">Available Actions</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search actions..." 
            className="pl-8 h-9 text-sm" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          {filteredActionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4 last:mb-0">
              <div className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
                {group.name}
              </div>
              
              <div className="space-y-2">
                {group.items.map(item => (
                  <Card 
                    key={item.id} 
                    className="border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => onActionSelect(item.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium flex items-center justify-between">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="outline" 
                                className="px-1.5 py-0 h-5 text-xs bg-gray-50"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredActionGroups.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">No actions found matching "{searchTerm}"</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button 
              className="inline-flex items-center justify-center text-xs text-neutrinos-blue hover:text-neutrinos-blue/80"
              onClick={() => onActionSelect('custom-action')}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> 
              Create Custom Action
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AvailableActions;