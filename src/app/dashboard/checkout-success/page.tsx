"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500"/>
            <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
            <CardDescription>
                Your plan has been upgraded. Welcome to the next level of compliance.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">You will be redirected to your dashboard shortly...</p>
        </CardContent>
      </Card>
    </div>
  )
}
