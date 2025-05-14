import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCcw,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';

// Define the IDP interface types
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

const ProviderDetailPage: React.FC = () => {
  const [match, params] = useRoute('/idp/providers/:id');
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch provider details
  const { 
    data: provider, 
    isLoading: isLoadingProvider, 
    isError: isErrorProvider,
    refetch: refetchProvider
  } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch provider mappings
  const { 
    data: mappings, 
    isLoading: isLoadingMappings,
    refetch: refetchMappings
  } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}/mappings`],
    enabled: !!params?.id,
  });

  // Fetch provider rules
  const { 
    data: rules, 
    isLoading: isLoadingRules,
    refetch: refetchRules
  } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}/rules`],
    enabled: !!params?.id,
  });

  // Handle provider verification
  const handleVerify = async () => {
    if (!params?.id) return;
    
    setVerifying(true);
    try {
      const response = await fetch(`/api/idp/providers/${params.id}/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Verification successful',
          description: 'The provider configuration has been successfully verified.',
          variant: 'success',
        });
        refetchProvider();
      } else {
        const error = await response.json();
        toast({
          title: 'Verification failed',
          description: error.error || 'Unable to verify the provider configuration.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during verification.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  // Handle provider deletion
  const handleDelete = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/idp/providers/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Provider deleted',
          description: 'The identity provider has been successfully deleted.',
          variant: 'success',
        });
        navigate('/idp');
      } else {
        const error = await response.json();
        toast({
          title: 'Deletion failed',
          description: error.error || 'Unable to delete the provider.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during deletion.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Testing':
        return 'secondary';
      case 'Inactive':
        return 'outline';
      case 'Deprecated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Loading state
  if (isLoadingProvider || (!provider && !isErrorProvider)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorProvider || !provider) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Identity Provider"
          description="View provider details"
          actions={
            <Button variant="outline" onClick={() => navigate('/idp')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Button>
          }
        />
        
        <Card className="mt-6">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              <CardTitle>Provider Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              The identity provider you're looking for doesn't exist or there was an error loading it.
            </p>
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
          content={`Details and configuration for the ${provider.name} identity provider.`}
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title={provider.name}
          description={provider.description || `${provider.type} identity provider`}
          actions={
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => navigate('/idp')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/idp/providers/${provider.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Identity Provider</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the "{provider.name}" identity provider? 
                      This action cannot be undone and may affect user authentication.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete Provider
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        />
        
        <div className="grid gap-6 mt-6">
          {/* Provider Details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Provider Information</CardTitle>
                <Badge variant={getStatusBadgeVariant(provider.status)}>
                  {provider.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="text-base">{provider.type}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-base">
                    {format(new Date(provider.createdAt), 'PPP')}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-base">
                    {format(new Date(provider.updatedAt), 'PPP p')}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Verified</dt>
                  <dd className="text-base">
                    {provider.lastVerifiedAt ? (
                      format(new Date(provider.lastVerifiedAt), 'PPP p')
                    ) : (
                      <span className="text-muted-foreground text-sm">Never</span>
                    )}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-6">
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {verifying ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Authentication configuration for {provider.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="config">
                  <AccordionTrigger>
                    Provider Configuration
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted rounded-md p-4 overflow-auto">
                      <pre className="text-sm">
                        {JSON.stringify(provider.config, null, 2)}
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          {/* Attribute Mappings */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Attribute Mappings</CardTitle>
                  <CardDescription>
                    Map provider attributes to user attributes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/idp/providers/${provider.id}/mappings/new`)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoadingMappings ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : mappings && mappings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source Attribute</TableHead>
                        <TableHead>Target Attribute</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappings.map((mapping: IdpMapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell className="font-medium">
                            {mapping.sourceAttribute}
                          </TableCell>
                          <TableCell>{mapping.targetAttribute}</TableCell>
                          <TableCell>{mapping.mappingType}</TableCell>
                          <TableCell>
                            {mapping.isRequired ? (
                              <span className="text-green-600 font-medium">Yes</span>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert variant="default" className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No mappings configured</AlertTitle>
                  <AlertDescription>
                    No attribute mappings have been configured for this provider.
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/idp/providers/${provider.id}/mappings/new`)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Mapping
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Rules */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Authentication Rules</CardTitle>
                  <CardDescription>
                    Customize authentication behavior based on conditions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/idp/providers/${provider.id}/rules/new`)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoadingRules ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : rules && rules.length > 0 ? (
                <div className="space-y-4">
                  {rules.map((rule: IdpRule) => (
                    <Card key={rule.id} className="overflow-hidden">
                      <CardHeader className="py-3 bg-muted/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{rule.name}</div>
                            {rule.isEnabled ? (
                              <Badge variant="success">Enabled</Badge>
                            ) : (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Priority: {rule.priority || 'Default'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3">
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                        )}
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Condition</h4>
                            <div className="bg-muted rounded-md p-2 text-xs overflow-x-auto">
                              <pre>{JSON.stringify(rule.condition, null, 2)}</pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Action</h4>
                            <div className="bg-muted rounded-md p-2 text-xs overflow-x-auto">
                              <pre>{JSON.stringify(rule.action, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="default" className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No rules configured</AlertTitle>
                  <AlertDescription>
                    No authentication rules have been configured for this provider.
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/idp/providers/${provider.id}/rules/new`)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProviderDetailPage;