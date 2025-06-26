
'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent, useMemo, useTransition, useCallback, useActionState, Fragment } from 'react';
import { useFormStatus } from "react-dom"
import { Bot, Check, Clipboard, FileText, Loader2, Send, Sparkles, User, History, MessageSquare, Clock, FolderCheck, Download, FileUp, Share2, UploadCloud, RefreshCw, Lock, ShieldCheck, GanttChartSquare, FilePenLine, Search, RadioTower, Building2, Banknote, DatabaseZap, Globe, Telescope, FileScan, BookText, Library, Zap, Workflow, Play, Trash2, Activity, PlusCircle, ArrowRight, FileWarning, AlertCircle, CalendarPlus, StickyNote, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useSearchParams } from 'next/navigation';


import * as AiActions from './actions';
import type { AssistantOutput } from '@/ai/flows/assistant-flow';
import type { GenerateDDChecklistOutput, ChecklistCategory, ChecklistItem, UserRole, UserProfile, Workflow as WorkflowType, ActivityLogItem, ChatMessage, DocumentAnalysis, RiskFlag } from "@/lib/types"
import { planHierarchy } from '@/lib/types';
import type { GenerateChecklistOutput as RawChecklistOutput } from "@/ai/flows/generate-checklist-flow"
import type { ComplianceValidatorOutput } from "@/ai/flows/compliance-validator-flow"
import type { DocumentGeneratorOutput } from "@/ai/flows/document-generator-flow";
import type { WatcherOutput } from '@/ai/flows/regulation-watcher-flow';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { useTypewriter } from '@/hooks/use-typewriter';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Tab: AI Legal Assistant ---

const TypewriterResponse = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 10);
    return <p className="whitespace-pre-wrap font-code text-sm text-card-foreground">{displayText}</p>;
};

const ChecklistResult = ({ checklist }: { checklist: AssistantOutput['checklist'] }) => {
  const { toast } = useToast();
  if (!checklist) return null;
  
  const copyToClipboard = (checklist: AssistantOutput['checklist']) => {
    if (!checklist) return;
    const textToCopy = `${checklist.title}\n\n${checklist.items.map(item => `- [ ] ${item.task} (${item.category})`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The checklist has been copied.',
    });
  };
  
  return (
    <div className="bg-muted rounded-xl max-w-4xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-md font-sans">{checklist.title}</h3>
        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(checklist)}>
          <Clipboard className="h-4 w-4" />
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </div>
      <div className="p-4 text-sm font-sans">
        <ul className="space-y-3">
          {checklist.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
              <div>
                <span className="font-semibold">{item.category}:</span> {item.task}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ChatAssistant = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const { userProfile, saveChatHistory } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isProcessing]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  const handleTextSubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    if (e) e.preventDefault();
    const topic = suggestion || input;
    if (!topic.trim()) return;

    setIsProcessing(true);

    const userMessage: ChatMessage = { role: 'user', content: topic };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setInput('');

    try {
      const response = await AiActions.getAssistantResponse({ topic, legalRegion: userProfile?.legalRegion || 'India' });
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      const finalChatHistory = [...newChatHistory, assistantMessage];
      setChatHistory(finalChatHistory);
      await saveChatHistory(finalChatHistory); // Save to Firestore

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to generate the response. Please try again.',
        variant: 'destructive',
      });
      setChatHistory(prev => prev.slice(0, -1)); // remove user message on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleTextSubmit(undefined, input);
    }
  };

  const suggestionPrompts = [
    { text: 'What are the steps to register a Private Limited Company?', icon: FileText, action: () => handleTextSubmit(undefined, 'What are the steps to register a Private Limited Company?') },
    { text: 'What are the compliance requirements for hiring the first employee?', icon: Clock, action: () => handleTextSubmit(undefined, 'What are the compliance requirements for hiring the first employee?') },
    { text: 'What happens if I don\'t file my GST returns on time?', icon: FileText, action: () => handleTextSubmit(undefined, 'What happens if I don\'t file my GST returns on time?') },
  ];

  return (
    <div className={cn("flex flex-col bg-card border rounded-lg shadow-sm h-full max-h-[calc(100vh-14rem)] min-h-[calc(100vh-14rem)]")}>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {chatHistory.length === 0 && !isProcessing && (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Your AI Legal Assistant</h2>
              <p className="text-muted-foreground mb-6">Ask a legal question or try a suggestion.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-4">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={prompt.action}
                    className="p-4 border rounded-lg text-left hover:bg-muted transition-colors flex items-center gap-3 interactive-lift"
                  >
                    <prompt.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
        )}

        <div className="p-6 space-y-8">
            {chatHistory.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : '')}>
                {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border">
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                </Avatar>
                )}
                
                <div className={cn(message.role === 'user' ? 'bg-primary text-primary-foreground rounded-xl p-4 max-w-2xl' : 'w-full max-w-4xl')}>
                  {typeof message.content === 'string' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <TypewriterResponse text={message.content.response} />
                      {message.content.checklist && <ChecklistResult checklist={message.content.checklist} />}
                    </div>
                  )}
                </div>

                {message.role === 'user' && userProfile && (
                <Avatar className="w-8 h-8 border">
                    <AvatarImage src={`https://avatar.vercel.sh/${userProfile.email}.png`} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                )}
            </div>
            ))}
        </div>
        
        {isProcessing && (
            <div className="flex items-center space-x-4 p-6">
              <Avatar className="w-8 h-8 border">
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                      <Bot className="w-5 h-5 text-primary" />
                  </div>
                </Avatar>
              <div className="p-4 bg-muted rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t bg-card rounded-b-lg">
        <form onSubmit={handleTextSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="e.g., 'What are the compliance requirements for a private limited company?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none pr-14 pl-4 py-3 max-h-48 overflow-y-auto"
            rows={1}
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button type="submit" size="icon" disabled={isProcessing || !input.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Tab: Dataroom Audit ---

const initialDiligenceState: { data: RawChecklistOutput | null; error: string | null } = { data: null, error: null };
const initialComplianceState: { data: ComplianceValidatorOutput | null; error: string | null } = { data: null, error: null };
type ChecklistState = { data: GenerateDDChecklistOutput | null; timestamp: string | null; };

const dealTypesByRole = {
  Founder: [ { value: "Pre-seed / Seed Funding", label: "Pre-seed / Seed Funding" }, { value: "Series A Funding", label: "Series A Funding" }, { value: "Series B/C+ Funding", label: "Series B/C+ Funding" }, { value: "Venture Debt Financing", label: "Venture Debt Financing" }, { value: "Merger & Acquisition (Sell-Side)", label: "Merger & Acquisition (Sell-Side)" }, { value: "General Dataroom Prep", label: "General Dataroom Prep" }, ],
  CA: [ { value: "Financial Due Diligence", label: "Financial Due Diligence" }, { value: "Tax Due Diligence", label: "Tax Due Diligence" }, { value: "Statutory Audit", label: "Statutory Audit" }, { value: "Internal Audit", label: "Internal Audit" }, { value: "Forensic Audit", label: "Forensic Audit" }, { value: "Business Valuation Prep", label: "Business Valuation Prep" }, { value: "IFRS / Ind AS Transition", label: "IFRS / Ind AS Transition" }, ],
  'Legal Advisor': [ { value: "Legal Due Diligence (M&A)", label: "Legal Due Diligence (M&A)" }, { value: "IP Due Diligence", label: "IP Due Diligence" }, { value: "Contract Portfolio Audit", label: "Contract Portfolio Audit" }, { value: "Regulatory Compliance Review", label: "Regulatory Compliance Review" }, { value: "Corporate Governance Audit", label: "Corporate Governance Audit" }, { value: "Litigation Portfolio Review", label: "Litigation Portfolio Review" }, ],
  Enterprise: [ { value: "IPO Readiness Audit", label: "IPO Readiness Audit" }, { value: "SOC 2 Compliance Prep", label: "SOC 2 Compliance Prep" }, { value: "ISO 27001 Compliance Prep", label: "ISO 27001 Compliance Prep" }, { value: "Internal Controls (SOX/IFC)", label: "Internal Controls (SOX/IFC)" }, { value: "GDPR / DPDP Compliance Audit", label: "GDPR / DPDP Compliance Audit" }, { value: "Third-Party Vendor DD", label: "Third-Party Vendor DD" }, { value: "Post-Merger Integration Audit", label: "Post-Merger Integration Audit" }, ],
};

function DataroomAuditSubmitButton({ isRegenerate }: { isRegenerate: boolean }) {
  const { pending } = useFormStatus();
  return ( <Button type="submit" disabled={pending} className="w-full sm:w-auto interactive-lift"> {pending ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : isRegenerate ? (<RefreshCw className="mr-2 h-4 w-4" />) : (<Sparkles className="mr-2 h-4 w-4" />)} {isRegenerate ? "Regenerate" : "Generate Checklist"} </Button> );
}

const DataroomAudit = () => {
  const { userProfile, deductCredits } = useAuth();
  const [serverState, formAction] = useActionState(AiActions.generateDiligenceChecklistAction, initialDiligenceState);
  const [checklistState, setChecklistState] = useState<ChecklistState>({ data: null, timestamp: null });
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { toast } = useToast();
  const { pending } = useFormStatus();
  
  const userPlanLevel = userProfile ? planHierarchy[userProfile.plan] : 0;

  if (!userProfile) return <Loader2 className="animate-spin" />;

  const checklistKey = `ddChecklistData-${userProfile.activeCompanyId}`;

  useEffect(() => { try { const savedState = localStorage.getItem(checklistKey); if (savedState) setChecklistState(JSON.parse(savedState)); } catch (error) { console.error("Failed to parse checklist data from localStorage", error); localStorage.removeItem(checklistKey); } }, [checklistKey]);
  
  useEffect(() => {
    if (serverState.error) toast({ variant: "destructive", title: "Checklist Generation Failed", description: serverState.error });
    if (serverState.data) {
      deductCredits(2);
      const rawData = serverState.data;
      const groupedData = rawData.checklist.reduce<ChecklistCategory[]>((acc, item) => { let category = acc.find(c => c.category === item.category); if (!category) { category = { category: item.category, items: [] }; acc.push(category); } category.items.push({ id: `${item.category.replace(/\s+/g, '-')}-${category.items.length}`, task: item.task, description: '', status: 'Pending' }); return acc; }, []);
      const newChecklistState: ChecklistState = { data: { reportTitle: rawData.title, checklist: groupedData }, timestamp: new Date().toISOString() };
      setChecklistState(newChecklistState);
    }
  }, [serverState, toast, deductCredits]);

  useEffect(() => { if (checklistKey && checklistState.data) localStorage.setItem(checklistKey, JSON.stringify(checklistState)); }, [checklistState, checklistKey]);

  const handleCheckChange = (categoryId: string, itemId: string, completed: boolean) => { setChecklistState(prevState => { if (!prevState.data) return prevState; const newData: GenerateDDChecklistOutput = { ...prevState.data, checklist: prevState.data.checklist.map(category => { if (category.category === categoryId) return { ...category, items: category.items.map(item => item.id === itemId ? { ...item, status: completed ? 'Completed' : 'Pending' } : item) }; return category; }) }; return { ...prevState, data: newData }; }); };
  
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link Copied!", description: "A shareable link to this checklist has been copied." }); }

  const { completedCount, totalCount, progress } = useMemo(() => { if (!checklistState.data) return { completedCount: 0, totalCount: 0, progress: 0 }; const allItems = checklistState.data.checklist.flatMap(c => c.items); const completedItems = allItems.filter(i => i.status === 'Completed'); const totalItems = allItems.length; if (totalItems === 0) return { completedCount: 0, totalCount: 0, progress: 0 }; return { completedCount: completedItems.length, totalCount: totalItems, progress: Math.round((completedItems.length / totalItems) * 100) }; }, [checklistState.data]);

  const filteredChecklist = useMemo(() => { if (!checklistState.data) return []; if (activeFilter === 'all') return checklistState.data.checklist; return checklistState.data.checklist.map(category => ({ ...category, items: category.items.filter(item => { if (activeFilter === 'completed') return item.status === 'Completed'; if (activeFilter === 'pending') return ['Pending', 'In Progress', 'Not Applicable'].includes(item.status); return true; }), })).filter(category => category.items.length > 0); }, [checklistState.data, activeFilter]);

  if (userPlanLevel < 1) {
      return <UpgradePrompt title="Unlock the Dataroom Audit" description="Generate comprehensive due diligence checklists and prepare for audits with our AI-powered tools. This feature is available on the Founder plan and above." icon={<FolderCheck className="w-12 h-12 text-primary/20"/>} />;
  }

  const availableDealTypes = dealTypesByRole[userProfile.role] || dealTypesByRole.Founder;

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader><CardTitle>{checklistState.data?.reportTitle || "Dataroom Audit Tool"}</CardTitle><CardDescription>Generate a checklist to start your audit process. Costs 2 credits.</CardDescription></CardHeader>
          <CardContent>
              <form action={formAction} className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
                <input type="hidden" name="legalRegion" value={userProfile.legalRegion} />
                <div className="space-y-1.5 w-full sm:w-auto sm:flex-1"><Label htmlFor="dealType">Deal / Audit Type</Label><Select name="dealType" defaultValue={availableDealTypes[0].value}><SelectTrigger id="dealType" className="min-w-[200px]"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{availableDealTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="w-full sm:w-auto self-end"><DataroomAuditSubmitButton isRegenerate={!!checklistState.data} /></div>
                <div className="flex items-center gap-2 self-end"><Button variant="outline" size="icon" disabled={!checklistState.data} className="interactive-lift" onClick={handleShare}><Share2 className="h-4 w-4"/></Button></div>
              </form>
          </CardContent>
      </Card>
      {pending && !checklistState.data && ( <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Generating your checklist...</p></div> )}
      {checklistState.data && !pending ? (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {checklistState.timestamp && <p className="text-xs text-muted-foreground text-center">📌 Last generated: {formatDistanceToNow(new Date(checklistState.timestamp), { addSuffix: true })}</p>}
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
                            <div className="flex items-center gap-1 self-center">
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 interactive-lift" disabled><FileUp className="h-4 w-4"/><span className="sr-only">Upload Document</span></Button></TooltipTrigger><TooltipContent><p>Document upload coming soon!</p></TooltipContent></Tooltip></TooltipProvider>
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 interactive-lift" disabled><MessageSquare className="h-4 w-4"/><span className="sr-only">Add Comment</span></Button></TooltipTrigger><TooltipContent><p>Commenting coming soon!</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>
                        ))}
                    </div></AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
        </div>
      ) : !pending && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1"> <FolderCheck className="w-16 h-16 text-primary/20" /><p className="font-semibold text-lg">Build Your Dataroom</p><p className="text-sm max-w-sm">Select a deal or audit type and our AI will generate a comprehensive checklist to guide you through the process.</p></div>
      )}
    </div>
  );
}


// --- Tab: Document Intelligence ---
const DocumentIntelligenceTab = () => {
  const { userProfile, deductCredits } = useAuth();
  const { toast } = useToast();
  const [analyzedDocs, setAnalyzedDocs] = useState<DocumentAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);

  const STORAGE_KEY = 'documentIntelligenceHistory';
  const userPlanLevel = userProfile ? planHierarchy[userProfile.plan] : 0;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAnalyzedDocs(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const saveDocs = (docs: DocumentAnalysis[]) => {
    setAnalyzedDocs(docs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  };

  const handleAnalysis = useCallback(async (file: File) => {
    if (!userProfile) return;
    if (!await deductCredits(10)) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (loadEvent) => {
      try {
        const fileDataUri = loadEvent.target?.result as string;
        if (!fileDataUri) throw new Error("Could not read file data.");
        const result = await AiActions.analyzeDocumentAction({ fileDataUri, fileName: file.name, legalRegion: userProfile.legalRegion });
        
        const newAnalysis: DocumentAnalysis = {
          ...result,
          id: Date.now().toString(),
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        };

        saveDocs([newAnalysis, ...analyzedDocs]);
        setActiveDoc(newAnalysis.id);
        toast({ title: "Analysis Complete", description: `"${file.name}" has been analyzed.` });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Analysis Failed", description: error.message });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
      setIsProcessing(false);
    };
  }, [deductCredits, toast, analyzedDocs, userProfile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) handleAnalysis(acceptedFiles[0]);
  }, [handleAnalysis]);
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({ onDrop, noClick: true, noKeyboard: true, maxFiles: 1, maxSize: 5 * 1024 * 1024 });

  const filteredDocs = useMemo(() => {
    return analyzedDocs.filter(doc => {
      const searchMatch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const filterMatch = activeFilters.length === 0 || activeFilters.includes(doc.documentType);
      return searchMatch && filterMatch;
    });
  }, [analyzedDocs, searchTerm, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  }
  
  const handleDelete = (id: string) => {
     saveDocs(analyzedDocs.filter(doc => doc.id !== id));
     toast({ title: "Deleted", description: "Analysis has been removed from history." });
  }

  if (userPlanLevel < 1) {
    return <UpgradePrompt title="Unlock Document Intelligence" description="Let our AI analyze your legal documents for risks, summarize them, and even draft replies. This feature requires a Founder plan or higher." icon={<FileScan className="w-12 h-12 text-primary/20"/>} />;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 space-y-4">
        <Card {...getRootProps()} className="interactive-lift">
          <input {...getInputProps()} />
          <CardHeader>
            <CardTitle>Document Intelligence</CardTitle>
            <CardDescription>Upload a document for AI analysis. Costs 10 credits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn("text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed h-full w-full transition-colors cursor-pointer", isDragActive ? "border-primary bg-primary/10" : "")}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <p className="font-semibold text-lg text-foreground">Analyzing...</p>
                  </>
                ) : (
                  <>
                    <FileScan className="w-16 h-16 text-primary/20" />
                    <p className="font-semibold text-lg text-foreground">Drop a document here</p>
                    <p className="text-sm max-w-xs">Or click the button below to select a file.</p>
                    <Button type="button" variant="outline" onClick={openFileDialog} className="mt-4 interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Select File</Button>
                  </>
                )}
            </div>
          </CardContent>
        </Card>
        <Card className="interactive-lift">
            <CardHeader><CardTitle>Filter & Search</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search documents..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <div className="space-y-2"><Label>Filter by type</Label><div className="flex flex-wrap gap-2">{['Legal Contract', 'Government Notice', 'Compliance Filing', 'Other'].map(f => (<Button key={f} variant={activeFilters.includes(f) ? 'default' : 'outline'} size="sm" onClick={() => toggleFilter(f)}>{f}</Button>))}</div></div>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Analysis History ({filteredDocs.length})</h3>
          {filteredDocs.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40 min-h-[400px] flex items-center justify-center flex-col">
              <FileScan className="w-12 h-12 text-primary/20 mb-4" />
              <p className="font-semibold">{analyzedDocs.length > 0 ? "No documents match filters" : "Upload a document to start"}</p>
            </div>
          ) : (
            <Accordion type="single" collapsible value={activeDoc || undefined} onValueChange={setActiveDoc} className="w-full space-y-4">
              {filteredDocs.map(doc => <AnalyzedDocItem key={doc.id} doc={doc} onDelete={handleDelete} />)}
            </Accordion>
          )}
      </div>
    </div>
  )
}

const getRiskColor = (severity: 'High' | 'Medium' | 'Low') => {
  switch (severity) {
    case 'High': return 'border-red-500 bg-red-500/10 text-red-500';
    case 'Medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
    case 'Low': return 'border-green-500 bg-green-500/10 text-green-500';
    default: return 'border-muted';
  }
};

const AnalyzedDocItem = ({ doc, onDelete }: { doc: DocumentAnalysis, onDelete: (id: string) => void }) => {
  const { toast } = useToast();
  const highestSeverity = useMemo(() => {
    if (doc.riskFlags.some(f => f.severity === 'High')) return 'High';
    if (doc.riskFlags.some(f => f.severity === 'Medium')) return 'Medium';
    if (doc.riskFlags.length > 0) return 'Low';
    return null;
  }, [doc.riskFlags]);
  
  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: `${title} has been copied.` });
  };

  return (
    <AccordionItem value={doc.id} className="border-b-0">
       <Card className="interactive-lift">
          <AccordionTrigger className="p-4 hover:no-underline text-left">
              <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                      <p className="font-semibold truncate">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {highestSeverity && <Badge variant="outline" className={getRiskColor(highestSeverity)}>{highestSeverity} Risk</Badge>}
                    <Badge variant="secondary">{doc.documentType}</Badge>
                  </div>
              </div>
          </AccordionTrigger>
          <AccordionContent>
              <Tabs defaultValue="summary" className="w-full px-4 pb-4">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="summary"><StickyNote/>Summary</TabsTrigger>
                      <TabsTrigger value="risks"><AlertCircle/>Risks</TabsTrigger>
                      <TabsTrigger value="reply" disabled={!doc.replySuggestion}><MessageSquare/>Reply</TabsTrigger>
                      <TabsTrigger value="reminder" disabled={!doc.reminder}><CalendarPlus/>Reminder</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="p-4 bg-muted/50 rounded-lg border prose dark:prose-invert max-w-none text-sm"><ReactMarkdown>{doc.summary}</ReactMarkdown></TabsContent>
                  <TabsContent value="risks" className="space-y-3">{doc.riskFlags.length > 0 ? doc.riskFlags.map((flag, i) => (<div key={i} className={`p-3 bg-card rounded-lg border-l-4 ${getRiskColor(flag.severity)}`}><p className="font-semibold text-sm">Clause: <span className="font-normal italic">"{flag.clause}"</span></p><p className="text-muted-foreground text-sm mt-1"><span className="font-medium text-foreground">Risk:</span> {flag.risk}</p></div>)) : <p className="text-sm text-muted-foreground p-4 text-center">No significant risks found.</p>}</TabsContent>
                   <TabsContent value="reply" className="p-4 bg-muted/50 rounded-lg border min-h-[200px] flex items-center justify-center">
                    {doc.replySuggestion ? (
                        <div className="prose dark:prose-invert max-w-none text-sm w-full">
                            <div className="flex justify-between items-center not-prose mb-4">
                                <h4 className="font-bold text-lg my-0">{doc.replySuggestion.title}</h4>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(doc.replySuggestion!.content, doc.replySuggestion!.title)}><Copy className="mr-2"/>Copy</Button>
                            </div>
                            <ReactMarkdown>{doc.replySuggestion.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <MessageSquare className="mx-auto w-8 h-8 mb-2 opacity-50" />
                            <p className="font-semibold">No Reply Suggested</p>
                            <p className="text-xs">The AI did not detect a need for a reply for this document.</p>
                        </div>
                    )}
                  </TabsContent>
                   <TabsContent value="reminder" className="p-4 bg-muted/50 rounded-lg border min-h-[200px] flex items-center justify-center">
                    {doc.reminder ? (
                       <div className="bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-500/20 flex items-center justify-between gap-4 p-4 w-full">
                          <div className="flex items-center gap-3">
                            <CalendarPlus className="w-5 h-5"/>
                            <div>
                                <p className="font-semibold">{doc.reminder.title}</p>
                                <p className="text-sm">Suggested Date: {doc.reminder.date}</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => toast({title:"Feature coming soon"})}>Add to Calendar</Button>
                        </div>
                    ) : (
                       <div className="text-center text-muted-foreground">
                            <CalendarPlus className="mx-auto w-8 h-8 mb-2 opacity-50" />
                            <p className="font-semibold">No Reminder Needed</p>
                            <p className="text-xs">The AI did not find a specific deadline in this document.</p>
                        </div>
                    )}
                  </TabsContent>
              </Tabs>
               <div className="px-4 pt-2 flex justify-end"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(doc.id)}><Trash2 className="mr-2"/>Delete</Button></div>
          </AccordionContent>
       </Card>
    </AccordionItem>
  )
}


// --- Tab: Document Generator ---
type Template = { name: string; isPremium: boolean; };
type TemplateCategoryData = { name: string; roles: UserRole[]; templates: Template[]; };
const templateLibrary: TemplateCategoryData[] = [
  { name: 'Startup Legal', roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'], templates: [ { name: 'Non-Disclosure Agreement', isPremium: false }, { name: 'Founders Agreement', isPremium: true }, { name: 'ESOP Plan', isPremium: true }, { name: 'Terms of Service', isPremium: false }, { name: 'Privacy Policy', isPremium: false }, { name: 'NOC from Landlord', isPremium: false }, { name: 'Board Resolution for Incorporation', isPremium: true }, { name: 'Registered Address Declaration', isPremium: true }, ], },
  { name: 'Contracts & HR', roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'], templates: [ { name: 'Employment Offer Letter', isPremium: false }, { name: 'Consulting Agreement', isPremium: true }, { name: 'Vendor Agreement', isPremium: true }, { name: 'Freelance Services Agreement', isPremium: false }, { name: 'Statement of Work (SOW)', isPremium: false }, { name: 'Invoice Template', isPremium: false }, { name: 'International Contract Rider', isPremium: true }, ], },
  { name: 'Corporate Filings', roles: ['CA', 'Enterprise'], templates: [ { name: 'Board Resolution', isPremium: false }, { name: 'MOA (Memorandum of Association)', isPremium: true }, { name: 'AOA (Articles of Association)', isPremium: true }, { name: 'Form DIR-3', isPremium: false }, { name: 'Audit Engagement Letter', isPremium: true }, { name: 'Statutory Audit Report', isPremium: true }, { name: 'MSME Application Draft', isPremium: false }, ], },
  { name: 'Fundraising / Dataroom', roles: ['Founder', 'Legal Advisor', 'CA', 'Enterprise'], templates: [ { name: 'SAFE Agreement', isPremium: true }, { name: 'Shareholder Agreement', isPremium: true }, { name: 'Investor Pitch Deck', isPremium: false }, { name: 'Startup India Pitch Deck', isPremium: false }, ], },
  { name: 'Legal & Advisory', roles: ['Legal Advisor', 'Enterprise'], templates: [ { name: 'Legal Notice Draft', isPremium: false }, { name: 'GDPR/DPDP Policy Generator', isPremium: true }, { name: 'Litigation Summary Template', isPremium: true }, { name: 'Client Brief Template', isPremium: true }, { name: 'Service Level Agreement (SLA)', isPremium: true }, { name: 'Non-compete Agreement', isPremium: true }, { name: 'Client Engagement Letter', isPremium: true }, ], },
  { name: 'Enterprise Suite', roles: ['Enterprise'], templates: [ { name: 'HR Policy Docs', isPremium: true }, { name: 'Cross-border NDA', isPremium: true }, ], },
];

const DocumentGeneratorTab = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<DocumentGeneratorOutput | null>(null);
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();
  const [editorContent, setEditorContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasUserEdited = useRef(false);
  const typewriterText = useTypewriter(isTyping ? (generatedDoc?.content || '') : '', 1);
  const userPlanLevel = userProfile ? planHierarchy[userProfile.plan] : 0;

  useEffect(() => { if (isTyping && !hasUserEdited.current) setEditorContent(typewriterText); if (isTyping && typewriterText.length > 0 && typewriterText.length === (generatedDoc?.content || '').length) setIsTyping(false); }, [typewriterText, isTyping, generatedDoc]);
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { if (isTyping) { hasUserEdited.current = true; setIsTyping(false); } setEditorContent(e.target.value); };
  const availableCategories = useMemo(() => { if (!userProfile) return []; return templateLibrary.filter(category => category.roles.includes(userProfile.role)); }, [userProfile]);
  useEffect(() => { if (availableCategories.length > 0 && !activeAccordion) setActiveAccordion(availableCategories[0].name); }, [availableCategories, activeAccordion]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
    }
  }, [editorContent]);


  const handleGenerateClick = async () => {
    if (!selectedTemplate) { toast({ title: 'No Template Selected', description: 'Please select a template from the library first.', variant: 'destructive' }); return; }
    if (!userProfile) { toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' }); return; }

    const templateDetails = availableCategories.flatMap(c => c.templates).find(t => t.name === selectedTemplate);
    if (templateDetails?.isPremium && userPlanLevel < 1) { 
        toast({ 
            title: 'Upgrade Required', 
            description: 'Premium templates require a Founder plan or higher.', 
            variant: 'destructive', 
            action: <ToastAction altText="Upgrade"><Link href="/dashboard/billing">Upgrade</Link></ToastAction> 
        }); 
        return; 
    }
    if (!await deductCredits(1)) return;
    setLoading(true); setGeneratedDoc(null); setEditorContent(''); hasUserEdited.current = false;
    try { const result = await AiActions.generateDocumentAction({ templateName: selectedTemplate, legalRegion: userProfile.legalRegion }); setGeneratedDoc(result); setIsTyping(true); } catch (error: any) { toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' }); } finally { setLoading(false); }
  };

  const handleDownload = () => { if (!generatedDoc) return; const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${generatedDoc.title.replace(/ /g, '_')}.txt`); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };

  if (!userProfile) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start h-full max-h-[calc(100vh-16rem)]">
      <Card className="lg:col-span-1 xl:col-span-1 h-full flex flex-col bg-card interactive-lift">
        <CardHeader><CardTitle>Template Library</CardTitle><CardDescription>Select a template to generate.</CardDescription></CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search templates..." className="pl-10" /></div>
          <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-2">
             <RadioGroup value={selectedTemplate || ''} onValueChange={setSelectedTemplate} className="w-full">
                <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                    {availableCategories.map((category) => (
                        <AccordionItem value={category.name} key={category.name}>
                            <AccordionTrigger className="text-base font-medium hover:no-underline interactive-lift py-3 px-2">{category.name}</AccordionTrigger>
                            <AccordionContent><div className="flex flex-col gap-1 pl-2">{category.templates.map((template) => { const isLocked = template.isPremium && userPlanLevel < 1; return ( <Label key={template.name} className={cn("flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted interactive-lift", selectedTemplate === template.name && "bg-muted", isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer")}><RadioGroupItem value={template.name} id={template.name} disabled={isLocked} /><span className="font-normal text-sm">{template.name}</span>{isLocked && <Lock className="h-3 w-3 ml-auto text-amber-500" />}</Label> ) })}</div></AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="mt-auto pt-6"><Button onClick={handleGenerateClick} disabled={loading || !selectedTemplate} className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FilePenLine className="mr-2 h-4 w-4" /> Generate Document</>}</Button></CardFooter>
      </Card>
      <div className="lg:col-span-2 xl:col-span-3 h-full overflow-y-auto -mr-2 pr-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 className="text-2xl font-bold font-headline">Document Preview</h2><p className="text-muted-foreground">Generate a new document or view a recent one.</p></div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-start">
                <Button variant="outline" disabled={!generatedDoc || isTyping} onClick={() => toast({ title: "Feature Coming Soon"})} className="interactive-lift w-full sm:w-auto justify-center"><FilePenLine className="mr-2 h-4 w-4" /> Sign Document</Button>
                <Button variant="outline" disabled={!generatedDoc || isTyping} onClick={() => toast({ title: "Feature Coming Soon"})} className="interactive-lift w-full sm:w-auto justify-center"><Send className="mr-2 h-4 w-4" /> Send for Signature</Button>
                <Button disabled={!generatedDoc || isTyping} onClick={handleDownload} className="interactive-lift w-full sm:w-auto justify-center"><Download className="mr-2 h-4 w-4" /> Download</Button>
            </div>
        </div>
        {loading ? <Card className="min-h-[400px]"><CardHeader><p className="h-6 w-1/2">loading</p></CardHeader><CardContent className="space-y-4 pt-4"><p className="h-4 w-full">loading</p></CardContent></Card> : generatedDoc ? <Card className="min-h-[400px] flex flex-col"><CardHeader><CardTitle>{generatedDoc.title}</CardTitle></CardHeader><CardContent className="flex-1 overflow-y-auto"><Textarea ref={editorRef} value={editorContent} onChange={handleEditorChange} readOnly={isTyping} className="font-code text-sm text-card-foreground min-h-[500px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" /></CardContent></Card> : <Card className="border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card"><div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4"><Library className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-xl font-semibold mb-1">Your Document Appears Here</h3><p className="text-muted-foreground max-w-xs">Select a template from the library and click "Generate" to get started.</p></Card>}
      </div>
    </div>
  )
}

const watcherPortals = [
  { id: "MCA", name: "MCA", description: "Corporate Affairs", icon: <Building2 className="w-6 h-6" /> },
  { id: "RBI", name: "RBI", description: "Banking Regulations", icon: <Banknote className="w-6 h-6" /> },
  { id: "SEBI", name: "SEBI", description: "Securities", icon: <ShieldCheck className="w-6 h-6" /> },
  { id: "DPDP", name: "DPDP", description: "Data Privacy", icon: <DatabaseZap className="w-6 h-6" /> },
  { id: "GDPR", name: "GDPR", description: "EU Privacy", icon: <Globe className="w-6 h-6" /> },
];

function WatcherSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto interactive-lift">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Telescope className="mr-2 h-4 w-4" />}
            Get Latest Updates
        </Button>
    );
}

const TypewriterWatcher = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 20);
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br/>') }} />;
};

const RegulationWatcherTab = () => {
    const [state, formAction] = useActionState(AiActions.getRegulatoryUpdatesAction, { data: null, error: null });
    const [submittedPortal, setSubmittedPortal] = useState("");
    const [submittedFrequency, setSubmittedFrequency] = useState("");
    const { deductCredits, userProfile } = useAuth();
    const { toast } = useToast();
    const userPlanLevel = userProfile ? planHierarchy[userProfile.plan] : 0;
    const lastSuccessfulData = useRef<WatcherOutput | null>(null);

    useEffect(() => {
        if (state.error) {
            toast({ variant: "destructive", title: "Update Failed", description: state.error });
            lastSuccessfulData.current = null; // Reset on error
        }
        // Only deduct credits if we have new, valid data that we haven't processed before.
        if (state.data && state.data !== lastSuccessfulData.current) {
            deductCredits(1);
            lastSuccessfulData.current = state.data;
        }
    }, [state, toast, deductCredits]);
    
    const handleFormAction = (formData: FormData) => {
        if (!userProfile) return;
        const portal = formData.get("portal") as string;
        const frequency = formData.get("frequency") as string;
        setSubmittedPortal(portal);
        setSubmittedFrequency(frequency);
        formData.append('legalRegion', userProfile.legalRegion);
        formAction(formData);
    }

    if (!userProfile || userPlanLevel < 2) {
        return <UpgradePrompt title="Unlock Regulation Watcher" description="Stay ahead of regulatory changes with AI-powered summaries from government portals. This feature requires a Pro plan or higher." icon={<RadioTower className="w-12 h-12 text-primary/20" />} />;
    }

    return (
        <div className="space-y-8">
            <form action={handleFormAction}>
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Configure Your Watcher</CardTitle>
                        <CardDescription>Select the regulatory bodies you want to monitor and the frequency of updates. Costs 1 credit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-medium">1. Select a Regulatory Portal</Label>
                            <RadioGroup name="portal" defaultValue="MCA" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {watcherPortals.map((portal) => (
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
                            <RadioGroup name="frequency" defaultValue="daily" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <WatcherSubmitButton />
                    </CardFooter>
                </Card>
                
                <h2 className="text-xl font-bold tracking-tight">Latest Updates</h2>
                
                {state.data ? (
                    <Card className="interactive-lift">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               {watcherPortals.find(p => p.id === submittedPortal)?.icon}
                               {submittedPortal} {submittedFrequency.charAt(0).toUpperCase() + submittedFrequency.slice(1)} Digest
                            </CardTitle>
                            <CardDescription>Last updated: Just now</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none text-sm p-6 bg-muted/50 rounded-lg border">
                               <TypewriterWatcher text={state.data.summary} />
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
};

const workflowTriggers = [ { value: "doc_uploaded", label: "Document Uploaded", desc: "When a new contract or notice is uploaded." }, { value: "client_added", label: "New Client Added", desc: "When a new client is added to your workspace." }, { value: "reg_update", label: "Regulatory Update Found", desc: "When the watcher finds a new circular." }, ];
const workflowActions = [ { value: "analyze_risk", label: "Analyze for Risks", desc: "Run the document through the Contract Analyzer." }, { value: "gen_checklist", label: "Generate Onboarding Checklist", desc: "Create a standard setup checklist for the client." }, { value: "summarize", label: "Summarize Update", desc: "Use AI to summarize the regulatory changes." }, ];
const workflowNotifications = [ { value: "slack_legal", label: "Notify #legal on Slack", desc: "Post a summary message to your legal channel." }, { value: "email_client", label: "Email Client", desc: "Send an automated email to the client's primary contact." }, { value: "log_only", label: "Log to Activity Feed", desc: "No notification, just log the event." }, ];

const WorkflowTab = () => {
    const { userProfile } = useAuth();
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [newWorkflow, setNewWorkflow] = useState({ trigger: '', action: '', notification: '' });
    const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
    const { toast } = useToast();
    const userPlanLevel = userProfile ? planHierarchy[userProfile.plan] : 0;

    if (!userProfile || userPlanLevel < 3) {
        return <UpgradePrompt title="Unlock the Workflow & Automation Studio" description="Connect Clausey to your favorite tools and build powerful, automated workflows. This is an Enterprise feature." icon={<Zap className="w-12 h-12 text-primary/20"/>} />;
    }
    const getLabel = (value: string, list: {value: string, label: string}[]) => list.find(item => item.value === value)?.label || 'N/A';
    const handleCreateWorkflow = () => { if (!newWorkflow.trigger || !newWorkflow.action || !newWorkflow.notification) { toast({ variant: "destructive", title: "Incomplete Workflow", description: "Please select a trigger, action, and notification." }); return; } const workflow: WorkflowType = { id: `wf_${Date.now()}`, ...newWorkflow }; setWorkflows(prev => [...prev, workflow]); const newActivity: ActivityLogItem = { id: `act_${Date.now()}`, timestamp: new Date(), icon: Workflow, title: `Workflow Created: "${getLabel(workflow.action, workflowActions)}"`, description: `Triggered by: "${getLabel(workflow.trigger, workflowTriggers)}"`, }; setActivityLog(prev => [newActivity, ...prev]); setNewWorkflow({ trigger: '', action: '', notification: '' }); toast({ title: "Workflow Created!", description: "Your new automation is now active." }); }
    const handleDeleteWorkflow = (id: string) => { const workflowToDelete = workflows.find(w => w.id === id); if (workflowToDelete) { const newActivity: ActivityLogItem = { id: `act_${Date.now()}`, timestamp: new Date(), icon: Trash2, title: `Workflow Deleted: "${getLabel(workflowToDelete.action, workflowActions)}"`, description: "The automation rule has been removed.", }; setActivityLog(prev => [newActivity, ...prev]); } setWorkflows(wfs => wfs.filter(w => w.id !== id)); toast({ title: "Workflow Deleted", description: "The automation has been removed." }); }
    const handleRunWorkflow = (workflow: WorkflowType) => { const newActivity: ActivityLogItem = { id: `act_${Date.now()}`, timestamp: new Date(), icon: Play, title: `Workflow Run: "${getLabel(workflow.action, workflowActions)}"`, description: `Triggered manually.`, }; setActivityLog(prev => [newActivity, ...prev]); toast({ title: "Workflow Running", description: "The workflow has been manually triggered." }); };
    return (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Workflow /> Workflow Builder</CardTitle><CardDescription>Create powerful automations to streamline your compliance processes.</CardDescription></CardHeader>
                    <CardContent><div className="p-6 border rounded-lg bg-muted/40 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2"><Label>1. Trigger</Label><Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow(w => ({...w, trigger: v}))}><SelectTrigger><SelectValue placeholder="When..."/></SelectTrigger><SelectContent>{workflowTriggers.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>2. Action</Label><Select value={newWorkflow.action} onValueChange={(v) => setNewWorkflow(w => ({...w, action: v}))}><SelectTrigger><SelectValue placeholder="Do..."/></SelectTrigger><SelectContent>{workflowActions.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>3. Notification</Label><Select value={newWorkflow.notification} onValueChange={(v) => setNewWorkflow(w => ({...w, notification: v}))}><SelectTrigger><SelectValue placeholder="Then..."/></SelectTrigger><SelectContent>{workflowNotifications.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        <Button className="w-full md:w-auto interactive-lift" onClick={handleCreateWorkflow}><PlusCircle className="mr-2 h-4 w-4" /> Create Workflow</Button>
                    </div></CardContent>
                </Card>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Active Workflows ({workflows.length})</h3>
                    {workflows.length > 0 ? <div className="space-y-4">{workflows.map(wf => (<Card key={wf.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-lift"><div className="flex items-center gap-2 font-medium flex-wrap text-sm"><span className="flex items-center gap-2"><span className="text-muted-foreground">When:</span> {getLabel(wf.trigger, workflowTriggers)}</span><ArrowRight className="w-4 h-4 text-muted-foreground" /><span className="flex items-center gap-2"><span className="text-muted-foreground">Do:</span> {getLabel(wf.action, workflowActions)}</span><ArrowRight className="w-4 h-4 text-muted-foreground" /><span className="flex items-center gap-2"><span className="text-muted-foreground">Notify:</span> {getLabel(wf.notification, workflowNotifications)}</span></div><div className="flex gap-2 self-end md:self-center"><Button variant="ghost" size="icon" onClick={() => handleRunWorkflow(wf)}><Play className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteWorkflow(wf.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></Card>))}</div> : <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40"><Workflow className="mx-auto w-12 h-12 text-primary/20 mb-4"/><p className="font-semibold">No active workflows</p><p className="text-sm">Use the builder above to create your first automation.</p></div>}
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card className="interactive-lift"><CardHeader><CardTitle className="flex items-center gap-2"><Activity /> Automation Activity Feed</CardTitle><CardDescription>A real-time log of your automated tasks.</CardDescription></CardHeader>
                    <CardContent>
                        {activityLog.length > 0 ? <div className="space-y-4">{activityLog.map(log => (<div key={log.id} className="flex items-start gap-3"><div className="p-2 bg-muted rounded-full text-muted-foreground"><log.icon className="w-4 h-4" /></div><div className="flex-1"><p className="text-sm font-medium">{log.title}</p><p className="text-xs text-muted-foreground">{log.description}</p><p className="text-xs text-muted-foreground/70 mt-0.5">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p></div></div>))}</div> : <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40"><p>No activity yet. Create a workflow to get started.</p></div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// --- Main AI Toolkit Page ---
export default function AiToolkitPage() {
    const { userProfile } = useAuth();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'assistant';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">AI Toolkit</h1>
                <p className="text-muted-foreground">Your unified AI workspace for legal and compliance tasks.</p>
            </div>
            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="assistant" className="interactive-lift"><MessageSquare className="mr-2"/>Assistant</TabsTrigger>
                    <TabsTrigger value="generator" className="interactive-lift"><FilePenLine className="mr-2"/>Generator</TabsTrigger>
                    <TabsTrigger value="audit" className="interactive-lift"><GanttChartSquare className="mr-2"/>Audit</TabsTrigger>
                    <TabsTrigger value="analyzer" className="interactive-lift"><FileScan className="mr-2"/>Intelligence</TabsTrigger>
                    <TabsTrigger value="watcher" className="interactive-lift"><RadioTower className="mr-2"/>Watcher</TabsTrigger>
                    <TabsTrigger value="workflows" className="interactive-lift"><Zap className="mr-2"/>Workflows</TabsTrigger>
                </TabsList>
                <TabsContent value="assistant" className="mt-6"><ChatAssistant /></TabsContent>
                <TabsContent value="generator" className="mt-6"><DocumentGeneratorTab /></TabsContent>
                <TabsContent value="audit" className="mt-6"><DataroomAudit /></TabsContent>
                <TabsContent value="analyzer" className="mt-6"><DocumentIntelligenceTab /></TabsContent>
                <TabsContent value="watcher" className="mt-6"><RegulationWatcherTab /></TabsContent>
                <TabsContent value="workflows" className="mt-6"><WorkflowTab /></TabsContent>
            </Tabs>
        </div>
    );
}
