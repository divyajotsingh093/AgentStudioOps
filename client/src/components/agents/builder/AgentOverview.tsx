import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  BarChart4, 
  Activity, 
  Clock, 
  DollarSign, 
  Eye, 
  Play, 
  Pause,
  ArrowRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Mock data for agent overview
const mockOverviewData = {
  metrics: {
    success: 0.94,
    latency_p95: 3.2,
    tokens_24h: 145000,
    cost_24h: 12.37
  },
  status: 'Running',
  environment: 'Development',
  sparklines: {
    success: [92, 94, 91, 95, 97, 93, 94],
    latency: [3.1, 3.0, 3.4, 3.2, 3.1, 3.3, 3.2],
    tokens: [20000, 19000, 22000, 18000, 24000, 21000, 21000],
    cost: [1.68, 1.61, 1.85, 1.52, 2.02, 1.78, 1.91]
  },
  recentRuns: [
    { id: 'run-9Y57', status: 'Success', time: '10 min ago', latency: 2.4, tokens: 1245 },
    { id: 'run-9Y56', status: 'Failed', time: '22 min ago', latency: 3.5, tokens: 890 },
    { id: 'run-9Y55', status: 'Success', time: '45 min ago', latency: 2.8, tokens: 1350 }
  ]
};

// Convert sparkline data to chart format
const prepareChartData = (data: number[]) => {
  return data.map((value, index) => ({ value, index }));
};

const AgentOverview = () => {
  const [agentStatus, setAgentStatus] = useState(mockOverviewData.status);
  const [environment, setEnvironment] = useState(mockOverviewData.environment);
  const { toast } = useToast();
  
  const handleStatusChange = (status: string) => {
    setAgentStatus(status);
    toast({
      title: `Agent ${status === 'Running' ? 'started' : 'paused'}`,
      description: `Agent is now ${status === 'Running' ? 'running' : 'paused'}.`,
    });
  };
  
  const handleEnvironmentChange = (env: string) => {
    setEnvironment(env);
    toast({
      title: "Environment changed",
      description: `Switched to ${env} environment.`,
    });
  };
  
  const handleOpenMetrics = () => {
    toast({
      title: "Opening metrics",
      description: "Navigating to detailed metrics view.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Status and Environment Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <Badge 
              className={`py-1.5 px-3 ${
                agentStatus === 'Running' 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {agentStatus === 'Running' ? (
                <Play className="h-3 w-3 mr-1" />
              ) : (
                <Pause className="h-3 w-3 mr-1" />
              )}
              {agentStatus}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={agentStatus === 'Running' ? 'outline' : 'default'} 
              size="sm"
              disabled={agentStatus === 'Paused'}
              onClick={() => handleStatusChange('Paused')}
            >
              Pause
            </Button>
            <Button 
              variant={agentStatus === 'Running' ? 'default' : 'outline'} 
              size="sm"
              disabled={agentStatus === 'Running'}
              onClick={() => handleStatusChange('Running')}
            >
              Start
            </Button>
          </div>
        </div>
        
        <div className="border px-3 py-1.5 rounded-md flex items-center space-x-3">
          <Label className="text-sm font-medium">Environment:</Label>
          <div className="flex items-center space-x-2">
            <Button 
              variant={environment === 'Development' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleEnvironmentChange('Development')}
            >
              Dev
            </Button>
            <Button 
              variant={environment === 'Production' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleEnvironmentChange('Production')}
            >
              Prod
            </Button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Success Rate */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-blue-600" />
              Success Rate (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{(mockOverviewData.metrics.success * 100).toFixed(1)}%</div>
                <div className="text-xs text-green-600 mt-1">+2.4% from last week</div>
              </div>
              
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(mockOverviewData.sparklines.success)}>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Success']}
                      labelFormatter={() => ''}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0066FF" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* p95 Latency */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-600" />
              p95 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mockOverviewData.metrics.latency_p95.toFixed(1)}s</div>
                <div className="text-xs text-yellow-600 mt-1">+0.3s from last week</div>
              </div>
              
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(mockOverviewData.sparklines.latency)}>
                    <Tooltip 
                      formatter={(value) => [`${value}s`, 'Latency']}
                      labelFormatter={() => ''}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0066FF" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Token Usage */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart4 className="mr-2 h-4 w-4 text-blue-600" />
              Token Usage (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{(mockOverviewData.metrics.tokens_24h / 1000).toFixed(1)}K</div>
                <div className="text-xs text-red-600 mt-1">+12.5% from last week</div>
              </div>
              
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(mockOverviewData.sparklines.tokens.map(t => t / 1000))}>
                    <Tooltip 
                      formatter={(value) => [`${value}K`, 'Tokens']}
                      labelFormatter={() => ''}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0066FF" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Cost */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
              Cost (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">${mockOverviewData.metrics.cost_24h.toFixed(2)}</div>
                <div className="text-xs text-red-600 mt-1">+8.2% from last week</div>
              </div>
              
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(mockOverviewData.sparklines.cost)}>
                    <Tooltip 
                      formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Cost']}
                      labelFormatter={() => ''}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0066FF" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Runs & CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Latest agent executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto shadow-sm rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Run ID</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Latency</th>
                    <th scope="col" className="px-6 py-3">Tokens</th>
                    <th scope="col" className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOverviewData.recentRuns.map((run, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {run.id}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`
                          ${run.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        `} variant="outline">
                          {run.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {run.latency.toFixed(1)}s
                      </td>
                      <td className="px-6 py-4">
                        {run.tokens}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {run.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="flex flex-col justify-between h-full p-6">
            <div>
              <BarChart4 className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Detailed Metrics</h3>
              <p className="text-sm text-gray-600 mb-4">
                View comprehensive performance analytics, usage patterns, and cost breakdowns.
              </p>
            </div>
            
            <Button 
              className="mt-4 w-full"
              onClick={handleOpenMetrics}
            >
              <Eye className="mr-2 h-4 w-4" />
              Open Metrics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentOverview;