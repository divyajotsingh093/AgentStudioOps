import React, { useState, useEffect } from 'react';
import { 
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Sparkles, 
  History, 
  Play, 
  BarChart2,
  LayoutPanelTop,
  FileText,
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ActionableChat from "./ActionableChat";
import ActionCard, { ActionType } from "./ActionCard";
import { ChatMessage, ReasoningTrace } from "@/lib/types";

interface AgentActionChatProps {
  agentName: string;
  messages: ChatMessage[];
  reasoningTraces: ReasoningTrace[];
  onSendMessage: (message: string) => void;
}

// Mock action history
const mockActionHistory = [
  {
    id: 'action-1',
    type: 'data-fabric-query' as ActionType,
    title: 'Customer Query Results',
    timestamp: '10:32 AM',
    data: {
      headers: ['Customer ID', 'Name', 'Policy Count', 'Status'],
      rows: [
        { id: 'CUST-5678', name: 'John Smith', policyCount: 2, status: { type: 'badge', value: 'Active', color: 'green' } },
        { id: 'CUST-9012', name: 'Jane Doe', policyCount: 1, status: { type: 'badge', value: 'Pending', color: 'yellow' } }
      ]
    }
  },
  {
    id: 'action-2',
    type: 'risk-calculation' as ActionType,
    title: 'Risk Assessment',
    timestamp: '10:35 AM',
    data: {
      title: 'Underwriting Recommendation',
      result: { value: 'Standard Plus', color: 'green' },
      factors: [
        { name: 'Hypertension', value: 'Controlled' },
        { name: 'Medication', value: 'Single standard' },
        { name: 'Build', value: 'Within range' },
        { name: 'Confidence', value: '87%' }
      ]
    }
  },
  {
    id: 'action-3',
    type: 'document-extraction' as ActionType,
    title: 'Medical Records Analysis',
    timestamp: '10:37 AM',
    data: {
      document: 'Medical_Report_12345.pdf',
      model: 'Medical IDP v2.1',
      confidence: 94,
      fields: [
        { name: 'Blood Pressure', value: '140/90 mmHg' },
        { name: 'Medication', value: 'Lisinopril 10mg' },
        { name: 'Diagnosis Date', value: '06/15/2022' },
        { name: 'Physician', value: 'Dr. Robert Chen' }
      ]
    }
  },
  {
    id: 'action-4',
    type: 'email-notification' as ActionType,
    title: 'Email Notification Sent',
    timestamp: '10:40 AM',
    data: {
      to: 'underwriter@neutrinos.com',
      subject: 'New Application Ready for Review',
      status: { value: 'Sent', color: 'green' },
      body: 'A new life insurance application has been processed with a Standard Plus recommendation. Please review the attached risk assessment and medical data extraction...'
    }
  },
  {
    id: 'action-5',
    type: 'threshold-alert' as ActionType,
    title: 'Policy Threshold Alert',
    timestamp: '10:41 AM',
    data: {
      message: 'Approval Required: Maximum Automated Policy Limit Exceeded',
      details: 'The requested coverage amount of $750,000 exceeds the automated approval threshold of $500,000',
      thresholdType: 'Coverage Amount',
      currentValue: '$750,000',
      limit: '$500,000',
      severity: 'Medium'
    }
  }
];

// Mock metrics data
const mockMetrics = {
  totalActions: 12,
  avgResponseTime: '2.4s',
  successRate: '94%',
  tokenUsage: '14,580',
  costEstimate: '$0.52',
  riskAssessments: [
    { type: 'Standard Plus', count: 3 },
    { type: 'Standard', count: 2 },
    { type: 'Table A', count: 1 }
  ]
};

const AgentActionChat: React.FC<AgentActionChatProps> = ({
  agentName,
  messages,
  reasoningTraces,
  onSendMessage
}) => {
  const [expandedActions, setExpandedActions] = useState<string[]>([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState('actions');
  const { toast } = useToast();

  const toggleActionExpand = (actionId: string) => {
    setExpandedActions(prevExpanded => 
      prevExpanded.includes(actionId)
        ? prevExpanded.filter(id => id !== actionId)
        : [...prevExpanded, actionId]
    );
  };

  const handleActionCardAction = (action: string, data: any) => {
    toast({
      title: `Action: ${action}`,
      description: `Performed ${action} on data`,
    });
  };
  
  const renderActionCards = () => {
    return mockActionHistory.map(action => (
      <ActionCard
        key={action.id}
        type={action.type}
        title={action.title}
        timestamp={action.timestamp}
        data={action.data}
        expanded={expandedActions.includes(action.id)}
        onToggleExpand={() => toggleActionExpand(action.id)}
        onAction={handleActionCardAction}
      />
    ));
  };

  const renderMetricsPanel = () => (
    <div className="px-4 py-3 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutrinos-blue/10 rounded-md p-3">
          <div className="text-xs text-gray-500">Total Actions</div>
          <div className="text-xl font-semibold text-neutrinos-blue">{mockMetrics.totalActions}</div>
        </div>
        <div className="bg-neutrinos-blue/10 rounded-md p-3">
          <div className="text-xs text-gray-500">Avg Response Time</div>
          <div className="text-xl font-semibold text-neutrinos-blue">{mockMetrics.avgResponseTime}</div>
        </div>
        <div className="bg-neutrinos-blue/10 rounded-md p-3">
          <div className="text-xs text-gray-500">Success Rate</div>
          <div className="text-xl font-semibold text-neutrinos-blue">{mockMetrics.successRate}</div>
        </div>
        <div className="bg-neutrinos-blue/10 rounded-md p-3">
          <div className="text-xs text-gray-500">Token Usage</div>
          <div className="text-xl font-semibold text-neutrinos-blue">{mockMetrics.tokenUsage}</div>
        </div>
      </div>

      <div className="bg-white rounded-md border p-3">
        <div className="text-sm font-medium mb-2">Risk Assessment Distribution</div>
        <div className="space-y-2">
          {mockMetrics.riskAssessments.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-32 text-xs">{item.type}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neutrinos-blue" 
                  style={{ width: `${(item.count / mockMetrics.totalActions) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs font-medium">{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentsPanel = () => (
    <div className="px-4 py-3">
      <div className="border rounded-md divide-y">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-neutrinos-blue mr-2" />
            <span className="text-sm">Medical_Report_12345.pdf</span>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-neutrinos-blue mr-2" />
            <span className="text-sm">Application_Form.pdf</span>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-neutrinos-blue mr-2" />
            <span className="text-sm">Lab_Results.pdf</span>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-neutrinos-blue mr-2" />
          <div>
            <h2 className="text-md font-medium">{agentName}</h2>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-700 mr-2">Running</Badge>
              <span className="text-xs text-gray-500">Session: 26 min</span>
            </div>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" className="mr-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Main Chat Panel */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <ActionableChat 
            messages={messages} 
            reasoningTraces={reasoningTraces}
            onSendMessage={onSendMessage}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Action History, Metrics, etc. */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <Tabs defaultValue="actions" className="h-full flex flex-col">
            <div className="px-4 pt-4 pb-2 border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions" onClick={() => setActiveHistoryTab('actions')}>
                  <LayoutPanelTop className="h-4 w-4 mr-1" />
                  Actions
                </TabsTrigger>
                <TabsTrigger value="metrics" onClick={() => setActiveHistoryTab('metrics')}>
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="documents" onClick={() => setActiveHistoryTab('documents')}>
                  <FileText className="h-4 w-4 mr-1" />
                  Documents
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="actions" className="flex-1 overflow-hidden flex flex-col p-0 m-0">
              <div className="px-4 py-2 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Action History</h3>
                  <Badge variant="outline" className="text-xs">
                    {mockActionHistory.length} actions
                  </Badge>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {renderActionCards()}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metrics" className="flex-1 overflow-auto p-0 m-0">
              {renderMetricsPanel()}
            </TabsContent>
            
            <TabsContent value="documents" className="flex-1 overflow-auto p-0 m-0">
              {renderDocumentsPanel()}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AgentActionChat;