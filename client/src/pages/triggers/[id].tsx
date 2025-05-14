import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { TriggerForm } from "@/components/triggers/TriggerForm";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EditTriggerPage() {
  const params = useParams<{ id: string }>();
  const triggerId = parseInt(params.id);
  const [, navigate] = useLocation();

  const {
    data: trigger,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/triggers', triggerId],
    enabled: !isNaN(triggerId),
  });

  if (isNaN(triggerId)) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Trigger ID</AlertTitle>
          <AlertDescription>
            The specified trigger ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Trigger</h1>
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !trigger) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load trigger. The trigger might not exist or there was an error retrieving it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Edit Trigger: {trigger.name} | Neutrinos AI Agent Studio</title>
        <meta name="description" content={`Edit trigger configuration for ${trigger.name}. Update conditions, scheduling, or webhook parameters.`} />
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">Edit Trigger: {trigger.name}</h1>
      <TriggerForm triggerId={triggerId} />
    </div>
  );
}