import { useState } from "react";
import { StepInfo } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RunStepProps {
  step: StepInfo;
  index: number;
  total: number;
}

const RunStep = ({ step, index, total }: RunStepProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="timeline-item mb-8">
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">
              {step.type === 'Tool' 
                ? `Tool: ${step.name}`
                : step.type === 'Prompt' && index === 0
                  ? 'Initial Prompt'
                  : 'Final Response'
              }
            </h3>
            <span className="text-xs text-gray-500">{step.latency}ms</span>
          </div>
          
          {step.type === 'Prompt' && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Input Tokens: {step.tokens_in || 0}
              </div>
              <div className="text-xs font-medium text-gray-500">
                Output Tokens: {step.tokens_out || 0}
              </div>
            </div>
          )}
          
          {step.description && (
            <p className="text-sm text-gray-600 mb-3">{step.description}</p>
          )}
          
          <div className="flex justify-between">
            <Button 
              variant="link" 
              size="sm" 
              className="px-0 text-xs" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            <div className="text-xs text-gray-500">Step {index + 1} of {total}</div>
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(step, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RunStep;
