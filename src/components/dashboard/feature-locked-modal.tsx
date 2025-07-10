
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
    "Community": {
        title: "This Feature is Locked",
        lines: [
            "Our intern said: 'I’ll handle it.'",
            "That was 42 days ago.",
            "No sightings since."
        ]
    },
    "CA Connect": {
        title: "Connection Timed Out",
        lines: [
            "You wanted to connect with your CA.",
            "We wanted to connect with our sleep cycle.",
            "Neither is happening right now."
        ]
    },
    "Invitations": {
        title: "Access Denied",
        lines: [
            "You can't see invites yet.",
            "But we're sure you're very popular.",
            "Probably."
        ]
    },
    "Compliance Hub": {
        title: "Compliance Machine is... Complaining",
        lines: [
            "It seems our compliance engine needs its own compliance check.",
            "The irony is not lost on us.",
            "Check back soon."
        ]
    },
    "default": {
        title: "Feature Locked",
        lines: [
            "This feature is part of our Pro plan.",
            "It's so good, we had to put a lock on it.",
            "Upgrade to unlock the magic."
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
        <div className="pt-4">
          <Button asChild className="w-full">
            <Link href="/dashboard/settings?tab=subscription">View Plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
