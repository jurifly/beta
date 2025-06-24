
'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent, useMemo, useTransition, useCallback, useActionState } from 'react';
import { useFormStatus } from "react-dom"
import { Bot, Check, Clipboard, FileText, Loader2, Send, Sparkles, User, History, MessageSquare, Clock, FolderCheck, Download, FileUp, Share2, UploadCloud, RefreshCw, Lock, ShieldCheck, GanttChartSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateChecklist, type AssistantOutput } from '@/ai/flows/assistant-flow';
import type { GenerateDDChecklistOutput, ChecklistCategory, ChecklistItem } from "@/lib/types"
import type { GenerateChecklistOutput as RawChecklistOutput } from "@/ai/flows/generate-checklist-flow"
import type { ComplianceValidatorOutput } from "@/ai/flows/compliance-validator-flow"
import { generateDiligenceChecklist, validateComplianceAction } from "./actions"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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


// --- Type Definitions and Initial States ---

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | AssistantOutput;
};

type ChecklistState = {
  data: GenerateDDChecklistOutput | null;
  timestamp: string | null;
};

const CHAT_HISTORY_KEY = 'aiCopilotHistory';
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
const initialDiligenceState: { data: RawChecklistOutput | null; error: string | null } = { data: null, error: null };
const initialComplianceState: { data: ComplianceValidatorOutput | null; error: string | null } = { data: null, error: null };

function isChecklist(content: any): content is AssistantOutput {
  return content && typeof content === 'object' && 'checklist' in content;
}


// --- AI Assistant Chat Component ---

const ChecklistResult = ({ checklist }: { checklist: AssistantOutput }) => {
  const { toast } = useToast();
  const copyToClipboard = (checklist: AssistantOutput) => {
    if (!checklist) return;
    const textToCopy = `${checklist.title}\n\n${checklist.checklist.map(item => `- [ ] ${item.task} (${item.category})`).join('\n')}`;
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
          {checklist.checklist.map((item, index) => (
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
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [savedConversations, setSavedConversations] = useState<ChatMessage[][]>([]);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        setSavedConversations(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

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
  
  const saveConversation = (conversation: ChatMessage[]) => {
      setSavedConversations(prev => {
        const updatedConversations = [conversation, ...prev];
        try {
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedConversations));
        } catch (error) {
           console.error("Failed to save history to localStorage", error);
        }
        return updatedConversations;
    });
  }

  const handleTextSubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    if (e) e.preventDefault();
    const topic = suggestion || input;
    if (!topic.trim()) return;

    setIsProcessing(true);
    setView('chat');

    const userMessage: ChatMessage = { role: 'user', content: topic };
    const currentChat = [userMessage];
    setChatHistory(currentChat);
    setInput('');

    try {
      const response = await generateChecklist({ topic });
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      const newConversation = [...currentChat, assistantMessage];
      
      setChatHistory(newConversation);
      saveConversation(newConversation);

    } catch (error) {
      console.error('Error generating checklist:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to generate the response. Please try again.',
        variant: 'destructive',
      });
      setChatHistory([]);
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
    { text: 'Draft a simple non-disclosure agreement', icon: FileText, action: () => handleTextSubmit(undefined, 'Draft a simple non-disclosure agreement') },
  ];

  return (
    <div className={cn("flex flex-col bg-card border rounded-lg shadow-sm", chatHistory.length === 0 && view === 'chat' && !isProcessing ? "h-auto" : "h-full max-h-[calc(100vh-14rem)] min-h-[calc(100vh-14rem)]")}>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {view === 'chat' && (
        <>
          {chatHistory.length === 0 && !isProcessing && (
            <div className="flex flex-col items-center justify-center text-center p-6">
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
                
                <div className={cn('rounded-xl', message.role === 'user' ? 'bg-primary text-primary-foreground p-4 max-w-2xl' : 'w-full')}>
                  {typeof message.content === 'string' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : isChecklist(message.content) ? (
                    <ChecklistResult checklist={message.content} />
                  ) : null}
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
          </>
        )}
        {view === 'history' && (
           <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Conversation History</h2>
              {savedConversations.length > 0 ? (
                <div className="space-y-2">
                  {savedConversations.map((convo, index) => (
                    <button 
                      key={index} 
                      onClick={() => { setChatHistory(convo); setView('chat'); }} 
                      className="block w-full p-4 border rounded-lg text-left hover:bg-muted transition-colors interactive-lift"
                    >
                      <p className="font-medium truncate text-sm">
                        {typeof convo[0]?.content === 'string' ? convo[0]?.content : "Untitled Conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground">{convo.length} messages</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                  <History className="w-16 h-16 text-primary/20"/>
                  <p className="font-semibold text-lg">No Saved History</p>
                  <p className="text-sm max-w-sm">Your past conversations will appear here.</p>
                </div>
              )}
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


// --- Dataroom Audit Tool Component ---

function SubmitButton({ isRegenerate }: { isRegenerate: boolean }) {
  const { pending } = useFormStatus();
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
  );
}

const DataroomAudit = () => {
  const { userProfile, deductCredits } = useAuth();
  const [serverState, formAction] = useActionState(generateDiligenceChecklist, initialDiligenceState);
  const [checklistState, setChecklistState] = useState<ChecklistState>({ data: null, timestamp: null });
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { toast } = useToast();
  const { pending } = useFormStatus();

  if (!userProfile) return <Loader2 className="animate-spin" />;

  const checklistKey = `ddChecklistData-${userProfile.activeCompanyId}`;

  useEffect(() => {
    try {
        const savedState = localStorage.getItem(checklistKey);
        if (savedState) {
            setChecklistState(JSON.parse(savedState));
        }
    } catch (error) {
        console.error("Failed to parse checklist data from localStorage", error);
        localStorage.removeItem(checklistKey);
    }
  }, [checklistKey]);
  
  useEffect(() => {
    if (serverState.error) {
      toast({
        variant: "destructive",
        title: "Checklist Generation Failed",
        description: serverState.error,
      });
    }

    if (serverState.data) {
      deductCredits(2);
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
            description: '',
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
                return { ...category, items: category.items.map(item => item.id === itemId ? { ...item, status: completed ? 'Completed' : 'Pending' } : item) };
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
    if (totalItems === 0) return { completedCount: 0, totalCount: 0, progress: 0 };
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

  if (['Starter'].includes(userProfile.plan)) {
    return <UpgradePrompt 
     title="Unlock the Audit Hub"
     description="Generate comprehensive due diligence checklists and prepare for audits with our AI-powered tools. This feature is available on the Founder plan and above."
     icon={<FolderCheck className="w-12 h-12 text-primary/20"/>}
   />;
  }

  const availableDealTypes = dealTypesByRole[userProfile.role] || dealTypesByRole.Founder;

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>{checklistState.data?.reportTitle || "Dataroom Audit Tool"}</CardTitle>
              <CardDescription>Generate a checklist to start your audit process. Costs 2 credits.</CardDescription>
          </CardHeader>
          <CardContent>
              <form action={formAction} className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
                <div className="space-y-1.5 w-full sm:w-auto sm:flex-1">
                    <Label htmlFor="dealType">Deal / Audit Type</Label>
                    <Select name="dealType" defaultValue={availableDealTypes[0].value}>
                        <SelectTrigger id="dealType" className="min-w-[200px]"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{availableDealTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-auto self-end">
                  <SubmitButton isRegenerate={!!checklistState.data} />
                </div>
                <div className="flex items-center gap-2 self-end">
                    <Button variant="outline" size="icon" disabled={!checklistState.data} className="interactive-lift" onClick={handleShare}><Share2 className="h-4 w-4"/></Button>
                </div>
              </form>
          </CardContent>
      </Card>
      {pending && !checklistState.data && (
         <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="font-semibold text-lg text-foreground">Generating your checklist...</p>
         </div>
      )}
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
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
            <FolderCheck className="w-16 h-16 text-primary/20" /><p className="font-semibold text-lg">Build Your Dataroom</p><p className="text-sm max-w-sm">Select a deal or audit type and our AI will generate a comprehensive checklist to guide you through the process.</p>
          </div>
      )}
    </div>
  );
}


// --- Compliance Validator Tool Component ---

const ComplianceValidatorTool = () => {
    const { toast } = useToast();
    const { deductCredits } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [fileDataUri, setFileDataUri] = useState<string | null>(null);
    const [framework, setFramework] = useState('SOC2');

    const [state, formAction] = useActionState(validateComplianceAction, initialComplianceState);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (state.error) toast({ variant: "destructive", title: "Analysis Failed", description: state.error });
        if (state.data) toast({ title: "Analysis Complete", description: "Your compliance report is ready." });
    }, [state, toast]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) { toast({ variant: "destructive", title: "File Upload Error", description: fileRejections[0].errors[0].message }); return; }
      if (acceptedFiles[0]) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onload = (loadEvent) => setFileDataUri(loadEvent.target?.result as string);
        reader.readAsDataURL(uploadedFile);
      }
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]}, maxFiles: 1 });

    const handleAnalysis = async () => {
        if (!fileDataUri) { toast({ variant: 'destructive', title: 'File Missing', description: 'Please upload a document to analyze.' }); return; }
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
                        <UploadCloud className="mx-auto h-12 w-12 text-primary/20" /><p className="mt-4 font-semibold">{file ? `Selected: ${file.name}` : "Drag & drop policy documents here"}</p><p className="text-sm text-muted-foreground">or click to select a file</p>
                    </div>
                    <div className="space-y-2"><Label>Select Framework</Label><Select value={framework} onValueChange={setFramework}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="SOC2">SOC2 Type I/II</SelectItem><SelectItem value="ISO27001">ISO 27001</SelectItem><SelectItem value="GDPR">GDPR</SelectItem><SelectItem value="DPDP">DPDP</SelectItem></SelectContent></Select></div>
                    <Button className="w-full" onClick={handleAnalysis} disabled={isPending || !file}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>} Run Compliance Analysis</Button>
                </CardContent>
            </Card>
            {isPending ? (
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Running analysis...</p></div>
            ) : (state.data) && (
                <Card><CardHeader><CardTitle>{framework} Analysis Report</CardTitle><CardDescription>Readiness Score: <span className="font-bold text-primary">{state.data.readinessScore}/100</span></CardDescription></CardHeader>
                    <CardContent className="space-y-4"><div><h4 className="font-semibold mb-2">Summary</h4><p className="text-sm text-muted-foreground">{state.data.summary}</p></div>
                        <div><h4 className="font-semibold mb-2">Recommendations</h4><div className="space-y-2">
                            {state.data.missingItems.map((item, index) => (<div key={index} className="p-3 border rounded-md bg-muted/50"><p className="font-medium text-sm">{item.item}</p><p className="text-xs text-muted-foreground">{item.recommendation}</p></div>))}
                        </div></div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// --- Main Page Component ---

export default function AiToolkitPage() {
    const { userProfile } = useAuth();
    const isEnterprise = userProfile?.plan === 'Enterprise';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-bold font-headline">AI Toolkit</h1>
                <p className="text-sm text-muted-foreground">Your unified AI workspace for legal and compliance tasks.</p>
            </div>
            <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="interactive-lift"><MessageSquare className="mr-2"/> AI Assistant</TabsTrigger>
                    <TabsTrigger value="audit" className="interactive-lift"><GanttChartSquare className="mr-2"/> Dataroom Audit</TabsTrigger>
                    <TabsTrigger value="compliance" className="interactive-lift" disabled={!isEnterprise}>
                        Compliance Validator
                        {!isEnterprise && <Lock className="ml-2 h-3 w-3 text-amber-500" />}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="mt-6"><ChatAssistant /></TabsContent>
                <TabsContent value="audit" className="mt-6"><DataroomAudit /></TabsContent>
                <TabsContent value="compliance" className="mt-6">
                    {isEnterprise ? <ComplianceValidatorTool /> : (
                        <UpgradePrompt 
                            title="Unlock Compliance Toolkits"
                            description="Validate your policy documents against frameworks like SOC2, ISO27001, and GDPR. This is an Enterprise feature."
                            icon={<ShieldCheck className="w-12 h-12 text-primary/20"/>}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
