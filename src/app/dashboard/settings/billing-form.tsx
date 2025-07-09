
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Loader2, Sparkles, Star } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { UserPlan } from "@/lib/types"

const plans: { name: UserPlan, price: { monthly: number, yearly: number }, features: string[], popular?: boolean }[] = [
    {
        name: 'Founder',
        price: { monthly: 1999, yearly: 19990 },
        features: [
            '1 Company',
            '50 daily AI credits',
            'All Core AI Tools',
            'Founder-CA Connect',
            'Email Support',
        ],
    },
    {
        name: 'Professional',
        price: { monthly: 4999, yearly: 49990 },
        features: [
            '5 Companies/Clients',
            '150 daily AI credits',
            'Advanced AI Tools (Workflows)',
            'Client Management Suite',
            'Priority Support',
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: { monthly: 0, yearly: 0 }, // Custom pricing
        features: [
            'Unlimited Companies',
            'Unlimited AI credits',
            'Single Sign-On (SSO)',
            'Team & Role Management',
            'Dedicated Account Manager',
        ],
    },
];

const creditPacks = [
  { name: '50 Credits', price: 499, credits: 50, popular: false },
  { name: '150 Credits', price: 1299, credits: 150, popular: true },
  { name: '500 Credits', price: 3999, credits: 500, popular: false },
];


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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
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
                        Yearly <span className="text-green-600 font-semibold">(Save 15%)</span>
                    </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        const isCurrent = plan.name === currentPlan;
                        const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
                        
                        return (
                            <Card key={plan.name} className={cn("flex flex-col", isCurrent && "border-primary ring-2 ring-primary/50", plan.popular && !isCurrent && "border-violet-500")}>
                                {plan.popular && <div className="text-center py-1 px-3 bg-violet-500 text-white text-xs font-bold rounded-t-lg">Most Popular</div>}
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    {plan.name === 'Enterprise' ? (
                                        <p className="text-2xl font-bold">Custom</p>
                                    ) : (
                                        <p className="text-2xl font-bold">₹{price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {plan.name === 'Enterprise' ? (
                                        <Button className="w-full" variant="outline">Contact Sales</Button>
                                    ) : (
                                        <Button 
                                            className="w-full"
                                            variant={isCurrent ? "secondary" : "default"}
                                            onClick={() => handlePurchase({ type: 'plan', name: plan.name, amount: price, plan: plan.name, cycle: billingCycle })}
                                            disabled={isCurrent}
                                        >
                                            {isCurrent ? "Current Plan" : "Upgrade"}
                                        </Button>
                                    )}
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
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creditPacks.map(pack => (
                    <Card key={pack.name} className={cn("text-center", pack.popular && "border-violet-500")}>
                        {pack.popular && <div className="text-center py-1 px-3 bg-violet-500 text-white text-xs font-bold rounded-t-lg">Best Value</div>}
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2"><Sparkles className="text-primary"/>{pack.name}</CardTitle>
                            <p className="text-2xl font-bold">₹{pack.price.toLocaleString()}</p>
                        </CardHeader>
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
