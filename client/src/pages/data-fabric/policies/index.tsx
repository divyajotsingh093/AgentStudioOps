import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShieldCheck, Search, Plus, FilterX, Eye, EyeOff, 
  Lock, Key, Users, Database, Network, FileIcon, Boxes, Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data policies for the page
const mockDataPolicies = [
  {
    id: "policy-1",
    name: "PII Access Control",
    type: "Access Policy",
    description: "Restricts access to personally identifiable information",
    scope: "Global",
    status: "Active",
    createdAt: "2025-04-10T09:30:00Z",
    updatedAt: "2025-05-05T14:15:00Z",
    createdBy: "Sarah Johnson",
    version: "1.3",
    rules: [
      {
        id: "rule-1",
        field: "customer.ssn",
        action: "restrict",
        condition: "role != 'Underwriter' && role != 'Claims Adjuster'"
      },
      {
        id: "rule-2",
        field: "customer.dob",
        action: "mask",
        condition: "role != 'Underwriter'"
      },
      {
        id: "rule-3",
        field: "customer.address",
        action: "restrict",
        condition: "role != 'Underwriter' && role != 'Customer Service'"
      }
    ],
    appliesTo: [
      { id: 2, name: "Customer Policies Database", type: "Database" },
      { id: 8, name: "Customer CRM", type: "API" }
    ]
  },
  {
    id: "policy-2",
    name: "Claims Data Retention",
    type: "Retention Policy",
    description: "Defines retention rules for claims data based on regulations",
    scope: "Claims Domain",
    status: "Active",
    createdAt: "2025-03-15T11:45:00Z",
    updatedAt: "2025-04-20T16:30:00Z",
    createdBy: "Michael Chen",
    version: "2.1",
    rules: [
      {
        id: "rule-1",
        field: "claim.documents",
        action: "retain",
        condition: "years <= 7"
      },
      {
        id: "rule-2",
        field: "claim.assessments",
        action: "retain",
        condition: "years <= 5"
      },
      {
        id: "rule-3",
        field: "claim.paymentInfo",
        action: "archive",
        condition: "years > 2 && years <= 7"
      },
      {
        id: "rule-4",
        field: "claim.*",
        action: "delete",
        condition: "years > 7"
      }
    ],
    appliesTo: [
      { id: 1, name: "Claims Processing API", type: "API" },
      { id: 7, name: "Analytics Warehouse", type: "Database" }
    ]
  },
  {
    id: "policy-3",
    name: "Medical Data Encryption",
    type: "Security Policy",
    description: "Ensures all medical data is properly encrypted at rest and in transit",
    scope: "Medical Records",
    status: "Active",
    createdAt: "2025-02-10T08:20:00Z",
    updatedAt: "2025-05-01T09:45:00Z",
    createdBy: "Jennifer Lee",
    version: "1.5",
    rules: [
      {
        id: "rule-1",
        field: "medicalRecord.*",
        action: "encrypt",
        condition: "storage = 'at-rest'"
      },
      {
        id: "rule-2",
        field: "medicalRecord.*",
        action: "encrypt",
        condition: "transfer = 'in-transit'"
      },
      {
        id: "rule-3",
        field: "medicalRecord.diagnoses",
        action: "audit-access",
        condition: "always"
      }
    ],
    appliesTo: [
      { id: 6, name: "Provider Network Service", type: "API" },
      { id: 5, name: "Document Storage System", type: "File" }
    ]
  },
  {
    id: "policy-4",
    name: "Third-Party Data Sharing",
    type: "Sharing Policy",
    description: "Rules for sharing data with third-party partners and providers",
    scope: "Global",
    status: "Active",
    createdAt: "2025-01-05T13:10:00Z",
    updatedAt: "2025-04-15T10:20:00Z",
    createdBy: "David Wilson",
    version: "2.3",
    rules: [
      {
        id: "rule-1",
        field: "customer.contactInfo",
        action: "allow-share",
        condition: "hasConsent = true && thirdPartyCategory = 'service-provider'"
      },
      {
        id: "rule-2",
        field: "customer.policies",
        action: "allow-share",
        condition: "hasConsent = true && thirdPartyCategory = 'underwriter'"
      },
      {
        id: "rule-3",
        field: "customer.claimsHistory",
        action: "deny-share",
        condition: "thirdPartyCategory != 'claims-processor'"
      }
    ],
    appliesTo: [
      { id: 2, name: "Customer Policies Database", type: "Database" },
      { id: 1, name: "Claims Processing API", type: "API" },
      { id: 3, name: "Product Catalog Service", type: "API" }
    ]
  },
  {
    id: "policy-5",
    name: "Data Quality Standards",
    type: "Quality Policy",
    description: "Defines data quality requirements and validation rules",
    scope: "Global",
    status: "Draft",
    createdAt: "2025-04-30T15:40:00Z",
    updatedAt: "2025-05-09T11:25:00Z",
    createdBy: "Emily Martinez",
    version: "0.9",
    rules: [
      {
        id: "rule-1",
        field: "customer.email",
        action: "validate",
        condition: "format = 'email'"
      },
      {
        id: "rule-2",
        field: "customer.phoneNumber",
        action: "validate",
        condition: "format = 'phone'"
      },
      {
        id: "rule-3",
        field: "policy.effectiveDate",
        action: "validate",
        condition: "date < expirationDate"
      }
    ],
    appliesTo: [
      { id: 2, name: "Customer Policies Database", type: "Database" },
      { id: 8, name: "Customer CRM", type: "API" }
    ]
  },
  {
    id: "policy-6",
    name: "Analytics Data Usage",
    type: "Usage Policy",
    description: "Governs how data can be used for analytics and ML purposes",
    scope: "Analytics",
    status: "Active",
    createdAt: "2025-03-01T09:50:00Z",
    updatedAt: "2025-04-10T14:30:00Z",
    createdBy: "Alex Johnson",
    version: "1.2",
    rules: [
      {
        id: "rule-1",
        field: "customer.*",
        action: "anonymize",
        condition: "purpose = 'analytics'"
      },
      {
        id: "rule-2",
        field: "claims.amount",
        action: "allow-use",
        condition: "purpose = 'fraud-detection'"
      },
      {
        id: "rule-3",
        field: "customer.preferences",
        action: "allow-use",
        condition: "purpose = 'personalization' && hasConsent = true"
      }
    ],
    appliesTo: [
      { id: 7, name: "Analytics Warehouse", type: "Database" }
    ]
  },
  {
    id: "policy-7",
    name: "Audit Logging Requirements",
    type: "Audit Policy",
    description: "Defines what actions should be logged for audit purposes",
    scope: "Global",
    status: "Active",
    createdAt: "2025-02-20T08:15:00Z",
    updatedAt: "2025-04-25T11:30:00Z",
    createdBy: "Robert Brown",
    version: "1.8",
    rules: [
      {
        id: "rule-1",
        field: "customer.financialInfo",
        action: "log-access",
        condition: "always"
      },
      {
        id: "rule-2",
        field: "claim.status",
        action: "log-changes",
        condition: "always"
      },
      {
        id: "rule-3",
        field: "policy.coverage",
        action: "log-changes",
        condition: "always"
      }
    ],
    appliesTo: [
      { id: 1, name: "Claims Processing API", type: "API" },
      { id: 2, name: "Customer Policies Database", type: "Database" },
      { id: 3, name: "Product Catalog Service", type: "API" }
    ]
  },
  {
    id: "policy-8",
    name: "Data Classification Framework",
    type: "Classification Policy",
    description: "Framework for classifying data sensitivity levels",
    scope: "Global",
    status: "Draft",
    createdAt: "2025-05-01T10:20:00Z",
    updatedAt: "2025-05-10T15:45:00Z",
    createdBy: "Jessica Clark",
    version: "0.7",
    rules: [
      {
        id: "rule-1",
        field: "customer.ssn",
        action: "classify",
        condition: "level = 'highly-sensitive'"
      },
      {
        id: "rule-2",
        field: "customer.contactInfo",
        action: "classify",
        condition: "level = 'sensitive'"
      },
      {
        id: "rule-3",
        field: "policy.coverageType",
        action: "classify",
        condition: "level = 'internal-only'"
      },
      {
        id: "rule-4",
        field: "product.name",
        action: "classify",
        condition: "level = 'public'"
      }
    ],
    appliesTo: [
      { id: 2, name: "Customer Policies Database", type: "Database" },
      { id: 3, name: "Product Catalog Service", type: "API" },
      { id: 7, name: "Analytics Warehouse", type: "Database" }
    ]
  }
];

// Policy type icons
const policyTypeIcons = {
  'Access Policy': <Eye className="h-5 w-5 text-blue-600" />,
  'Retention Policy': <Clock className="h-5 w-5 text-green-600" />,
  'Security Policy': <Lock className="h-5 w-5 text-amber-600" />,
  'Sharing Policy': <Users className="h-5 w-5 text-purple-600" />,
  'Quality Policy': <ShieldCheck className="h-5 w-5 text-teal-600" />,
  'Usage Policy': <Database className="h-5 w-5 text-indigo-600" />,
  'Audit Policy': <Key className="h-5 w-5 text-orange-600" />,
  'Classification Policy': <Boxes className="h-5 w-5 text-red-600" />
};

// Create policy form component
function CreatePolicyForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Access Policy');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('Global');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, would save to the backend
    toast({
      title: "Data policy created",
      description: `${name} has been created successfully.`
    });
    
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Policy Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter policy name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Policy Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select policy type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Access Policy">Access Policy</SelectItem>
            <SelectItem value="Retention Policy">Retention Policy</SelectItem>
            <SelectItem value="Security Policy">Security Policy</SelectItem>
            <SelectItem value="Sharing Policy">Sharing Policy</SelectItem>
            <SelectItem value="Quality Policy">Quality Policy</SelectItem>
            <SelectItem value="Usage Policy">Usage Policy</SelectItem>
            <SelectItem value="Audit Policy">Audit Policy</SelectItem>
            <SelectItem value="Classification Policy">Classification Policy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter policy description"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger>
            <SelectValue placeholder="Select policy scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Global">Global</SelectItem>
            <SelectItem value="Claims Domain">Claims Domain</SelectItem>
            <SelectItem value="Medical Records">Medical Records</SelectItem>
            <SelectItem value="Analytics">Analytics</SelectItem>
            <SelectItem value="Customer Data">Customer Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Apply to Data Sources</Label>
        <div className="border rounded-md p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="ds-customer" />
            <Label htmlFor="ds-customer" className="text-sm font-normal">Customer Policies Database</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ds-claims" />
            <Label htmlFor="ds-claims" className="text-sm font-normal">Claims Processing API</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ds-analytics" />
            <Label htmlFor="ds-analytics" className="text-sm font-normal">Analytics Warehouse</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ds-provider" />
            <Label htmlFor="ds-provider" className="text-sm font-normal">Provider Network Service</Label>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Policy</Button>
      </DialogFooter>
    </form>
  );
}

// Policy card component
function PolicyCard({ policy }: { policy: any }) {
  const [, setLocation] = useLocation();
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => setLocation(`/data-fabric/policies/${policy.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(var(--color), 0.1)' }}>
              {policyTypeIcons[policy.type as keyof typeof policyTypeIcons] || <ShieldCheck className="h-5 w-5 text-blue-600" />}
            </div>
            <CardTitle className="text-lg">{policy.name}</CardTitle>
          </div>
          <Badge variant={policy.status === 'Active' ? 'default' : 'outline'}>
            {policy.status}
          </Badge>
        </div>
        <CardDescription>{policy.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Scope:</span> {policy.scope}
          </div>
          <div>
            <span className="text-gray-500">Version:</span> {policy.version}
          </div>
          <div>
            <span className="text-gray-500">Updated:</span> {new Date(policy.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <span className="text-gray-500">Rules:</span> {policy.rules.length}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex">
          {policy.appliesTo?.slice(0, 2).map((source: any, index: number) => (
            <div 
              key={source.id} 
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                source.type === 'Database' 
                  ? 'bg-blue-100 text-blue-700' 
                  : source.type === 'API' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
              } ${index > 0 ? '-ml-2' : ''}`}
              title={source.name}
            >
              {source.type === 'Database' 
                ? <Database className="h-4 w-4" /> 
                : source.type === 'API' 
                  ? <Network className="h-4 w-4" />
                  : <FileIcon className="h-4 w-4" />
              }
            </div>
          ))}
          {policy.appliesTo?.length > 2 && (
            <div className="h-8 w-8 rounded-full bg-gray-100 -ml-2 flex items-center justify-center text-xs font-medium text-gray-600">
              +{policy.appliesTo.length - 2}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

// Main component
export default function DataPoliciesIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filter policies based on search term and filters
  const filteredPolicies = mockDataPolicies.filter(policy => {
    const matchesSearch = 
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || policy.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Data Policies</h1>
            <p className="text-gray-600">Data governance and access control rules for your organization</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-neutrinos-blue hover:bg-neutrinos-blue/90">
                <Plus className="h-4 w-4 mr-2" /> Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Data Policy</DialogTitle>
                <DialogDescription>
                  Define data governance rules and access controls.
                </DialogDescription>
              </DialogHeader>
              <CreatePolicyForm onClose={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search data policies..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Access Policy">Access Policy</SelectItem>
                <SelectItem value="Retention Policy">Retention Policy</SelectItem>
                <SelectItem value="Security Policy">Security Policy</SelectItem>
                <SelectItem value="Sharing Policy">Sharing Policy</SelectItem>
                <SelectItem value="Quality Policy">Quality Policy</SelectItem>
                <SelectItem value="Usage Policy">Usage Policy</SelectItem>
                <SelectItem value="Audit Policy">Audit Policy</SelectItem>
                <SelectItem value="Classification Policy">Classification Policy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" title="Reset filters" onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}>
              <FilterX className="h-4 w-4" />
            </Button>
            
            <div className="border-l mx-1"></div>
            
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="grid">
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No data policies found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm">Name</th>
                    <th className="text-left p-3 font-medium text-sm">Type</th>
                    <th className="text-left p-3 font-medium text-sm">Scope</th>
                    <th className="text-left p-3 font-medium text-sm">Rules</th>
                    <th className="text-left p-3 font-medium text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-sm">Updated</th>
                    <th className="text-right p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500">
                        No data policies found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredPolicies.map(policy => (
                      <tr key={policy.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[250px]">{policy.description}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {policyTypeIcons[policy.type as keyof typeof policyTypeIcons] || <ShieldCheck className="h-4 w-4" />}
                            <span>{policy.type}</span>
                          </div>
                        </td>
                        <td className="p-3">{policy.scope}</td>
                        <td className="p-3">{policy.rules.length}</td>
                        <td className="p-3">
                          <Badge variant={policy.status === 'Active' ? 'default' : 'outline'}>
                            {policy.status}
                          </Badge>
                        </td>
                        <td className="p-3">{new Date(policy.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}