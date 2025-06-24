import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight, Zap } from 'lucide-react';

export function UpgradePrompt() {
  return (
    <Card className="w-full bg-accent/10 border-accent/20">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 bg-accent/20 rounded-full">
            <Zap className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
          <CardTitle>Upgrade to Pro</CardTitle>
          <CardDescription>
            Unlock powerful features like unlimited companies, contract analysis, and more.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/billing">
            Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
