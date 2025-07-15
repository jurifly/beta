
'use client';

import { useState, useRef, useEffect, useTransition, useMemo } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, FolderCheck, RefreshCw, Share2, GanttChartSquare, Gift, CheckCircle, Building2, Banknote, ShieldCheck, Handshake, PiggyBank } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, differenceInMonths } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import * as AiActions from '@/app/dashboard/ai-toolkit/actions';
import type { GenerateDDChecklistOutput, ChecklistCategory, UserProfile } from "@/lib/types";
import type { GenerateChecklistOutput as RawChecklistOutput } from '@/ai/flows/generate-checklist-flow';
import type { GrantRecommenderOutput } from '@/ai/flows/grant-recommender-flow';

// --- Dataroom Audit Tab ---

const initialDiligenceState: { data: RawChecklistOutput | null; error: string | null } = { data: null, error: null };
type ChecklistState = { data: GenerateDDChecklistOutput | null };

const dealTypesByRole = {
  Founder: [ { value: "Pre-seed / Seed Funding", label: "Pre-seed / Seed Funding" }, { value: "Series A Funding", label: "Series A Funding" }, { value: "Series B/C+ Funding", label: "Series B/C+ Funding" }, { value: "Venture Debt Financing", label: "Venture Debt Financing" }, { value: "Merger & Acquisition (Sell-Side)", label: "Merger & Acquisition (Sell-Side)" }, { value: "General Dataroom Prep", label: "General Dataroom Prep" }, ],
  CA: [ { value: "Financial Due Diligence", label: "Financial Due Diligence" }, { value: "Tax Due Diligence", label: "Tax Due Diligence" }, { value: "Statutory Audit", label: "Statutory Audit" }, { value: "Internal Audit", label: "Internal Audit" }, { value: "Forensic Audit", label: "Forensic Audit" }, { value: "Business Valuation Prep", label: "Business Valuation Prep" }, { value: "IFRS / Ind AS Transition", label: "IFRS / Ind AS Transition" }, ],
  'Legal Advisor': [ { value: "Legal Due Diligence (M&A)", label: "Legal Due Diligence (M&A)" }, { value: "IP Due Diligence", label: "IP Due Diligence" }, { value: "Contract Portfolio Audit", label: "Contract Portfolio Audit" }, { value: "Regulatory Compliance Review", label: "Regulatory Compliance Review" }, { value: "Corporate Governance Audit", label: "Corporate Governance Audit" }, { value: "Litigation Portfolio Review", label: "Litigation Portfolio Review" }, ],
  Enterprise: [ { value: "IPO Readiness Audit", label: "IPO Readiness Audit" }, { value: "SOC 2 Compliance Prep", label: "SOC 2 Compliance Prep" }, { value: "ISO 27001 Compliance Prep", label: "ISO 27001 Compliance Prep" }, { value: "Internal Controls (SOX/IFC)", label: "Internal Controls (SOX/IFC)" }, { value: "GDPR / DPDP Compliance Audit", label: "GDPR / DPDP Compliance Audit" }, { value: "Third-Party Vendor DD", label: "Third-Party Vendor DD" }, { value: "Post-Merger Integration Audit", label: "Post-Merger Integration Audit" }, ],
};

function DataroomAuditSubmitButton({ isRegenerate, isPending }: { isRegenerate: boolean, isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto interactive-lift">
      {isPending ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : isRegenerate ? (<RefreshCw className="mr-2 h-4 w-4" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
      {isRegenerate ? "Regenerate" : "Generate Checklist (2 Credits)"}
    </Button>
  );
}

const DataroomAuditTab = () => {
  const { userProfile, deductCredits, updateUserProfile } = useAuth();
  
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const isAdvisorRole = userProfile?.role !== 'Founder';

  const [checklistState, setChecklistState] = useState<GenerateDDChecklistOutput | null>(activeCompany?.diligenceChecklist || null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // This effect ensures that when the active company changes, the checklist state updates.
    setChecklistState(activeCompany?.diligenceChecklist || null);
  }, [activeCompany]);

  if (!userProfile) return <Loader2 className="animate-spin" />;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formRef.current || !activeCompany) return;
      if (!await deductCredits(2)) return;

      const formData = new FormData(formRef.current);
      startTransition(async () => {
          try {
            const rawData = await AiActions.generateDiligenceChecklistAction(initialDiligenceState, formData);
            if (rawData.error) throw new Error(rawData.error);
            if (rawData.data) {
                const groupedData = rawData.data.checklist.reduce<ChecklistCategory[]>((acc, item) => {
                    let category = acc.find(c => c.category === item.category); 
                    if (!category) { 
                        category = { category: item.category, items: [] }; 
                        acc.push(category); 
                    } 
                    category.items.push({ id: `${item.category.replace(/\s+/g, '-')}-${category.items.length}`, task: item.task, description: '', status: 'Pending' }); 
                    return acc; 
                }, []);
                
                const newChecklistState: GenerateDDChecklistOutput = { 
                    reportTitle: rawData.data.title, 
                    checklist: groupedData,
                    timestamp: new Date().toISOString()
                };
                
                setChecklistState(newChecklistState);

                // Save to Firebase
                const updatedCompany = { ...activeCompany, diligenceChecklist: newChecklistState };
                const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
                await updateUserProfile({ companies: updatedCompanies });

            }
          } catch (error: any) {
              toast({ variant: "destructive", title: "Checklist Generation Failed", description: error.message });
          }
      });
  };

  const updateChecklistInFirebase = (updatedChecklist: GenerateDDChecklistOutput) => {
    if (!userProfile || !activeCompany) return;
    const updatedCompany = { ...activeCompany, diligenceChecklist: updatedChecklist };
    const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
    updateUserProfile({ companies: updatedCompanies });
  };
  
  const handleCheckChange = (categoryId: string, itemId: string, completed: boolean) => { 
      setChecklistState(prevState => { 
        if (!prevState) return prevState; 
        const newChecklist: GenerateDDChecklistOutput = { 
          ...prevState, 
          checklist: prevState.checklist.map(category => { 
            if (category.category === categoryId) 
              return { 
                ...category, 
                items: category.items.map(item => item.id === itemId ? { ...item, status: completed ? 'Completed' : 'Pending' } : item) 
              }; 
            return category; 
          }) 
        };
        updateChecklistInFirebase(newChecklist);
        return newChecklist;
      }); 
  };
  
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link Copied!", description: "A shareable link to this checklist has been copied." }); }

  const handleCompanyChange = (companyId: string) => {
    updateUserProfile({ activeCompanyId: companyId });
  };

  const { completedCount, totalCount, progress } = useMemo(() => { if (!checklistState) return { completedCount: 0, totalCount: 0, progress: 0 }; const allItems = checklistState.checklist.flatMap(c => c.items); const completedItems = allItems.filter(i => i.status === 'Completed').length; const totalItems = allItems.length; if (totalItems === 0) return { completedCount: 0, totalCount: 0, progress: 0 }; return { completedCount: completedItems.length, totalCount: totalItems, progress: Math.round((completedItems.length / totalItems) * 100) }; }, [checklistState]);

  const filteredChecklist = useMemo(() => { if (!checklistState) return []; if (activeFilter === 'all') return checklistState.checklist; return checklistState.checklist.map(category => ({ ...category, items: category.items.filter(item => { if (activeFilter === 'completed') return item.status === 'Completed'; if (activeFilter === 'pending') return ['Pending', 'In Progress', 'Not Applicable'].includes(item.status); return true; }), })).filter(category => category.items.length > 0); }, [checklistState, activeFilter]);


  const availableDealTypes = dealTypesByRole[userProfile.role] || dealTypesByRole.Founder;

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <CardTitle>{checklistState?.reportTitle || "Dataroom Audit Tool"}</CardTitle>
                    <CardDescription>Generate a checklist to start your audit process.</CardDescription>
                </div>
                {isAdvisorRole && userProfile.companies.length > 1 && (
                    <Select onValueChange={handleCompanyChange} value={userProfile.activeCompanyId}>
                        <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Select a client..." /></SelectTrigger>
                        <SelectContent>
                            {userProfile.companies.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    <div className="flex items-center gap-2"><Building2 className="w-4 h-4"/>{c.name}</div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
          </CardHeader>
          <CardContent>
              <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
                <input type="hidden" name="legalRegion" value={userProfile.legalRegion} />
                <div className="space-y-1.5 w-full sm:w-auto sm:flex-1"><Label htmlFor="dealType">Deal / Audit Type</Label><Select name="dealType" defaultValue={availableDealTypes[0].value}><SelectTrigger id="dealType" className="min-w-[200px]"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{availableDealTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="w-full sm:w-auto self-end"><DataroomAuditSubmitButton isPending={isPending} isRegenerate={!!checklistState} /></div>
                <div className="flex items-center gap-2 self-end"><Button variant="outline" size="icon" disabled={!checklistState} className="interactive-lift" onClick={handleShare}><Share2 className="h-4 w-4"/></Button></div>
              </form>
          </CardContent>
      </Card>
      {isPending && !checklistState && ( <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Generating your checklist...</p></div> )}
      {checklistState && !isPending ? (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {checklistState.timestamp && <p className="text-xs text-muted-foreground text-center">📌 Last generated: {formatDistanceToNow(new Date(checklistState.timestamp), { addSuffix: true })} for {activeCompany?.name}</p>}
            <div className="space-y-3"><div className="flex justify-between items-center text-sm font-medium"><Label>Dataroom Readiness ({completedCount}/{totalCount} Completed)</Label><span className="font-bold text-primary">{progress}%</span></div><Progress value={progress} /></div>
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full"><TabsList className="grid grid-cols-3 w-full max-w-sm"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList></Tabs>
            <Accordion type="multiple" defaultValue={filteredChecklist.map(c => c.category)} className="w-full">
                {filteredChecklist.map((category) => (
                <AccordionItem key={category.category} value={category.category} className="border-b-0">
                    <AccordionTrigger className="font-semibold text-base hover:no-underline rounded-md px-4 data-[state=open]:bg-muted interactive-lift">{category.category}</AccordionTrigger>
                    <AccordionContent className="pt-4"><div className="space-y-3">
                        {category.items.map(item => (
                            <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors interactive-lift">
                                <Checkbox id={item.id} className="mt-1" checked={item.status === 'Completed'} onCheckedChange={(checked) => handleCheckChange(category.category, item.id, !!checked)} />
                                <div className="grid gap-1.5 leading-none flex-1"><label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">{item.task}</label><p className="text-sm text-muted-foreground">{item.description}</p></div>
                                <Badge variant={item.status === 'Completed' ? 'secondary' : item.status === 'In Progress' ? 'default' : 'outline'} className={cn("ml-auto shrink-0 self-center", item.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-transparent')}>{item.status}</Badge>
                            </div>
                        ))}
                    </div></AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
        </div>
      ) : !isPending && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1"> <FolderCheck className="w-16 h-16 text-primary/20" /><p className="font-semibold text-lg">Build Your Dataroom</p><p className="text-sm max-w-sm">Select a deal or audit type and our AI will generate a comprehensive checklist to guide you through the process.</p></div>
      )}
    </div>
  );
};

// --- Grant Recommender Tab ---

const grantRecommenderSchema = z.object({
  industry: z.string().min(1, "Industry is required."),
  location: z.string().min(1, "Location is required."),
  hasFemaleFounder: z.boolean().default(false),
  isDpiitRecognized: z.boolean().default(false),
});
type GrantRecommenderFormData = z.infer<typeof grantRecommenderSchema>;

const GrantRecommenderTab = () => {
    const { userProfile, deductCredits } = useAuth();
    const [result, setResult] = useState<GrantRecommenderOutput | null>(null);
    const { toast } = useToast();
    
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<GrantRecommenderFormData>({
        resolver: zodResolver(grantRecommenderSchema),
        defaultValues: {
            industry: activeCompany?.sector || '',
            location: activeCompany?.location.split(',')[1]?.trim() || '',
        }
    });

    const onSubmit = async (data: GrantRecommenderFormData) => {
        if (!userProfile || !activeCompany) return;
        if (!await deductCredits(1)) return;

        setResult(null);

        try {
            const response = await AiActions.recommendGrantsAction({
                ...data,
                businessAgeInMonths: differenceInMonths(new Date(), new Date(activeCompany.incorporationDate)),
                legalRegion: userProfile.legalRegion,
            });
            setResult(response);
            toast({ title: "Recommendations Ready!", description: "We've found some schemes you might be eligible for." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const categoryIcons: Record<string, React.ElementType> = {
        "Tax Exemption": PiggyBank,
        "Grant / Funding": Banknote,
        "Certification": ShieldCheck,
        "State-Specific": Building2,
        "Loan Scheme": Handshake,
        "Default": Gift
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
                 <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Government Scheme Finder</CardTitle>
                        <CardDescription>Tell us about your startup to find relevant government grants, loans, and tax exemptions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="industry">Industry / Sector</Label>
                           <Controller name="industry" control={control} render={({ field }) => <Input id="industry" placeholder="e.g. B2B SaaS, Fintech" {...field} />} />
                           {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="location">State of Operation</Label>
                           <Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} />} />
                           {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                           <Controller name="hasFemaleFounder" control={control} render={({ field }) => <Checkbox id="hasFemaleFounder" checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label htmlFor="hasFemaleFounder">We have at least one female co-founder.</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Controller name="isDpiitRecognized" control={control} render={({ field }) => <Checkbox id="isDpiitRecognized" checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label htmlFor="isDpiitRecognized">We are already DPIIT recognized.</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Find Schemes (1 Credit)
                        </Button>
                    </CardFooter>
                 </Card>
            </form>
             <div className="lg:col-span-3">
                 <Card className="min-h-[400px] interactive-lift">
                    <CardHeader>
                        <CardTitle>AI Recommendations</CardTitle>
                    </CardHeader>
                     <CardContent>
                        {isSubmitting && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Searching for schemes...</p></div>}
                        {!result && !isSubmitting && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Gift className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your grant recommendations will appear here.</p></div>}
                        {result && (
                            <div className="space-y-4 animate-in fade-in-50">
                                {result.recommendations.map((rec, i) => {
                                    const Icon = categoryIcons[rec.category] || categoryIcons.Default;
                                    return (
                                        <Card key={i} className={cn(rec.isEligible ? 'border-primary/30 bg-primary/5' : 'bg-muted/50')}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{rec.schemeName}</CardTitle>
                                                    {rec.isEligible && <Badge><CheckCircle className="mr-1.5"/> Likely Eligible</Badge>}
                                                </div>
                                                <CardDescription><Badge variant="outline">{rec.category}</Badge></CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2"><strong>Eligibility:</strong> {rec.eligibilitySummary}</p>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                     </CardContent>
                 </Card>
            </div>
        </div>
    )
}

// --- Main Page Component ---
export default function PlaybookPage() {
    const { userProfile } = useAuth();
    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Playbooks</h1>
                <p className="text-muted-foreground">Actionable guides and checklists for key business milestones.</p>
            </div>
            
            <Tabs defaultValue="audit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="audit"><GanttChartSquare className="mr-2"/>Dataroom Audit</TabsTrigger>
                    <TabsTrigger value="schemes"><Gift className="mr-2"/>Grant Recommender</TabsTrigger>
                </TabsList>
                <TabsContent value="audit" className="mt-6">
                    <DataroomAuditTab />
                </TabsContent>
                <TabsContent value="schemes" className="mt-6">
                    <GrantRecommenderTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

