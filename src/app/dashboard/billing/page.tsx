
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Rocket } from "lucide-react"

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Plans & Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and view your billing history.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto text-center">
          <CardHeader>
              <Rocket className="w-12 h-12 mx-auto text-primary" />
              <CardTitle className="text-2xl mt-4">Free Beta Period</CardTitle>
              <CardDescription>
                  All features are currently free for all users during our open beta.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  We are working hard to finalize our plans and pricing. Your feedback during this period is invaluable to us. Enjoy full access on the house!
              </p>
          </CardContent>
      </Card>

      <Separator className="max-w-3xl mx-auto" />

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Your Current Usage</h2>
        <Card>
            <CardHeader>
                <CardTitle>AI Credits</CardTitle>
                <CardDescription>Credit deductions are paused during the beta.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">Unlimited Credits</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
