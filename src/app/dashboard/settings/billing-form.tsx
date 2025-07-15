

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Loader2, Sparkles, Star, KeyRound } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { UserPlan } from "@/lib/types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod";
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const founderPlans = [
    {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        benefits: ['5 daily credits', 'Core features'],
        isCurrent: (currentPlan: UserPlan) => currentPlan === 'Starter',
    },
    {
        name: 'Pro',
        price: { monthly: 199, yearly: 1990 },
        benefits: ['299 monthly credits', 'Unlock premium features'],
        isCurrent: (currentPlan: UserPlan) => currentPlan === 'Founder',
        popular: true,
    }
];

const caPlans = [
    {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        benefits: ['5 daily credits', 'Client dashboard'],
        isCurrent: (currentPlan: UserPlan) => currentPlan === 'Starter',
    },
    {
        name: 'Pro',
        price: { monthly: 499, yearly: 4990 },
        benefits: ['499 monthly credits', 'Unlock analyzer, clause lib, PDF tools'],
        isCurrent: (currentPlan: UserPlan) => currentPlan === 'Professional',
        popular: true,
    }
];

const creditPacks = [
  { name: 'Small Pack', price: 99, credits: 50, popular: false },
  { name: 'Medium Pack', price: 199, credits: 150, popular: true },
  { name: 'Big Pack', price: 349, credits: 300, popular: false },
  { name: 'Boss Mode', price: 599, credits: 600, popular: false },
];

const accessPassSchema = z.object({
    pass: z.string().min(4, "Please enter a valid pass.").max(20),
});
type AccessPassFormData = z.infer<typeof accessPassSchema>;

const AccessPassForm = () => {
    const { applyAccessPass } = useAuth();
    const { toast } = useToast();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AccessPassFormData>();
    
    const onSubmit = async (data: AccessPassFormData) => {
        const result = await applyAccessPass(data.pass);
        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            reset();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };
    
    return (
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle>Have an Access Pass?</CardTitle>
                <CardDescription>Enter a pass code here to unlock special offers, trials, or bonus credits.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="access-pass">Access Pass Code</Label>
                            <Input id="access-pass" {...register("pass")} placeholder="e.g. BETAEXTRA"/>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Apply'}
                        </Button>
                    </div>
                    {errors.pass && <p className="text-sm text-destructive mt-2">{errors.pass.message}</p>}
                </CardContent>
            </form>
        </Card>
    )
}

export default function BillingForm() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handlePurchase = (item: { type: 'plan' | 'credit_pack', name: string, amount: number, plan?: UserPlan, cycle?: 'monthly' | 'yearly', credits?: number }) => {
    const params = new URLSearchParams({
        type: item.type,
        name: item.name,
        amount: item.amount.toString(),
    });
    if (item.plan) params.set('plan', item.plan);
    if (item.cycle) params.set('cycle', item.cycle);
    if (item.credits) params.set('credits', item.credits.toString());
    
    router.push(`/dashboard/checkout?${params.toString()}`);
  }

  if (!userProfile) {
    return <Card><CardContent className="p-6 h-64 flex items-center justify-center"><Loader2 className="animate-spin"/></CardContent></Card>
  }
  
  const currentPlan = userProfile.plan;
  const plans = userProfile.role === 'CA' ? caPlans : founderPlans;
  const planTypeMapping = {
    'Free': 'Starter',
    'Pro': userProfile.role === 'CA' ? 'Professional' : 'Founder',
  };


  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
        <AccessPassForm />
        
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle>Plans & Pricing</CardTitle>
                <CardDescription>Choose the plan that's right for you, or top up with one-time credit packs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' && "text-primary")}>Monthly</Label>
                    <Switch
                        id="billing-cycle"
                        checked={billingCycle === 'yearly'}
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                    />
                    <Label htmlFor="billing-cycle" className={cn(billingCycle === 'yearly' && "text-primary")}>
                        Yearly <span className="text-green-600 font-semibold">(Save ~17%)</span>
                    </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => {
                        const isCurrent = plan.isCurrent(currentPlan);
                        const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
                        const finalPlanName = planTypeMapping[plan.name as keyof typeof planTypeMapping] as UserPlan;
                        
                        return (
                            <Card key={plan.name} className={cn("flex flex-col", isCurrent && "border-primary ring-2 ring-primary/50", plan.popular && !isCurrent && "border-violet-500")}>
                                {plan.popular && <div className="text-center py-1 px-3 bg-violet-500 text-white text-xs font-bold rounded-t-lg">Most Popular</div>}
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <p className="text-2xl font-bold">₹{price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {plan.benefits.map(benefit => (
                                            <li key={benefit} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full"
                                        variant={isCurrent ? "secondary" : "default"}
                                        onClick={() => handlePurchase({ type: 'plan', name: plan.name, amount: price, plan: finalPlanName, cycle: billingCycle })}
                                        disabled={isCurrent}
                                    >
                                        {isCurrent ? "Current Plan" : "Upgrade"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
        
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle>Purchase AI Credits</CardTitle>
                <CardDescription>Need more power? Top up your account with a one-time credit pack. Credits never expire.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {creditPacks.map(pack => (
                    <Card key={pack.name} className={cn("text-center", pack.popular && "border-violet-500")}>
                        {pack.popular && <div className="text-center py-1 px-3 bg-violet-500 text-white text-xs font-bold rounded-t-lg">Best Value</div>}
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2"><Sparkles className="text-primary"/>{pack.name}</CardTitle>
                            <p className="text-2xl font-bold">₹{pack.price.toLocaleString()}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{pack.credits} Credits</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" onClick={() => handlePurchase({type: 'credit_pack', name: pack.name, amount: pack.price, credits: pack.credits})}>Purchase Now</Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
    </div>
  )
}
