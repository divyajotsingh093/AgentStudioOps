import { Helmet } from "react-helmet";
import { TriggerDragDropConfig } from "@/components/triggers/TriggerDragDropConfig";

export default function TriggerDragDropConfigPage() {
  return (
    <>
      <Helmet>
        <title>Drag & Drop Trigger Configuration | Neutrinos AI Agent Platform</title>
        <meta 
          name="description" 
          content="Visually create and configure agent triggers using drag and drop interface" 
        />
      </Helmet>
      <TriggerDragDropConfig />
    </>
  );
}