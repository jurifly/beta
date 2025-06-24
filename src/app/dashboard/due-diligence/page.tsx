
"use client"

import { useMemo, useState, useEffect, useTransition, useCallback, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, FolderCheck, Download, FileUp, MessageSquare, Lock, ShieldCheck, Share2, UploadCloud, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { GenerateDDChecklistOutput, ChecklistCategory, ChecklistItem } from "@/lib/types"
import type { GenerateChecklistOutput as RawChecklistOutput } from "@/ai/flows/generate-checklist-flow"
import type { ComplianceValidatorOutput } from "@/ai/flows/compliance-validator-flow"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useDropzone, type FileRejection } from "react-dropzone"
import { generateDiligenceChecklist, validateComplianceAction } from "./actions"
import { UpgradePrompt } from "@/components/upgrade-prompt"


const initialDiligenceState: { data: RawChecklistOutput | null; error: string | null } = {
  data: null,
  error: null,
}

const initialComplianceState: { data: ComplianceValidatorOutput | null; error: string | null } = { data: null, error: null };

type ChecklistState = {
  data: GenerateDDChecklistOutput | null;
  timestamp: string | null;
};

const dealTypesByRole = {
  Founder: [
    { value: "Pre-seed / Seed Funding", label: "Pre-seed / Seed Funding" },
    { value: "Series A Funding", label: "Series A Funding" },
    { value: "Series B/C+ Funding", label: "Series B/C+ Funding" },
    { value: "Venture Debt Financing", label: "Venture Debt Financing" },
    { value: "Merger & Acquisition (Sell-Side)", label: "Merger & Acquisition (Sell-Side)" },
    { value: "General Dataroom Prep", label: "General Dataroom Prep" },
  ],
  CA: [
    { value: "Financial Due Diligence", label: "Financial Due Diligence" },
    { value: "Tax Due Diligence", label: "Tax Due Diligence" },
    { value: "Statutory Audit", label: "Statutory Audit" },
    { value: "Internal Audit", label: "Internal Audit" },
    { value: "Forensic Audit", label: "Forensic Audit" },
    { value: "Business Valuation Prep", label: "Business Valuation Prep" },
    { value: "IFRS / Ind AS Transition", label: "IFRS / Ind AS Transition" },
  ],
  'Legal Advisor': [
    { value: "Legal Due Diligence (M&A)", label: "Legal Due Diligence (M&A)" },
    { value: "IP Due Diligence", label: "IP Due Diligence" },
    { value: "Contract Portfolio Audit", label: "Contract Portfolio Audit" },
    { value: "Regulatory Compliance Review", label: "Regulatory Compliance Review" },
    { value: "Corporate Governance Audit", label: "Corporate Governance Audit" },
    { value: "Litigation Portfolio Review", label: "Litigation Portfolio Review" },
  ],
  Enterprise: [
    { value: "IPO Readiness Audit", label: "IPO Readiness Audit" },
    { value: "SOC 2 Compliance Prep", label: "SOC 2 Compliance Prep" },
    { value: "ISO 27001 Compliance Prep", label: "ISO 27001 Compliance Prep" },
    { value: "Internal Controls (SOX/IFC)", label: "Internal Controls (SOX/IFC)" },
    { value: "GDPR / DPDP Compliance Audit", label: "GDPR / DPDP Compliance Audit" },
    { value: "Third-Party Vendor DD", label: "Third-Party Vendor DD" },
    { value: "Post-Merger Integration Audit", label: "Post-Merger Integration Audit" },
  ],
};


function SubmitButton({ isRegenerate }: { isRegenerate: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto interactive-lift">
      {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isRegenerate ? (
          <RefreshCw className="mr-2 h-4 w-4" />
      ) : (
          <Sparkles className="mr-2 h-4 w-4" />
      )}
      {isRegenerate ? "Regenerate" : "Generate Checklist"}
    </Button>
  )
}

function ComplianceValidator() {
    const { toast } = useToast();
    const { deductCredits } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [fileDataUri, setFileDataUri] = useState<string | null>(null);
    const [framework, setFramework] = useState('SOC2');

    const [state, formAction] = useActionState(validateComplianceAction, initialComplianceState);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (state.error) {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: state.error,
            });
        }
        if (state.data) {
             toast({
                title: "Analysis Complete",
                description: "Your compliance report is ready.",
            });
        }
    }, [state, toast]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast({
          variant: "destructive",
          title: "File Upload Error",
          description: fileRejections[0].errors[0].message,
        })
        return
      }
       if (acceptedFiles[0]) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setFileDataUri(loadEvent.target?.result as string);
        }
        reader.readAsDataURL(uploadedFile);
      }
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]},
        maxFiles: 1,
    });

    const handleAnalysis = async () => {
        if (!fileDataUri) {
            toast({ variant: 'destructive', title: 'File Missing', description: 'Please upload a document to analyze.' });
            return;
        }
        if (!await deductCredits(10)) return;

        startTransition(() => {
            const formData = new FormData();
            formData.append('fileDataUri', fileDataUri);
            formData.append('framework', framework);
            formAction(formData);
        });
    };

    return (
         <div className="space-y-6">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/> SOC2 / ISO / GDPR Toolkit</CardTitle>
                    <CardDescription>Upload your IT and policy documents. Our AI will validate them against compliance checklists and suggest fixes. Costs 10 credits per analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div {...getRootProps()} className={cn("p-6 border-2 border-dashed rounded-lg text-center bg-muted/40 cursor-pointer", isDragActive && "border-primary bg-primary/10")}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-primary/20" />
                        <p className="mt-4 font-semibold">
                            {file ? `Selected: ${file.name}` : "Drag & drop policy documents here"}
                        </p>
                        <p className="text-sm text-muted-foreground">or click to select a file</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Select Framework</Label>
                        <Select value={framework} onValueChange={setFramework}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SOC2">SOC2 Type I/II</SelectItem>
                                <SelectItem value="ISO27001">ISO 27001</SelectItem>
                                <SelectItem value="GDPR">GDPR</SelectItem>
                                <SelectItem value="DPDP">DPDP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleAnalysis} disabled={isPending || !file}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>} 
                        Run Compliance Analysis
                    </Button>
                </CardContent>
            </Card>
            {isPending ? (
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="font-semibold text-lg text-foreground">Running analysis...</p>
                 </div>
            ) : (state.data) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{framework} Analysis Report</CardTitle>
                        <CardDescription>Readiness Score: <span className="font-bold text-primary">{state.data.readinessScore}/100</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <p className="text-sm text-muted-foreground">{state.data.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Recommendations</h4>
                            <div className="space-y-2">
                                {state.data.missingItems.map((item, index) => (
                                    <div key={index} className="p-3 border rounded-md bg-muted/50">
                                        <p className="font-medium text-sm">{item.item}</p>
                                        <p className="text-xs text-muted-foreground">{item.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function DueDiligencePage() {
  const [serverState, formAction] = useActionState(generateDiligenceChecklist, initialDiligenceState);
  const [checklistState, setChecklistState] = useState<ChecklistState>({ data: null, timestamp: null });
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const { userProfile, deductCredits } = useAuth();
  const { toast } = useToast();
  const { pending } = useFormStatus();
  
  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isEnterprise = userProfile.plan === 'Enterprise';
  const checklistKey = `ddChecklistData-${userProfile.activeCompanyId}`;

  useEffect(() => {
    if (checklistKey) {
        try {
            const savedState = localStorage.getItem(checklistKey);
            if (savedState) {
                setChecklistState(JSON.parse(savedState));
            }
        } catch (error) {
            console.error("Failed to parse checklist data from localStorage", error);
            localStorage.removeItem(checklistKey);
        }
    }
  }, [checklistKey]);
  
  // Handle state changes from the server action
  useEffect(() => {
    if (serverState.error) {
      toast({
        variant: "destructive",
        title: "Checklist Generation Failed",
        description: serverState.error,
      });
    }

    if (serverState.data) {
      deductCredits(2); // Cost for generating a checklist
      const rawData = serverState.data;

      const groupedData = rawData.checklist.reduce<ChecklistCategory[]>((acc, item) => {
        let category = acc.find(c => c.category === item.category);
        if (!category) {
            category = { category: item.category, items: [] };
            acc.push(category);
        }
        category.items.push({
            id: `${item.category.replace(/\s+/g, '-')}-${category.items.length}`,
            task: item.task,
            description: '', // Not provided by this AI flow
            status: 'Pending'
        });
        return acc;
      }, []);

      const newChecklistState: ChecklistState = {
        data: {
          reportTitle: rawData.title,
          checklist: groupedData
        },
        timestamp: new Date().toISOString()
      };
      setChecklistState(newChecklistState);
    }
  }, [serverState, toast, deductCredits]);


  useEffect(() => {
    if (checklistKey && checklistState.data) {
        localStorage.setItem(checklistKey, JSON.stringify(checklistState));
    }
  }, [checklistState, checklistKey]);

  const handleCheckChange = (categoryId: string, itemId: string, completed: boolean) => {
    setChecklistState(prevState => {
      if (!prevState.data) return prevState;

      const newData: GenerateDDChecklistOutput = {
          ...prevState.data,
          checklist: prevState.data.checklist.map(category => {
            if (category.category === categoryId) {
                return {
                ...category,
                items: category.items.map(item => {
                    if (item.id === itemId) {
                    return { ...item, status: completed ? 'Completed' : 'Pending' };
                    }
                    return item;
                }),
                };
            }
            return category;
            })
      };
      return { ...prevState, data: newData };
    });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "A shareable link to this checklist has been copied." });
  }

  const { completedCount, totalCount, progress } = useMemo(() => {
    if (!checklistState.data) return { completedCount: 0, totalCount: 0, progress: 0 };
    
    const allItems = checklistState.data.checklist.flatMap(c => c.items);
    const completedItems = allItems.filter(i => i.status === 'Completed');
    const totalItems = allItems.length;

    if (totalItems === 0) return { completedCount: 0, totalCount: 0, progress: 0, pendingItems: [] };
    
    return {
      completedCount: completedItems.length,
      totalCount: totalItems,
      progress: Math.round((completedItems.length / totalItems) * 100),
    };
  }, [checklistState.data]);

  const filteredChecklist = useMemo(() => {
    if (!checklistState.data) return [];
    if (activeFilter === 'all') return checklistState.data.checklist;

    return checklistState.data.checklist.map(category => ({
      ...category,
      items: category.items.filter(item => {
        if (activeFilter === 'completed') return item.status === 'Completed';
        if (activeFilter === 'pending') return ['Pending', 'In Progress', 'Not Applicable'].includes(item.status);
        return true;
      }),
    })).filter(category => category.items.length > 0);

  }, [checklistState.data, activeFilter]);

  const availableDealTypes = dealTypesByRole[userProfile.role] || dealTypesByRole.Founder;

  if (['Starter'].includes(userProfile.plan)) {
     return <UpgradePrompt 
      title="Unlock the Audit Hub"
      description="Generate comprehensive due diligence checklists and prepare for audits with our AI-powered tools. This feature is available on the Founder plan and above."
      icon={<FolderCheck className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
      <Card className="flex flex-col min-h-[calc(100vh-14rem)] w-full">
        <Tabs defaultValue="dataroom" className="flex flex-col flex-1">
          <CardHeader className="flex-row items-center justify-between border-b">
              <div>
                  <CardTitle className="font-headline text-xl">
                      {checklistState.data?.reportTitle || "Audit Hub"}
                  </CardTitle>
                  <CardDescription>
                      {checklistState.data ? "Your audit checklist is ready." : "Generate a checklist to start your audit process."}
                  </CardDescription>
              </div>
              <TabsList>
                  <TabsTrigger value="dataroom" className="interactive-lift">Dataroom Checklist</TabsTrigger>
                  <TabsTrigger value="compliance" className="interactive-lift" disabled={!isEnterprise}>
                    Compliance Toolkits
                    {!isEnterprise && <Lock className="ml-2 h-3 w-3 text-amber-500" />}
                  </TabsTrigger>
              </TabsList>
          </CardHeader>
          <TabsContent value="dataroom" className="p-6 flex-1 flex flex-col data-[state=inactive]:hidden m-0">
              <form action={formAction} className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b">
                <div className="space-y-1.5 w-full sm:w-auto sm:flex-1">
                    <Label htmlFor="dealType">Deal / Audit Type</Label>
                    <Select name="dealType" defaultValue={availableDealTypes[0].value}>
                        <SelectTrigger id="dealType" className="min-w-[200px]">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDealTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-auto self-end">
                  <SubmitButton isRegenerate={!!checklistState.data} />
                </div>
                <div className="flex items-center gap-2 self-end">
                    <Button variant="outline" size="icon" disabled={!checklistState.data} className="interactive-lift" onClick={handleShare}>
                        <Share2 className="h-4 w-4"/>
                    </Button>
                </div>
              </form>
              
              {pending && !checklistState.data && (
                 <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="font-semibold text-lg text-foreground">Generating your checklist...</p>
                 </div>
              )}
              
              {checklistState.data && !pending ? (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                    {checklistState.timestamp && (
                        <p className="text-xs text-muted-foreground text-center">
                          📌 Last generated: {formatDistanceToNow(new Date(checklistState.timestamp), { addSuffix: true })}
                        </p>
                    )}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                          <Label>Dataroom Readiness ({completedCount}/{totalCount} Completed)</Label>
                          <span className="font-bold text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                  </div>
                  
                  <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full max-w-sm">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Accordion type="multiple" defaultValue={filteredChecklist.map(c => c.category)} className="w-full">
                      {filteredChecklist.map((category) => (
                      <AccordionItem key={category.category} value={category.category} className="border-b-0">
                          <AccordionTrigger className="font-semibold text-base hover:no-underline rounded-md px-4 data-[state=open]:bg-muted interactive-lift">
                              {category.category}
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                          <div className="space-y-3">
                              {category.items.map(item => (
                              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors interactive-lift">
                                  <Checkbox 
                                    id={item.id} 
                                    className="mt-1" 
                                    checked={item.status === 'Completed'}
                                    onCheckedChange={(checked) => handleCheckChange(category.category, item.id, !!checked)}
                                  />
                                  <div className="grid gap-1.5 leading-none flex-1">
                                  <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                      {item.task}
                                  </label>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  </div>
                                  <Badge variant={item.status === 'Completed' ? 'secondary' : item.status === 'In Progress' ? 'default' : 'outline'} className={cn("ml-auto shrink-0 self-center", item.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-transparent')}>{item.status}</Badge>
                                  <div className="flex items-center gap-1 self-center">
                                      <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 interactive-lift" disabled>
                                                    <FileUp className="h-4 w-4"/>
                                                    <span className="sr-only">Upload Document</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Document upload coming soon!</p>
                                            </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 interactive-lift" disabled>
                                                <MessageSquare className="h-4 w-4"/>
                                                <span className="sr-only">Add Comment</span>
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Commenting coming soon!</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                  </div>
                              </div>
                              ))}
                          </div>
                          </AccordionContent>
                      </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              ) : (
                 !pending && (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                      <FolderCheck className="w-16 h-16 text-primary/20" />
                      <p className="font-semibold text-lg">Build Your Dataroom</p>
                      <p className="text-sm max-w-sm">Select a deal or audit type and our AI will generate a comprehensive checklist to guide you through the process.</p>
                    </div>
                 )
              )}
          </TabsContent>

          <TabsContent value="compliance" className="p-6 flex-1 flex flex-col data-[state=inactive]:hidden m-0">
             {!isEnterprise ? <p>This is an enterprise feature.</p> : (
                <ComplianceValidator />
             )}
          </TabsContent>
        </Tabs>
      </Card>
  )
}

    