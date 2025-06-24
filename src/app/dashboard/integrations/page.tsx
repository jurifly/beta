
"use client"

import { useAuth } from "@/hooks/auth"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { Loader2, Zap } from "lucide-react"

export default function IntegrationsPage() {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (userProfile.plan !== 'Enterprise' && userProfile.plan !== 'Enterprise Pro') {
    return <UpgradePrompt 
      title="Unlock Integrations & Automations"
      description="Connect LexIQ.AI to your other tools and automate your compliance workflows. This feature requires an Enterprise plan."
      icon={<Zap className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
          <p className="text-muted-foreground">
            Connect your tools and automate your workflows.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Integrations coming soon!</p>
      </div>
    </div>
  )
}

    