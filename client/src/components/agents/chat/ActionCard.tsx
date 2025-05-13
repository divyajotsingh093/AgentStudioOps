import React from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  Database, 
  FileText, 
  Calculator,
  Mail,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export type ActionType = 
  | 'data-fabric-query' 
  | 'risk-calculation' 
  | 'document-extraction' 
  | 'email-notification'
  | 'threshold-alert';

interface ActionCardProps {
  type: ActionType;
  title: string;
  timestamp: string;
  data: any;
  expanded: boolean;
  onToggleExpand: () => void;
  onAction: (action: string, data: any) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  type,
  title,
  timestamp,
  data,
  expanded,
  onToggleExpand,
  onAction
}) => {
  const getIconByType = () => {
    switch(type) {
      case 'data-fabric-query':
        return <Database className="h-4 w-4 text-neutrinos-blue" />;
      case 'risk-calculation':
        return <Calculator className="h-4 w-4 text-purple-600" />;
      case 'document-extraction':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'email-notification':
        return <Mail className="h-4 w-4 text-orange-500" />;
      case 'threshold-alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderDataContent = () => {
    switch(type) {
      case 'data-fabric-query':
        return (
          <div className="mt-3">
            <div className="text-xs font-medium mb-2">Query Results</div>
            <div className="bg-gray-50 rounded-md p-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    {data.headers.map((header: string, index: number) => (
                      <th key={index} className="py-1 px-2 text-left text-gray-600 font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-gray-200 last:border-0">
                      <td className="py-1 px-2">{row.id}</td>
                      <td className="py-1 px-2">{row.name}</td>
                      <td className="py-1 px-2">{row.policyCount}</td>
                      <td className="py-1 px-2">
                        <Badge 
                          variant="outline" 
                          className={`text-${row.status.color}-600 bg-${row.status.color}-50 border-${row.status.color}-200`}
                        >
                          {row.status.value}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'risk-calculation':
        return (
          <div className="mt-3">
            <div className="text-xs font-medium mb-2">{data.title}</div>
            <div className="mb-2">
              <Badge 
                variant="outline" 
                className={`text-${data.result.color}-600 bg-${data.result.color}-50 border-${data.result.color}-200`}
              >
                {data.result.value}
              </Badge>
            </div>
            <div className="bg-gray-50 rounded-md p-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{factor.name}:</span>
                    <span className="font-medium">{factor.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'document-extraction':
        return (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium">{data.document}</div>
              <Badge variant="outline" className="text-xs">
                {data.confidence}% confident
              </Badge>
            </div>
            <div className="bg-gray-50 rounded-md p-2">
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {data.fields.map((field: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{field.name}:</span>
                    <span className="font-medium">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Processed by {data.model}
            </div>
          </div>
        );
      
      case 'email-notification':
        return (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">To: {data.to}</div>
              <Badge 
                variant="outline" 
                className={`text-${data.status.color}-600 bg-${data.status.color}-50 border-${data.status.color}-200`}
              >
                {data.status.value}
              </Badge>
            </div>
            <div className="text-xs font-medium">Subject: {data.subject}</div>
            <div className="bg-gray-50 rounded-md p-2 text-xs">
              {data.body}
            </div>
          </div>
        );
      
      case 'threshold-alert':
        return (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-amber-600">{data.message}</div>
            <div className="text-xs text-gray-600">{data.details}</div>
            <div className="bg-gray-50 rounded-md p-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Threshold Type:</span>
                  <span className="font-medium">{data.thresholdType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-medium">{data.currentValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Limit:</span>
                  <span className="font-medium">{data.limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Severity:</span>
                  <span className="font-medium">{data.severity}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-xs text-gray-500">No detailed information available</div>;
    }
  };

  const renderCardFooter = () => {
    if (!expanded) return null;
    
    switch(type) {
      case 'data-fabric-query':
        return (
          <CardFooter className="pt-0 px-4 pb-3 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onAction('export', data)}
            >
              Export Data
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="text-xs h-7 bg-neutrinos-blue hover:bg-neutrinos-blue/90"
              onClick={() => onAction('filter', data)}
            >
              Filter Results
            </Button>
          </CardFooter>
        );
      
      case 'risk-calculation':
        return (
          <CardFooter className="pt-0 px-4 pb-3 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onAction('details', data)}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="text-xs h-7 bg-neutrinos-blue hover:bg-neutrinos-blue/90"
              onClick={() => onAction('adjust', data)}
            >
              Adjust Factors
            </Button>
          </CardFooter>
        );
      
      case 'document-extraction':
        return (
          <CardFooter className="pt-0 px-4 pb-3 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onAction('view', data)}
            >
              View Document
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="text-xs h-7 bg-neutrinos-blue hover:bg-neutrinos-blue/90"
              onClick={() => onAction('verify', data)}
            >
              Verify Extraction
            </Button>
          </CardFooter>
        );
      
      case 'email-notification':
        return (
          <CardFooter className="pt-0 px-4 pb-3 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onAction('resend', data)}
            >
              Resend
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="text-xs h-7 bg-neutrinos-blue hover:bg-neutrinos-blue/90"
              onClick={() => onAction('edit', data)}
            >
              Edit & Resend
            </Button>
          </CardFooter>
        );
      
      case 'threshold-alert':
        return (
          <CardFooter className="pt-0 px-4 pb-3 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onAction('override', data)}
            >
              Override
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="text-xs h-7 bg-neutrinos-blue hover:bg-neutrinos-blue/90"
              onClick={() => onAction('approve', data)}
            >
              Request Approval
            </Button>
          </CardFooter>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="mb-3 border-gray-200 overflow-hidden">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          {getIconByType()}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{timestamp}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggleExpand}
          >
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 py-0">
          {renderDataContent()}
        </CardContent>
      )}
      {renderCardFooter()}
    </Card>
  );
};

export default ActionCard;