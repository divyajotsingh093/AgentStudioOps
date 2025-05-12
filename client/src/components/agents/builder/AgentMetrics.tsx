import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for metrics
const mockMetricsData = {
  success: 0.94,
  latency_p95: 3.2,
  tokens_24h: 145000,
  cost_24h: 12.37,
  timeSeriesData: [
    { time: '00:00', tokens: 4200, cost: 0.35, latency: 2.1, errors: 0 },
    { time: '02:00', tokens: 3800, cost: 0.32, latency: 2.3, errors: 0 },
    { time: '04:00', tokens: 2900, cost: 0.24, latency: 2.0, errors: 0 },
    { time: '06:00', tokens: 3100, cost: 0.26, latency: 2.2, errors: 0 },
    { time: '08:00', tokens: 5600, cost: 0.47, latency: 2.5, errors: 1 },
    { time: '10:00', tokens: 7200, cost: 0.60, latency: 2.8, errors: 0 },
    { time: '12:00', tokens: 8500, cost: 0.71, latency: 3.1, errors: 0 },
    { time: '14:00', tokens: 9200, cost: 0.77, latency: 3.2, errors: 2 },
    { time: '16:00', tokens: 8900, cost: 0.74, latency: 3.0, errors: 1 },
    { time: '18:00', tokens: 7800, cost: 0.65, latency: 2.9, errors: 0 },
    { time: '20:00', tokens: 6500, cost: 0.54, latency: 2.7, errors: 0 },
    { time: '22:00', tokens: 5100, cost: 0.43, latency: 2.4, errors: 0 },
  ]
};

type TimeRange = '1h' | '24h' | '7d';

const AgentMetrics = () => {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('24h');
  
  // Calculate some derived metrics for the KPI strip
  const totalErrors = mockMetricsData.timeSeriesData.reduce((acc, curr) => acc + curr.errors, 0);
  const avgLatency = mockMetricsData.timeSeriesData.reduce((acc, curr) => acc + curr.latency, 0) / mockMetricsData.timeSeriesData.length;
  
  const filterData = (range: TimeRange) => {
    // In a real app, we'd filter data based on the timerange
    // For now, we'll just return all data
    return mockMetricsData.timeSeriesData;
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Success Rate (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">{(mockMetricsData.success * 100).toFixed(1)}%</div>
              <div className="ml-2 text-sm text-green-600">+2.4%</div>
            </div>
            <div className="mt-2 h-6 bg-gray-50 rounded">
              {/* Sparkline could go here */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">p95 Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">{mockMetricsData.latency_p95.toFixed(1)}s</div>
              <div className="ml-2 text-sm text-yellow-600">+0.3s</div>
            </div>
            <div className="mt-2 h-6 bg-gray-50 rounded">
              {/* Sparkline could go here */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Token Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">{(mockMetricsData.tokens_24h / 1000).toFixed(1)}K</div>
              <div className="ml-2 text-sm text-red-600">+12.5%</div>
            </div>
            <div className="mt-2 h-6 bg-gray-50 rounded">
              {/* Sparkline could go here */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cost (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">${mockMetricsData.cost_24h.toFixed(2)}</div>
              <div className="ml-2 text-sm text-red-600">+8.2%</div>
            </div>
            <div className="mt-2 h-6 bg-gray-50 rounded">
              {/* Sparkline could go here */}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Metrics */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agent Metrics</CardTitle>
              <CardDescription>Performance over time</CardDescription>
            </div>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === '1h' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTimeRange('1h')}
              >
                1h
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === '24h' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTimeRange('24h')}
              >
                24h
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === '7d' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTimeRange('7d')}
              >
                7d
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage">
            <TabsList className="mb-4">
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="latency">Latency</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="cost">Cost</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filterData(activeTimeRange)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tokens" stroke="#0066FF" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="latency" className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filterData(activeTimeRange)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="latency" stroke="#0066FF" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="errors" className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filterData(activeTimeRange)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="cost" className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filterData(activeTimeRange)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cost" stroke="#0066FF" fill="#0066FF33" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentMetrics;