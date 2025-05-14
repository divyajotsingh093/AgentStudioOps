import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  LayoutList,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';

// Define the IDP Provider type based on schema
interface IdpProvider {
  id: number;
  name: string;
  description: string | null;
  type: string; // 'OIDC' | 'SAML' | 'OAuth2' | 'LDAP' | 'Custom'
  status: string; // 'Active' | 'Inactive' | 'Testing' | 'Deprecated'
  config: any;
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt: string | null;
}

interface IdpMapping {
  id: number;
  providerId: number;
  sourceAttribute: string;
  targetAttribute: string;
  mappingType: string;
  transformationRule: string | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IdpRule {
  id: number;
  providerId: number;
  name: string;
  description: string | null;
  condition: any;
  action: any;
  priority: number | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Testing':
        return 'warning';
      case 'Inactive':
        return 'outline';
      case 'Deprecated':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant() as any}>{status}</Badge>
  );
};

// Provider details page component
const ProviderDetailsPage = () => {
  const [match, params] = useRoute('/idp/providers/:id');
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: provider, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}`],
    enabled: !!params?.id,
  });
  
  const { data: mappings, isLoading: isMappingsLoading } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}/mappings`],
    enabled: !!params?.id,
  });
  
  const { data: rules, isLoading: isRulesLoading } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}/rules`],
    enabled: !!params?.id,
  });
  
  if (!match) {
    return null;
  }
  
  const handleVerify = async () => {
    if (!params?.id) return;
    
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/idp/providers/${params.id}/verify`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Provider verified',
          description: 'The provider connection was successfully verified.',
          variant: 'success',
        });
        refetch();
      } else {
        const error = await response.json();
        toast({
          title: 'Verification failed',
          description: error.error || 'Could not verify provider connection.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Verification error',
        description: 'An error occurred while verifying the provider.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleDelete = async () => {
    if (!params?.id) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/idp/providers/${params.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: 'Provider deleted',
          description: 'The identity provider was successfully deleted.',
          variant: 'success',
        });
        navigate('/idp');
      } else {
        const error = await response.json();
        toast({
          title: 'Deletion failed',
          description: error.error || 'Could not delete the provider.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Deletion error',
        description: 'An error occurred while deleting the provider.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Skeleton loaders while fetching data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError || !provider) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <CardTitle className="text-red-800">Provider Not Found</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              The identity provider you're looking for doesn't exist or there was an error loading it.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={() => navigate('/idp')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{provider.name} | Identity Provider | Neutrinos AI</title>
        <meta 
          name="description" 
          content={`View and manage the ${provider.name} identity provider configuration.`}
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title={provider.name}
          description={provider.description || "Identity Provider"}
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/idp')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                asChild
              >
                <Link href={`/idp/providers/${provider.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          }
        />
        
        <div className="mt-8">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="mappings">Attribute Mappings</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Provider Configuration</CardTitle>
                    <CardDescription>
                      Identity provider details and connection settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Type</h3>
                        <p className="mt-1">{provider.type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div className="mt-1">
                          <StatusBadge status={provider.status} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1">{provider.description || "No description provided."}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Configuration</h3>
                      <div className="bg-gray-50 p-4 rounded border overflow-x-auto">
                        <pre className="text-xs text-gray-700">
                          {JSON.stringify(provider.config, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Created</h3>
                        <p className="mt-1 text-sm">
                          {new Date(provider.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                        <p className="mt-1 text-sm">
                          {new Date(provider.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Verified</h3>
                        <p className="mt-1 text-sm">
                          {provider.lastVerifiedAt
                            ? new Date(provider.lastVerifiedAt).toLocaleString()
                            : "Never verified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      asChild
                    >
                      <Link href={`/idp/providers/${provider.id}/mappings`}>
                        <LayoutList className="h-4 w-4 mr-2" />
                        Manage Attribute Mappings
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/idp/providers/${provider.id}/rules`}>
                        <Shield className="h-4 w-4 mr-2" />
                        Configure Rules
                      </Link>
                    </Button>
                  </CardContent>
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Provider
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            identity provider and all associated mappings and rules.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="mappings">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Attribute Mappings</CardTitle>
                    <CardDescription>
                      Configure how provider attributes map to your application
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/idp/providers/${provider.id}/mappings/new`}>
                      Add Mapping
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isMappingsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : !mappings || mappings.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-gray-500">No attribute mappings defined yet.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <Link href={`/idp/providers/${provider.id}/mappings/new`}>
                          Add Your First Mapping
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Source Attribute</th>
                            <th className="text-left py-3 px-4 font-medium">Target Attribute</th>
                            <th className="text-left py-3 px-4 font-medium">Type</th>
                            <th className="text-left py-3 px-4 font-medium">Required</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mappings.map((mapping: IdpMapping) => (
                            <tr key={mapping.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{mapping.sourceAttribute}</td>
                              <td className="py-3 px-4">{mapping.targetAttribute}</td>
                              <td className="py-3 px-4">{mapping.mappingType}</td>
                              <td className="py-3 px-4">
                                {mapping.isRequired ? (
                                  <Badge variant="default">Required</Badge>
                                ) : (
                                  <Badge variant="outline">Optional</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/idp/mappings/${mapping.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rules">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Access Rules</CardTitle>
                    <CardDescription>
                      Define conditional rules for access control
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/idp/providers/${provider.id}/rules/new`}>
                      Add Rule
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isRulesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : !rules || rules.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-gray-500">No access rules defined yet.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <Link href={`/idp/providers/${provider.id}/rules/new`}>
                          Add Your First Rule
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Name</th>
                            <th className="text-left py-3 px-4 font-medium">Priority</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.map((rule: IdpRule) => (
                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="font-medium">{rule.name}</div>
                                <div className="text-xs text-gray-500">
                                  {rule.description || "No description"}
                                </div>
                              </td>
                              <td className="py-3 px-4">{rule.priority || "Default"}</td>
                              <td className="py-3 px-4">
                                {rule.isEnabled ? (
                                  <Badge variant="success">Enabled</Badge>
                                ) : (
                                  <Badge variant="outline">Disabled</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/idp/rules/${rule.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ProviderDetailsPage;