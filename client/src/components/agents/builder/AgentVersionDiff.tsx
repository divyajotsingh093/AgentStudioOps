import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock data for versions
const mockVersionsData = {
  versions: [
    {v: "1.3-draft", date: "2025-05-18"},
    {v: "1.2", date: "2025-05-15", prod: true},
    {v: "1.1", date: "2025-05-09"},
    {v: "1.0", date: "2025-04-28"}
  ],
  diffs: {
    prompt: `- You are an AI assistant for insurance underwriting at Neutrinos Insurance.
- Your role is to help process applications efficiently and accurately.
+ You are an AI assistant for insurance underwriting at Neutrinos Insurance. 
+ Your role is to help process applications efficiently, accurately, and with full compliance.
  
  Your responsibilities include:
  1. Collect relevant health and medical information
  2. Apply underwriting rules to evaluate applications
  3. Make recommendations based on risk assessment
  4. Request additional information when needed
- 5. Create clear decisions
+ 5. Create clear, explainable decisions with references to specific rules
+ 6. Ensure all PII data is properly masked in responses`,
    
    tools: `  Available tools:
  - Rules Engine: for policy evaluation
  - Document Intelligence: for analyzing medical records
- - Data Fabric Query: for retrieving customer history
+ - Data Fabric Query: for retrieving customer history (restricted fields)
+ - Case System: for updating application status`,
    
    policies: `  Policy settings:
- - Max token limit: 4000
+ - Max token limit: 3000
  - PII masking: enabled
  - Tool allow-list enforced
- - Max transaction amount: $5000
+ - Max transaction amount: $2000`
  }
};

const AgentVersionDiff = () => {
  const [activeVersion, setActiveVersion] = useState("1.3-draft");
  const [compareVersion, setCompareVersion] = useState("1.2");
  const [activeTab, setActiveTab] = useState("prompt");
  const { toast } = useToast();
  
  const handlePromote = () => {
    toast({
      title: "Version promoted",
      description: "Version 1.3 has been promoted to production.",
    });
  };
  
  const handleRollback = () => {
    toast({
      title: "Version rolled back",
      description: "Rolled back to version 1.1",
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Version List */}
        <div className="w-full md:w-64">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Agent Versions</CardTitle>
              <CardDescription>Select to compare</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockVersionsData.versions.map((version) => (
                  <button
                    key={version.v}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      activeVersion === version.v ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (compareVersion === version.v) {
                        setCompareVersion(activeVersion);
                      }
                      setActiveVersion(version.v);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="font-medium">v{version.v}</span>
                      {version.prod && (
                        <Badge className="ml-2 bg-green-100 text-green-700" variant="outline">
                          Prod
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(version.date).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full"
              onClick={handlePromote}
              disabled={!activeVersion.includes('draft')}
            >
              Promote to Production
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleRollback}
            >
              Rollback to Previous
            </Button>
          </div>
        </div>
        
        {/* Diff View */}
        <div className="flex-1">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Version Comparison</CardTitle>
                  <CardDescription>
                    Comparing v{activeVersion} with v{compareVersion}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={activeTab === 'prompt' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveTab('prompt')}
                  >
                    Prompt
                  </Button>
                  <Button 
                    variant={activeTab === 'tools' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveTab('tools')}
                  >
                    Tools
                  </Button>
                  <Button 
                    variant={activeTab === 'policies' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveTab('policies')}
                  >
                    Policies
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {activeTab === 'prompt' && renderDiff(mockVersionsData.diffs.prompt)}
                  {activeTab === 'tools' && renderDiff(mockVersionsData.diffs.tools)}
                  {activeTab === 'policies' && renderDiff(mockVersionsData.diffs.policies)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to render diff with appropriate colors
const renderDiff = (diffText: string) => {
  return diffText.split('\n').map((line, index) => {
    if (line.startsWith('+')) {
      return (
        <div key={index} className="bg-green-100 text-green-800">
          {line}
        </div>
      );
    } else if (line.startsWith('-')) {
      return (
        <div key={index} className="bg-red-100 text-red-800">
          {line}
        </div>
      );
    } else {
      return (
        <div key={index}>
          {line}
        </div>
      );
    }
  });
};

export default AgentVersionDiff;