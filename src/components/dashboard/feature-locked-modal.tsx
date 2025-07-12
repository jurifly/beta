

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureLockedModalProps {
  featureName: string | null;
  onOpenChange: (isOpen: boolean) => void;
}

const wittyMessages: Record<string, { title: string; lines: string[]; eta: string }> = {
    "Analyzer": {
        title: "AI Document Analyzer",
        lines: ["Unlock the ability to analyze contracts in seconds.", "Identify risks, get summaries, and find critical clauses instantly."],
        eta: "This is a premium feature available on Pro plans."
    },
    "Watcher": {
        title: "Regulation Watcher",
        lines: ["Stay ahead of regulatory changes with AI-powered summaries.", "Monitor government portals for updates relevant to you."],
        eta: "This is a premium feature available on Pro plans."
    },
    "Reconciliation": {
        title: "AI Reconciliation Tool",
        lines: ["Automate the comparison of financial documents.", "Let AI find discrepancies between your GST, ROC, and ITR filings."],
        eta: "This is a premium feature available on our Pro plans."
    },
    "Invitations": {
        title: "Invite System Under Construction",
        lines: [
            "We were going to build an invite system.",
            "Then we accidentally invited burnout instead.",
        ],
        eta: "Coming soon… once coffee works again. ☕"
    },
    "Workflows": {
        title: "Workflow Engine is... Napping",
        lines: [
            "The workflow is currently... not working.",
            "We tried building it on a weekend. Big mistake.",
        ],
        eta: "ETA: After 7 cups of chai and one long nap. 💤"
    },
    "Community": {
        title: "Community Feature Missing",
        lines: [
            "Our intern said: ‘I'll build the community feature.’",
            "That was 49 days ago. No updates since.",
        ],
        eta: "We’re filing a missing feature report. 🕵️‍♂️"
    },
    "CA Connect": {
        title: "Connection Timed Out",
        lines: [
            "You wanted to connect with your CA?",
            "We wanted to connect with our sleep cycle.",
        ],
        eta: "Neither is happening. Stay tuned. 😴"
    },
    "Compliance Hub": {
        title: "Connection Timed Out",
        lines: [
            "You wanted to connect with your CA?",
            "We wanted to connect with our sleep cycle.",
        ],
        eta: "Neither is happening. Stay tuned. 😴"
    },
    "Report Center": {
        title: "Upgrade to Pro to Generate Reports",
        lines: [
            "Unlock professional, investor-ready reports.",
            "Impress your stakeholders with a single click."
        ],
        eta: "This is a premium feature available on our Pro plans."
    },
    "Clause Library": {
        title: "Upgrade to Pro for Clause Library",
        lines: [
            "Build a library of your firm's standard legal clauses.",
            "Ensure consistency and speed up document drafting."
        ],
        eta: "This is a premium feature available on our Pro plans."
    },
    "default": {
        title: "Feature Coming Soon!",
        lines: [
            "This feature is still under development.",
            "Our team is working hard to bring it to you.",
        ],
        eta: "Check back soon for updates."
    }
}

export function FeatureLockedModal({ featureName, onOpenChange }: FeatureLockedModalProps) {
  const isOpen = !!featureName;
  const content = (featureName && wittyMessages[featureName]) || wittyMessages.default;
  
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
                <p className="text-muted-foreground/80 font-medium">{content.eta}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
