
"use client"

import { useAuth } from "@/hooks/auth";
import RegulationWatcherForm from "./form";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { RadioTower, Loader2 } from "lucide-react";

export default function RegulationWatcherPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!['Pro', 'Enterprise'].includes(userProfile.plan)) {
    return <UpgradePrompt 
      title="Unlock Regulation Watcher"
      description="Stay ahead of regulatory changes with AI-powered summaries from government portals. This feature requires a Pro plan."
      icon={<RadioTower className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
          <div>
              <h2 className="text-2xl font-bold tracking-tight">Regulation Watcher</h2>
              <p className="text-muted-foreground">
                Get AI-powered summaries of the latest regulatory updates. Costs 1 credit per request.
              </p>
          </div>
      </div>
      <RegulationWatcherForm />
    </div>
  );
}
