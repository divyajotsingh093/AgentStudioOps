import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertCircle,
  Timer, 
  Hash,
  ChevronDown
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Histogram } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for tool telemetry
const mockToolsData = [
  {
    tool: "data_fabric.query",
    calls: 487,
    avgLatency: 340,
    errors: 5,
    lastErrorMsg: "Connection timeout after 2000ms",
    payloads: [
      { timestamp: "2025-05-18T15:42:10", request: '{"query": "SELECT policy_id, status FROM policies WHERE customer_id = ?", "params": ["cust-1234"]}' },
      { timestamp: "2025-05-18T15:24:33", request: '{"query": "SELECT * FROM claims WHERE policy_id = ? AND status = ?", "params": ["POL-5678", "Pending"]}' },
    ],
    latencyHistogram: [
      { range: "100-200ms", count: 48 },
      { range: "200-300ms", count: 145 },
      { range: "300-400ms", count: 212 },
      { range: "400-500ms", count: 57 },
      { range: "500-600ms", count: 19 },
      { range: ">600ms", count: 6 },
    ]
  },
  {
    tool: "rules.evaluate",
    calls: 325,
    avgLatency: 120,
    errors: 0,
    lastErrorMsg: "",
    payloads: [
      { timestamp: "2025-05-18T15:42:15", request: '{"ruleSet": "underwriting", "facts": {"age": 35, "smoker": false, "medicalConditions": ["hypertension"]}}' },
      { timestamp: "2025-05-18T15:24:38", request: '{"ruleSet": "underwriting", "facts": {"age": 42, "smoker": true, "medicalConditions": ["diabetes"]}}' },
    ],
    latencyHistogram: [
      { range: "0-50ms", count: 42 },
      { range: "50-100ms", count: 153 },
      { range: "100-150ms", count: 89 },
      { range: "150-200ms", count: 32 },
      { range: "200-250ms", count: 7 },
      { range: ">250ms", count: 2 },
    ]
  },
  {
    tool: "idp.extract",
    calls: 215,
    avgLatency: 850,
    errors: 12,
    lastErrorMsg: "Invalid document format",
    payloads: [
      { timestamp: "2025-05-18T15:40:22", request: '{"documentURL": "s3://neutrinos-docs/medical/report-12345.pdf", "extractFields": ["diagnosis", "medication", "date"]}' },
      { timestamp: "2025-05-18T15:22:15", request: '{"documentURL": "s3://neutrinos-docs/medical/report-54321.pdf", "extractFields": ["diagnosis", "medication", "date"]}' },
    ],
    latencyHistogram: [
      { range: "500-600ms", count: 12 },
      { range: "600-700ms", count: 34 },
      { range: "700-800ms", count: 67 },
      { range: "800-900ms", count: 54 },
      { range: "900-1000ms", count: 38 },
      { range: ">1000ms", count: 10 },
    ]
  },
  {
    tool: "case.update",
    calls: 178,
    avgLatency: 290,
    errors: 2,
    lastErrorMsg: "Permission denied: insufficient privileges",
    payloads: [
      { timestamp: "2025-05-18T15:42:30", request: '{"caseId": "case-9876", "status": "Approved", "notes": "Approved based on standard criteria"}' },
      { timestamp: "2025-05-18T15:24:45", request: '{"caseId": "case-5432", "status": "Need More Info", "notes": "Request additional medical history"}' },
    ],
    latencyHistogram: [
      { range: "100-200ms", count: 43 },
      { range: "200-300ms", count: 89 },
      { range: "300-400ms", count: 32 },
      { range: "400-500ms", count: 10 },
      { range: "500-600ms", count: 4 },
      { range: ">600ms", count: 0 },
    ]
  }
];

const AgentToolTelemetry = () => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  const toggleRow = (toolName: string) => {
    if (expandedRows.includes(toolName)) {
      setExpandedRows(expandedRows.filter(name => name !== toolName));
    } else {
      setExpandedRows([...expandedRows, toolName]);
    }
  };
  
  const openToolDetails = (tool: any) => {
    setSelectedTool(tool);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tool Usage Telemetry</CardTitle>
          <CardDescription>Performance metrics for agent tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto shadow-sm rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Tool</th>
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      Calls
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-1" />
                      Avg. Latency
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Errors
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockToolsData.map((tool, index) => (
                  <>
                    <tr 
                      key={tool.tool} 
                      className={`bg-white border-b hover:bg-gray-50 ${expandedRows.includes(tool.tool) ? 'border-b-0' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center">
                          <button 
                            className="mr-2 p-1 rounded hover:bg-gray-100"
                            onClick={() => toggleRow(tool.tool)}
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${expandedRows.includes(tool.tool) ? 'rotate-180' : ''}`} 
                            />
                          </button>
                          <code>{tool.tool}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tool.calls.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {tool.avgLatency}ms
                      </td>
                      <td className="px-6 py-4">
                        {tool.errors > 0 ? (
                          <Badge className="bg-red-100 text-red-700" variant="outline">
                            {tool.errors}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700" variant="outline">
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                          onClick={() => openToolDetails(tool)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded row for latency distribution */}
                    {expandedRows.includes(tool.tool) && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-3">
                            <h4 className="text-xs font-medium text-gray-500">Latency Distribution</h4>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tool.latencyHistogram}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="range" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#0066FF" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {tool.errors > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mt-3">Latest Error</h4>
                                <div className="mt-1 p-2 rounded bg-red-50 text-red-700 text-xs">
                                  {tool.lastErrorMsg}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Tool Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTool && (
            <>
              <DialogHeader>
                <DialogTitle>Tool Details: {selectedTool.tool}</DialogTitle>
                <DialogDescription>
                  Recent payloads and performance metrics
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Latest Payloads</h3>
                  <div className="space-y-3">
                    {selectedTool.payloads.map((payload: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">{new Date(payload.timestamp).toLocaleString()}</span>
                        </div>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                          {payload.request}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xs text-blue-600">Total Calls</div>
                      <div className="text-lg font-bold">{selectedTool.calls}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xs text-green-600">Avg Latency</div>
                      <div className="text-lg font-bold">{selectedTool.avgLatency}ms</div>
                    </div>
                    <div className={`${selectedTool.errors > 0 ? 'bg-red-50' : 'bg-gray-50'} p-3 rounded`}>
                      <div className={`text-xs ${selectedTool.errors > 0 ? 'text-red-600' : 'text-gray-600'}`}>Error Rate</div>
                      <div className="text-lg font-bold">
                        {((selectedTool.errors / selectedTool.calls) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentToolTelemetry;