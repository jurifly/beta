
"use client";

import { useState, useTransition, useEffect } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Telescope, RadioTower, Building2, Banknote, ShieldCheck, DatabaseZap, Globe } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useToast } from "@/hooks/use-toast";
import { getRegulatoryUpdates } from "./actions";
import { WatcherOutput } from "@/ai/flows/regulation-watcher-flow";

const initialState: { data: WatcherOutput | null; error: string | null } = {
  data: null,
  error: null,
};

const portals = [
    { id: "MCA", name: "MCA", description: "Corporate Affairs", icon: <Building2 className="w-6 h-6" /> },
    { id: "RBI", name: "RBI", description: "Banking Regulations", icon: <Banknote className="w-6 h-6" /> },
    { id: "SEBI", name: "SEBI", description: "Securities", icon: <ShieldCheck className="w-6 h-6" /> },
    { id: "DPDP", name: "DPDP", description: "Data Privacy", icon: <DatabaseZap className="w-6 h-6" /> },
    { id: "GDPR", name: "GDPR", description: "EU Privacy", icon: <Globe className="w-6 h-6" /> },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto interactive-lift">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Telescope className="mr-2 h-4 w-4" />}
      Get Latest Updates
    </Button>
  );
}

const Typewriter = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 20);
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br/>') }}/>;
};

export default function RegulationWatcherForm() {
  const [state, formAction] = useFormState(getRegulatoryUpdates, initialState);
  const [submittedPortal, setSubmittedPortal] = useState("");
  const [submittedFrequency, setSubmittedFrequency] = useState("");
  const { deductCredits } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", title: "Update Failed", description: state.error });
    }
    if (state.data) {
      deductCredits(1);
    }
  }, [state, toast, deductCredits]);

  const handleFormAction = (formData: FormData) => {
    const portal = formData.get("portal") as string;
    const frequency = formData.get("frequency") as string;
    setSubmittedPortal(portal);
    setSubmittedFrequency(frequency);
    formAction(formData);
  }

  return (
    <div className="space-y-8">
        <form action={handleFormAction}>
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Configure Your Watcher</CardTitle>
                    <CardDescription>Select the regulatory bodies you want to monitor and the frequency of updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base font-medium">1. Select a Regulatory Portal</Label>
                        <RadioGroup 
                            name="portal"
                            defaultValue="MCA"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                        >
                            {portals.map((portal) => (
                                <Label key={portal.id} htmlFor={portal.id} className="group flex flex-col items-center justify-center gap-2 border rounded-lg p-4 hover:bg-accent/50 has-[input:checked]:border-primary has-[input:checked]:bg-primary/10 transition-colors cursor-pointer text-center interactive-lift">
                                    <RadioGroupItem value={portal.id} id={portal.id} className="sr-only" />
                                    <div className="p-2 rounded-full bg-muted group-has-[input:checked]:bg-primary/10 group-has-[input:checked]:text-primary">{portal.icon}</div>
                                    <p className="font-semibold group-has-[input:checked]:text-primary">{portal.name}</p>
                                    <p className="text-xs text-muted-foreground">{portal.description}</p>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-medium">2. Set Update Frequency</Label>
                         <RadioGroup
                            name="frequency"
                            defaultValue="daily"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                         >
                            <Label htmlFor="daily" className="flex items-center space-x-3 border rounded-md p-4 hover:bg-accent/50 has-[input:checked]:border-primary has-[input:checked]:bg-accent transition-colors cursor-pointer interactive-lift">
                                <RadioGroupItem value="daily" id="daily" />
                                <div>
                                    <p className="font-semibold">Daily Digest</p>
                                    <p className="text-sm text-muted-foreground">Receive a summary every 24 hours.</p>
                                </div>
                            </Label>
                            <Label htmlFor="weekly" className="flex items-center space-x-3 border rounded-md p-4 hover:bg-accent/50 has-[input:checked]:border-primary has-[input:checked]:bg-accent transition-colors cursor-pointer interactive-lift">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <div>
                                    <p className="font-semibold">Weekly Roundup</p>
                                    <p className="text-sm text-muted-foreground">A consolidated report once a week.</p>
                                </div>
                            </Label>
                        </RadioGroup>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-center border-t pt-6 mt-6">
                    <SubmitButton />
                </CardFooter>
            </Card>
            
            <h2 className="text-xl font-bold tracking-tight">Latest Updates</h2>
            
            {state.data ? (
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                           {portals.find(p => p.id === submittedPortal)?.icon}
                           {submittedPortal} {submittedFrequency.charAt(0).toUpperCase() + submittedFrequency.slice(1)} Digest
                        </CardTitle>
                        <CardDescription>Last updated: Just now</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm p-6 bg-muted/50 rounded-lg border">
                           <Typewriter text={state.data.summary} />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[300px] border-dashed">
                    <RadioTower className="w-16 h-16 text-primary/20"/>
                    <p className="mt-4 font-semibold text-lg">Stay Ahead of Changes</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Select a portal and frequency above to receive AI-powered summaries of regulatory updates.
                    </p>
                </Card>
            )}
        </form>
    </div>
  );
}
