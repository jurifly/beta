
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
        title: "🧑‍💼 Team Management is... Spiritually Out of Office",
        lines: ["The team tool was supposed to bring order.", "Instead, it brought a group chat full of emojis and confusion."],
        eta: "ETA: After one townhall and a shared mental breakdown. 🫠"
    },
    "Connections": {
        title: "🔌 Connection is… on Airplane Mode",
        lines: ["We built it to connect people.", "Turns out no one wants to talk unless there’s equity involved."],
        eta: "ETA: After coffee, convincing, and emotional bribery. ☕💸"
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
        title: "📊 Report Centre is... in Witness Protection",
        lines: ["It was last seen near a dashboard wireframe.", "No one’s heard from it since the analytics guy rage-quit."],
        eta: "When the numbers agree to be seen. 📉"
    },
    "Clause Library": {
        title: "Clause Library is Checked Out",
        lines: ["A library of pre-approved legal clauses, just for you.", "Right now, the only clause is 'Santa Clause' and he's on vacation."],
        eta: "This is a premium feature available on our Pro plans."
    },
    "Latest News": {
        title: "🗞️ Latest News is... Yesterday's News",
        lines: ["The news feature is still being written.", "Our AI reporter is currently stuck in a debate about whether pineapple belongs on pizza."],
        eta: "ETA: As soon as we resolve this critical issue."
    },
    "Reconciliation": {
        title: "💸 Reconciliation is... Having a Meltdown",
        lines: ["It tried to match transactions and matched trauma instead.", "Now it just stares at the ledger whispering “why?”"],
        eta: "Pending therapy and a bug fix. 🧾🧘‍♂️"
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
