

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";

interface FeatureLockedModalProps {
  featureName: string | null;
  onOpenChange: (isOpen: boolean) => void;
  type?: 'pro' | 'beta';
}

const wittyMessages: Record<string, { title: string; lines: string[]; }> = {
    "Team Management": {
        title: "Patience, Young Padawan",
        lines: ["Managing a team is a big deal.", "This feature is part of our Pro plan."],
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
        lines: ["Our extensive library of pre-built legal clauses is being polished.", "It will be available to Pro users soon."],
    },
    "Analytics": {
        title: "The Future is Data-Driven",
        lines: ["Unlock deep insights into your compliance and financial health.", "This powerful feature is available on our Pro plan."],
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

const proUpgradeContent = {
    title: "Upgrade to Pro",
    lines: ["This powerful feature is exclusively available on our Pro plan.", "Upgrade now to unlock this and much more."]
}

export function FeatureLockedModal({ featureName, onOpenChange, type = 'beta' }: FeatureLockedModalProps) {
  const isOpen = !!featureName;
  const { isDevMode } = useAuth();

  let content;
  if (type === 'pro') {
      content = proUpgradeContent;
  } else {
      content = (featureName && wittyMessages[featureName]) || wittyMessages.default;
  }
  
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
                 {type === 'pro' ? (
                    <Button asChild size="lg" className="w-full interactive-lift" onClick={() => onOpenChange(false)}>
                        <Link href="/dashboard/settings?tab=subscription">
                            <Zap className="mr-2 h-4 w-4"/> Upgrade Now
                        </Link>
                    </Button>
                 ) : (
                    <Button size="lg" className="w-full interactive-lift" onClick={() => onOpenChange(false)}>
                        Got It!
                    </Button>
                 )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
