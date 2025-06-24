
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Mail, MessageSquare, Zap, Bot, Database, ArrowRight, UploadCloud, Lock, Loader2, PlusCircle, Workflow as WorkflowIcon, Play, Trash2, Activity } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from 'date-fns';
import type { Workflow, ActivityLogItem } from "@/lib/types";


const initialIntegrations = [
  { name: "Slack", description: "Get notifications and interact with Clausey bot.", icon: MessageSquare, connected: false, authUrl: "#" },
  { name: "Gmail", description: "Parse incoming notices & create tasks from emails.", icon: Mail, connected: false, authUrl: "#" },
  { name: "Zapier", description: "Connect Clausey to thousands of other apps.", icon: Zap, connected: false, authUrl: "#" },
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

export default function IntegrationsPage() {
  const { userProfile } = useAuth();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({ trigger: '', action: '', notification: '' });
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!['Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) {
    return <UpgradePrompt 
      title="Unlock the Workflow & Automation Studio"
      description="Connect Clausey to your favorite tools and build automated workflows. This is an Enterprise feature."
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
    
    // Simulate OAuth flow
    setTimeout(() => {
      setIntegrations(current => current.map(i => i.name === name ? { ...i, connected: true } : i));
      setConnecting(null);
      toast({ title: `Integration Connected`, description: `Successfully connected to ${name}.` });
    }, 2000);
  };
  
  const getLabel = (value: string, list: {value: string, label: string}[]) => list.find(item => item.value === value)?.label || 'N/A';

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

    const newActivity: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: new Date(),
      icon: WorkflowIcon,
      title: `Workflow Created: "${getLabel(workflow.action, workflowActions)}"`,
      description: `Triggered by: "${getLabel(workflow.trigger, workflowTriggers)}"`,
    };
    setActivityLog(prev => [newActivity, ...prev]);
    
    setNewWorkflow({ trigger: '', action: '', notification: '' });
    toast({ title: "Workflow Created!", description: "Your new automation is now active." });
  }

  const handleDeleteWorkflow = (id: string) => {
     const workflowToDelete = workflows.find(w => w.id === id);
    if (workflowToDelete) {
        const newActivity: ActivityLogItem = {
          id: `act_${Date.now()}`,
          timestamp: new Date(),
          icon: Trash2,
          title: `Workflow Deleted: "${getLabel(workflowToDelete.action, workflowActions)}"`,
          description: "The automation rule has been removed.",
        };
        setActivityLog(prev => [newActivity, ...prev]);
    }
    setWorkflows(wfs => wfs.filter(w => w.id !== id));
    toast({ title: "Workflow Deleted", description: "The automation has been removed." });
  }

  const handleRunWorkflow = (workflow: Workflow) => {
    const newActivity: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: new Date(),
      icon: Play,
      title: `Workflow Run: "${getLabel(workflow.action, workflowActions)}"`,
      description: `Triggered manually.`,
    };
    setActivityLog(prev => [newActivity, ...prev]);
    toast({ title: "Workflow Running", description: "The workflow has been manually triggered." });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Workflow & Automation Studio</h2>
                <p className="text-muted-foreground">
                  Connect Clausey to your favorite tools and build powerful, automated workflows.
                </p>
            </div>
            <Card className="interactive-lift">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><WorkflowIcon /> Workflow Builder</CardTitle>
                <CardDescription>Create powerful automations to streamline your compliance processes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 border rounded-lg bg-muted/40 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>1. Trigger</Label>
                                <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow(w => ({...w, trigger: v}))}>
                                    <SelectTrigger><SelectValue placeholder="When..."/></SelectTrigger>
                                    <SelectContent>
                                        {workflowTriggers.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>2. Action</Label>
                                <Select value={newWorkflow.action} onValueChange={(v) => setNewWorkflow(w => ({...w, action: v}))}>
                                    <SelectTrigger><SelectValue placeholder="Do..."/></SelectTrigger>
                                    <SelectContent>
                                        {workflowActions.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>3. Notification</Label>
                                <Select value={newWorkflow.notification} onValueChange={(v) => setNewWorkflow(w => ({...w, notification: v}))}>
                                    <SelectTrigger><SelectValue placeholder="Then..."/></SelectTrigger>
                                    <SelectContent>
                                        {workflowNotifications.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <Button className="w-full md:w-auto interactive-lift" onClick={handleCreateWorkflow}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Workflow
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h3 className="text-xl font-semibold mb-4">Active Workflows ({workflows.length})</h3>
                {workflows.length > 0 ? (
                    <div className="space-y-4">
                        {workflows.map(wf => (
                            <Card key={wf.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-lift">
                                <div className="flex items-center gap-2 font-medium flex-wrap text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="text-muted-foreground">When:</span> {getLabel(wf.trigger, workflowTriggers)}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    <span className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Do:</span> {getLabel(wf.action, workflowActions)}
                                    </span>
                                     <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                     <span className="flex items-center gap-2">
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
                        <WorkflowIcon className="mx-auto w-12 h-12 text-primary/20 mb-4"/>
                        <p className="font-semibold">No active workflows</p>
                        <p className="text-sm">Use the builder above to create your first automation.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
                <p className="text-muted-foreground">
                  Connect your favorite tools.
                </p>
            </div>
             <div className="space-y-4">
                {integrations.map((integration) => (
                <Card key={integration.name} className="interactive-lift">
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <integration.icon className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                    </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
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
                    <CardTitle className="flex items-center gap-2"><Activity /> Automation Activity Feed</CardTitle>
                    <CardDescription>A real-time log of your automated tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLog.length > 0 ? (
                        <div className="space-y-4">
                           {activityLog.map(log => (
                            <div key={log.id} className="flex items-start gap-3">
                                <div className="p-2 bg-muted rounded-full text-muted-foreground">
                                    <log.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{log.title}</p>
                                    <p className="text-xs text-muted-foreground">{log.description}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p>
                                </div>
                            </div>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40">
                            <p>No activity yet. Create a workflow to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    </div>
  );
}
