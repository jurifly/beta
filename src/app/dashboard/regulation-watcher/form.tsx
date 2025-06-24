"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef } from "react"
import { fetchRegulationsAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, BookText, ExternalLink, Calendar as CalendarIcon } from "lucide-react"
import type { RegulationWatcherOutput } from "@/ai/flows/regulation-watcher-flow"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const initialState: { data: RegulationWatcherOutput | null; error: string | null } = {
  data: null,
  error: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Fetch Updates
    </Button>
  )
}

export default function RegulationWatcherForm() {
  const [state, formAction] = useFormState(fetchRegulationsAction, initialState)
  const { toast } = useToast()
  const { deductCredits } = useAuth()
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: state.error,
      })
    }
    if (state.data) {
      deductCredits(1).then(success => {
        if (success) {
            toast({
            title: "Updates Fetched",
            description: "Latest regulatory changes are ready for review.",
            });
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
      });
    }
  }, [state, toast, deductCredits])

  return (
    <div className="space-y-8">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Select Regulator</CardTitle>
            <CardDescription>Choose a regulatory body and optionally provide keywords to filter updates.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="regulator">Regulator</Label>
              <Select name="regulator" defaultValue="MCA" required>
                <SelectTrigger id="regulator">
                  <SelectValue placeholder="Select a regulator..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCA">Ministry of Corporate Affairs (MCA)</SelectItem>
                  <SelectItem value="SEBI">Securities and Exchange Board of India (SEBI)</SelectItem>
                  <SelectItem value="RBI">Reserve Bank of India (RBI)</SelectItem>
                  <SelectItem value="Income Tax">Income Tax Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="topic">Keywords (Optional)</Label>
              <Input id="topic" name="topic" placeholder="e.g., 'foreign investment', 'KYC norms', 'related party transactions'" />
            </div>
          </CardContent>
          <CardContent>
            <SubmitButton />
          </CardContent>
        </form>
      </Card>

      <div ref={resultsRef}>
        {state.data && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
              <CardDescription>
                AI-generated summaries of the most recent notifications and circulars.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.data.updates.length > 0 ? (
                state.data.updates.map((update, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start gap-4">
                        <h4 className="font-semibold">{update.title}</h4>
                        <Button asChild variant="ghost" size="sm" className="shrink-0">
                            <a href={update.link} target="_blank" rel="noopener noreferrer">
                                Read More <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 mb-2">
                        <CalendarIcon className="h-3 w-3"/>
                        <span>Published on: {update.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.summary}</p>
                  </div>
                ))
              ) : (
                <Alert>
                  <BookText className="h-4 w-4" />
                  <AlertTitle>No Updates Found</AlertTitle>
                  <AlertDescription>
                    Could not find any recent updates for the selected criteria.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
