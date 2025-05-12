import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StepInfo } from "@/lib/types";
import RunStep from "./RunStep";

interface RunTimelineProps {
  steps: StepInfo[];
  runId: string;
}

const RunTimeline = ({ steps, runId }: RunTimelineProps) => {
  const [activeTab, setActiveTab] = useState("steps");

  const handleReplay = () => {
    console.log(`Replaying run ${runId} with latest agent version`);
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <TabsList className="px-4 border-b-0">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="steps" className="p-6">
          <div className="flex mb-6">
            <Button onClick={handleReplay}>
              <Play className="h-4 w-4 mr-2" /> Replay with latest
            </Button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {steps.map((step, index) => (
              <RunStep 
                key={index} 
                step={step} 
                index={index} 
                total={steps.length} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="input">
          <CardContent className="p-6">
            <p className="text-gray-500">Input content for this run will be displayed here.</p>
          </CardContent>
        </TabsContent>

        <TabsContent value="output">
          <CardContent className="p-6">
            <p className="text-gray-500">Output content for this run will be displayed here.</p>
          </CardContent>
        </TabsContent>

        <TabsContent value="tokens">
          <CardContent className="p-6">
            <p className="text-gray-500">Token usage information will be displayed here.</p>
          </CardContent>
        </TabsContent>

        <TabsContent value="latency">
          <CardContent className="p-6">
            <p className="text-gray-500">Latency measurements will be displayed here.</p>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RunTimeline;
