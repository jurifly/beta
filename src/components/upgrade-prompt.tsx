import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight, Zap } from 'lucide-react';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function UpgradePrompt({
  title = "Upgrade to Pro",
  description = "Unlock powerful features like unlimited companies, contract analysis, and more.",
  icon = <Zap className="h-12 w-12 text-primary" />
}: UpgradePromptProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-card rounded-lg border-dashed border-2 p-8 text-center">
      <div className="p-4 bg-muted rounded-full mb-6">
          {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button asChild size="lg">
        <Link href="/dashboard/billing">
          Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
