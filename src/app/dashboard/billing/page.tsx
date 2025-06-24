"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Sparkles, Bolt, Package, Star, Briefcase, Building, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { UserProfile, UserPlan } from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

const plans: { name: UserPlan, price: { monthly: number, yearly: number }, description: string, features: string[], cta: string, role: UserProfile['role'][], popular: boolean, icon?: React.ElementType }[] = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "For individuals and startups getting started.",
    features: ["1 Company Limit", "30 AI Credits/month (renews monthly)", "Basic Calendar & Notifications", "Limited Document Generation"],
    cta: "Current Plan",
    role: ["Founder", "Legal Advisor", "CA", "Enterprise"],
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: 129, yearly: 1299 },
    description: "For founders who need powerful compliance tools.",
    features: ["Unlimited Companies", "500 AI Credits/month", "Full Access to Document Generation", "Compliance Calendar + Insights", "Document Analyzer (Upload & Scan)", "Company Risk Score Indicator"],
    cta: "Upgrade to Pro",
    role: ["Founder", "Legal Advisor", "Enterprise"],
    popular: true,
  },
  {
    name: "CA Pro",
    price: { monthly: 349, yearly: 3499 },
    description: "For CAs managing multiple clients.",
    features: ["All Pro Plan Features", "1000 AI Credits/month", "CA Dashboard & Client Analytics", "Multi-user Team Access", "Downloadable Compliance Reports"],
    cta: "Upgrade to CA Pro",
    role: ["CA", "Enterprise"],
    popular: true,
  },
   {
    name: "Enterprise",
    price: { monthly: 4999, yearly: 49990 },
    description: "Advanced compliance and team management.",
    features: ["All Pro & CA Pro Features", "5 Included User Seats", "Advanced Risk Engine", "Workflow Studio (Beta)", "Dedicated Support"],
    cta: "Upgrade to Enterprise",
    role: ["Enterprise", "Founder", "CA", "Legal Advisor"],
    popular: false,
  },
   {
    name: "Enterprise Pro",
    price: { monthly: 9999, yearly: 99990 },
    description: "Ultimate toolkit for SOC2, ISO, and GDPR compliance.",
    features: ["All Enterprise Features", "10+ Included User Seats", "SOC2 / ISO / GDPR Toolkits", "Full Automation Studio Access", "Custom Onboarding"],
    cta: "Contact Sales",
    role: ["Enterprise"],
    popular: false,
    icon: Building,
  },
]

const creditPacks = [
    { name: "Lite Pack", price: 79, credits: 100, icon: <Package/> },
    { name: "Smart Pack", price: 149, credits: 300, icon: <Star/> },
    { name: "Power Pack", price: 299, credits: 800, icon: <Briefcase/> },
]

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { userProfile, updateUserProfile, addCredits } = useAuth()
  const { toast } = useToast()

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }
  
  const userPlan = userProfile.plan || "Free";
  const creditLimitMap = {
    'Free': 30,
    'Pro': 500,
    'CA Pro': 1000,
    'Enterprise': 5000,
    'Enterprise Pro': 10000,
  }
  const creditLimit = creditLimitMap[userProfile.plan];
  const creditUsagePercentage = userProfile.credits ? (userProfile.credits / creditLimit) * 100 : 0;

  const handleDowngrade = async () => {
    if (userProfile) {
        await updateUserProfile({ plan: "Free", credits: userProfile.credits ? Math.min(userProfile.credits, 30) : 30 });
        toast({
            title: "Plan Downgraded",
            description: "You are now on the Free plan. Premium features have been disabled.",
        });
    }
  };

  const handleBuyCredits = (credits: number) => {
    if (addCredits) {
      addCredits(credits);
    }
  }

  const availablePlans = plans.filter(p => p.role.includes(userProfile.role || 'Founder'));

  return (
    <div className="space-y-12 pb-16 md:pb-0">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Plans & Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that's right for your compliance needs.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch
          id="billing-cycle"
          checked={billingCycle === "yearly"}
          onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
        />
        <Label htmlFor="billing-cycle" className="flex items-center">
            Yearly <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Save 15%</Badge>
        </Label>
      </div>

      <div className={cn("max-w-7xl mx-auto grid grid-cols-1 gap-8 items-stretch", 
        availablePlans.length > 3 ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3"
      )}>
        {availablePlans.map((plan) => {
           const isCurrentPlan = plan.name === userPlan;
           const isPopular = plan.popular;
           const price = plan.price[billingCycle];
           return (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col relative interactive-lift",
                isCurrentPlan && "border-2 border-primary ring-4 ring-primary/10",
                isPopular && !isCurrentPlan && "border-2 border-accent",
                plan.name === 'Enterprise Pro' && "bg-muted/30"
              )}
            >
              {isPopular && (
                <Badge className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">Most Popular</Badge>
              )}
              <CardHeader className="text-center pt-10">
                 {plan.icon && <plan.icon className="w-8 h-8 mx-auto text-primary" />}
                <CardTitle className="text-xl font-headline mt-2">{plan.name}</CardTitle>
                <CardDescription className="mt-2 h-10 text-sm">{plan.description}</CardDescription>
                {plan.cta !== 'Contact Sales' ? (
                    <p className="mt-4">
                        <span className="text-4xl font-bold">{formatPrice(price)}</span>
                        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </p>
                ) : (
                    <p className="text-4xl font-bold mt-4">Custom</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <Separator />
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 {plan.name === 'Free' ? (
                    isCurrentPlan ? (
                      <Button className="w-full" disabled variant="outline">
                        Your Current Plan
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" onClick={handleDowngrade}>
                        Downgrade to Free
                      </Button>
                    )
                  ) : (
                    <Button
                      asChild={plan.cta !== "Contact Sales" && !isCurrentPlan}
                      className={cn("w-full", isPopular && !isCurrentPlan && "bg-accent hover:bg-accent/90")}
                      disabled={isCurrentPlan}
                      variant={isCurrentPlan ? "outline" : "default"}
                    >
                      {isCurrentPlan ? (
                        <span>Your Current Plan</span>
                      ) : plan.cta === "Contact Sales" ? (
                        <a href="mailto:sales@lexiq.ai">{plan.cta}</a>
                      ) : (
                        <Link href={`/dashboard/checkout?plan=${plan.name.toLowerCase().replace(' pro', '-pro').replace(' ', '-')}&cycle=${billingCycle}`}>
                           {isPopular && <Sparkles className="mr-2 h-4 w-4"/>} {plan.cta}
                        </Link>
                      )}
                    </Button>
                  )}
              </CardFooter>
            </Card>
           )
        })}
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-center mb-2">Need more power?</h2>
            <p className="text-muted-foreground text-center mb-6">Top up your account with one-time AI credit packs.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creditPacks.map(pack => (
                    <Card key={pack.name} className="flex flex-col text-center interactive-lift">
                        <CardHeader>
                            <div className="mx-auto bg-muted p-3 rounded-full mb-2 text-primary">{pack.icon}</div>
                            <CardTitle>{pack.name}</CardTitle>
                            <p className="text-3xl font-bold text-primary">{pack.credits} <span className="text-lg font-medium text-muted-foreground">credits</span></p>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-xl font-semibold">{formatPrice(pack.price)}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full interactive-lift" onClick={() => handleBuyCredits(pack.credits)}>
                                <Bolt className="mr-2 h-4 w-4" /> Buy Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Your Current Usage</h2>
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">AI Credits</h3>
                        <p className="text-sm text-muted-foreground">Your remaining credits for the current billing cycle.</p>
                        <div className="space-y-2">
                            <Progress value={creditUsagePercentage} />
                            <p className="text-right font-mono text-lg font-bold">{userProfile.credits || 0} / {creditLimit}</p>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold">Billing History</h3>
                        <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            <p>No invoices yet.</p>
                            <Button variant="link" size="sm" className="mt-2">Download Invoices</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
