import React from 'react';
import { 
  Database, 
  FileText, 
  Calculator, 
  Mail 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvailableActionProps {
  onActionSelect: (actionId: string) => void;
}

const AvailableActions: React.FC<AvailableActionProps> = ({ onActionSelect }) => {
  // Action options that appear below the agent header
  const availableActions = [
    {
      id: 'query-customer',
      title: 'Query Customer Database',
      icon: <Database className="h-4 w-4 text-neutrinos-blue" />
    },
    {
      id: 'extract-document',
      title: 'Extract Document Information',
      icon: <FileText className="h-4 w-4 text-green-600" />
    },
    {
      id: 'calculate-risk',
      title: 'Calculate Risk Score',
      icon: <Calculator className="h-4 w-4 text-purple-600" />
    },
    {
      id: 'send-email',
      title: 'Send Email Notification',
      icon: <Mail className="h-4 w-4 text-orange-600" />
    }
  ];

  return (
    <div className="py-4 border-t border-b border-gray-200 bg-gray-50">
      <div className="container">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Available Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="flex items-center justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-normal h-auto py-3"
              onClick={() => onActionSelect(action.id)}
            >
              <div className="mr-3">{action.icon}</div>
              <span className="text-sm">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailableActions;