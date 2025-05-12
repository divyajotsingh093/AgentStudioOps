import React from 'react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  FileText, 
  Calculator, 
  Mail, 
  Search,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Download,
  Copy
} from "lucide-react";

export type ActionType = 
  | 'data-fabric-query' 
  | 'document-extraction' 
  | 'risk-calculation' 
  | 'email-notification'
  | 'policy-search'
  | 'threshold-alert';

interface ActionCardProps {
  type: ActionType;
  title: string;
  data: any;
  timestamp?: string;
  onAction?: (action: string, data?: any) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  type,
  title,
  data,
  timestamp,
  onAction,
  expanded = false,
  onToggleExpand
}) => {
  const getIcon = () => {
    switch (type) {
      case 'data-fabric-query':
        return <Database className="h-5 w-5 text-blue-600" />;
      case 'document-extraction':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'risk-calculation':
        return <Calculator className="h-5 w-5 text-purple-600" />;
      case 'email-notification':
        return <Mail className="h-5 w-5 text-orange-600" />;
      case 'policy-search':
        return <Search className="h-5 w-5 text-red-600" />;
      case 'threshold-alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCardContent = () => {
    switch (type) {
      case 'data-fabric-query':
        return renderDataFabricCard();
      case 'risk-calculation':
        return renderRiskCalculationCard();
      case 'document-extraction':
        return renderDocumentExtractionCard();
      case 'email-notification':
        return renderEmailNotificationCard();
      case 'threshold-alert':
        return renderThresholdAlertCard();
      default:
        return (
          <div className="text-sm text-gray-700">
            <pre className="bg-gray-50 p-2 rounded overflow-x-auto text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const renderDataFabricCard = () => (
    <>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow-sm text-xs">
          <thead className="bg-gray-50">
            <tr>
              {data.headers.map((header: string, i: number) => (
                <th key={i} className="px-3 py-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.map((row: any, i: number) => (
              <tr key={i}>
                {Object.values(row).map((cell: any, j: number) => (
                  <td key={j} className="px-3 py-2">
                    {typeof cell === 'object' && cell.type === 'badge' ? (
                      <Badge className={`bg-${cell.color}-100 text-${cell.color}-700`}>
                        {cell.value}
                      </Badge>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" className="mr-2" onClick={() => onAction?.('view-all', data)}>
          <ExternalLink className="h-3 w-3 mr-1" />
          View All
        </Button>
        <Button size="sm" onClick={() => onAction?.('open-source', data)}>
          <Database className="h-3 w-3 mr-1" />
          Open Source
        </Button>
      </div>
    </>
  );

  const renderRiskCalculationCard = () => (
    <>
      <div className="text-sm">
        <p className="font-medium">{data.title}:</p>
        <p className={`mt-1 font-semibold text-${data.result.color}-700`}>{data.result.value}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {data.factors.map((factor: any, i: number) => (
          <div key={i} className="bg-white p-2 rounded">
            <span className="text-gray-500">{factor.name}:</span> {factor.value}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" className="mr-2" onClick={() => onAction?.('export', data)}>
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
        <Button size="sm" onClick={() => onAction?.('approve', data)}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Approve
        </Button>
      </div>
    </>
  );

  const renderDocumentExtractionCard = () => (
    <>
      <div className="mt-2 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Document:</span>
          <span className="font-medium">{data.document}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Extraction Model:</span>
          <span>{data.model}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Confidence:</span>
          <span>{data.confidence}%</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs font-medium text-gray-700 mb-1">Extracted Fields:</div>
        <div className="space-y-2">
          {data.fields.map((field: any, i: number) => (
            <div key={i} className="bg-gray-50 p-2 rounded text-xs">
              <div className="font-medium">{field.name}</div>
              <div className="mt-1 text-gray-700">{field.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" className="mr-2" onClick={() => onAction?.('copy', data)}>
          <Copy className="h-3 w-3 mr-1" />
          Copy All
        </Button>
        <Button size="sm" onClick={() => onAction?.('download-pdf', data)}>
          <Download className="h-3 w-3 mr-1" />
          Download PDF
        </Button>
      </div>
    </>
  );

  const renderEmailNotificationCard = () => (
    <>
      <div className="bg-gray-50 p-3 rounded text-xs">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <span className="text-gray-500">To:</span>
            <span className="ml-1 font-medium">{data.to}</span>
          </div>
          <div>
            <span className="text-gray-500">Subject:</span>
            <span className="ml-1 font-medium">{data.subject}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <Badge className={`bg-${data.status.color}-100 text-${data.status.color}-700 ml-1`}>
              {data.status.value}
            </Badge>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="text-gray-500 mb-1">Message Preview:</div>
          <div className="bg-white p-2 rounded border border-gray-200">
            {data.body}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" className="mr-2" onClick={() => onAction?.('edit', data)}>
          <Mail className="h-3 w-3 mr-1" />
          Edit Email
        </Button>
        <Button size="sm" onClick={() => onAction?.('resend', data)}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Resend
        </Button>
      </div>
    </>
  );

  const renderThresholdAlertCard = () => (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800 text-sm">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{data.message}</p>
            <p className="mt-1 text-xs text-yellow-700">{data.details}</p>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs font-medium text-gray-700 mb-1">Threshold Details:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded">
            <span className="text-gray-500">Threshold Type:</span> {data.thresholdType}
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-500">Current Value:</span> {data.currentValue}
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-500">Limit:</span> {data.limit}
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-500">Severity:</span> {data.severity}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" className="mr-2" onClick={() => onAction?.('ignore', data)}>
          Ignore Once
        </Button>
        <Button size="sm" onClick={() => onAction?.('adjust-threshold', data)}>
          Adjust Threshold
        </Button>
      </div>
    </>
  );

  return (
    <Card className={`mb-3 shadow-sm bg-gradient-to-r ${
      type === 'data-fabric-query' ? 'from-blue-50 to-indigo-50 border-blue-200' :
      type === 'risk-calculation' ? 'from-purple-50 to-pink-50 border-purple-200' :
      type === 'document-extraction' ? 'from-green-50 to-teal-50 border-green-200' :
      type === 'email-notification' ? 'from-orange-50 to-amber-50 border-orange-200' :
      type === 'threshold-alert' ? 'from-yellow-50 to-amber-50 border-yellow-200' :
      'from-gray-50 to-gray-100 border-gray-200'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getIcon()}
            <CardTitle className="text-sm font-medium ml-2">{title}</CardTitle>
          </div>
          <div className="flex items-center">
            {timestamp && (
              <span className="text-xs text-gray-500 mr-2">{timestamp}</span>
            )}
            {onToggleExpand && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={onToggleExpand}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {getCardContent()}
        </CardContent>
      )}
      {!expanded && (
        <CardFooter className="pt-0 pb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs w-full justify-center" 
            onClick={onToggleExpand}
          >
            Show Details <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ActionCard;