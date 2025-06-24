"use client"
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';
import type { UserPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const plan = searchParams.get('plan');
    
    const planMap: { [key: string]: UserPlan } = {
      'pro': 'Pro',
      'ca-pro': 'CA Pro',
      'enterprise': 'Enterprise',
      'enterprise-pro': 'Enterprise Pro',
    };
    
    const newPlan = plan ? planMap[plan] : null;

    if (newPlan) {
      updateUserProfile({ plan: newPlan }).then(() => {
        router.replace('/dashboard/checkout-success');
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Plan",
        description: "The selected plan is not valid. Redirecting back to billing.",
      });
      router.replace('/dashboard/billing');
    }
  }, [router, searchParams, updateUserProfile, toast]);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-4">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="text-lg font-medium">Processing your upgrade...</p>
      <p className="text-muted-foreground">Please do not refresh the page.</p>
    </div>
  );
}
