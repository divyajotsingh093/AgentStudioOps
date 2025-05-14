import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
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

// Form schema for creating a new IDP provider
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional(),
  type: z.enum(['OIDC', 'SAML', 'OAuth2', 'LDAP', 'Custom']),
  status: z.enum(['Active', 'Inactive', 'Testing', 'Deprecated']),
  config: z.record(z.any()).default({}),
});

type FormValues = z.infer<typeof formSchema>;

const NewProviderPage = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

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

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/idp/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Provider created',
          description: 'The identity provider was successfully created.',
          variant: 'success',
        });
        navigate(`/idp/providers/${result.id}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to create provider',
          description: error.error || 'An error occurred while creating the provider.',
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

  return (
    <>
      <Helmet>
        <title>Add Identity Provider | Neutrinos AI</title>
        <meta 
          name="description" 
          content="Configure a new identity provider to integrate with external authentication systems."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Add Identity Provider"
          description="Configure a new identity provider for authentication"
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate('/idp')}>
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
                        placeholder="Enter client secret"
                        onChange={(e) => {
                          const newConfig = { ...form.getValues('config'), clientSecret: e.target.value };
                          form.setValue('config', newConfig);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The client secret issued by the identity provider.
                      </p>
                    </div>
                    
                    <div>
                      <FormLabel>Redirect URI</FormLabel>
                      <Input 
                        placeholder="https://yourdomain.com/auth/callback"
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
                    onClick={() => navigate('/idp')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Create Provider
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

export default NewProviderPage;