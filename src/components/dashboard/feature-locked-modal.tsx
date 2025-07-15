

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
        title: "Patience, Young Padawan",
        lines: ["Managing a team is a big deal.", "This feature is still in the Jedi Council chambers. Coming soon!"],
    },
    "Connections": {
        title: "It's Not You, It's Us",
        lines: ["This feature is currently playing hard to get.", "We're launching it for everyone after the beta. Promise."],
    },
    "Community": {
        title: "The Cool Kids' Table",
        lines: ["Our community forum is getting its final touches.", "It'll be the place to be, launching for everyone post-beta."],
    },
    "Report Center": {
        title: "The Reports of My Existence...",
        lines: ["...have been greatly exaggerated. For now.", "Automated PDF reports are coming for all users after the beta period."],
    },
    "Clause Library": {
        title: "Shhh, the Clauses are Sleeping",
        lines: ["Our extensive library of pre-built legal clauses is being polished.", "It will be available to all after the official launch."],
    },
    "Round Modeling": {
        title: "Future-Gazing in Progress",
        lines: ["Our dilution calculator is powerful, but it's still brewing.", "This Pro feature will be available soon."],
    },
    "Latest News": {
        title: "Hold the Front Page!",
        lines: ["Our AI news-bots are being trained to find the juiciest updates.", "This feature will roll out to everyone post-beta."],
    },
    "Reconciliation": {
        title: "The Robots are Reconciling",
        lines: ["Automated document reconciliation is a powerful tool we're perfecting.", "It'll be available for everyone after the beta launch."],
    },
    "Workflows": {
        title: "Don't Just Work, Workflow!",
        lines: ["Automation is the final frontier.", "This powerful feature is coming for all users after the beta."],
    },
    "default": {
        title: "Still in the Oven!",
        lines: ["This feature is baking and isn't quite ready yet.", "It will be available for everyone after the beta launch."],
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
                    <div className="flex items-center gap-2">
                        <Zap className="mr-2 h-4 w-4"/>
                        Got It!
                    </div>
                </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
