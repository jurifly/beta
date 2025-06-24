"use client"

import { useAuth } from "@/hooks/auth"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import ContractAnalyzerForm from "./form"
import { FileScan, Loader2 } from "lucide-react"

export default function ContractAnalyzerPage() {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (userProfile.plan === 'Free') {
    return <UpgradePrompt 
      title="Unlock the Contract Analyzer"
      description="Let our AI analyze your legal documents for risks, missing clauses, and key terms. This feature requires a Pro plan."
      icon={<FileScan className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contract Analyzer</h2>
          <p className="text-muted-foreground">
            Turn uploaded contracts into actionable insights. Costs 5 credits per analysis.
          </p>
        </div>
      </div>
      <ContractAnalyzerForm />
    </div>
  )
}
