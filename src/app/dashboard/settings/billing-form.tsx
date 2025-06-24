'use client';

import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UpgradePrompt } from '@/components/upgrade-prompt';

export default function BillingForm() {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const isFreePlan = userProfile.plan === 'Free';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className='flex items-center gap-4'>
               <Badge variant="secondary" className="text-lg py-2 px-4 border-primary/20 bg-primary/10 text-primary">{userProfile.plan}</Badge>
               <div>
                  <p className="font-semibold">You are currently on the {userProfile.plan} plan.</p>
                  <p className="text-sm text-muted-foreground">Billed monthly. Next renewal on July 24, 2024.</p>
               </div>
            </div>
            {!isFreePlan && <Button variant="outline">Manage Subscription</Button>}
          </div>
        </CardContent>
        {isFreePlan && (
           <CardFooter>
             <UpgradePrompt />
           </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-muted-foreground">
                No payment method on file.
            </div>
        </CardContent>
        <CardFooter>
            <Button variant="secondary">Add Payment Method</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
