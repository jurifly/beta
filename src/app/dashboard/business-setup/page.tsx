
"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Loader2,
  Check,
  Building2,
  FileText,
  ListChecks,
  Sparkles,
  Download,
  Fingerprint,
  FileSignature,
  BookUser,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getIncCodeAction, getFinalChecklistAction } from "./actions";
import type { IncCodeFinderOutput } from "@/ai/flows/inc-code-finder-flow";
import type { AssistantOutput } from "@/ai/flows/assistant-flow";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateDocument } from "@/ai/flows/document-generator-flow";
import { useAuth } from "@/hooks/auth";
import Link from "next/link";
import { ToastAction } from "@/components/ui/toast";
import { useTypewriter } from "@/hooks/use-typewriter";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 1, name: "INC Code Finder", icon: Fingerprint },
  { id: 2, name: "Registration Guide", icon: BookUser },
  { id: 3, name: "Generate Documents", icon: FileSignature },
  { id: 4, name: "Final Checklist", icon: ListChecks },
];

const incCodeFormSchema = z.object({
  businessDescription: z.string().min(20, "Please provide a more detailed description (min 20 characters).").max(500),
});

type IncCodeFormData = z.infer<typeof incCodeFormSchema>;

type NavigatorState = {
  incCodeForm?: IncCodeFormData;
  incCodeResult?: IncCodeFinderOutput;
  finalChecklist?: AssistantOutput;
  completedSteps: number[];
};

// Main Page Component
export default function SetupAssistantPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [navigatorState, setNavigatorState] = useState<NavigatorState>({ completedSteps: [] });

  const goToNextStep = () => {
     setNavigatorState(prev => ({ ...prev, completedSteps: [...new Set([...prev.completedSteps, currentStep])] }));
     setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  }
  const goToPrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const jumpToStep = (step: number) => {
    // Allow jumping only to completed steps
    if (navigatorState.completedSteps.includes(step) || step < currentStep) {
        setCurrentStep(step);
    }
  }

  const updateNavigatorState = (updates: Partial<NavigatorState>) => {
    setNavigatorState((prev) => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1IncCodeFinder onComplete={goToNextStep} updateState={updateNavigatorState} initialState={navigatorState} />;
      case 2:
        return <Step2RegistrationGuide onComplete={goToNextStep} />;
      case 3:
        return <Step3DocumentGenerator onComplete={goToNextStep} />;
      case 4:
        return <Step4FinalChecklist navigatorState={navigatorState} />;
      default:
        return null;
    }
  };

  const completionPercentage = Math.round((navigatorState.completedSteps.length / (STEPS.length -1)) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Startup Setup Assistant</h1>
        <p className="text-muted-foreground">Your AI-guided journey to launching your company.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>You’ve completed {navigatorState.completedSteps.length} of {STEPS.length} registration essentials.</CardDescription>
          <Progress value={completionPercentage} className="mt-2" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="font-semibold">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
            <div aria-label="Progress bar" className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {STEPS.map((step, index) => {
                const stepStatus =
                  navigatorState.completedSteps.includes(step.id) ? 'completed' : currentStep === index + 1 ? 'current' : 'upcoming';
                return (
                  <div key={step.id} className="flex items-center gap-2 sm:gap-4 w-full">
                    <button
                      onClick={() => jumpToStep(step.id)}
                      disabled={stepStatus === 'upcoming'}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                        stepStatus === 'completed' && 'bg-primary border-primary text-primary-foreground',
                        stepStatus === 'current' && 'border-primary',
                        stepStatus === 'upcoming' && 'bg-muted border-muted-foreground/20 text-muted-foreground'
                      )}
                    >
                      {stepStatus === 'completed' ? <Check className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                    </button>
                    {index < STEPS.length - 1 && <div className={cn("flex-1 h-0.5", stepStatus === 'completed' ? 'bg-primary' : 'bg-muted-foreground/20')} />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px] border-t pt-6">
          {renderStepContent()}
        </CardContent>
         <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={goToPrevStep} disabled={currentStep === 1}>
                Back
            </Button>
            {/* Next button is handled within each step */}
         </CardFooter>
      </Card>
    </div>
  );
}

// --- Step 1: INC Code Finder ---
interface Step1Props {
    onComplete: () => void;
    updateState: (updates: Partial<NavigatorState>) => void;
    initialState: NavigatorState;
}

function Step1IncCodeFinder({ onComplete, updateState, initialState }: Step1Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IncCodeFinderOutput | undefined>(initialState.incCodeResult);

  const { control, handleSubmit, formState: { errors } } = useForm<IncCodeFormData>({
    resolver: zodResolver(incCodeFormSchema),
    defaultValues: initialState.incCodeForm || {
      businessDescription: "",
    },
  });

  const onSubmit = async (data: IncCodeFormData) => {
    setIsLoading(true);
    setResult(undefined);
    updateState({ incCodeForm: data });
    try {
      const response = await getIncCodeAction(data);
      setResult(response);
      updateState({ incCodeResult: response });
    } catch (error: any) {
      toast({ variant: "destructive", title: "INC Code Search Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
     <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h2 className="text-xl font-bold">Find Your INC/NIC Code</h2>
            <p className="text-muted-foreground mt-1">Describe your business, and our AI will suggest the correct government classification code for your registration.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea id="businessDescription" placeholder="e.g., We are building a SaaS platform for small businesses to manage their finances, using AI to provide insights and automation." {...control.register("businessDescription")} className="min-h-[120px]" />
                  {errors.businessDescription && <p className="text-sm text-destructive">{errors.businessDescription.message}</p>}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                Find My Code
              </Button>
            </form>
        </div>
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-bold text-lg text-center mb-4">AI Recommendation</h3>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-4 font-semibold">Analyzing your business...</p>
            </div>
          )}
          {!isLoading && result && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <Card className="bg-primary/10 border-primary/20 text-center">
                    <CardHeader>
                        <CardTitle className="text-primary font-mono">{result.nicCode}</CardTitle>
                        <CardDescription className="font-semibold">{result.nicTitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm">{result.reasoning}</p>
                    </CardContent>
                </Card>
                {result.alternativeCodes && result.alternativeCodes.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-center mb-2">Alternatives</h4>
                        <div className="space-y-2">
                           {result.alternativeCodes.map(alt => (
                            <div key={alt.code} className="p-2 text-center border rounded-md bg-card">
                                <p className="font-semibold font-mono text-sm">{alt.code}</p>
                                <p className="text-xs text-muted-foreground">{alt.title}</p>
                            </div>
                           ))}
                        </div>
                    </div>
                )}
                <Button onClick={onComplete} className="w-full">Next Step <ArrowRight className="ml-2"/></Button>
             </div>
          )}
           {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <Sparkles className="w-12 h-12 text-primary/20 mb-4" />
                    <p className="font-medium">Your INC/NIC code will appear here.</p>
                </div>
           )}
        </div>
     </div>
  );
}

// --- Step 2: Registration Guide ---
const registrationData = [
  { id: "gst", title: "GST Registration", time: "3-7 days", link: "https://www.gst.gov.in/", docs: ["PAN Card", "Proof of Business Registration", "Address Proof of Business", "Bank Account Statement", "Promoter's ID and Address Proof"] },
  { id: "msme", title: "MSME / Udyam Registration", time: "1-2 days", link: "https://udyamregistration.gov.in/", docs: ["Aadhaar Card of Applicant", "PAN Card of Organization", "Bank Account Details"] },
  { id: "startup_india", title: "Startup India (DPIIT)", time: "1-2 weeks", link: "https://www.startupindia.gov.in/", docs: ["Incorporation/Registration Certificate", "Director/Partner Details", "Proof of Funding (if any)", "Pitch Deck or Business Brief"] },
  { id: "shops", title: "Shops & Establishment Act", time: "7-15 days", link: "#", docs: ["Business Name and Address", "Category of Establishment", "Employer and Employee Details"] },
];

function Step2RegistrationGuide({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold">Key Registration Workflows</h2>
                <p className="text-muted-foreground mt-1">A guide to the essential registrations for your new venture.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {registrationData.map(reg => (
                  <AccordionItem value={reg.id} key={reg.id}>
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">{reg.title}</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="p-4 bg-muted/50 rounded-md border space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="font-medium">Est. Time:</p><p className="text-muted-foreground">{reg.time}</p></div>
                                <div><p className="font-medium">Official Link:</p><p><Button variant="link" asChild className="p-0 h-auto text-sm"><a href={reg.link} target="_blank" rel="noopener noreferrer">Visit Portal <ArrowRight className="ml-1 w-4 h-4"/></a></Button></p></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm mb-2">Required Documents:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {reg.docs.map(doc => <li key={doc}>{doc}</li>)}
                                </ul>
                            </div>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
            <div className="text-center pt-4">
                <Button onClick={onComplete}>Next Step <ArrowRight className="ml-2"/></Button>
            </div>
        </div>
    );
}

// --- Step 3: Document Generation ---
const docTemplates = [
  { name: "NOC from Landlord", desc: "A no-objection certificate required if your registered office is a rented property.", premium: false },
  { name: "Board Resolution for Incorporation", desc: "The official board resolution to authorize the incorporation process.", premium: true },
  { name: "MSME Application Draft", desc: "A pre-filled draft to help with your Udyam registration.", premium: false },
  { name: "Registered Address Declaration", desc: "A declaration for the company's registered office address.", premium: true },
];

function Step3DocumentGenerator({ onComplete }: { onComplete: () => void }) {
    const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<{title: string, content: string} | null>(null);
    const { toast } = useToast();
    const { userProfile } = useAuth();
    
    const displayText = useTypewriter(generatedContent?.content || '', 10);

    const handleGenerate = async (templateName: string, isPremium: boolean) => {
        if (isPremium && userProfile?.plan === 'Free') {
            toast({
                title: 'Upgrade Required',
                description: 'This is a premium document. Please upgrade to generate.',
                variant: 'destructive',
                action: <ToastAction altText="Upgrade"><Link href="/dashboard/billing">Upgrade</Link></ToastAction>,
            });
            return;
        }

        setLoadingDoc(templateName);
        setGeneratedContent(null);
        try {
            const doc = await generateDocument({ templateName });
            setGeneratedContent(doc);
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: e.message });
        } finally {
            setLoadingDoc(null);
        }
    };
    
    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-bold">Auto-Generate Registration Documents</h2>
                <p className="text-muted-foreground mt-1">Select a document to instantly generate a draft with AI.</p>
                <div className="space-y-4 mt-6">
                    {docTemplates.map(template => (
                        <Card key={template.name} className="interactive-lift">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  {template.name}
                                  {template.premium && <Badge variant="secondary" className="text-amber-600 bg-amber-100">Premium</Badge>}
                                </CardTitle>
                                <CardDescription className="text-sm">{template.desc}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => handleGenerate(template.name, template.premium)}
                                    disabled={!!loadingDoc}
                                >
                                    {loadingDoc === template.name ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                                    Generate
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Document Preview</h3>
                    <Button variant="outline" size="sm" disabled={!generatedContent}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>
                <div className="flex-1 border rounded-md bg-card p-4 overflow-y-auto min-h-[300px]">
                    {loadingDoc && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p className="mt-4 font-semibold">Generating {loadingDoc}...</p>
                        </div>
                    )}
                    {generatedContent && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="font-bold mb-4">{generatedContent.title}</h4>
                            <p className="whitespace-pre-wrap">{displayText}</p>
                        </div>
                    )}
                    {!loadingDoc && !generatedContent && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <FileSignature className="w-12 h-12 text-primary/20 mb-4" />
                            <p className="font-medium">Your generated document will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 text-center pt-4">
                <Button onClick={onComplete}>Next Step <ArrowRight className="ml-2"/></Button>
            </div>
        </div>
    )
}

// --- Step 4: Final Checklist ---
function Step4FinalChecklist({ navigatorState }: { navigatorState: NavigatorState }) {
    const [isLoading, setIsLoading] = useState(false);
    const [checklist, setChecklist] = useState<AssistantOutput | undefined>(navigatorState.finalChecklist);
    const { toast } = useToast();

    const handleGenerateChecklist = async () => {
        setIsLoading(true);
        setChecklist(undefined);
        const topic = `Generate a final business setup checklist for a startup. Their business is: "${navigatorState.incCodeForm?.businessDescription}". Include sections for Legal/Registration, Banking, and Initial Operations.`;

        try {
            const response = await getFinalChecklistAction({ topic });
            setChecklist(response);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Checklist Generation Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
             <div className="text-center">
                <h2 className="text-xl font-bold">Your Personalized Setup Checklist</h2>
                <p className="text-muted-foreground mt-1">Here is your final roadmap. Generate it with AI based on your inputs.</p>
            </div>
            <div className="text-center my-6">
                <Button onClick={handleGenerateChecklist} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                    {checklist ? "Regenerate Checklist" : "Generate Final Checklist"}
                </Button>
            </div>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="mt-4 font-semibold">Our AI is building your custom checklist...</p>
                </div>
            )}

            {checklist && (
                 <div className="bg-muted/50 rounded-xl animate-in fade-in-50 duration-500">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-bold text-md">{checklist.title}</h3>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                    </div>
                    <ul className="space-y-3 p-4">
                    {checklist.checklist.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 p-3 bg-card rounded-md border">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                              <Check className="h-3 w-3" />
                          </span>
                          <div>
                              <p className="font-medium text-sm">{item.task}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </li>
                    ))}
                    </ul>
                </div>
            )}

            {!isLoading && !checklist && (
                 <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-card flex-1">
                    <ListChecks className="w-16 h-16 text-primary/20"/>
                    <p className="font-semibold text-lg">Your checklist will appear here</p>
                    <p className="text-sm max-w-sm">Click the button above to generate it.</p>
                </div>
            )}
        </div>
    )
}
