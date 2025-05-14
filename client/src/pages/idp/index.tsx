import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { PlusIcon, ExternalLink, RefreshCcw, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PageHeader } from '@/components/common/PageHeader';
import { format } from 'date-fns';

// Define the IDP provider interface
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

const IdpProvidersPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: providers, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/idp/providers'],
  });
  
  // Filter providers by search query
  const filteredProviders = providers ? 
    providers.filter((provider: IdpProvider) => 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.description && provider.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      provider.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];
  
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
  
  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'OIDC':
        return '🔑';
      case 'SAML':
        return '🔐';
      case 'OAuth2':
        return '🔒';
      case 'LDAP':
        return '👥';
      case 'Custom':
        return '⚙️';
      default:
        return '📋';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-72" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Identity Providers"
          description="Manage authentication and user identity providers"
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Providers</CardTitle>
            <CardDescription>
              There was an error loading the identity providers. Please try again or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Identity Providers | Neutrinos AI</title>
        <meta 
          name="description" 
          content="Manage authentication providers and user identity sources for Neutrinos AI agents."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Identity Providers"
          description="Manage authentication and user identity sources"
          actions={
            <Button onClick={() => navigate('/idp/providers/new')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Provider
            </Button>
          }
        />
        
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Providers</CardTitle>
                <CardDescription>
                  {providers && providers.length > 0 
                    ? `${providers.length} providers configured` 
                    : 'No providers configured yet'
                  }
                </CardDescription>
              </div>
              <div className="w-full md:w-72">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProviders.length === 0 && (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                {providers && providers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No providers match your search criteria</p>
                    <Button variant="link" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No identity providers configured</p>
                    <Button onClick={() => navigate('/idp/providers/new')}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Provider
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {filteredProviders.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Verified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map((provider: IdpProvider) => (
                      <TableRow
                        key={provider.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/idp/providers/${provider.id}`)}
                      >
                        <TableCell>
                          <div className="font-medium">{provider.name}</div>
                          {provider.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {provider.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span>{getProviderTypeIcon(provider.type)}</span>
                            <span>{provider.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(provider.status)}>
                            {provider.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {provider.lastVerifiedAt ? (
                            format(new Date(provider.lastVerifiedAt), 'MMM d, yyyy')
                          ) : (
                            <span className="text-muted-foreground text-sm">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/idp/providers/${provider.id}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {filteredProviders.length > 0 && (
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProviders.length} of {providers.length} providers
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
};

export default IdpProvidersPage;