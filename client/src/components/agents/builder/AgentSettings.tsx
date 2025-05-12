import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  LucideIcon, 
  MessagesSquare, 
  Wrench, 
  Sliders, 
  ShieldCheck, 
  Bell,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Mock data for settings
const mockSettingsData = {
  general: {
    name: "Accelerated UW Agent",
    owner: "John D.",
    tags: ["Underwriting", "Life Insurance", "Automation"]
  },
  promptModel: {
    model: "gpt-4o",
    temperature: 0.7,
    topP: 0.95,
    systemPrompt: "You are an AI assistant for insurance underwriting at Neutrinos Insurance...",
    maxOutputTokens: 4000
  },
  tools: [
    { id: "data_fabric.query", name: "Data Fabric Query", enabled: true },
    { id: "workflow.trigger", name: "Workflow Trigger", enabled: true },
    { id: "rules.evaluate", name: "Rules Engine", enabled: true },
    { id: "idp.extract", name: "Document Intelligence", enabled: true },
    { id: "case.update", name: "Case System", enabled: true },
    { id: "email.send", name: "Email Service", enabled: false }
  ],
  runtimeCaps: {
    tokenCap: 3000,
    loopCap: 10,
    costCap: 0.50
  },
  guardrails: {
    piiMask: true,
    piiRegex: "\\b(?!000|666|9\\d{2})([0-8]\\d{2}|7([0-6]\\d|7[012]))([-]?|\\s{1})(?!00)\\d\\d\\2(?!0000)\\d{4}\\b",
    toxicityThreshold: 0.8
  },
  notifications: {
    slackWebhook: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    email: "underwriting-team@neutrinos.com",
    notifyOn: ["failure", "approval_needed"]
  }
};

interface AccordionSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

const AccordionSection = ({ icon: Icon, title, children }: AccordionSectionProps) => (
  <AccordionItem value={title.toLowerCase()}>
    <AccordionTrigger className="hover:no-underline">
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-2 text-blue-600" />
        <span>{title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-4">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const AgentSettings = () => {
  const [settings, setSettings] = useState(mockSettingsData);
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Agent settings have been saved successfully.",
    });
  };
  
  const handlePublish = () => {
    toast({
      title: "Version published",
      description: "New version 1.3 has been published successfully.",
    });
  };
  
  const handleToolToggle = (toolId: string) => {
    setSettings({
      ...settings,
      tools: settings.tools.map(tool => 
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      )
    });
  };

  return (
    <div className="p-6">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Accordion type="single" collapsible defaultValue="general" className="w-full">
            {/* General Settings */}
            <AccordionSection icon={Info} title="General">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input 
                      id="agent-name" 
                      value={settings.general.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, name: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="agent-owner">Owner</Label>
                    <Input 
                      id="agent-owner" 
                      value={settings.general.owner}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, owner: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-tags">Tags (comma separated)</Label>
                  <Input 
                    id="agent-tags" 
                    value={settings.general.tags.join(", ")}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { 
                        ...settings.general, 
                        tags: e.target.value.split(",").map(tag => tag.trim()) 
                      }
                    })}
                  />
                </div>
              </div>
            </AccordionSection>
            
            {/* Prompt/Model Settings */}
            <AccordionSection icon={MessagesSquare} title="Prompt / Model">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-selection">Model</Label>
                    <Select 
                      defaultValue={settings.promptModel.model}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        promptModel: { ...settings.promptModel, model: value }
                      })}
                    >
                      <SelectTrigger id="model-selection">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude-3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Output Tokens</Label>
                    <Input 
                      id="max-tokens" 
                      type="number"
                      value={settings.promptModel.maxOutputTokens}
                      onChange={(e) => setSettings({
                        ...settings,
                        promptModel: { 
                          ...settings.promptModel, 
                          maxOutputTokens: parseInt(e.target.value) 
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Temperature: {settings.promptModel.temperature.toFixed(2)}</Label>
                  <Slider 
                    value={[settings.promptModel.temperature * 100]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      promptModel: { 
                        ...settings.promptModel, 
                        temperature: value[0] / 100 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Top-P: {settings.promptModel.topP.toFixed(2)}</Label>
                  <Slider 
                    value={[settings.promptModel.topP * 100]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      promptModel: { 
                        ...settings.promptModel, 
                        topP: value[0] / 100 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea 
                    id="system-prompt" 
                    rows={8}
                    value={settings.promptModel.systemPrompt}
                    onChange={(e) => setSettings({
                      ...settings,
                      promptModel: { 
                        ...settings.promptModel, 
                        systemPrompt: e.target.value 
                      }
                    })}
                  />
                </div>
              </div>
            </AccordionSection>
            
            {/* Tools Settings */}
            <AccordionSection icon={Tool} title="Tools">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Enable or disable tools the agent can use.</p>
                
                <div className="space-y-2">
                  {settings.tools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-600"></div>
                        <span>{tool.name}</span>
                        <code className="ml-2 text-xs text-gray-500">{tool.id}</code>
                      </div>
                      <Switch 
                        checked={tool.enabled}
                        onCheckedChange={() => handleToolToggle(tool.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AccordionSection>
            
            {/* Runtime Caps Settings */}
            <AccordionSection icon={Sliders} title="Runtime Caps">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-cap">Max Tokens per Run</Label>
                    <Input 
                      id="token-cap" 
                      type="number"
                      value={settings.runtimeCaps.tokenCap}
                      onChange={(e) => setSettings({
                        ...settings,
                        runtimeCaps: { 
                          ...settings.runtimeCaps, 
                          tokenCap: parseInt(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loop-cap">Max Loop Iterations</Label>
                    <Input 
                      id="loop-cap" 
                      type="number"
                      value={settings.runtimeCaps.loopCap}
                      onChange={(e) => setSettings({
                        ...settings,
                        runtimeCaps: { 
                          ...settings.runtimeCaps, 
                          loopCap: parseInt(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost-cap">Max Cost per Run ($)</Label>
                    <Input 
                      id="cost-cap" 
                      type="number"
                      step="0.01"
                      value={settings.runtimeCaps.costCap}
                      onChange={(e) => setSettings({
                        ...settings,
                        runtimeCaps: { 
                          ...settings.runtimeCaps, 
                          costCap: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
                  <p>Reducing the token cap from 4000 to 3000 will reduce costs by approximately 25%.</p>
                </div>
              </div>
            </AccordionSection>
            
            {/* Guardrails Settings */}
            <AccordionSection icon={ShieldCheck} title="Guardrails">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div>
                    <Label>PII Masking</Label>
                    <p className="text-sm text-gray-500">Automatically mask personally identifiable information</p>
                  </div>
                  <Switch 
                    checked={settings.guardrails.piiMask}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      guardrails: { 
                        ...settings.guardrails, 
                        piiMask: checked 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pii-regex">PII Regular Expression</Label>
                  <Textarea 
                    id="pii-regex" 
                    rows={2}
                    value={settings.guardrails.piiRegex}
                    onChange={(e) => setSettings({
                      ...settings,
                      guardrails: { 
                        ...settings.guardrails, 
                        piiRegex: e.target.value 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Toxicity Threshold: {settings.guardrails.toxicityThreshold.toFixed(2)}</Label>
                  <Slider 
                    value={[settings.guardrails.toxicityThreshold * 100]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      guardrails: { 
                        ...settings.guardrails, 
                        toxicityThreshold: value[0] / 100 
                      }
                    })}
                  />
                  <p className="text-xs text-gray-500">Lower values are more strict (reject more content)</p>
                </div>
              </div>
            </AccordionSection>
            
            {/* Notifications Settings */}
            <AccordionSection icon={Bell} title="Notifications">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input 
                    id="slack-webhook" 
                    value={settings.notifications.slackWebhook}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { 
                        ...settings.notifications, 
                        slackWebhook: e.target.value 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-notify">Email Notification</Label>
                  <Input 
                    id="email-notify" 
                    value={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { 
                        ...settings.notifications, 
                        email: e.target.value 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notify On</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notify-failure"
                        checked={settings.notifications.notifyOn.includes('failure')}
                        onCheckedChange={(checked) => {
                          const newNotifyOn = checked 
                            ? [...settings.notifications.notifyOn, 'failure']
                            : settings.notifications.notifyOn.filter(n => n !== 'failure');
                          
                          setSettings({
                            ...settings,
                            notifications: { 
                              ...settings.notifications, 
                              notifyOn: newNotifyOn 
                            }
                          });
                        }}
                      />
                      <Label htmlFor="notify-failure">Run Failures</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notify-approval"
                        checked={settings.notifications.notifyOn.includes('approval_needed')}
                        onCheckedChange={(checked) => {
                          const newNotifyOn = checked 
                            ? [...settings.notifications.notifyOn, 'approval_needed']
                            : settings.notifications.notifyOn.filter(n => n !== 'approval_needed');
                          
                          setSettings({
                            ...settings,
                            notifications: { 
                              ...settings.notifications, 
                              notifyOn: newNotifyOn 
                            }
                          });
                        }}
                      />
                      <Label htmlFor="notify-approval">Approval Needed</Label>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionSection>
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end space-x-3">
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={handlePublish}>
          Publish
        </Button>
      </div>
    </div>
  );
};

export default AgentSettings;