"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function BillingForm() {
  const { userProfile } = useAuth()

  if (!userProfile) {
    return <Card><CardContent className="p-6 h-64 flex items-center justify-center"><Loader2 className="animate-spin"/></CardContent></Card>
  }
  
  const isPaidPlan = userProfile.plan !== 'Free';

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Billing & Plan</CardTitle>
        <CardDescription>Manage your subscription and view your billing history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-xl font-bold flex items-center gap-3">
                    {userProfile.plan}
                    {isPaidPlan && <Badge variant="secondary" className="border-violet-500/30 text-violet-500">{userProfile.plan}</Badge>}
                </p>
            </div>
            <Button asChild>
                <Link href="/dashboard/billing">
                    {isPaidPlan ? "Manage Subscription" : "Upgrade Plan"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        {isPaidPlan && (
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Billing History</h4>
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
