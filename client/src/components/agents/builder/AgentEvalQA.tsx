import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  PlayCircle, 
  UserCheck 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for evaluations
const mockEvalData = {
  auto: {
    relevance: 0.91,
    guardrail: 0.97,
    toxicity: 1.0
  },
  failures: [
    {run: "run-9Y55", check: "Relevance", score: 0.45},
    {run: "run-9Y57", check: "Guardrail", score: 0.60}
  ]
};

const AgentEvalQA = () => {
  const { toast } = useToast();
  
  const handleReplay = (runId: string) => {
    toast({
      title: "Replaying run",
      description: `Replaying run ${runId}...`,
    });
  };
  
  const handleAskSME = () => {
    toast({
      title: "Request sent",
      description: "SME rating request has been sent to the governance team.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Eval Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Automated Evaluations</h2>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Answer Relevance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-green-500" 
                    style={{ width: `${mockEvalData.auto.relevance * 100}%` }}
                  />
                </div>
                <span className="ml-3 font-medium">
                  {(mockEvalData.auto.relevance * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Based on 124 evaluations in the last 7 days</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShieldAlert className="mr-2 h-4 w-4 text-blue-500" />
                Guardrail Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-green-500" 
                    style={{ width: `${mockEvalData.auto.guardrail * 100}%` }}
                  />
                </div>
                <span className="ml-3 font-medium">
                  {(mockEvalData.auto.guardrail * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Based on 124 evaluations in the last 7 days</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                Toxicity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-600" 
                    style={{ width: `${mockEvalData.auto.toxicity * 100}%` }}
                  />
                </div>
                <span className="ml-3 font-medium">
                  {(mockEvalData.auto.toxicity * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Perfect score! No toxicity detected in 124 evaluations</p>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleAskSME}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Ask SME to rate 5 random runs
          </Button>
        </div>
        
        {/* Failure Table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Failed Evaluations</h2>
          
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Run ID</th>
                      <th scope="col" className="px-6 py-3">Check</th>
                      <th scope="col" className="px-6 py-3">Score</th>
                      <th scope="col" className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEvalData.failures.map((failure, index) => (
                      <tr key={index} className="bg-white border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {failure.run}
                        </td>
                        <td className="px-6 py-4">
                          {failure.check}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {(failure.score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleReplay(failure.run)}
                          >
                            <PlayCircle className="mr-1 h-3 w-3" />
                            Replay
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {mockEvalData.failures.length === 0 && (
                      <tr className="bg-white border-b">
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No evaluation failures found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Recent SME Feedback</h3>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson (Underwriting)</p>
                    <p className="text-xs text-gray-500">May 18, 2025</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium">4.5/5</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  "Agent handled the complex diabetes case well, but could improve on explaining which rules were applied."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEvalQA;