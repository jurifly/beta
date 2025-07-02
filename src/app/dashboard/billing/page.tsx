
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const allPlans = [
  {
    name: "Founder",
    price: 299,
    description: "For individual startups and founders.",
    features: [
      "Unlimited Document Generation",
      "Conversational AI: 500 prompts/month",
      "Checklist Generator: unlimited",
      "Cap Table Modeling",
      "Analyzer: 20 docs/month",
      "Conversation History & Reports",
      "Basic Integrations (Zapier, Gmail)",
    ],
    roles: ['Founder'],
    isCurrent: () => false,
  },
  {
    name: "Professional",
    price: 899,
    description: "Ideal for CAs, Lawyers, and small firms managing clients.",
    features: [
      "Everything in Founder, plus:",
      "Client Management & Workspace",
      "Team Access (up to 3)",
      "Unlimited Contract Analyzer",
      "AI Financial Reconciliation",
      "Custom Branding",
      "Watcher AI (3 portals)",
    ],
    roles: ['CA', 'Legal Advisor', 'Enterprise'],
    isCurrent: () => false,
    isPopular: true,
  },
]

const creditPacks = [
  { name: '25 Credits', price: 50, credits: 25, description: "Perfect for a few quick tasks." },
  { name: '50 Credits', price: 100, credits: 50, description: "A solid pack for regular use." },
  { name: '100 Credits', price: 200, credits: 100, description: "Best value for heavy users." },
];

export default function BillingPage() {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const visiblePlans = allPlans.filter(plan => plan.roles.includes(userProfile.role));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Plans & Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that's right for your team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        <Card className="flex flex-col interactive-lift border-primary ring-2 ring-primary">
            <CardHeader>
              <CardTitle>Beta Plan</CardTitle>
              <CardDescription>Your current free-tier plan during our beta period.</CardDescription>
              <div className="pt-2">
                  <span className="text-3xl font-bold">Free</span>
                  <span className="text-muted-foreground"> / during beta</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
               <p className="text-sm font-medium">Your current plan includes:</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Bonus & Daily AI Credits</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Conversational AI</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Document Generation & Analysis</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Regulation Watcher</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>And all other features...</span></li>
              </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled>
                    Your Current Plan
                </Button>
            </CardFooter>
        </Card>
        {visiblePlans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col interactive-lift", plan.isCurrent() && "border-primary ring-2 ring-primary", plan.isPopular && "shadow-lg")}>
             {plan.isPopular && <Badge className="absolute -top-3 self-center">Most Popular</Badge>}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
               <div className="pt-2">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
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
               <Button asChild className="w-full">
                    <Link href={`/dashboard/checkout?type=plan&plan=${plan.name}&name=${plan.name}%20Plan&amount=${plan.price}&cycle=monthly`}>
                        Choose {plan.name}
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Buy More Credits</h2>
        <p className="mt-2 text-muted-foreground">
            Top up your account with one-time credit packs. Credits never expire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {creditPacks.map((pack) => (
          <Card key={pack.name} className="flex flex-col interactive-lift">
            <CardHeader>
              <CardTitle>{pack.name}</CardTitle>
              <CardDescription>{pack.description}</CardDescription>
               <div className="pt-2">
                <span className="text-3xl font-bold">₹{pack.price}</span>
                <span className="text-muted-foreground">/ one-time</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{pack.credits} bonus AI credits</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Use for any AI feature</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>Credits never expire</span></li>
              </ul>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full">
                    <Link href={`/dashboard/checkout?type=credit_pack&name=${pack.name.replace(' ', '%20')}&amount=${pack.price}&credits=${pack.credits}`}>
                        Buy Now
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
