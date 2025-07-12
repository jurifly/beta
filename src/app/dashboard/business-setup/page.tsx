
"use client";

import { useState, type ReactNode, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Info,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getBusinessRecommendationAction, getIncCodeAction, getFinalChecklistAction } from "./actions";
import type { BusinessRecommenderOutput } from "@/ai/flows/business-recommender-flow";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/lib/types";
import { planHierarchy } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";


const STEPS = [
  { id: 1, name: "Business Type", icon: Building2 },
  { id: 2, name: "INC Code Finder", icon: Fingerprint },
  { id: 3, name: "Registration Guide", icon: BookUser },
  { id: 4, name: "Generate Documents", icon: FileSignature },
  { id: 5, name: "Final Checklist", icon: ListChecks },
];

const businessTypeFormSchema = z.object({
  founderCount: z.coerce.number().min(1, "Number of founders is required."),
  investmentPlan: z.string().min(1, "Investment plan is required."),
  revenueGoal: z.string().min(1, "Revenue goal is required."),
  businessDescription: z.string().min(20, "Please provide a more detailed description (min 20 characters).").max(500),
  legalRegion: z.string().min(1, "Legal region is required."),
});
type BusinessTypeFormData = z.infer<typeof businessTypeFormSchema>;

const incCodeFormSchema = z.object({
  businessDescription: z.string().min(20, "Please provide a more detailed description (min 20 characters).").max(500),
  legalRegion: z.string().min(1, "Legal region is required."),
});
type IncCodeFormData = z.infer<typeof incCodeFormSchema>;

type NavigatorState = {
  businessTypeForm?: BusinessTypeFormData;
  businessTypeResult?: BusinessRecommenderOutput;
  incCodeForm?: IncCodeFormData;
  incCodeResult?: IncCodeFinderOutput;
  finalChecklist?: AssistantOutput;
  completedSteps: number[];
};

// Main Page Component
export default function BusinessSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [navigatorState, setNavigatorState] = useState<NavigatorState>({ completedSteps: [] });
  const { userProfile, loading } = useAuth();

  const goToNextStep = () => {
     setNavigatorState(prev => ({ ...prev, completedSteps: [...new Set([...prev.completedSteps, currentStep])] }));
     setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  }
  const goToPrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const jumpToStep = (step: number) => {
    if (navigatorState.completedSteps.includes(step) || step < currentStep) {
        setCurrentStep(step);
    }
  }

  const updateNavigatorState = (updates: Partial<NavigatorState>) => {
    setNavigatorState((prev) => ({ ...prev, ...updates }));
  };
  
  if (loading || !userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessType onComplete={goToNextStep} updateState={updateNavigatorState} initialState={navigatorState} />;
      case 2:
        return <Step2IncCodeFinder onComplete={goToNextStep} updateState={updateNavigatorState} initialState={navigatorState} />;
      case 3:
        return <Step3RegistrationGuide onComplete={goToNextStep} />;
      case 4:
        return <Step4DocumentGenerator onComplete={goToNextStep} userProfile={userProfile} />;
      case 5:
        return <Step5FinalChecklist navigatorState={navigatorState} />;
      default:
        return null;
    }
  };

  const completionPercentage = Math.round((navigatorState.completedSteps.length / (STEPS.length -1)) * 100);

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-[var(--feature-color,hsl(var(--primary)))]">Launch Pad</h1>
        <p className="text-muted-foreground">Your AI-guided journey to launching your company.</p>
      </div>

       <Card className="interactive-lift">
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>You’ve completed {navigatorState.completedSteps.length} of {STEPS.length} registration essentials.</CardDescription>
          <Progress value={completionPercentage} className="mt-2" />
        </CardHeader>
      </Card>

      <Card className="interactive-lift">
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

// --- Step 1: Business Type Recommender ---
interface StepProps {
    onComplete: () => void;
    updateState: (updates: Partial<NavigatorState>) => void;
    initialState: NavigatorState;
}

function Step1BusinessType({ onComplete, updateState, initialState }: StepProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BusinessRecommenderOutput | undefined>(initialState.businessTypeResult);
    const { userProfile, deductCredits } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<BusinessTypeFormData>({
        resolver: zodResolver(businessTypeFormSchema),
        defaultValues: initialState.businessTypeForm || {
          founderCount: 1,
          investmentPlan: "",
          revenueGoal: "",
          businessDescription: "",
          legalRegion: userProfile?.legalRegion || "India",
        },
    });

    const onSubmit = async (data: BusinessTypeFormData) => {
        if (!await deductCredits(2)) return;
        setIsLoading(true);
        setResult(undefined);
        updateState({ businessTypeForm: data });
        try {
            const response = await getBusinessRecommendationAction(data);
            setResult(response);
            updateState({ businessTypeResult: response });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Recommendation Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
                <h2 className="text-xl font-bold">Find Your Ideal Business Structure</h2>
                <p className="text-muted-foreground mt-1">Answer a few questions and our AI will recommend the best legal structure for your new venture.</p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Number of Founders</Label>
                            <Controller name="founderCount" control={control} render={({ field }) => (
                                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value || 1)}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Founder</SelectItem>
                                        <SelectItem value="2">2 Founders</SelectItem>
                                        <SelectItem value="3">3 Founders</SelectItem>
                                        <SelectItem value="4">4 Founders</SelectItem>
                                        <SelectItem value="5">5+ Founders</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}/>
                            {errors.founderCount && <p className="text-sm text-destructive">{errors.founderCount.message}</p>}
                        </div>
                        <div className="space-y-2">
                             <Label>Investment Plan</Label>
                             <Controller name="investmentPlan" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                                        <SelectItem value="Angel Investors">Angel Investors</SelectItem>
                                        <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}/>
                             {errors.investmentPlan && <p className="text-sm text-destructive">{errors.investmentPlan.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                         <Label>Projected Annual Revenue</Label>
                         <Controller name="revenueGoal" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Under 10 Lakhs">Under ₹10 Lakhs</SelectItem>
                                    <SelectItem value="10 Lakhs - 1 Crore">₹10 Lakhs - ₹1 Crore</SelectItem>
                                    <SelectItem value="Over 1 Crore">Over ₹1 Crore</SelectItem>
                                </SelectContent>
                            </Select>
                        )}/>
                         {errors.revenueGoal && <p className="text-sm text-destructive">{errors.revenueGoal.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessDescription">Business Description</Label>
                        <Controller name="businessDescription" control={control} render={({ field }) => (
                            <Textarea id="businessDescription" placeholder="e.g., We are building a SaaS platform for small businesses to manage their finances..." {...field} className="min-h-[100px]" />
                        )}/>
                        {errors.businessDescription && <p className="text-sm text-destructive">{errors.businessDescription.message}</p>}
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                        Get Recommendation (2 Credits)
                    </Button>
                </form>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 flex flex-col">
                <h3 className="font-bold text-lg text-center mb-4 shrink-0">AI Recommendation</h3>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="mt-4 font-semibold">Analyzing your venture...</p>
                    </div>
                )}
                {!isLoading && result && (
                    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in-50 duration-500">
                        <div className="overflow-y-auto pr-2 -mr-4">
                            <Card className="bg-background text-center mb-4 interactive-lift">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">{result.recommendedType}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-left">
                                        <ReactMarkdown>{result.reasoning}</ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Accordion type="single" collapsible defaultValue="pros-cons" className="w-full">
                                <AccordionItem value="pros-cons">
                                    <AccordionTrigger>Pros & Cons</AccordionTrigger>
                                    <AccordionContent>
                                        <Card className="bg-background interactive-lift">
                                          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-left p-4">
                                              <div className="space-y-3">
                                                  <h4 className="font-semibold flex items-center gap-2"><ThumbsUp className="text-green-500"/> Pros</h4>
                                                  <ul className="space-y-3 text-muted-foreground">
                                                      {result.pros.map((pro, i) => (
                                                          <li key={i} className="flex items-start gap-2.5">
                                                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500/50" />
                                                              <p className="flex-1">{pro}</p>
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                              <div className="space-y-3">
                                                  <h4 className="font-semibold flex items-center gap-2"><ThumbsDown className="text-red-500"/> Cons</h4>
                                                  <ul className="space-y-3 text-muted-foreground">
                                                      {result.cons.map((con, i) => (
                                                          <li key={i} className="flex items-start gap-2.5">
                                                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50" />
                                                              <p className="flex-1">{con}</p>
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                {result.alternativeOption && (
                                    <AccordionItem value="alternative">
                                        <AccordionTrigger>Alternative to Consider</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex items-start gap-3 p-3 bg-amber-100/50 border border-amber-500/20 rounded-lg text-left">
                                                <Lightbulb className="text-amber-600 h-5 w-5 shrink-0 mt-1"/>
                                                <div>
                                                    <h4 className="font-semibold text-amber-900">{result.alternativeOption}</h4>
                                                    <p className="text-sm text-amber-800">This could also be a viable option depending on your specific priorities.</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>
                        <div className="mt-6 shrink-0">
                           <Button onClick={onComplete} className="w-full">Next Step <ArrowRight className="ml-2"/></Button>
                        </div>
                    </div>
                )}
                {!isLoading && !result && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <Building2 className="w-12 h-12 text-primary/20 mb-4" />
                        <p className="font-medium">Your recommended business structure will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


// --- Step 2: INC Code Finder ---
function Step2IncCodeFinder({ onComplete, updateState, initialState }: StepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IncCodeFinderOutput | undefined>(initialState.incCodeResult);
  const { userProfile, deductCredits } = useAuth();

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<IncCodeFormData>({
    resolver: zodResolver(incCodeFormSchema),
    defaultValues: {
      businessDescription: initialState.businessTypeForm?.businessDescription || "",
      legalRegion: userProfile?.legalRegion || "India",
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
                  <Controller name="businessDescription" control={control} render={({ field }) => (
                    <Textarea id="businessDescription" placeholder="e.g., We are building a SaaS platform for small businesses to manage their finances, using AI to provide insights and automation." {...field} className="min-h-[120px]" />
                  )}/>
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
                <Card className="bg-primary/10 border-primary/20 text-center interactive-lift">
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

// --- Step 3: Registration Guide ---
const registrationData = [
  { id: "gst", title: "GST Registration", time: "3-7 days", link: "https://www.gst.gov.in/", docs: ["PAN Card", "Proof of Business Registration", "Address Proof of Business", "Bank Account Statement", "Promoter's ID and Address Proof"] },
  { id: "msme", title: "MSME / Udyam Registration", time: "1-2 days", link: "https://udyamregistration.gov.in/", docs: ["Aadhaar Card of Applicant", "PAN Card of Organization", "Bank Account Details"] },
  { id: "startup_india", title: "Startup India (DPIIT)", time: "1-2 weeks", link: "https://www.startupindia.gov.in/", docs: ["Incorporation/Registration Certificate", "Director/Partner Details", "Proof of Funding (if any)", "Pitch Deck or Business Brief"] },
  { id: "shops", title: "Shops & Establishment Act", time: "7-15 days", link: "#", docs: ["Business Name and Address", "Category of Establishment", "Employer and Employee Details"] },
];

function Step3RegistrationGuide({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold">Key Registration Workflows</h2>
                <p className="text-muted-foreground mt-1">A guide to the essential registrations for your new venture.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {registrationData.map(reg => (
                  <AccordionItem value={reg.id} key={reg.id}>
                    <AccordionTrigger className="text-base font-semibold hover:no-underline interactive-lift">{reg.title}</AccordionTrigger>
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

interface Step4DocumentGeneratorProps {
    onComplete: () => void;
    userProfile: UserProfile;
}

// --- Step 4: Document Generation ---
const docTemplates = [
  { name: "NOC from Landlord", desc: "A no-objection certificate required if your registered office is a rented property.", premium: false },
  { name: "Board Resolution for Incorporation", desc: "The official board resolution to authorize the incorporation process.", premium: true },
  { name: "MSME Application Draft", desc: "A pre-filled draft to help with your Udyam registration.", premium: false },
  { name: "Registered Address Declaration", desc: "A declaration for the company's registered office address.", premium: true },
];

function Step4DocumentGenerator({ onComplete, userProfile }: Step4DocumentGeneratorProps) {
    const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<{title: string, content: string} | null>(null);
    const { toast } = useToast();
    const { deductCredits } = useAuth();
    
    const [editorContent, setEditorContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const hasUserEdited = useRef(false);

    const typewriterText = useTypewriter(isTyping ? (generatedContent?.content || '') : '', 10);
    
    useEffect(() => {
        if (isTyping && !hasUserEdited.current) {
          setEditorContent(typewriterText);
        }
        if (isTyping && typewriterText.length > 0 && typewriterText.length === (generatedContent?.content || '').length) {
            setIsTyping(false);
        }
    }, [typewriterText, isTyping, generatedContent]);

    const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isTyping) {
          hasUserEdited.current = true;
          setIsTyping(false);
        }
        setEditorContent(e.target.value);
    };

    const handleGenerate = async (templateName: string) => {
        setLoadingDoc(templateName);
        setGeneratedContent(null);
        setEditorContent('');
        hasUserEdited.current = false;
        
        try {
            const doc = await generateDocument({ templateName, legalRegion: userProfile.legalRegion });
            setGeneratedContent(doc);
            setIsTyping(true);
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: e.message });
        } finally {
            setLoadingDoc(null);
        }
    };
    
    const handleDownload = () => {
        if (!generatedContent) return;
        const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${generatedContent.title.replace(/ /g, '_')}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                                </CardTitle>
                                <CardDescription className="text-sm">{template.desc}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => handleGenerate(template.name)}
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
                    <h3 className="font-bold text-lg">{generatedContent?.title || "Document Preview"}</h3>
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!generatedContent || loadingDoc}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>
                <div className="flex-1 border rounded-md bg-card overflow-hidden min-h-[300px]">
                    {loadingDoc && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <p className="mt-4 font-semibold">Generating {loadingDoc}...</p>
                        </div>
                    )}
                    {generatedContent ? (
                        <Textarea
                            value={editorContent}
                            onChange={handleEditorChange}
                            className="w-full h-full p-4 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-code interactive-lift"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground interactive-lift">
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

// --- Step 5: Final Checklist ---
function Step5FinalChecklist({ navigatorState }: { navigatorState: NavigatorState }) {
    const [isLoading, setIsLoading] = useState(false);
    const [checklist, setChecklist] = useState<AssistantOutput['checklist'] | undefined>(navigatorState.finalChecklist?.checklist);
    const [checklistTitle, setChecklistTitle] = useState<string>(navigatorState.finalChecklist?.checklist?.title || "Final Checklist");
    const { toast } = useToast();
    const { userProfile, deductCredits } = useAuth();

    const handleGenerateChecklist = async () => {
        setIsLoading(true);
        setChecklist(undefined);
        const businessDesc = navigatorState.businessTypeForm?.businessDescription || navigatorState.incCodeForm?.businessDescription;
        const businessType = navigatorState.businessTypeResult?.recommendedType;
        const topic = `Generate a final business setup checklist for a startup. Their recommended business structure is "${businessType}". Their business is: "${businessDesc}". Include sections for Legal/Registration, Banking, and Initial Operations.`;

        try {
            const response = await getFinalChecklistAction({ topic, legalRegion: userProfile?.legalRegion || 'India' });
            if (response.checklist) {
                setChecklist(response.checklist);
                setChecklistTitle(response.checklist.title);
            } else {
                toast({ variant: 'destructive', title: 'Checklist Generation Failed', description: 'The AI could not generate a checklist for this topic.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Checklist Generation Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleDownload = () => {
        if (!checklist) return;

        let content = `${checklistTitle}\n\n`;
        
        const categories = checklist.items.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item.task);
            return acc;
        }, {} as Record<string, string[]>);

        for (const category in categories) {
            content += `## ${category}\n\n`;
            categories[category].forEach(task => {
                content += `- ${task}\n`;
            });
            content += '\n';
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${checklistTitle.replace(/\s+/g, '_')}_checklist.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
                        <h3 className="font-bold text-md">{checklistTitle}</h3>
                        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!checklist}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                    </div>
                    <ul className="space-y-3 p-4">
                    {checklist.items.map((item, itemIndex) => (
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
