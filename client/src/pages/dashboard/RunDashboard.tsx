import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import KpiCard from "@/components/dashboard/KpiCard";
import RunTable from "@/components/dashboard/RunTable";
import { runs } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const successRateData = [
  { name: 'Mon', value: 95.5 },
  { name: 'Tue', value: 97.2 },
  { name: 'Wed', value: 96.8 },
  { name: 'Thu', value: 98.1 },
  { name: 'Fri', value: 97.9 },
  { name: 'Sat', value: 98.3 },
  { name: 'Sun', value: 98.2 },
];

const latencyData = [
  { name: 'Mon', value: 2.1 },
  { name: 'Tue', value: 2.3 },
  { name: 'Wed', value: 2.2 },
  { name: 'Thu', value: 2.5 },
  { name: 'Fri', value: 2.3 },
  { name: 'Sat', value: 2.2 },
  { name: 'Sun', value: 2.4 },
];

const costData = [
  { name: 'Mon', value: 15.23 },
  { name: 'Tue', value: 14.87 },
  { name: 'Wed', value: 14.56 },
  { name: 'Thu', value: 13.98 },
  { name: 'Fri', value: 13.45 },
  { name: 'Sat', value: 13.12 },
  { name: 'Sun', value: 12.86 },
];

const RunDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [agentFilter, setAgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header 
        title="Run Dashboard"
        actions={
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">Last updated: Just now</span>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-5 w-5 text-primary" />
            </Button>
          </div>
        }
      />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="Success Rate"
          value="98.2%"
          change={{ value: "1.4%", trend: "up", positive: true }}
          status="good"
          chartComponent={
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={successRateData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[90, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#84CC16" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
        
        <KpiCard
          title="Latency (p95)"
          value="2.4s"
          change={{ value: "0.3s", trend: "up", positive: false }}
          status="fair"
          chartComponent={
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={latencyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[1.5, 3]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FBBF24" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
        
        <KpiCard
          title="Token Cost (Daily)"
          value="$12.86"
          change={{ value: "8.2%", trend: "down", positive: true }}
          status="good"
          chartComponent={
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={costData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[10, 16]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      </div>
      
      {/* Filters Row */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Agent</Label>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="accel-uw">Accelerated UW Agent</SelectItem>
                <SelectItem value="claims-fast">Auto Claims Fast-Track</SelectItem>
                <SelectItem value="fraud-detect">Fraud Detection Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="needs-approval">Needs Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="ml-auto">
            <Button className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Run Table */}
      <RunTable runs={runs} />
    </div>
  );
};

export default RunDashboard;
