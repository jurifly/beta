
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";

interface FeatureLockedModalProps {
  featureName: string | null;
  onOpenChange: (isOpen: boolean) => void;
}

const wittyMessages: Record<string, { title: string; lines: string[]; eta?: string }> = {
    "Team Management": {
        title: "🧑‍💼 Team Management is a Pro Feature",
        lines: ["Invite colleagues, assign roles, and manage permissions by upgrading to a Pro plan."],
    },
    "Connections": {
        title: "🔌 Connect with Your Team",
        lines: ["Collaborate seamlessly with your advisors or clients. This feature is available on our paid plans."],
    },
    "Community": {
        title: "💬 Join the Community",
        lines: ["Access our private community of founders and experts by upgrading your account."],
    },
    "Report Center": {
        title: "📊 Automated Reporting",
        lines: ["Generate professional, shareable PDF reports for your clients or stakeholders. Upgrade to unlock this feature."],
    },
    "Clause Library": {
        title: "📚 Unlock the Full Clause Library",
        lines: ["Access our complete library of pre-built legal clauses to speed up your document drafting."],
    },
    "Round Modeling": {
        title: "💸 Round Modeling is a Pro Feature",
        lines: ["Model funding rounds, understand dilution, and plan your equity strategy like a pro."],
    },
    "Latest News": {
        title: "🗞️ Stay Ahead with Curated News",
        lines: ["Get the latest legal and financial news relevant to your business by upgrading to a Pro plan."],
    },
    "Reconciliation": {
        title: "💸 Automated Reconciliation",
        lines: ["Automatically compare financial documents to find discrepancies. Upgrade to unlock this powerful tool."],
    },
    "Workflows": {
        title: "⚡ Workflow Automation",
        lines: ["Streamline your processes by creating automated workflows for compliance and approvals."],
    },
    "default": {
        title: "Upgrade to Unlock",
        lines: ["This is a premium feature. Upgrade your plan to gain access."],
    }
};

export function FeatureLockedModal({ featureName, onOpenChange }: FeatureLockedModalProps) {
  const isOpen = !!featureName;
  const content = (featureName && wittyMessages[featureName]) || wittyMessages.default;
  const { isDevMode } = useAuth();

  if (isDevMode) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-headline text-2xl text-center">{content.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4 text-center">
                <div className="space-y-1 text-foreground text-center">
                    {content.lines.map((line, index) => <p key={index}>{line}</p>)}
                </div>
                {content.eta && <p className="text-muted-foreground/80 font-medium">{content.eta}</p>}
                <Button asChild size="lg" className="w-full interactive-lift" onClick={() => onOpenChange(false)}>
                    <Link href="/dashboard/settings?tab=subscription">
                        <Zap className="mr-2 h-4 w-4"/>
                        Upgrade to Pro
                    </Link>
                </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
