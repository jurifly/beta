
"use client"

import { useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { handleNotificationSettings } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, FileClock, Bot, Save, Loader2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { planHierarchy } from "@/lib/types"

const initialState = { success: null, error: null };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
        {pending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Preferences
    </Button>
  )
}

export default function NotificationsForm() {
  const [state, formAction] = useActionState(handleNotificationSettings, initialState);
  const { toast } = useToast();
  const { userProfile, isDevMode } = useAuth();
  const isPro = userProfile ? planHierarchy[userProfile.plan] > 0 : false;
  const isEnabled = isPro || isDevMode;


  useEffect(() => {
    if (state.success) {
        toast({ title: "Success!", description: state.success });
    }
  }, [state, toast])

  return (
     <form action={formAction} className="w-full">
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle>Notifications & Automations</CardTitle>
                <CardDescription>Choose how and where you receive alerts and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {!isEnabled && (
                    <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Pro Feature</AlertTitle>
                        <AlertDescription>
                            Custom notifications are available on Pro plans.
                            <Link href="/dashboard/settings?tab=subscription" className="font-bold underline ml-2">Upgrade now</Link>
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 sm:gap-0 interactive-lift">
                    <div className="flex items-start gap-4">
                        <Bell className="w-5 h-5 text-primary mt-1 shrink-0"/>
                        <div>
                            <Label htmlFor="email_notifications" className="font-medium">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">For deadlines and regulation updates.</p>
                        </div>
                    </div>
                    <Switch id="email_notifications" name="email_notifications" defaultChecked disabled={!isEnabled} />
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 sm:gap-0 interactive-lift">
                    <div className="flex items-start gap-4">
                        <FileClock className="w-5 h-5 text-primary mt-1 shrink-0"/>
                        <div>
                            <Label htmlFor="quarterly_snapshot" className="font-medium">Auto-Email Quarterly Snapshot</Label>
                            <p className="text-xs text-muted-foreground">AI-generated PDF summary of compliance.</p>
                        </div>
                    </div>
                    <Switch id="quarterly_snapshot" name="quarterly_snapshot" defaultChecked disabled={!isEnabled} />
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 sm:gap-0 interactive-lift">
                    <div className="flex items-start gap-4">
                        <Bot className="w-5 h-5 text-primary mt-1 shrink-0"/>
                        <div>
                            <Label htmlFor="whatsapp_bot" className="font-medium">Enable WhatsApp AI Bot</Label>
                            <p className="text-xs text-muted-foreground">Interact with your AI assistant on WhatsApp.</p>
                        </div>
                    </div>
                    <Switch id="whatsapp_bot" name="whatsapp_bot" disabled={!isEnabled} />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <SubmitButton disabled={!isEnabled} />
            </CardFooter>
        </Card>
    </form>
  )
}
