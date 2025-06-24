
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Mail, MessageSquare, Zap, Bot, Database, ArrowRight, UploadCloud, Lock, Loader2, PlusCircle, Workflow as WorkflowIcon, Play, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";


const initialIntegrations = [
  { name: "Slack", description: "Get notifications and interact with LexIQ.AI bot.", icon: MessageSquare, connected: false, authUrl: "https://slack.com/oauth/v2/authorize" },
  { name: "Gmail", description: "Parse incoming notices & create tasks from emails.", icon: Mail, connected: false, authUrl: "https://accounts.google.com/o/oauth2/v2/auth" },
  { name: "Zapier", description: "Connect LexIQ.AI to thousands of other apps.", icon: Zap, connected: false, authUrl: "https://zapier.com/apps/lexiq-ai/integrations" },
  { name: "WhatsApp", description: "Receive urgent alerts directly on your phone.", icon: Bot, connected: false, authUrl: "#" }, // No standard web auth flow
  { name: "Notion", description: "Sync compliance calendars and task lists.", icon: Database, connected: false, authUrl: "https://api.notion.com/v1/oauth/authorize" },
  { name: "GitHub", description: "Example for another integration.", icon: GitBranch, connected: false, authUrl: "https://github.com/login/oauth/authorize" },
];

const workflowTriggers = [
    { value: "doc_uploaded", label: "Document Uploaded", desc: "When a new contract or notice is uploaded." },
    { value: "client_added", label: "New Client Added", desc: "When a new client is added to your workspace." },
    { value: "reg_update", label: "Regulatory Update Found", desc: "When the watcher finds a new circular." },
];

const workflowActions = [
    { value: "analyze_risk", label: "Analyze for Risks", desc: "Run the document through the Contract Analyzer." },
    { value: "gen_checklist", label: "Generate Onboarding Checklist", desc: "Create a standard setup checklist for the client." },
    { value: "summarize", label: "Summarize Update", desc: "Use AI to summarize the regulatory changes." },
];

const workflowNotifications = [
    { value: "slack_legal", label: "Notify #legal on Slack", desc: "Post a summary message to your legal channel." },
    { value: "email_client", label: "Email Client", desc: "Send an automated email to the client's primary contact." },
    { value: "log_only", label: "Log to Activity Feed", desc: "No notification, just log the event." },
];

type Workflow = {
  id: string;
  trigger: string;
  action: string;
  notification: string;
};

export default function IntegrationsPage() {
  const { userProfile } = useAuth();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({ trigger: '', action: '', notification: '' });

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
  
  const handleToggleConnection = (name: string, authUrl: string) => {
    const integration = integrations.find(i => i.name === name);
    if (!integration) return;

    if (integration.connected) {
      setIntegrations(currentIntegrations =>
        currentIntegrations.map(i =>
          i.name === name ? { ...i, connected: false } : i
        )
      );
      toast({ title: `Integration Disconnected`, description: `Successfully disconnected from ${name}.` });
      return;
    }
    
    setConnecting(name);
    
    if (authUrl === "#") {
       setTimeout(() => {
          setIntegrations(current => current.map(i => i.name === name ? { ...i, connected: true } : i));
          setConnecting(null);
          toast({ title: `Integration Connected`, description: `Successfully connected to ${name}.` });
       }, 2000);
       return;
    }

    // In a real app, you would handle the OAuth callback to confirm connection.
    // For this prototype, we'll just simulate success after a delay.
    window.open(authUrl, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
      setIntegrations(current => current.map(i => i.name === name ? { ...i, connected: true } : i));
      setConnecting(null);
      toast({ title: `Integration Connected`, description: `Successfully connected to ${name}.` });
    }, 3000);
  };
  
  const handleCreateWorkflow = () => {
    if (!newWorkflow.trigger || !newWorkflow.action || !newWorkflow.notification) {
      toast({
        variant: "destructive",
        title: "Incomplete Workflow",
        description: "Please select a trigger, action, and notification.",
      });
      return;
    }
    const workflow: Workflow = {
      id: `wf_${Date.now()}`,
      ...newWorkflow
    }
    setWorkflows(prev => [...prev, workflow]);
    setNewWorkflow({ trigger: '', action: '', notification: '' });
    toast({ title: "Workflow Created!", description: "Your new automation is now active." });
  }

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(wfs => wfs.filter(w => w.id !== id));
    toast({ title: "Workflow Deleted", description: "The automation has been removed." });
  }

  const getLabel = (value: string, list: {value: string, label: string}[]) => list.find(item => item.value === value)?.label || 'N/A';

  const handleRunWorkflow = (workflow: Workflow) => {
    const actionLabel = getLabel(workflow.action, workflowActions);
    const triggerLabel = getLabel(workflow.trigger, workflowTriggers);
    toast({
      title: `Running: ${actionLabel}`,
      description: `Simulating workflow triggered by: ${triggerLabel}.`,
    });
    // In a real app, this would trigger the backend to execute the workflow.
    // For now, we just show a notification.
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
                  onClick={() => handleToggleConnection(integration.name, integration.authUrl)}
                  disabled={!!connecting}
                >
                    {connecting === integration.name ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {integration.connected ? "Disconnect" : "Connect"}
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="interactive-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><WorkflowIcon /> Workflow Builder</CardTitle>
          <CardDescription>Create powerful automations to streamline your compliance processes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-6 border rounded-lg bg-muted/40 space-y-4">
                <h3 className="font-semibold text-lg">Create a New Workflow</h3>
                 <div className="grid md:grid-cols-[1fr,auto,1fr,auto,1fr,auto] items-end gap-4">
                    <div className="space-y-2 w-full">
                        <Label>Trigger</Label>
                        <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow(w => ({...w, trigger: v}))}>
                            <SelectTrigger><SelectValue placeholder="When..."/></SelectTrigger>
                            <SelectContent>
                                {workflowTriggers.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                    
                    <div className="space-y-2 w-full">
                         <Label>Action</Label>
                        <Select value={newWorkflow.action} onValueChange={(v) => setNewWorkflow(w => ({...w, action: v}))}>
                            <SelectTrigger><SelectValue placeholder="Do..."/></SelectTrigger>
                            <SelectContent>
                                {workflowActions.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

                     <div className="space-y-2 w-full">
                         <Label>Notification</Label>
                        <Select value={newWorkflow.notification} onValueChange={(v) => setNewWorkflow(w => ({...w, notification: v}))}>
                            <SelectTrigger><SelectValue placeholder="Then..."/></SelectTrigger>
                            <SelectContent>
                                {workflowNotifications.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-auto">
                        <Button className="w-full interactive-lift" onClick={handleCreateWorkflow}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-lg mb-4">Active Workflows</h3>
                {workflows.length > 0 ? (
                    <div className="space-y-4">
                        {workflows.map(wf => (
                            <Card key={wf.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-lift">
                                <div className="flex items-center gap-4 font-medium flex-wrap">
                                    <span className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">When:</span> {getLabel(wf.trigger, workflowTriggers)}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                                    <span className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Do:</span> {getLabel(wf.action, workflowActions)}
                                    </span>
                                     <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                                     <span className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Notify:</span> {getLabel(wf.notification, workflowNotifications)}
                                    </span>
                                </div>
                                <div className="flex gap-2 self-end md:self-center">
                                    <Button variant="ghost" size="icon" onClick={() => handleRunWorkflow(wf)}><Play className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkflow(wf.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40">
                        <p>You haven't created any workflows yet.</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
