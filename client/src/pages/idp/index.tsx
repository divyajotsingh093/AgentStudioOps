import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Plus, CircleCheck, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

// Provider card component for each IDP provider
const ProviderCard = ({ provider }: { provider: IdpProvider }) => {
  const { toast } = useToast();
  
  const handleVerify = async (id: number) => {
    try {
      const response = await fetch(`/api/idp/providers/${id}/verify`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Provider verified',
          description: 'The provider connection was successfully verified.',
          variant: 'success',
        });
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
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{provider.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {provider.type} Provider
            </CardDescription>
          </div>
          <StatusBadge status={provider.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-2">
          {provider.description || 'No description provided.'}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Last verified: {provider.lastVerifiedAt 
            ? new Date(provider.lastVerifiedAt).toLocaleString() 
            : 'Never'}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/idp/providers/${provider.id}`}>
            View Details
          </Link>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleVerify(provider.id)}>
              Verify Connection
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/idp/providers/${provider.id}/edit`}>
                Edit Provider
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/idp/providers/${provider.id}/mappings`}>
                Configure Mappings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/idp/providers/${provider.id}/rules`}>
                Manage Rules
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

// Skeleton loader for provider cards while loading
const ProviderCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pb-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-3 w-32 mt-3" />
    </CardContent>
    <CardFooter className="flex justify-between pt-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </CardFooter>
  </Card>
);

// Empty state component when no providers exist
const EmptyState = () => (
  <div className="text-center p-8 border border-dashed rounded-lg">
    <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
      <XCircle className="h-6 w-6 text-neutral-400" />
    </div>
    <h3 className="text-lg font-medium">No Identity Providers</h3>
    <p className="text-sm text-gray-500 mt-1 mb-4">
      You haven't added any identity providers yet.
    </p>
    <Button asChild>
      <Link href="/idp/providers/new">
        <Plus className="h-4 w-4 mr-2" />
        Add Provider
      </Link>
    </Button>
  </div>
);

// Main IDP Providers page component
const IdpProvidersPage = () => {
  const { data: providers, isLoading, isError } = useQuery({
    queryKey: ['/api/idp/providers'],
  });
  
  return (
    <>
      <Helmet>
        <title>Identity Providers | Neutrinos AI</title>
        <meta 
          name="description" 
          content="Manage external identity providers for authentication and authorization in the Neutrinos AI platform."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Identity Providers"
          description="Manage external identity sources and authentication providers"
          actions={
            <Button asChild>
              <Link href="/idp/providers/new">
                <Plus className="h-4 w-4 mr-2" />
                New Provider
              </Link>
            </Button>
          }
        />
        
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center p-8 border border-red-200 bg-red-50 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Failed to load providers</h3>
              <p className="text-sm text-red-600 mt-1">
                There was an error loading the identity providers. Please try again.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : providers?.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider: IdpProvider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IdpProvidersPage;