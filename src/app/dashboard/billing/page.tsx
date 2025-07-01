
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Founder",
    price: "$29",
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
    price: "$99",
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
    price: "Custom",
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

export default function BillingPage() {
  const { userProfile } = useAuth();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Plans & Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that's right for your team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col interactive-lift", plan.isCurrent(userProfile?.plan || '') && "border-primary ring-2 ring-primary", plan.isPopular && "shadow-lg")}>
             {plan.isPopular && <Badge className="absolute -top-3 self-center">Most Popular</Badge>}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price.startsWith('$') && <span className="text-muted-foreground">/month</span>}
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
              <Button className="w-full" disabled={plan.isCurrent(userProfile?.plan || '')}>
                 {plan.isCurrent(userProfile?.plan || '') ? "Current Plan" : "Choose Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
