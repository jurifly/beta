
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Mail, MessageSquare, Zap, Bot, Database, ArrowRight, UploadCloud, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useToast } from "@/hooks/use-toast";

const initialIntegrations = [
  { name: "Slack", description: "Get notifications and interact with LexIQ.AI bot.", icon: MessageSquare, connected: false },
  { name: "Gmail", description: "Parse incoming notices & create tasks from emails.", icon: Mail, connected: false },
  { name: "Zapier", description: "Connect LexIQ.AI to thousands of other apps.", icon: Zap, connected: false },
  { name: "WhatsApp", description: "Receive urgent alerts directly on your phone.", icon: Bot, connected: false },
  { name: "Notion", description: "Sync compliance calendars and task lists.", icon: Database, connected: false },
  { name: "GitHub", description: "Example for another integration.", icon: GitBranch, connected: false },
];

export default function IntegrationsPage() {
  const { userProfile } = useAuth();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const { toast } = useToast();
  
  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!['Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) {
    return <UpgradePrompt 
      title="Unlock the Workflow & Automation Studio"
      description="Connect LexIQ.AI to your favorite tools and build automated workflows. This is an Enterprise feature."
      icon={<Zap className="w-12 h-12 text-primary/20"/>}
    />;
  }
  
  const handleToggleConnection = (name: string) => {
    const isConnecting = !integrations.find(i => i.name === name)?.connected;
    
    setIntegrations(currentIntegrations =>
      currentIntegrations.map(integration =>
        integration.name === name
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    
    toast({
      title: `Integration ${isConnecting ? 'Connected' : 'Disconnected'}`,
      description: `Successfully ${isConnecting ? 'connected to' : 'disconnected from'} ${name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workflow & Automation Studio</h2>
        <p className="text-muted-foreground">
          Connect LexIQ.AI to your favorite tools and build powerful, automated workflows.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="interactive-lift">
            <CardHeader className="flex flex-row items-center gap-4">
              <integration.icon className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
                <Button 
                  className="w-full interactive-lift" 
                  variant={integration.connected ? "outline" : "default"}
                  onClick={() => handleToggleConnection(integration.name)}
                >
                    {integration.connected ? "Disconnect" : "Connect"}
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="interactive-lift">
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create powerful automations to streamline your compliance processes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40 space-y-6">
            <Zap className="mx-auto h-12 w-12 text-primary/20" />
            <p className="mt-4 text-lg font-semibold text-foreground">Build Automated Legal Workflows</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-foreground">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                <UploadCloud className="w-6 h-6 text-blue-500" />
                <span className="font-medium">Trigger</span>
              </div>
              <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block" />
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="font-medium">Action</span>
              </div>
              <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block" />
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                <MessageSquare className="w-6 h-6 text-green-500" />
                <span className="font-medium">Notify</span>
              </div>
            </div>
            <p className="text-sm max-w-2xl">Example: "When a 'Contract is Uploaded', automatically 'Analyze it for Risks', and if the risk is 'High', then 'Notify the Legal Team on Slack'."</p>
            <Button variant="secondary" className="interactive-lift">Start Building</Button>
        </CardContent>
      </Card>
    </div>
  );
}
