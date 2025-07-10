
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

const wittyMessages: Record<string, { title: string, lines: string[] }> = {
    "Invitations": {
        title: "Invite System Under Construction",
        lines: [
            "We were going to build an invite system.",
            "Then we accidentally invited burnout instead.",
            "Coming soon… once coffee works again. ☕"
        ]
    },
    "Workflows": {
        title: "Workflow Engine is... Napping",
        lines: [
            "The workflow is currently... not working.",
            "We tried building it on a weekend. Big mistake.",
            "ETA: After 7 cups of chai and one long nap. 💤"
        ]
    },
    "Community": {
        title: "Community Feature Missing",
        lines: [
            "Our intern said: 'I'll build the community feature.'",
            "That was 49 days ago. No updates since.",
            "We’re filing a missing feature report. 🕵️‍♂️"
        ]
    },
    "CA Connect": {
        title: "Connection Timed Out",
        lines: [
            "You wanted to connect with your CA?",
            "We wanted to connect with our sleep cycle.",
            "Neither is happening. Stay tuned. 😴"
        ]
    },
    "Compliance Hub": {
        title: "Connection Timed Out",
        lines: [
            "You wanted to connect with your CA?",
            "We wanted to connect with our sleep cycle.",
            "Neither is happening. Stay tuned. 😴"
        ]
    },
    "default": {
        title: "Feature Coming Soon!",
        lines: [
            "This feature is still under development.",
            "Our team is working hard to bring it to you.",
            "Check back soon for updates."
        ]
    }
}

export function FeatureLockedModal({ featureName, onOpenChange }: FeatureLockedModalProps) {
  const isOpen = !!featureName;
  const content = (featureName && wittyMessages[featureName]) || wittyMessages.default;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-headline text-2xl">{content.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1 text-muted-foreground mt-2">
                {content.lines.map((line, index) => <p key={index}>{line}</p>)}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
