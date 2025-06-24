
"use client";

import { useState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Loader2,
  Check,
  Building2,
  FileText,
  Home,
  ListChecks,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getBusinessRecommendationAction, getFinalChecklistAction } from "./actions";
import type { BusinessRecommenderOutput } from "@/ai/flows/business-recommender-flow";
import type { AssistantOutput } from "@/ai/flows/assistant-flow";

const STEPS = [
  { id: 1, name: "Business Type", icon: Building2 },
  { id: 2, name: "Registrations", icon: FileText },
  { id: 3, name: "Virtual Address", icon: Home },
  { id: 4, name: "Final Checklist", icon: ListChecks },
];

const recommendationFormSchema = z.object({
  founderCount: z.coerce.number().min(1, "At least one founder is required."),
  investmentPlan: z.string().min(1, "Please select an investment plan."),
  revenueGoal: z.string().min(1, "Please select a revenue goal."),
  businessDescription: z.string().min(10, "Please provide a brief description.").max(500),
});

type RecommendationFormData = z.infer<typeof recommendationFormSchema>;

type NavigatorState = {
  recommendationForm?: RecommendationFormData;
  recommendationResult?: BusinessRecommenderOutput;
  finalChecklist?: AssistantOutput;
};

// Main Page Component
export default function BusinessSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [navigatorState, setNavigatorState] = useState<NavigatorState>({});

  const goToNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const goToPrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const jumpToStep = (step: number) => {
    // Allow jumping only to completed steps
    if (step < currentStep) {
        setCurrentStep(step);
    }
  }

  const updateNavigatorState = (updates: Partial<NavigatorState>) => {
    setNavigatorState((prev) => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessRecommender onComplete={goToNextStep} updateState={updateNavigatorState} initialState={navigatorState} />;
      case 2:
        return <Step2Registrations onComplete={goToNextStep} />;
      case 3:
        return <Step3VirtualAddress onComplete={goToNextStep} />;
      case 4:
        return <Step4FinalChecklist navigatorState={navigatorState} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Business Setup Navigator</h1>
        <p className="text-muted-foreground">Your AI-guided journey to launching your company.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="font-semibold">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
            <div aria-label="Progress bar" className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {STEPS.map((step, index) => {
                const stepStatus =
                  currentStep > index + 1 ? 'completed' : currentStep === index + 1 ? 'current' : 'upcoming';
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
interface Step1Props {
    onComplete: () => void;
    updateState: (updates: Partial<NavigatorState>) => void;
    initialState: NavigatorState;
}

function Step1BusinessRecommender({ onComplete, updateState, initialState }: Step1Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BusinessRecommenderOutput | undefined>(initialState.recommendationResult);

  const { control, handleSubmit, formState: { errors } } = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: initialState.recommendationForm || {
      founderCount: 1,
      investmentPlan: "",
      revenueGoal: "",
      businessDescription: "",
    },
  });

  const onSubmit = async (data: RecommendationFormData) => {
    setIsLoading(true);
    setResult(undefined);
    updateState({ recommendationForm: data });
    try {
      const response = await getBusinessRecommendationAction(data);
      setResult(response);
      updateState({ recommendationResult: response });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Recommendation Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const InfoCard = ({ icon, title, children }: { icon: ReactNode, title: string, children: ReactNode }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <div className="text-sm text-muted-foreground space-y-2 mt-1">{children}</div>
        </div>
    </div>
  );


  return (
     <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h2 className="text-xl font-bold">Find the Right Business Structure</h2>
            <p className="text-muted-foreground mt-1">Answer a few questions and our AI will suggest the best fit for you.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <Controller name="founderCount" control={control} render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="founderCount">How many founders?</Label>
                    <Input id="founderCount" type="number" min="1" {...field} />
                    {errors.founderCount && <p className="text-sm text-destructive">{errors.founderCount.message}</p>}
                  </div>
              )} />
              <Controller name="investmentPlan" control={control} render={({ field }) => (
                <div className="space-y-2">
                    <Label>What are your investment plans?</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a plan..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bootstrapped">Bootstrapped / Self-funded</SelectItem>
                            <SelectItem value="Friends & Family">Friends & Family Round</SelectItem>
                            <SelectItem value="Angel Investors">Angel Investors</SelectItem>
                            <SelectItem value="Venture Capital">Venture Capital (VC)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.investmentPlan && <p className="text-sm text-destructive">{errors.investmentPlan.message}</p>}
                </div>
              )} />
               <Controller name="revenueGoal" control={control} render={({ field }) => (
                <div className="space-y-2">
                    <Label>Projected annual revenue (first 2-3 years)?</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a range..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="< 10 Lakhs">Under ₹10 Lakhs</SelectItem>
                            <SelectItem value="10-50 Lakhs">₹10 Lakhs - ₹50 Lakhs</SelectItem>
                            <SelectItem value="50 Lakhs - 1 Crore">₹50 Lakhs - ₹1 Crore</SelectItem>
                            <SelectItem value="> 1 Crore">More than ₹1 Crore</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.revenueGoal && <p className="text-sm text-destructive">{errors.revenueGoal.message}</p>}
                </div>
              )} />
              <Controller name="businessDescription" control={control} render={({ field }) => (
                <div className="space-y-2">
                    <Label htmlFor="businessDescription">What does your business do? (1-2 sentences)</Label>
                    <Textarea id="businessDescription" placeholder="e.g., We are building a SaaS platform for small businesses to manage their finances." {...field} />
                    {errors.businessDescription && <p className="text-sm text-destructive">{errors.businessDescription.message}</p>}
                </div>
              )} />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                Get AI Recommendation
              </Button>
            </form>
        </div>
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-bold text-lg text-center mb-4">AI Recommendation</h3>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-4 font-semibold">Analyzing your input...</p>
            </div>
          )}
          {!isLoading && result && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <Card className="bg-primary/10 border-primary/20 text-center">
                    <CardHeader>
                        <CardTitle className="text-primary">{result.recommendedType}</CardTitle>
                        <CardDescription>{result.reasoning}</CardDescription>
                    </CardHeader>
                </Card>
                <div className="space-y-4">
                  <InfoCard icon={<ThumbsUp/>} title="Pros">
                     <ul className="list-disc pl-5 space-y-1">
                        {result.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                     </ul>
                  </InfoCard>
                  <InfoCard icon={<ThumbsDown/>} title="Cons">
                     <ul className="list-disc pl-5 space-y-1">
                        {result.cons.map((con, i) => <li key={i}>{con}</li>)}
                     </ul>
                  </InfoCard>
                  {result.alternativeOption && (
                    <InfoCard icon={<Lightbulb/>} title="Alternative to Consider">
                       <p>{result.alternativeOption}</p>
                    </InfoCard>
                  )}
                </div>
                <Button onClick={onComplete} className="w-full">Next Step <ArrowRight className="ml-2"/></Button>
             </div>
          )}
           {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <Sparkles className="w-12 h-12 text-primary/20 mb-4" />
                    <p className="font-medium">Your recommendation will appear here.</p>
                </div>
           )}
        </div>
     </div>
  );
}

// --- Step 2: Registrations ---
function Step2Registrations({ onComplete }: { onComplete: () => void }) {
    const InfoBlock = ({ title, children }: { title: string, children: ReactNode }) => (
        <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <div className="text-muted-foreground space-y-3 text-sm">{children}</div>
        </div>
    );
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold">Key Business Registrations</h2>
                <p className="text-muted-foreground mt-1">Understanding when and why you need GST and MSME registrations.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <InfoBlock title="GST (Goods and Services Tax)">
                    <p>GST registration is mandatory for businesses whose aggregate turnover exceeds a certain threshold. This threshold varies by state and whether you supply goods or services.</p>
                    <p><strong>Generally required if:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Your annual turnover is over ₹40 Lakhs (for goods) or ₹20 Lakhs (for services).</li>
                        <li>You make inter-state sales (selling outside your state).</li>
                        <li>You sell on e-commerce platforms like Amazon or Flipkart.</li>
                    </ul>
                    <Button variant="link" asChild className="p-0 h-auto"><a href="https://www.gst.gov.in/" target="_blank" rel="noopener noreferrer">Visit GST Portal <ArrowRight className="ml-1"/></a></Button>
                </InfoBlock>
                <InfoBlock title="MSME (Udyam Registration)">
                    <p>Registering as a Micro, Small, or Medium Enterprise (MSME) is not mandatory but offers numerous government benefits.</p>
                     <p><strong>Key benefits include:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Easier access to bank loans with lower interest rates.</li>
                        <li>Protection against delayed payments from buyers.</li>
                        <li>Eligibility for various government schemes and subsidies.</li>
                    </ul>
                     <Button variant="link" asChild className="p-0 h-auto"><a href="https://udyamregistration.gov.in/" target="_blank" rel="noopener noreferrer">Visit Udyam Portal <ArrowRight className="ml-1"/></a></Button>
                </InfoBlock>
            </div>
            <div className="text-center pt-4">
                <Button onClick={onComplete}>Next Step <ArrowRight className="ml-2"/></Button>
            </div>
        </div>
    );
}

// --- Step 3: Virtual Address ---
const virtualOfficeProviders = [
  { name: "InstaSpaces", pricing: "Starts from ₹1,000/month", url: "#" },
  { name: "myHQ", pricing: "Starts from ₹1,500/month", url: "#" },
  { name: "Regus", pricing: "Starts from ₹2,500/month", url: "#" },
  { name: "Awfis", pricing: "Starts from ₹1,200/month", url: "#" },
  { name: "WeWork", pricing: "Starts from ₹3,000/month", url: "#" },
  { name: "BHIVE", pricing: "Starts from ₹999/month", url: "#" },
];

function Step3VirtualAddress({ onComplete }: { onComplete: () => void }) {
    return (
         <div className="max-w-5xl mx-auto">
             <div className="text-center">
                <h2 className="text-xl font-bold">Set Up Your Virtual Address</h2>
                <p className="text-muted-foreground mt-1">A virtual office gives you a professional business address without the cost of physical space.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {virtualOfficeProviders.map(provider => (
                    <Card key={provider.name} className="interactive-lift hover:border-primary">
                        <CardHeader>
                            <CardTitle>{provider.name}</CardTitle>
                            <CardDescription>{provider.pricing}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="secondary" className="w-full"><a href={provider.url} target="_blank" rel="noopener noreferrer">Visit Website</a></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
             <div className="text-center pt-8">
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
        if (!navigatorState.recommendationResult) {
            toast({ variant: 'destructive', title: "Missing Information", description: "Please complete Step 1 first."});
            return;
        }
        setIsLoading(true);
        setChecklist(undefined);
        const topic = `Generate a final business setup checklist for a "${navigatorState.recommendationResult.recommendedType}" with ${navigatorState.recommendationForm?.founderCount} founder(s). The company plans on ${navigatorState.recommendationForm?.investmentPlan}. Include sections for Legal/Registration, Banking, and Initial Operations.`;

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
                <Button onClick={handleGenerateChecklist} disabled={isLoading || !navigatorState.recommendationResult}>
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
    