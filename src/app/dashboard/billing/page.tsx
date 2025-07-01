
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Sparkles, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const plans = [
  {
    name: "Founder",
    price: 29,
    features: [
      "1 User Seat",
      "Core AI Toolkit",
      "Document Generation",
      "Compliance Calendar",
      "100 AI Actions/month",
    ],
    isCurrent: (plan: string) => plan === 'Founder',
  },
  {
    name: "Pro",
    price: 99,
    features: [
      "5 User Seats",
      "Advanced AI Toolkit",
      "Contract Analysis",
      "Clause Library",
      "500 AI Actions/month",
    ],
    isCurrent: (plan: string) => plan === 'Pro' || plan === 'CA Pro',
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: -1, // Custom
    features: [
      "Unlimited User Seats",
      "Full AI Suite",
      "Workflow Automation",
      "SSO & Custom Security",
      "Unlimited AI Actions",
    ],
    isCurrent: (plan: string) => plan === 'Enterprise' || plan === 'Enterprise Pro',
  },
]

const creditPacks = [
  { name: '500 Credits', price: 49, credits: 500 },
  { name: '1500 Credits', price: 99, credits: 1500 },
  { name: '5000 Credits', price: 249, credits: 5000 },
]

export default function BillingPage() {
  const { userProfile } = useAuth();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Plans & Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that's right for your team, or top up with AI credits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col interactive-lift", plan.isCurrent(userProfile?.plan || '') && "border-primary ring-2 ring-primary", plan.isPopular && "shadow-lg")}>
             {plan.isPopular && <Badge className="absolute -top-3 self-center">Most Popular</Badge>}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.price > 0 ? (
                    <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                    </>
                ) : (
                    <span className="text-3xl font-bold">Custom</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
               {plan.price > 0 ? (
                <Button asChild className="w-full" disabled={plan.isCurrent(userProfile?.plan || '')}>
                    <Link href={`/dashboard/checkout?plan=${plan.name}&cycle=monthly&amount=${plan.price}`}>
                        {plan.isCurrent(userProfile?.plan || '') ? "Current Plan" : "Choose Plan"}
                    </Link>
                </Button>
               ) : (
                <Button asChild variant="outline" className="w-full">
                    <a href="mailto:sales@clausey.com">Contact Sales</a>
                </Button>
               )}
            </CardFooter>
          </Card>
        ))}
      </div>

       <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline text-center mt-12 mb-4">Need More AI Power?</h2>
        <p className="text-muted-foreground text-center mb-8">
          Top up your account with one-time credit packs. Credits never expire.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {creditPacks.map((pack) => (
                <Card key={pack.name} className="interactive-lift">
                    <CardHeader className="text-center">
                        <div className="p-3 bg-primary/10 rounded-full w-max mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-primary"/>
                        </div>
                        <CardTitle>{pack.name}</CardTitle>
                        <CardDescription className="text-2xl font-bold text-foreground">${pack.price}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Button asChild className="w-full">
                           <Link href={`/dashboard/checkout?credits=${pack.credits}&amount=${pack.price}&name=${encodeURIComponent(pack.name)}`}>
                                Purchase Credits <ArrowRight className="ml-2 h-4 w-4"/>
                           </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
