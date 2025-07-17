
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap, ArrowRight, GanttChartSquare, LineChart, Library, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";
import type { ReactNode } from "react";

interface FeatureLockedModalProps {
  featureName: string | null;
  onOpenChange: (isOpen: boolean) => void;
  type?: 'pro' | 'beta';
}

const wittyMessages: Record<string, { title: string; lines: string[]; }> = {
    "Connections": { title: "It's Not You, It's Us", lines: ["This feature is currently playing hard to get.", "We're launching it for everyone after the beta. Promise."], },
    "Community": { title: "The Cool Kids' Table", lines: ["Our community forum is getting its final touches.", "It'll be the place to be, launching for everyone post-beta."], },
    "Report Center": { title: "The Reports of My Existence...", lines: ["...have been greatly exaggerated. For now.", "Automated PDF reports are coming for all users after the beta period."], },
    "Workflows": { title: "Don't Just Work, Workflow!", lines: ["Automation is the final frontier.", "This powerful feature is coming for all users after the beta."], },
    "default": { title: "Still in the Oven!", lines: ["This feature is baking and isn't quite ready yet.", "It will be available for everyone after the beta launch."], }
};

const proFeatureMessages: Record<string, { title: string; lines: string[], icon: React.ElementType }> = {
    "Team Management": {
        title: "Team Management is... Self-Managed (Badly)",
        lines: [
            "We introduced task assignment.",
            "The team introduced chaos.",
            "Now we manage projects through memes and anxiety."
        ],
        icon: Users
    },
    "Analytics": {
        title: "Analytics is... Manifesting Data",
        lines: [
            "It’s supposed to show insights.",
            "Right now, it shows a loading spinner and inner peace.",
            "ETA: When the universe is ready. 🔮"
        ],
        icon: LineChart,
    },
    "Clause Library": {
        title: "Clause Library is... a Choose Your Own Adventure",
        lines: [
            "Legal templates? Yes.",
            "Understanding them? Not really.",
            "We added emojis to make it friendly. Still terrifying"
        ],
        icon: Library,
    },
    "default": {
        title: "Upgrade to Pro",
        lines: ["This powerful feature is exclusively available on our Pro plan.", "Upgrade now to unlock this and much more."],
        icon: Zap,
    }
};

export function FeatureLockedModal({ featureName, onOpenChange, type = 'beta' }: FeatureLockedModalProps) {
  const isOpen = !!featureName;
  const { isDevMode } = useAuth();

  let content;
  let Icon;
  if (type === 'pro') {
      content = (featureName && proFeatureMessages[featureName]) || proFeatureMessages.default;
      Icon = content.icon;
  } else {
      content = (featureName && wittyMessages[featureName]) || wittyMessages.default;
      Icon = Lock;
  }
  
  if (isDevMode) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-headline text-2xl text-center whitespace-pre-wrap">{content.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4 text-center">
                <div className="space-y-1 text-foreground text-center">
                    {content.lines.map((line, index) => <p key={index}>{line}</p>)}
                </div>
                 {type === 'pro' ? (
                    <Button asChild size="lg" className="w-full interactive-lift" onClick={() => onOpenChange(false)}>
                        <Link href="/dashboard/settings?tab=subscription">
                            <Zap className="mr-2 h-4 w-4"/> Upgrade to Pro
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
