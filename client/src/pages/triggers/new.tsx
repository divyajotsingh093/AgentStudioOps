import { TriggerForm } from "@/components/triggers/TriggerForm";
import { Helmet } from "react-helmet";

export default function NewTriggerPage() {
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Create New Trigger | Neutrinos AI Agent Studio</title>
        <meta name="description" content="Create a new automation trigger to activate your AI agents based on events, schedules, or webhooks." />
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">Create New Trigger</h1>
      <TriggerForm />
    </div>
  );
}