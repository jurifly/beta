"use client"

import DueDiligenceForm from "./form";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { GanttChartSquare, Loader2 } from "lucide-react";

export default function DueDiligencePage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const isProUser = userProfile.plan !== 'Free';

  if (!isProUser) {
    return (
      <UpgradePrompt
        title="Unlock the Audit Hub"
        description="Generate dynamic checklists, build secure datarooms, and run compliance checks with our advanced toolkit. This is a Pro feature."
        icon={<GanttChartSquare className="w-12 h-12 text-primary" />}
      />
    );
  }

  return (
    <div className="space-y-6 h-full">
       <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Hub</h2>
          <p className="text-muted-foreground">
            Generate dynamic checklists, prepare datarooms, and run compliance checks.
          </p>
        </div>
      <DueDiligenceForm />
    </div>
  );
}
