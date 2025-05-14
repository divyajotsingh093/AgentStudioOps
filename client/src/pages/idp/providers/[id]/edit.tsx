import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

// Form schema based on IDP provider
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional(),
  type: z.enum(['OIDC', 'SAML', 'OAuth2', 'LDAP', 'Custom']),
  status: z.enum(['Active', 'Inactive', 'Testing', 'Deprecated']),
  config: z.record(z.any()).default({}),
});

type FormValues = z.infer<typeof formSchema>;

const EditProviderPage = () => {
  const [match, params] = useRoute('/idp/providers/:id/edit');
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: provider, isLoading, isError } = useQuery({
    queryKey: [`/api/idp/providers/${params?.id}`],
    enabled: !!params?.id,
  });

  // Form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'OIDC',
      status: 'Testing',
      config: {},
    },
  });

  // Update form values when provider data is loaded
  useEffect(() => {
    if (provider) {
      form.reset({
        name: provider.name,
        description: provider.description || '',
        type: provider.type,
        status: provider.status,
        config: provider.config || {},
      });
    }
  }, [provider, form]);

  const onSubmit = async (data: FormValues) => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/idp/providers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Provider updated',
          description: 'The identity provider was successfully updated.',
          variant: 'success',
        });
        navigate(`/idp/providers/${params.id}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to update provider',
          description: error.error || 'An error occurred while updating the provider.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  if (!match) {
    return null;
  }
  
  // Loading state
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
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
          <CardFooter>
            <div className="flex justify-end gap-2 w-full">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !provider) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <CardTitle className="text-red-800">Provider Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-700">
              The identity provider you're trying to edit doesn't exist or there was an error loading it.
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
        <title>Edit {provider.name} | Neutrinos AI</title>
        <meta 
          name="description" 
          content={`Edit configuration for ${provider.name} identity provider.`}
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title={`Edit ${provider.name}`}
          description="Modify identity provider configuration"
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate(`/idp/providers/${params?.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Provider Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Company OIDC" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name to identify this provider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a description for this provider..."
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description for this identity provider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OIDC">OpenID Connect (OIDC)</SelectItem>
                            <SelectItem value="SAML">SAML 2.0</SelectItem>
                            <SelectItem value="OAuth2">OAuth 2.0</SelectItem>
                            <SelectItem value="LDAP">LDAP / Active Directory</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The authentication protocol used by this provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Deprecated">Deprecated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The current status of this provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Dynamic config fields based on provider type */}
                {form.watch('type') === 'OIDC' && (
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium">OpenID Connect Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Issuer URL</FormLabel>
                        <Input 
                          placeholder="https://example.com/.well-known/openid-configuration"
                          value={(form.getValues('config')?.issuerUrl as string) || ''}
                          onChange={(e) => {
                            const newConfig = { ...form.getValues('config'), issuerUrl: e.target.value };
                            form.setValue('config', newConfig);
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The OpenID Connect issuer URL.
                        </p>
                      </div>
                      
                      <div>
                        <FormLabel>Client ID</FormLabel>
                        <Input 
                          placeholder="your-client-id"
                          value={(form.getValues('config')?.clientId as string) || ''}
                          onChange={(e) => {
                            const newConfig = { ...form.getValues('config'), clientId: e.target.value };
                            form.setValue('config', newConfig);
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The client ID issued by the identity provider.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel>Client Secret</FormLabel>
                      <Input 
                        type="password"
                        placeholder={form.getValues('config')?.clientSecret ? "●●●●●●●●●●●●" : "Enter client secret"}
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), clientSecret: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The client secret issued by the identity provider. Leave blank to keep existing value.
                      </p>
                    </div>
                    
                    <div>
                      <FormLabel>Redirect URI</FormLabel>
                      <Input 
                        placeholder="https://yourdomain.com/auth/callback"
                        value={(form.getValues('config')?.redirectUri as string) || ''}
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), redirectUri: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The URI where the identity provider will redirect after authentication.
                      </p>
                    </div>
                  </div>
                )}
                
                {form.watch('type') === 'SAML' && (
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium">SAML Configuration</h3>
                    
                    <div>
                      <FormLabel>Identity Provider Metadata URL</FormLabel>
                      <Input 
                        placeholder="https://example.com/saml/metadata"
                        value={(form.getValues('config')?.metadataUrl as string) || ''}
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), metadataUrl: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL to the identity provider's SAML metadata.
                      </p>
                    </div>
                    
                    <div>
                      <FormLabel>Service Provider Entity ID</FormLabel>
                      <Input 
                        placeholder="https://yourdomain.com"
                        value={(form.getValues('config')?.entityId as string) || ''}
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), entityId: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your service provider entity ID.
                      </p>
                    </div>
                    
                    <div>
                      <FormLabel>Assertion Consumer Service URL</FormLabel>
                      <Input 
                        placeholder="https://yourdomain.com/saml/acs"
                        value={(form.getValues('config')?.acsUrl as string) || ''}
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), acsUrl: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The endpoint where SAML assertions are received.
                      </p>
                    </div>
                  </div>
                )}
                
                <CardFooter className="flex justify-end gap-2 px-0">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate(`/idp/providers/${params?.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditProviderPage;