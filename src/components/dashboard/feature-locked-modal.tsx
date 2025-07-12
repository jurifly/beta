

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
    "Team Management": {
        title: "Team? What Team?",
        lines: ["This feature is for managing your team.", "Right now, it's just you. And our AI. And the AI is on a coffee break."],
        eta: "Unlocks on our Pro & Enterprise plans."
    },
     "Advisor Hub": {
        title: "Advisor Connection Offline",
        lines: ["You wanted to connect with your advisor?", "We wanted to connect with our sleep cycle. Neither is happening."],
        eta: "Unlocks on our Pro plans. For now, there's always email."
    },
    "Compliance Hub": {
        title: "Compliance Hub Offline",
        lines: ["You wanted to connect with your clients here?", "We wanted to connect with our sleep cycle. Neither is happening."],
        eta: "Unlocks on our Pro plans. For now, there's always email."
    },
    "Community": {
        title: "Community Feature Missing",
        lines: [
            "Our intern said: ‘I'll build the community feature.’",
            "That was 49 days ago. No updates since.",
        ],
        eta: "We’re filing a missing person report. 🕵️‍♂️"
    },
    "Report Center": {
        title: "Report Center Under Construction",
        lines: ["Our AI is currently learning how to use a PDF generator.", "It's surprisingly difficult. For the AI, we mean. Not for you."],
        eta: "This feature is coming soon in a future beta update."
    },
    "Clause Library": {
        title: "Clause Library is Checked Out",
        lines: ["A library of pre-approved legal clauses, just for you.", "Right now, the only clause is 'Santa Clause' and he's on vacation."],
        eta: "This is a premium feature available on our Pro plans."
    },
    "Reconciliation": {
        title: "AI Reconciliation is Reconciling Its Feelings",
        lines: ["Automate the painful process of matching financial documents.", "Our AI is currently trying to reconcile its code with its purpose."],
        eta: "Unlocks on our Pro plans."
    },
    "Workflows": {
        title: "Workflow Engine is... Napping",
        lines: [
            "The workflow is currently... not working.",
            "We tried building it on a weekend. Big mistake.",
        ],
        eta: "ETA: After 7 cups of chai and one long nap. 💤"
    },
    "default": {
        title: "Feature Not Found",
        lines: [
            "Error 404: This feature has gone on an unscheduled vacation.",
            "We've sent a postcard asking it to return.",
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
