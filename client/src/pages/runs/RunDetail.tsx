import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { FileText, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import RunDetailHeader from "@/components/runs/RunDetailHeader";
import RunTimeline from "@/components/runs/RunTimeline";
import { runs } from "@/lib/mock-data";
import { Run } from "@/lib/types";

const RunDetail = () => {
  const { id } = useParams();
  const [run, setRun] = useState<Run | null>(null);
  
  useEffect(() => {
    // Find run by ID
    const foundRun = runs.find(run => run.id === id);
    if (foundRun) {
      setRun(foundRun);
    }
  }, [id]);
  
  if (!run) {
    return <div className="p-6">Run not found</div>;
  }
  
  const getAgentIcon = (icon: string) => {
    switch (icon) {
      case 'file-text':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'activity':
        return <Activity className="h-5 w-5 text-primary" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <RunDetailHeader run={run} />
      
      {/* Run Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Agent</h3>
              <div className="flex items-center">
                <div className="h-6 w-6 bg-primary/10 rounded flex items-center justify-center mr-2">
                  {getAgentIcon(run.agentIcon)}
                </div>
                <span className="font-medium">{run.agentName}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Timestamp</h3>
              <p>{run.timestamp}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Latency</h3>
              <p>{run.latency}s</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Token Cost</h3>
              <p>${run.cost.toFixed(4)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      <RunTimeline steps={run.steps} runId={run.id} />
    </div>
  );
};

export default RunDetail;
