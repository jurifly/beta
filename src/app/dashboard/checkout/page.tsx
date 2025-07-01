
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket } from "lucide-react"

export default function CheckoutPage() {
  return (
    <div className="flex items-center justify-center min-h-full bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Rocket className="w-12 h-12 mx-auto text-primary" />
          <CardTitle className="text-2xl mt-4">Billing is Paused</CardTitle>
          <CardDescription>
            We are currently in a free beta period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All features are available to you for free. We are not processing any payments at this time. Thank you for testing out our app!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
