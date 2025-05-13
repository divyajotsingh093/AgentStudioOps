import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, Network, FileIcon, GitFork, CircuitBoard, Link2, Boxes, 
  Compass, ShieldCheck, Settings2, BarChart3
} from 'lucide-react';

// Main Data Fabric dashboard component
export default function DataFabricDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Data Fabric</h1>
        <p className="text-gray-600">Comprehensive data management platform for your AI agents</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="models">Data Models</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard 
              title="Data Sources" 
              value="14" 
              description="Active connections"
              icon={<Database className="w-5 h-5 text-blue-600" />}
              color="blue"
            />
            <StatsCard 
              title="Data Connectors" 
              value="6" 
              description="Active data flows"
              icon={<GitFork className="w-5 h-5 text-green-600" />}
              color="green"
            />
            <StatsCard 
              title="Data Models" 
              value="32" 
              description="Structured definitions"
              icon={<Boxes className="w-5 h-5 text-purple-600" />}
              color="purple"
            />
            <StatsCard 
              title="Data Policies" 
              value="8" 
              description="Governance rules"
              icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
              color="amber"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-neutrinos-blue" />
                  Data Sources
                </CardTitle>
                <CardDescription>Connect to external data systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">
                  Connect to databases, APIs, and other data sources to build a comprehensive data network for your AI agents.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <SourceTypeButton
                    icon={<Database className="w-4 h-4" />}
                    label="Databases"
                    count={5}
                  />
                  <SourceTypeButton
                    icon={<Network className="w-4 h-4" />}
                    label="APIs"
                    count={6}
                  />
                  <SourceTypeButton
                    icon={<FileIcon className="w-4 h-4" />}
                    label="Files"
                    count={2}
                  />
                  <SourceTypeButton
                    icon={<CircuitBoard className="w-4 h-4" />}
                    label="Custom"
                    count={1}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => setLocation('/data-sources')}
                >
                  Manage Data Sources
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitFork className="w-5 h-5 mr-2 text-green-600" />
                  Data Connectors
                </CardTitle>
                <CardDescription>Create data movement pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Build data pipelines to move and transform data between different sources, enabling real-time insights for your AI agents.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <GitFork className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium">Claims Data Pipeline</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <GitFork className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium">Customer Data Sync</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => setLocation('/data-sources/connectors')}
                >
                  Manage Connectors
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Boxes className="w-5 h-5 mr-2 text-purple-600" />
                  Data Models
                </CardTitle>
                <CardDescription>Structure your data definitions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Create and manage data models that define the structure and relationships of your insurance domain data.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ModelTypeButton
                    icon={<Boxes className="w-4 h-4" />}
                    label="Domain Models"
                    count={12}
                  />
                  <ModelTypeButton
                    icon={<Link2 className="w-4 h-4" />}
                    label="Relationships"
                    count={8}
                  />
                  <ModelTypeButton
                    icon={<Compass className="w-4 h-4" />}
                    label="Knowledge Graphs"
                    count={2}
                  />
                  <ModelTypeButton
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Analytics"
                    count={10}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => setLocation('/data-fabric/models')}
                >
                  Manage Data Models
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Data Fabric Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Data Fabric Overview</CardTitle>
              <CardDescription>A holistic view of your connected data ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <CircuitBoard className="h-16 w-16 mx-auto text-neutrinos-blue/30 mb-4" />
                <p className="text-gray-500">Interactive data fabric visualization</p>
                <p className="text-xs text-gray-400 mt-1">Connect more data sources to enhance your visualization</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes in your data fabric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={<Database className="h-4 w-4" />}
                  title="Claims API connected"
                  description="New data source added to the fabric"
                  time="2 hours ago"
                  actionType="create"
                />
                <ActivityItem
                  icon={<GitFork className="h-4 w-4" />}
                  title="Customer Data Pipeline updated"
                  description="Added new transformation to normalize customer addresses"
                  time="Yesterday"
                  actionType="update"
                />
                <ActivityItem
                  icon={<Boxes className="h-4 w-4" />}
                  title="Policy Model modified"
                  description="Added new fields for regulatory compliance"
                  time="2 days ago"
                  actionType="update"
                />
                <ActivityItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="PII Access Policy created"
                  description="New policy restricting access to personal information"
                  time="3 days ago"
                  actionType="create"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Sources</CardTitle>
                  <CardDescription>Manage your connected data sources</CardDescription>
                </div>
                <Button onClick={() => setLocation('/data-sources')}>View All Sources</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SourceCard 
                  name="Claims Processing API"
                  type="API"
                  description="System handling claims processing and benefit utilization"
                  status="Active"
                  id={1}
                />
                <SourceCard 
                  name="Customer Policies Database"
                  type="Database"
                  description="Main database for customer policy information"
                  status="Active"
                  id={2}
                />
                <SourceCard 
                  name="Provider Network Service"
                  type="API"
                  description="Service for accessing healthcare provider network information"
                  status="Active"
                  id={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center">
                <Button 
                  variant="link" 
                  onClick={() => setLocation('/data-sources')}
                >
                  View All 14 Data Sources
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Models</CardTitle>
                  <CardDescription>Structured data definitions for your domain</CardDescription>
                </div>
                <Button onClick={() => setLocation('/data-fabric/models')}>View All Models</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModelCard 
                  name="Policy Contract"
                  type="Domain Model"
                  description="Core insurance policy data structure with coverage information"
                  entityCount={12}
                  id="model-1"
                />
                <ModelCard 
                  name="Customer Profile"
                  type="Domain Model"
                  description="Comprehensive customer information model with preferences"
                  entityCount={8}
                  id="model-2"
                />
                <ModelCard 
                  name="Claims Processing"
                  type="Domain Model"
                  description="Claims lifecycle and processing workflow"
                  entityCount={15}
                  id="model-3"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center">
                <Button 
                  variant="link" 
                  onClick={() => setLocation('/data-fabric/models')}
                >
                  View All 32 Data Models
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Policies</CardTitle>
                  <CardDescription>Data governance and access control rules</CardDescription>
                </div>
                <Button onClick={() => setLocation('/data-fabric/policies')}>View All Policies</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PolicyCard 
                  name="PII Access Control"
                  type="Access Policy"
                  description="Restricts access to personally identifiable information"
                  scope="Global"
                  id="policy-1"
                />
                <PolicyCard 
                  name="Claims Data Retention"
                  type="Retention Policy"
                  description="Defines retention rules for claims data based on regulations"
                  scope="Claims Domain"
                  id="policy-2"
                />
                <PolicyCard 
                  name="Medical Data Encryption"
                  type="Security Policy"
                  description="Ensures all medical data is properly encrypted at rest and in transit"
                  scope="Medical Records"
                  id="policy-3"
                />
                <PolicyCard 
                  name="Third-Party Data Sharing"
                  type="Sharing Policy"
                  description="Rules for sharing data with third-party partners and providers"
                  scope="Global"
                  id="policy-4"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center">
                <Button 
                  variant="link" 
                  onClick={() => setLocation('/data-fabric/policies')}
                >
                  View All 8 Data Policies
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Source Type Button Component
interface SourceTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

const SourceTypeButton: React.FC<SourceTypeButtonProps> = ({ icon, label, count }) => {
  return (
    <Button variant="outline" className="justify-start h-auto py-2 font-normal">
      {icon}
      <span className="ml-2">{label}</span>
      <Badge variant="secondary" className="ml-auto">{count}</Badge>
    </Button>
  );
};

// Model Type Button Component
interface ModelTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

const ModelTypeButton: React.FC<ModelTypeButtonProps> = ({ icon, label, count }) => {
  return (
    <Button variant="outline" className="justify-start h-auto py-2 font-normal">
      {icon}
      <span className="ml-2">{label}</span>
      <Badge variant="secondary" className="ml-auto">{count}</Badge>
    </Button>
  );
};

// Activity Item Component
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  actionType: 'create' | 'update' | 'delete';
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time, actionType }) => {
  const actionColors = {
    create: 'bg-green-50 text-green-600',
    update: 'bg-blue-50 text-blue-600',
    delete: 'bg-red-50 text-red-600'
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-full ${actionColors[actionType]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <div className="text-gray-400 text-xs whitespace-nowrap">
        {time}
      </div>
    </div>
  );
};

// Source Card Component
interface SourceCardProps {
  name: string;
  type: string;
  description: string;
  status: string;
  id: number;
}

const SourceCard: React.FC<SourceCardProps> = ({ name, type, description, status, id }) => {
  const [, setLocation] = useLocation();
  
  const typeIcons = {
    'Database': <Database className="h-5 w-5" />,
    'API': <Network className="h-5 w-5" />,
    'File': <FileIcon className="h-5 w-5" />,
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/data-sources/${id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              {typeIcons[type as keyof typeof typeIcons] || <Database className="h-5 w-5" />}
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <Badge variant={status === 'Active' ? 'default' : 'outline'}>
            {status}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" className="ml-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Model Card Component
interface ModelCardProps {
  name: string;
  type: string;
  description: string;
  entityCount: number;
  id: string;
}

const ModelCard: React.FC<ModelCardProps> = ({ name, type, description, entityCount, id }) => {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/data-fabric/models/${id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="outline">{type}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 flex justify-between">
        <div className="text-xs text-gray-500">
          {entityCount} entities
        </div>
        <Button variant="ghost" size="sm">
          View Model
        </Button>
      </CardFooter>
    </Card>
  );
};

// Policy Card Component
interface PolicyCardProps {
  name: string;
  type: string;
  description: string;
  scope: string;
  id: string;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ name, type, description, scope, id }) => {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/data-fabric/policies/${id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge>{type}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 flex justify-between">
        <div className="text-xs text-gray-500">
          Scope: {scope}
        </div>
        <Button variant="ghost" size="sm">
          View Policy
        </Button>
      </CardFooter>
    </Card>
  );
};