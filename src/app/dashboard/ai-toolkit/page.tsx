

'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent, useMemo, useTransition, useCallback, Fragment } from 'react';
import { Bot, Check, Clipboard, FileText, Loader2, Send, Sparkles, User, History, MessageSquare, Clock, FolderCheck, Download, FileUp, Share2, UploadCloud, RefreshCw, Lock, ShieldCheck, GanttChartSquare, FilePenLine, Search, RadioTower, Building2, Banknote, DatabaseZap, Globe, Telescope, FileScan, BookText, Library, Zap, Workflow, Play, Trash2, Activity, PlusCircle, ArrowRight, FileWarning, AlertCircle, CalendarPlus, StickyNote, Edit, Copy, Scale, Info, CheckCircle, ThumbsDown, ThumbsUp, Gavel, FileSignature, Save, Calculator, HelpCircle, Gift, PiggyBank, Handshake, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useSearchParams } from 'next/navigation';


import * as AiActions from './actions';
import type { AssistantOutput } from '@/ai/flows/assistant-flow';
import type { GenerateDDChecklistOutput, ChecklistCategory, UserRole, UserProfile, Workflow as WorkflowType, ActivityLogItem, ChatMessage, DocumentAnalysis, RiskFlag, ContractDetails, Clause } from "@/lib/types"
import { planHierarchy } from "@/lib/types";
import type { GenerateChecklistOutput as RawChecklistOutput } from '@/ai/flows/generate-checklist-flow'
import type { ComplianceValidatorOutput } from "@/ai/flows/compliance-validator-flow"
import type { DocumentGeneratorOutput } from "@/ai/flows/document-generator-flow";
import type { WikiGeneratorOutput } from "@/ai/flows/wiki-generator-flow";
import type { ReconciliationOutput } from '@/ai/flows/reconciliation-flow';
import type { LegalResearchOutput } from '@/ai/flows/legal-research-flow';
import { allClauses } from '@/lib/clause-library-content';
import type { PenaltyPredictorOutput } from '@/ai/flows/penalty-predictor-flow';


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
import { format, formatDistanceToNow, differenceInMonths } from 'date-fns';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTypewriter } from '@/hooks/use-typewriter';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


// --- Tab: AI Legal Assistant ---

const TypewriterResponse = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 10);
    return <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm leading-relaxed">{displayText}</ReactMarkdown>;
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
  const { userProfile, saveChatHistory, deductCredits } = useAuth();
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

    if (!await deductCredits(1)) return;

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
    { text: 'My company does food delivery. If an order is ₹100 and I add 12% commission, then a platform fee of ₹5 and delivery charge of ₹40, on what amount do I have to pay GST?', icon: HelpCircle, action: () => handleTextSubmit(undefined, "My company does food delivery. If an order is ₹100 and I add 12% commission, then a platform fee of ₹5 and delivery charge of ₹40, on what amount do I have to pay GST?") },
  ];

  return (
    <div className={cn("flex flex-col bg-card border rounded-lg shadow-sm h-full")}>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {chatHistory.length === 0 && !isProcessing && (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Your AI Legal Assistant</h2>
              <p className="text-muted-foreground mb-6">Ask a legal question or try a suggestion.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl mb-4">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={prompt.action}
                    className="p-3 md:p-4 border rounded-lg text-left hover:bg-muted transition-colors flex items-start sm:items-center gap-3 interactive-lift"
                  >
                    <prompt.icon className="w-5 h-5 text-muted-foreground shrink-0 mt-1 sm:mt-0" />
                    <span className="font-medium text-sm break-words">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
        )}

        <div className="p-4 md:p-6 space-y-8">
            {chatHistory.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-3 md:gap-4', message.role === 'user' ? 'justify-end' : '')}>
                {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border">
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                </Avatar>
                )}
                
                <div className={cn(message.role === 'user' ? 'bg-primary text-primary-foreground rounded-xl p-3 md:p-4 max-w-[85%] md:max-w-2xl' : 'w-full max-w-full md:max-w-4xl')}>
                  {typeof message.content === 'string' ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
        <p className="text-xs text-muted-foreground text-center pt-2">1 Credit per message.</p>
      </div>
    </div>
  );
};

// --- Tab: Document Analyzer ---
const DocumentAnalyzerTab = () => {
  const { userProfile, deductCredits } = useAuth();
  const { toast } = useToast();
  const [analyzedDocs, setAnalyzedDocs] = useState<DocumentAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  
  const STORAGE_KEY = 'documentIntelligenceHistory';

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
    if (!await deductCredits(2)) return;
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
          redlineContent: result.summary,
        };

        saveDocs([newAnalysis, ...analyzedDocs]);
        setActiveDocId(newAnalysis.id);
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

  const handleSaveRedline = (docId: string, newContent: string) => {
    const updatedDocs = analyzedDocs.map(doc => doc.id === docId ? { ...doc, redlineContent: newContent } : doc);
    saveDocs(updatedDocs);
    toast({ title: "Changes Saved", description: "Your summary has been saved." });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 space-y-4">
        <Card {...getRootProps()} className="interactive-lift">
          <input {...getInputProps()} />
          <CardHeader>
            <CardTitle>Document Analyzer</CardTitle>
            <CardDescription>Upload a document for AI analysis.</CardDescription>
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
                    <p className="text-xs text-muted-foreground mt-2">2 Credits per analysis</p>
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
            <Accordion type="single" collapsible value={activeDocId || undefined} onValueChange={setActiveDocId} className="w-full space-y-4">
              {filteredDocs.map(doc => <AnalyzedDocItem key={doc.id} doc={doc} onDelete={handleDelete} onSaveRedline={handleSaveRedline} />)}
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

const EmptyTabContent = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  const Icon = icon;
  return (
    <div className="text-center text-muted-foreground p-8 min-h-[200px] flex flex-col items-center justify-center">
      <Icon className="mx-auto w-8 h-8 opacity-50" />
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs">{description}</p>
    </div>
  );
};

const AnalyzedDocItem = ({ doc, onDelete, onSaveRedline }: { doc: DocumentAnalysis, onDelete: (id: string) => void, onSaveRedline: (id: string, content: string) => void }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(doc.redlineContent || doc.summary);

  useEffect(() => {
    setEditedContent(doc.redlineContent || doc.summary);
  }, [doc]);

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

  const handleSaveClick = () => {
    onSaveRedline(doc.id, editedContent);
    setIsEditing(false);
  }
  
  const isDateValid = (dateString: string | undefined): boolean => {
    return !!dateString && !isNaN(new Date(dateString).getTime());
  };

  return (
    <AccordionItem value={doc.id} className="border-b-0">
       <Card className="interactive-lift">
          <AccordionTrigger className="p-4 hover:no-underline text-left">
              <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                      <p className="font-semibold truncate">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {isDateValid(doc.uploadedAt) ? formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true }) : 'Invalid date'}
                      </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {highestSeverity && <Badge variant="outline" className={getRiskColor(highestSeverity)}>{highestSeverity} Risk</Badge>}
                    <Badge variant="secondary">{doc.documentType}</Badge>
                  </div>
              </div>
          </AccordionTrigger>
          <AccordionContent>
              <Tabs defaultValue="summary" className="w-full px-4 pb-4">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4">
                      <TabsTrigger value="summary"><StickyNote/>Summary</TabsTrigger>
                      <TabsTrigger value="risks"><AlertCircle/>Risks</TabsTrigger>
                      <TabsTrigger value="details"><FileSignature/>Details</TabsTrigger>
                      <TabsTrigger value="reply" ><MessageSquare/>Reply</TabsTrigger>
                      <TabsTrigger value="reminder"><CalendarPlus/>Reminder</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">AI Summary</h4>
                      {isEditing ? (
                        <div className="flex gap-2">
                           <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                           <Button size="sm" onClick={handleSaveClick}><Save className="mr-2"/>Save</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="mr-2"/>Edit Summary</Button>
                      )}
                    </div>
                    {isEditing ? (
                      <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[200px]"/>
                    ) : (
                       <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown>{editedContent}</ReactMarkdown></div>
                    )}
                  </TabsContent>
                  <TabsContent value="risks" className="space-y-3">{doc.riskFlags.length > 0 ? doc.riskFlags.map((flag, i) => (<div key={i} className={`p-3 bg-card rounded-lg border-l-4 ${getRiskColor(flag.severity)}`}><p className="font-semibold text-sm">Clause: <span className="font-normal italic">"{flag.clause}"</span></p><p className="text-muted-foreground text-sm mt-1"><span className="font-medium text-foreground">Risk:</span> {flag.risk}</p></div>)) : <EmptyTabContent icon={ShieldCheck} title="No Significant Risks Found" description="The AI did not find any major risks in this document." />}</TabsContent>
                  <TabsContent value="details">
                    {doc.contractDetails ? (
                      <div className="w-full space-y-3 p-4 bg-muted/50 rounded-lg border">
                        <div className="p-3 border rounded-md bg-card">
                          <p className="text-xs text-muted-foreground">Parties</p>
                          <p className="font-medium">{doc.contractDetails.contractingParties.join(', ')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 border rounded-md bg-card">
                            <p className="text-xs text-muted-foreground">Effective Date</p>
                            <p className="font-medium">
                                {isDateValid(doc.contractDetails.effectiveDate) ? format(new Date(doc.contractDetails.effectiveDate), "PPP") : 'N/A'}
                            </p>
                          </div>
                          <div className="p-3 border rounded-md bg-card">
                            <p className="text-xs text-muted-foreground">Term</p>
                            <p className="font-medium">{doc.contractDetails.term}</p>
                          </div>
                          <div className="p-3 border rounded-md bg-card">
                            <p className="text-xs text-muted-foreground">Renewal Notice</p>
                            <p className="font-medium">
                                {isDateValid(doc.contractDetails.renewalNoticeDate) ? format(new Date(doc.contractDetails.renewalNoticeDate!), "PPP") : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyTabContent icon={FileSignature} title="No Contract Details Extracted" description="The AI did not identify this as a standard contract." />
                    )}
                  </TabsContent>
                   <TabsContent value="reply" className="p-4 bg-muted/50 rounded-lg border">
                    {doc.replySuggestion ? (
                        <div className="prose dark:prose-invert max-w-none text-sm w-full">
                            <div className="flex justify-between items-center not-prose mb-4">
                                <h4 className="font-bold text-lg my-0">{doc.replySuggestion.title}</h4>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(doc.replySuggestion!.content, doc.replySuggestion!.title)}><Copy className="mr-2"/>Copy</Button>
                            </div>
                            <ReactMarkdown>{doc.replySuggestion.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <EmptyTabContent icon={MessageSquare} title="No Reply Suggested" description="The AI did not detect a need for a reply for this document."/>
                    )}
                  </TabsContent>
                   <TabsContent value="reminder">
                    {doc.reminder ? (
                       <div className="bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-500/20 flex items-center justify-between gap-4 p-4 w-full">
                          <div className="flex items-center gap-3">
                            <CalendarPlus className="w-5 h-5"/>
                            <div>
                                <p className="font-semibold">{doc.reminder.title}</p>
                                <p className="text-sm">Suggested Date: {isDateValid(doc.reminder.date) ? format(new Date(doc.reminder.date), 'PPP') : 'Invalid Date'}</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => toast({title:"Feature coming soon"})}>Add to Calendar</Button>
                        </div>
                    ) : (
                       <EmptyTabContent icon={CalendarPlus} title="No Reminder Needed" description="The AI did not find a specific deadline in this document." />
                    )}
                  </TabsContent>
              </Tabs>
               <div className="px-4 pt-2 flex justify-end"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(doc.id)}><Trash2 className="mr-2"/>Delete</Button></div>
          </AccordionContent>
       </Card>
    </AccordionItem>
  )
}


// --- Tab: Document Studio ---
const DocumentStudioTab = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Studio</CardTitle>
                <CardDescription>Generate legal documents from templates or convert existing policies into internal wikis.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="generator">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generator"><FilePenLine className="mr-2"/>From a Template</TabsTrigger>
                        <TabsTrigger value="wiki"><BookText className="mr-2"/>From a Policy</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generator" className="pt-6"><DocumentGenerator/></TabsContent>
                    <TabsContent value="wiki" className="pt-6"><WikiGenerator/></TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

type Template = { name: string; isPremium: boolean; };
type TemplateCategoryData = { name: string; roles: UserRole[]; templates: Template[]; };

const templateLibrary: TemplateCategoryData[] = [
  {
    name: "Startup Formation & Compliance",
    roles: ["Founder"],
    templates: [
      { name: "Founders’ Agreement", isPremium: true },
      { name: "Co-Founder Equity Split Agreement", isPremium: true },
      { name: "Incorporation Checklist", isPremium: false },
      { name: "Consent Letter for Registered Office", isPremium: false },
      { name: "ESOP Policy (Standard + Advanced)", isPremium: true },
      { name: "Shareholders Agreement (SHA) – Template", isPremium: true },
      { name: "Board Resolution: Appointment of Directors", isPremium: false },
      { name: "Board Resolution: Allotment of Shares", isPremium: false },
      { name: "Board Resolution: Opening Bank Account", isPremium: false },
      { name: "Board Report Generator", isPremium: true },
      { name: "Form MGT-7 / AOC-4 Template", isPremium: false },
      { name: "Startup Audit Checklist", isPremium: false },
      { name: "Valuation Certificate Summary", isPremium: true },
    ],
  },
  {
    name: "Fundraising & Equity",
    roles: ["Founder"],
    templates: [
      { name: "Pitch-Ready Cap Table Format (Excel + PDF)", isPremium: false },
      { name: "Convertible Note Agreement (SAFE, iSAFE)", isPremium: true },
      { name: "Term Sheet (Seed, Series A)", isPremium: true },
      { name: "Equity Subscription Agreement", isPremium: true },
      { name: "Investor Due Diligence Checklist (Editable)", isPremium: false },
      { name: "Fund Utilization Statement", isPremium: true },
      { name: "Virtual Due Diligence Folder Checklist", isPremium: false },
    ],
  },
  {
    name: "Legal & Regulatory",
    roles: ["Founder"],
    templates: [
      { name: "Startup India DPIIT Declaration", isPremium: false },
      { name: "MSME/Udyam Registration Guide & Template", isPremium: false },
      { name: "NDA – Mutual & One-Way", isPremium: false },
      { name: "Non-Compete Agreement", isPremium: true },
      { name: "Employment Contract Template (ESOP-Ready)", isPremium: true },
    ],
  },
  {
    name: "Financial & Tax",
    roles: ["Founder", "CA"],
    templates: [
      { name: "Salary Structure Template (with CTC → Take-Home)", isPremium: false },
      { name: "Reimbursement Tracker (with Sample Policy)", isPremium: false },
      { name: "Advance Tax Planner Spreadsheet", isPremium: false },
      { name: "GST Input Claim Summary Template", isPremium: false },
      { name: "TDS Deduction & Payment Calendar", isPremium: false },
      { name: "Tax Summary Report", isPremium: true },
      { name: "Advance Tax Computation Sheet", isPremium: true },
      { name: "Form 16 & 16A Generator", isPremium: true },
      { name: "ITR Filing Report (PDF summary)", isPremium: true },
      { name: "Startup Tax Optimization Report", isPremium: true },
    ],
  },
  {
    name: "Investor & Team Communication",
    roles: ["Founder"],
    templates: [
      { name: "Investor Update Email Template (Monthly/Quarterly)", isPremium: false },
      { name: "Employee ESOP Letter Template", isPremium: true },
      { name: "Offer Letter + Annexure (CTC + NDA)", isPremium: true },
    ],
  },
  {
    name: "Client Onboarding",
    roles: ["CA"],
    templates: [
      { name: "Engagement Letter Template", isPremium: false },
      { name: "Letter of Authority / Consent to Represent", isPremium: true },
      { name: "Welcome Email + Document Checklist", isPremium: false },
      { name: "KYC + UBO Declaration Format", isPremium: false },
    ],
  },
  {
    name: "Compliance Filing",
    roles: ["CA"],
    templates: [
      { name: "GSTR-3B / 1 Filing Summary Format", isPremium: false },
      { name: "TDS Master Sheet (with PANs, Rates, Deadlines)", isPremium: true },
    ],
  },
  {
    name: "Due Diligence & Audit",
    roles: ["CA", "Founder", "Legal Advisor", "Enterprise"],
    templates: [
      { name: "Pre-Funding Due Diligence Checklist", isPremium: true },
      { name: "Compliance Health Score Report", isPremium: true },
    ],
  },
  {
    name: "Client Communication",
    roles: ["CA"],
    templates: [
      { name: "Monthly Compliance Summary Mailer", isPremium: false },
      { name: "Document Reminder Email Template", isPremium: false },
      { name: "Tax Planning Advisory Letter", isPremium: true },
    ],
  },
  {
    name: "Legal & Advisory",
    roles: ["CA", "Legal Advisor", "Founder", "Enterprise"],
    templates: [
      { name: "Board Meeting Minutes Format", isPremium: false },
      { name: "Startup ESOP Accounting Notes", isPremium: true },
      { name: "ROC Resolution Templates", isPremium: false },
      { name: "GST Reconciliation Explanation Letter", isPremium: true },
      { name: "Notice Reply Template (for IT/GST Notices)", isPremium: true },
    ],
  },
];


const templatePlaceholders: Record<string, { context: string; reason: string }> = {
  "Non-Disclosure Agreement": {
    context: "e.g., Discussing a potential partnership with a new software vendor.",
    reason: "e.g., To protect our proprietary algorithms during initial talks.",
  },
  "Founders Agreement": {
    context: "e.g., Two co-founders starting a new tech venture.",
    reason: "e.g., To clearly define equity split, roles, and responsibilities.",
  },
  "Terms of Service": {
    context: "e.g., For our new SaaS application launching next month.",
    reason: "e.g., To set the legal terms for users of our platform.",
  },
  "Employment Offer Letter": {
    context: "e.g., Hiring a new Senior Software Engineer.",
    reason: "e.g., To formalize the employment offer with salary and terms.",
  },
  "Vendor Agreement": {
      context: "e.g., Onboarding a new marketing agency for a 6-month contract.",
      reason: "e.g., To define scope of work, deliverables, and payment terms."
  },
  "Default": {
    context: "e.g., Describe the situation for this document.",
    reason: "e.g., What is the main goal you want to achieve?",
  }
};

const DocumentGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<DocumentGeneratorOutput | null>(null);
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();
  
  const [editorContent, setEditorContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasUserEdited = useRef(false);
  const typewriterText = useTypewriter(isTyping ? (generatedDoc?.content || '') : '', 1);

  const [context, setContext] = useState("");
  const [reason, setReason] = useState("");
  const [placeholders, setPlaceholders] = useState(templatePlaceholders.Default);

  useEffect(() => {
    if (selectedTemplate && templatePlaceholders[selectedTemplate]) {
        setPlaceholders(templatePlaceholders[selectedTemplate]);
    } else {
        setPlaceholders(templatePlaceholders.Default);
    }
    setContext('');
    setReason('');
  }, [selectedTemplate]);

  useEffect(() => { if (isTyping && !hasUserEdited.current) setEditorContent(typewriterText); if (isTyping && typewriterText.length > 0 && typewriterText.length === (generatedDoc?.content || '').length) setIsTyping(false); }, [typewriterText, isTyping, generatedDoc]);
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { if (isTyping) { hasUserEdited.current = true; setIsTyping(false); } setEditorContent(e.target.value); };
  
  const availableCategories = useMemo(() => {
    if (!userProfile) return [];
    return templateLibrary.filter(category => category.roles.includes(userProfile.role));
  }, [userProfile]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
    }
  }, [editorContent]);


  const handleGenerateClick = async () => {
    if (!selectedTemplate) { toast({ title: 'No Template Selected', description: 'Please select a template from the library first.', variant: 'destructive' }); return; }
    if (!userProfile) { toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' }); return; }

    if (!await deductCredits(3)) return;
    setLoading(true); setGeneratedDoc(null); setEditorContent(''); hasUserEdited.current = false;
    try { 
        const result = await AiActions.generateDocumentAction({ 
            templateName: selectedTemplate, 
            legalRegion: userProfile.legalRegion,
            context: context,
            reason: reason,
        }); 
        setGeneratedDoc(result); 
        setIsTyping(true); 
    } catch (error: any) { 
        toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' }); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleDownload = () => { if (!generatedDoc) return; const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${generatedDoc.title.replace(/ /g, '_')}.txt`); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
  
  const handleCopy = () => {
    if (!editorContent) return;
    navigator.clipboard.writeText(editorContent);
    toast({ title: "Copied to clipboard!" });
  };

  if (!userProfile) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col space-y-6">
        <Card className="flex flex-col bg-card interactive-lift">
            <CardHeader>
                <CardTitle className="text-base">1. Select a Template</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ScrollArea className="h-[400px]">
                    <RadioGroup value={selectedTemplate || ''} onValueChange={setSelectedTemplate} className="w-full">
                        <Accordion type="single" collapsible className="w-full">
                            {availableCategories.map((category) => (
                                <AccordionItem value={category.name} key={category.name}>
                                    <AccordionTrigger className="text-sm font-medium hover:no-underline interactive-lift py-2 px-2">{category.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col gap-1 pl-2">
                                            {category.templates.map((template) => {
                                                const isLocked = template.isPremium;
                                                return (
                                                    <Label key={template.name} className={cn("flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted interactive-lift", selectedTemplate === template.name && "bg-muted")}>
                                                        <RadioGroupItem value={template.name} id={template.name} />
                                                        <span className="font-normal text-sm">{template.name}</span>
                                                    </Label>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </RadioGroup>
                </ScrollArea>
            </CardContent>
        </Card>
        
        {selectedTemplate && (
          <Card className="animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="text-base">2. Add Context (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="context" className="text-xs font-normal">Situation / Context</Label>
                  <Textarea
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder={placeholders.context}
                      className="text-xs h-20"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs font-normal">Goal / Reason</Label>
                  <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={placeholders.reason}
                      className="text-xs h-20"
                  />
              </div>
            </CardContent>
             <CardFooter className="flex flex-col gap-2">
              <Button onClick={handleGenerateClick} disabled={loading || !selectedTemplate} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Document</>}
              </Button>
              <p className="text-xs text-muted-foreground">3 Credits per generation.</p>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2 xl:col-span-3 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 className="text-xl font-bold font-headline">Document Preview & Edit</h2>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" disabled={!generatedDoc || isTyping} onClick={handleCopy} className="interactive-lift"><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                <Button disabled={!generatedDoc || isTyping} onClick={handleDownload} className="interactive-lift"><Download className="mr-2 h-4 w-4" /> Download</Button>
            </div>
        </div>
        {loading ? <Card className="min-h-[400px]"><CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader><CardContent className="space-y-4 pt-4"><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-5/6"/></CardContent></Card> : generatedDoc ? <Card className="min-h-[400px] flex flex-col"><CardHeader><CardTitle>{generatedDoc.title}</CardTitle></CardHeader><CardContent className="flex-1 overflow-y-auto"><Textarea ref={editorRef} value={editorContent} onChange={handleEditorChange} readOnly={isTyping} className="font-code text-sm text-card-foreground min-h-[500px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" /></CardContent></Card> : <Card className="border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card"><div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4"><Library className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-xl font-semibold mb-1">Your Document Appears Here</h3><p className="text-muted-foreground max-w-xs">Select a template, add optional context, and click "Generate" to get started.</p></Card>}
      </div>
    </div>
  )
}

const WikiGenerator = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WikiGeneratorOutput | null>(null);
    const { toast } = useToast();
    const { userProfile, deductCredits } = useAuth();
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({ onDrop, noClick: true, noKeyboard: true, maxFiles: 1, maxSize: 5 * 1024 * 1024 });

    const handleGenerate = async () => {
        if (!file || !title.trim()) {
            toast({ variant: "destructive", title: "Missing Input", description: "Please provide a file and a title."});
            return;
        }
        if (!userProfile) return;
        if (!await deductCredits(5)) return;
        
        setLoading(true);
        setResult(null);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const fileDataUri = e.target?.result as string;
            try {
                const response = await AiActions.generateWikiAction({ fileDataUri, documentTitle: title });
                setResult(response);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Generation Failed", description: error.message });
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setLoading(false);
            toast({ variant: "destructive", title: "File Error", description: "Could not read the selected file."});
        }
    }
    
    const handleCopyWiki = () => {
      if (!result?.wikiContent) return;
      navigator.clipboard.writeText(result.wikiContent);
      toast({ title: 'Wiki content copied!' });
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <Card {...getRootProps()} className="interactive-lift">
                <input {...getInputProps()} />
                <CardContent className="pt-6">
                    <div className={cn("text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed h-full w-full transition-colors cursor-pointer", isDragActive ? "border-primary bg-primary/10" : "")}>
                       <BookText className="w-16 h-16 text-primary/20" />
                        <p className="font-semibold text-lg text-foreground">Drop a policy document here</p>
                        <p className="text-sm max-w-xs">Or click the button below to select a file (PDF, TXT, DOCX).</p>
                        <Button type="button" variant="outline" onClick={openFileDialog} className="mt-4 interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Select File</Button>
                    </div>
                </CardContent>
            </Card>
            {file && (
                <Card className="animate-in fade-in-50">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="wiki-title">Wiki Page Title</Label>
                            <Input id="wiki-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Employee Code of Conduct"/>
                        </div>
                        <Button onClick={handleGenerate} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            Generate Internal Wiki
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
        <Card className="lg:col-span-1 min-h-[400px]">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Generated Wiki Content</CardTitle>
                    {result && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyWiki}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading && <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>}
                {result ? (
                    <div className="prose dark:prose-invert max-w-none text-sm p-4 bg-muted/50 rounded-lg border">
                        <ReactMarkdown>{result.wikiContent}</ReactMarkdown>
                    </div>
                ) : !loading && (
                    <div className="text-center text-muted-foreground py-10">Your simplified wiki page will appear here.</div>
                )}
            </CardContent>
        </Card>
      </div>
    );
};


// --- Tab: Reconciliation ---
const DropzoneCard = ({ file, type, open, disabled }: { file: File | null; type: string; open: () => void; disabled?: boolean; }) => ( <div onClick={!disabled ? open : undefined} className={cn("border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center h-full", disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary transition-colors cursor-pointer bg-muted/40" )}><UploadCloud className="w-10 h-10 text-muted-foreground mb-2" /><p className="font-semibold">Upload {type} Filing</p>{file ? ( <p className="text-sm text-green-600 mt-2 flex items-center gap-2"><FileText className="w-4 h-4"/>{file.name}</p> ) : ( <p className="text-xs text-muted-foreground">Drag & drop or click</p> )}</div> );

const ReconciliationTab = () => {
    const { userProfile, deductCredits } = useAuth();
    const [files, setFiles] = useState<{ gst: File | null; roc: File | null; itr: File | null; }>({ gst: null, roc: null, itr: null });
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ReconciliationOutput | null>(null);
    const { toast } = useToast();
  
    const createDropHandler = (type: keyof typeof files) => useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) { toast({ variant: "destructive", title: "File Upload Error", description: fileRejections[0].errors[0].message }); return; }
        if (acceptedFiles[0]) { setFiles(prev => ({ ...prev, [type]: acceptedFiles[0] })); }
    }, [toast]);
    
    const dropzoneOptions = { maxFiles: 1, accept: { 'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }, maxSize: 5 * 1024 * 1024 };
  
    const { getRootProps: getGstRootProps, getInputProps: getGstInputProps, open: openGstDialog } = useDropzone({ onDrop: createDropHandler('gst'), noClick: true, ...dropzoneOptions });
    const { getRootProps: getRocRootProps, getInputProps: getRocInputProps, open: openRocDialog } = useDropzone({ onDrop: createDropHandler('roc'), noClick: true, ...dropzoneOptions });
    const { getRootProps: getItrRootProps, getInputProps: getItrInputProps, open: openItrDialog } = useDropzone({ onDrop: createDropHandler('itr'), noClick: true, ...dropzoneOptions });
  
    const getFileAsDataURI = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
  
    const handleReconcile = async () => {
      if (!files.gst || !files.roc || !files.itr) { toast({ variant: "destructive", title: "Missing Files", description: "Please upload all three documents to proceed." }); return; }
      if (!userProfile || !await deductCredits(2)) return;
      setIsProcessing(true); setResult(null);
      try {
        const [gstDataUri, rocDataUri, itrDataUri] = await Promise.all([ getFileAsDataURI(files.gst), getFileAsDataURI(files.roc), getFileAsDataURI(files.itr), ]);
        const response = await AiActions.reconcileDocumentsAction({ doc1Name: "GST Filing", doc1DataUri: gstDataUri, doc2Name: "ROC Filing", doc2DataUri: rocDataUri, doc3Name: "ITR Filing", doc3DataUri: itrDataUri, legalRegion: userProfile.legalRegion, });
        setResult(response);
        toast({ title: "Reconciliation Complete!", description: "Your report is ready below." });
      } catch (error: any) { toast({ variant: "destructive", title: "Analysis Failed", description: error.message }); } finally { setIsProcessing(false); }
    };
    
    const handleCopyReconciliation = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: 'Summary copied to clipboard!' });
    };
  
    if (!userProfile) { return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }
    
    return (
      <div className="space-y-6">
        <Card className="interactive-lift">
          <CardHeader><CardTitle>Upload Filings</CardTitle><CardDescription>Provide all three documents for a comprehensive reconciliation.</CardDescription></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-6"> <div {...getGstRootProps()}><input {...getGstInputProps()} /><DropzoneCard file={files.gst} type="GST" open={openGstDialog} disabled={isProcessing} /></div> <div {...getRocRootProps()}><input {...getRocInputProps()} /><DropzoneCard file={files.roc} type="ROC" open={openRocDialog} disabled={isProcessing} /></div> <div {...getItrRootProps()}><input {...getItrInputProps()} /><DropzoneCard file={files.itr} type="ITR" open={openItrDialog} disabled={isProcessing} /></div></div></CardContent>
          <CardFooter className="border-t pt-6 flex-col items-center gap-4"><Button onClick={handleReconcile} disabled={isProcessing || !files.gst || !files.roc || !files.itr}>{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>} Reconcile Documents</Button><p className="text-xs text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4"/>This analysis uses 2 credits.</p></CardFooter>
        </Card>
        {isProcessing && ( <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Our AI is crunching the numbers...</p></div> )}
        {result && (
          <Card className="interactive-lift animate-in fade-in-50 duration-500">
              <CardHeader><CardTitle>Reconciliation Report</CardTitle><CardDescription> Overall Status: <Badge variant={result.overallStatus === 'Matched' ? 'secondary' : 'destructive'} className={result.overallStatus === 'Matched' ? 'bg-green-100 text-green-800' : ''}>{result.overallStatus}</Badge></CardDescription></CardHeader>
              <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">AI Summary</h3>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyReconciliation(result.summary)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border">{result.summary}</p>
                  </div>
                  <Accordion type="multiple" defaultValue={['discrepancies', 'matched']} className="w-full">
                      <AccordionItem value="discrepancies"><AccordionTrigger className="text-base font-medium">Discrepancies Found ({result.discrepancies.length})</AccordionTrigger><AccordionContent className="pt-2">{result.discrepancies.length > 0 ? ( <div className="space-y-4">{result.discrepancies.map((item, index) => ( <Card key={index} className="bg-destructive/10 border-destructive/20"><CardHeader><CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle/> {item.field}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-3 gap-4 text-center">{item.values.map(v => ( <div key={v.source} className="p-2 border rounded-md bg-card"><p className="text-xs font-semibold">{v.source}</p><p className="text-sm font-mono">{v.value}</p></div> )) }</div><div><p className="text-sm font-semibold">Probable Cause:</p><p className="text-sm text-destructive/80">{item.reason}</p></div></CardContent></Card> ))}</div> ) : ( <p className="text-sm text-muted-foreground p-4">No discrepancies found.</p> )}</AccordionContent></AccordionItem>
                      <AccordionItem value="matched"><AccordionTrigger className="text-base font-medium">Matched Items ({result.matchedItems.length})</AccordionTrigger><AccordionContent className="pt-2">{result.matchedItems.length > 0 ? ( <div className="space-y-3">{result.matchedItems.map((item, index) => ( <div key={index} className="p-3 border rounded-md flex items-center justify-between bg-muted/50"><p className="font-medium text-sm flex items-center gap-2"><CheckCircle className="text-green-500"/>{item.field}</p><p className="font-mono text-sm">{item.value}</p></div> ))}</div> ) : ( <p className="text-sm text-muted-foreground p-4">No fully matched items found.</p> )}</AccordionContent></AccordionItem>
                  </Accordion>
              </CardContent>
          </Card>
        )}
      </div>
    )
  }

const LegalResearchTab = () => {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<LegalResearchOutput | null>(null);
    const { toast } = useToast();
    const { userProfile, deductCredits } = useAuth();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleQuerySubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim() || !userProfile) return;

        if (!await deductCredits(20)) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const response = await AiActions.performLegalResearchAction({ query, legalRegion: userProfile.legalRegion });
            setResult(response);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Research Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-4">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gavel/> AI Legal Research</CardTitle>
                        <CardDescription>Ask complex legal questions and get AI-powered analysis and precedents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleQuerySubmit} className="space-y-4">
                            <Textarea
                                ref={textareaRef}
                                placeholder="e.g., Explain the concept of 'force majeure' in commercial contracts under Indian law."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full resize-none min-h-[150px]"
                                disabled={isProcessing}
                            />
                            <Button type="submit" className="w-full" disabled={isProcessing || !query.trim()}>
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Start Research
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-4">
                <Card className="min-h-[500px]">
                    <CardHeader><CardTitle>Research Analysis</CardTitle></CardHeader>
                    <CardContent>
                        {isProcessing && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Researching precedents and statutes...</p></div>}
                        {!isProcessing && result && (
                            <div className="space-y-6 animate-in fade-in-50">
                                <Accordion type="multiple" defaultValue={['summary', 'analysis', 'precedents']} className="w-full">
                                    <AccordionItem value="summary"><AccordionTrigger>Summary</AccordionTrigger><AccordionContent className="prose dark:prose-invert max-w-none text-sm p-4"><ReactMarkdown>{result.summary}</ReactMarkdown></AccordionContent></AccordionItem>
                                    <AccordionItem value="analysis"><AccordionTrigger>Detailed Analysis</AccordionTrigger><AccordionContent className="prose dark:prose-invert max-w-none text-sm p-4"><ReactMarkdown>{result.analysis}</ReactMarkdown></AccordionContent></AccordionItem>
                                    <AccordionItem value="precedents"><AccordionTrigger>Relevant Precedents</AccordionTrigger><AccordionContent className="space-y-3 pt-2">{result.precedents.map((p,i) => <div key={i} className="p-3 border rounded-md"><p className="font-semibold text-sm">{p.caseName}</p><p className="text-xs text-muted-foreground mt-1">{p.summary}</p></div>)}</AccordionContent></AccordionItem>
                                </Accordion>
                            </div>
                        )}
                         {!isProcessing && !result && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Gavel className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your legal analysis will appear here.</p></div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- Tab: Penalty Predictor ---
const PenaltyPredictorTab = () => {
    const { userProfile, deductCredits } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<PenaltyPredictorOutput | null>(null);
    const [defaultDescription, setDefaultDescription] = useState("");
    const { toast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!defaultDescription.trim() || !userProfile) return;
        if (!await deductCredits(1)) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const response = await AiActions.predictPenaltyAction({
                complianceDefault: defaultDescription,
                legalRegion: userProfile.legalRegion,
            });
            setResult(response);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Prediction Failed', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const getRiskColorClasses = (level: 'High' | 'Medium' | 'Low') => {
        switch (level) {
            case 'High': return 'bg-destructive/10 border-destructive/20 text-destructive';
            case 'Medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
            case 'Low': return 'bg-primary/10 border-primary/20 text-primary';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>AI Penalty Predictor</CardTitle>
                        <CardDescription>Describe a compliance default to get an AI-powered risk assessment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="default-description">Describe the Compliance Default</Label>
                            <Textarea
                                id="default-description"
                                value={defaultDescription}
                                onChange={(e) => setDefaultDescription(e.target.value)}
                                placeholder="e.g., 'We missed filing our GSTR-3B for the month of July. Our turnover is around 2 Cr.'"
                                className="min-h-[150px]"
                                disabled={isProcessing}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isProcessing || !defaultDescription.trim()}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Predict Penalty (1 Credit)
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            <div className="lg:col-span-3">
                 <Card className="min-h-[400px] interactive-lift">
                    <CardHeader>
                        <CardTitle>Risk Analysis Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isProcessing && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Analyzing potential consequences...</p></div>}
                        {!result && !isProcessing && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Gavel className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your penalty analysis will appear here.</p></div>}
                        {result && (
                            <div className="space-y-6 animate-in fade-in-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/50 border text-center">
                                        <p className="text-sm text-muted-foreground">Estimated Penalty</p>
                                        <p className="text-xl font-bold">{result.penaltyAmount}</p>
                                    </div>
                                    <div className={cn("p-4 rounded-lg border text-center", getRiskColorClasses(result.riskLevel))}>
                                        <p className="text-sm font-medium">Risk Level</p>
                                        <p className="text-xl font-bold">{result.riskLevel}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Reasoning</h4>
                                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 border rounded-md">{result.reasoning}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Mitigation Steps</h4>
                                    <ul className="space-y-2">
                                        {result.mitigationSteps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 p-3 text-sm rounded-md bg-muted/50 border">
                                                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0"/>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- Main AI Toolkit Page ---
export default function AiToolkitPage() {
    const { userProfile, isDevMode } = useAuth();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    
    // State to manage the active tab, initialized from URL param or default
    const [activeTab, setActiveTab] = useState(tabParam || 'assistant');

    useEffect(() => {
        if(tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }
    
    const isPro = planHierarchy[userProfile.plan] > 0;
    
    const showAnalyzer = (userProfile?.role === 'Founder' && (isPro || isDevMode)) || (userProfile?.role === 'CA' && (isPro || isDevMode)) || userProfile?.role === 'Legal Advisor' || userProfile?.role === 'Enterprise';
    const showResearch = userProfile?.role === 'Legal Advisor' || userProfile?.role === 'Enterprise';
    const showReconciliation = userProfile?.role === 'CA' || userProfile?.role === 'Enterprise' || isDevMode;

    const pageTitle = useMemo(() => {
        if (!userProfile) return "AI Toolkit";
        switch (userProfile.role) {
            case 'CA': return 'AI Practice Suite';
            case 'Legal Advisor': return 'AI Counsel Tools';
            case 'Enterprise': return 'AI Compliance Suite';
            default: return 'AI Toolkit';
        }
    }, [userProfile]);

    const pageDescription = useMemo(() => {
        if (!userProfile) return "Your unified AI workspace for legal and compliance tasks.";
        switch (userProfile.role) {
            case 'CA': return 'A suite of AI-powered tools to enhance your practice and client services.';
            case 'Legal Advisor': return 'Leverage AI for legal research, document analysis, and drafting.';
            case 'Enterprise': return 'AI-driven tools for managing enterprise-wide compliance and governance.';
            default: return 'Your unified AI workspace for legal and compliance tasks.';
        }
    }, [userProfile]);
    
    const tabs = [
        { value: 'assistant', label: 'Assistant', icon: MessageSquare, content: <ChatAssistant /> },
        { value: 'studio', label: 'Doc Studio', icon: FilePenLine, content: <DocumentStudioTab /> },
        { value: 'analyzer', label: 'Analyzer', icon: FileScan, content: showAnalyzer ? <DocumentAnalyzerTab /> : <UpgradePrompt /> },
        { value: 'reconciliation', label: 'Reconciliation', icon: Scale, content: showReconciliation ? <ReconciliationTab /> : <UpgradePrompt /> },
        { value: 'predictor', label: 'Penalty Predictor', icon: Gavel, content: <PenaltyPredictorTab /> },
        { value: 'research', label: 'Research', icon: Gavel, content: showResearch ? <LegalResearchTab /> : null, hidden: !showResearch },
        { value: 'workflows', label: 'Workflows', icon: Workflow, content: <WorkflowTab />, hidden: !isDevMode },
    ].filter(t => !t.hidden);
    
    const currentTabInfo = tabs.find(t => t.value === activeTab) || tabs[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{pageTitle}</h1>
                <p className="text-muted-foreground">{pageDescription}</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="md:hidden">
                    <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-full">
                           <div className="flex items-center gap-2">
                               <currentTabInfo.icon className="w-4 h-4" />
                               <span>{currentTabInfo.label}</span>
                           </div>
                        </SelectTrigger>
                        <SelectContent>
                            {tabs.map(tab => (
                                <SelectItem key={tab.value} value={tab.value}>
                                   <div className="flex items-center gap-2">
                                     <tab.icon className="w-4 h-4" />
                                     {tab.label}
                                   </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="hidden md:block">
                    <TabsList>
                        {tabs.map(t => (
                            <TabsTrigger key={t.value} value={t.value} className="interactive-lift">
                                <t.icon className="mr-2"/>{t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <div className="mt-6">
                    {tabs.map(t => (
                        <TabsContent key={t.value} value={t.value} className="mt-0">
                            {activeTab === t.value && t.content}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
