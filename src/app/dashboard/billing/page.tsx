
"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Sparkles, Bolt, Package, Star, Briefcase, Building, User, Users, BrainCircuit, Gift, Copy } from "lucide-react"

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
import { Loader2 } from "lucide-react"
import { add } from "date-fns"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Starter",
    price: { monthly: 0, yearly: 0 },
    description: "For curious users, early founders, and student professionals.",
    features: ["Conversational AI (3 prompts/day)", "Document Generator (1 NDA/month)", "Basic Activity Tracker", "Checklist Generator (1/month)", "Company Profile Setup", "AI Assistant (Summary Only)", "Contract Analyzer (1 doc/month)"],
    cta: "Current Plan",
    role: ["Founder", "Legal Advisor", "CA", "Enterprise"],
    popular: false,
    icon: User,
  },
  {
    name: "Founder",
    price: { monthly: 199, yearly: 999 },
    description: "For early-stage startups, solo entrepreneurs, and freelancers.",
    features: ["Everything in Starter, plus:", "50 AI Credits/month", "Unlimited Document Generation", "Full Editor Access & Downloads", "Unlimited Checklists", "Analyzer (10 docs/month)", "Setup Assistant (INC/NIC finder)", "Conversation History", "Clause Library (Read-only)"],
    cta: "Upgrade to Founder",
    role: ["Founder", "Legal Advisor", "Enterprise"],
    popular: true,
    icon: Sparkles,
  },
  {
    name: "Pro",
    price: { monthly: 799, yearly: 7990 },
    description: "For CAs, legal professionals, and consultants managing clients.",
    features: ["Everything in Founder, plus:", "Full Clause Library Access", "Client & Team Management (3 users)", "Unlimited Contract Analyzer", "Watcher AI (3 portals)", "Advanced Insights Dashboard"],
    cta: "Upgrade to Pro",
    role: ["CA", "Legal Advisor", "Enterprise"],
    popular: true,
    icon: Briefcase,
  },
   {
    name: "Enterprise",
    price: { monthly: 2999, yearly: 29990 },
    description: "For law firms, mid-sized enterprises, and compliance teams.",
    features: ["Everything in Pro, plus:", "Compliance Toolkit (SOC2, ISO)", "Full Integrations (Zapier, etc.)", "API Access & Webhooks", "Unlimited Watcher AI", "Team Access (10+ Users)", "White-labeled Exports"],
    cta: "Upgrade to Enterprise",
    role: ["Enterprise", "Founder", "CA", "Legal Advisor"],
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
  const router = useRouter();

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
  
  const userPlan = userProfile.plan || "Starter";
  const creditLimitMap: { [key in UserPlan]: number } = {
    'Starter': 90,
    'Founder': 50,
    'Pro': 1000,
    'Enterprise': 10000,
    'Free': 30, 
    'CA Pro': 1000, 
    'Enterprise Pro': 10000, 
  }
  const creditLimit = creditLimitMap[userProfile.plan] || 30;
  const creditUsagePercentage = userProfile.credits ? (userProfile.credits / creditLimit) * 100 : 0;

  const handleDowngrade = async () => {
    if (userProfile) {
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        await updateUserProfile({ 
          plan: "Starter", 
          credits: userProfile.credits ? Math.min(userProfile.credits, 90) : 90,
          planStartDate: new Date().toISOString(),
          planExpiryDate: newExpiry.toISOString(),
        });
        toast({
            title: "Plan Downgraded",
            description: "You are now on the Starter plan. Premium features have been disabled.",
        });
    }
  };

  const handleBuyCredits = (credits: number, price: number) => {
    router.push(`/dashboard/checkout?credits=${credits}&price=${price}`);
  }

  const handleGetReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${userProfile.uid}`;
    navigator.clipboard.writeText(referralLink);
    toast({
        title: "Referral Link Copied!",
        description: "Share the link with your friends to earn credits.",
    });
  };
  
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
        availablePlans.length > 3 ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-3"
      )}>
        {availablePlans.map((plan) => {
           const isCurrentPlan = userPlan.startsWith(plan.name);
           const isPopular = plan.popular;
           const price = plan.price[billingCycle];
           return (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col relative interactive-lift",
                isCurrentPlan && "border-2 border-primary ring-4 ring-primary/10",
                isPopular && !isCurrentPlan && "border-2 border-accent",
              )}
            >
              {isPopular && (
                <Badge className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">Most Popular</Badge>
              )}
              <CardHeader className="text-center pt-10">
                 {plan.icon && <plan.icon className="w-8 h-8 mx-auto text-primary" />}
                <CardTitle className="text-xl font-headline mt-2">{plan.name}</CardTitle>
                <CardDescription className="mt-2 h-16 text-sm">{plan.description}</CardDescription>
                <p className="mt-4">
                    <span className="text-4xl font-bold">{price > 0 ? formatPrice(price) : "Free"}</span>
                    <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
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
                 {plan.name === 'Starter' ? (
                    isCurrentPlan ? (
                      <Button className="w-full" disabled variant="outline">
                        Your Current Plan
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" onClick={handleDowngrade}>
                        Downgrade to Starter
                      </Button>
                    )
                  ) : (
                    <Button
                      asChild={!isCurrentPlan}
                      className={cn("w-full", isPopular && !isCurrentPlan && "bg-accent hover:bg-accent/90")}
                      disabled={isCurrentPlan}
                      variant={isCurrentPlan ? "outline" : "default"}
                    >
                      {isCurrentPlan ? (
                        <span>Your Current Plan</span>
                      ) : (
                        <Link href={`/dashboard/checkout?plan=${plan.name.toLowerCase()}&cycle=${billingCycle}`}>
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
                            <Button className="w-full interactive-lift" onClick={() => handleBuyCredits(pack.credits, pack.price)}>
                                <Bolt className="mr-2 h-4 w-4" /> Buy Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Your Current Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">AI Credits</CardTitle>
                        <CardDescription>Remaining credits for the current cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Progress value={creditUsagePercentage} />
                        <p className="text-right font-mono text-lg font-bold">{userProfile.credits || 0} / {creditLimit}</p>
                    </CardContent>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Referral Boosts</CardTitle>
                         <CardDescription>Earn free credits by sharing with friends.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/50 border rounded-lg">
                        <div className="shrink-0 text-primary bg-primary/10 p-3 rounded-full">
                           <Gift className="w-6 h-6"/>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-semibold">Share & Earn!</p>
                            <p className="text-xs text-muted-foreground">Get 50 free credits for every friend who signs up.</p>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={handleGetReferralLink}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Get Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}
