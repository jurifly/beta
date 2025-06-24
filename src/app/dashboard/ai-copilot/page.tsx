'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Bot, Check, Clipboard, FileText, Loader2, Paperclip, Send, Sparkles, User, History, MessageSquare, Clock, FileScan, UploadCloud, AlertTriangle, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateChecklist, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { analyzeContract, type AnalyzeContractOutput } from '@/ai/flows/contract-analyzer-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Type guards to differentiate message content
function isChecklist(content: any): content is AssistantOutput {
  return content && typeof content === 'object' && 'checklist' in content;
}

function isAnalysis(content: any): content is AnalyzeContractOutput {
  return content && typeof content === 'object' && 'riskScore' in content;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | AssistantOutput | AnalyzeContractOutput;
};

const CHAT_HISTORY_KEY = 'aiCopilotHistory';


// --- Result Rendering Components ---

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
    <div className="bg-muted rounded-xl max-w-4xl prose-p:my-0 prose-ul:my-0">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-md font-sans">{checklist.title}</h3>
        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(checklist)}>
          <Clipboard className="h-4 w-4" />
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </div>
      <div className="p-4 prose dark:prose-invert max-w-none text-sm font-sans" dangerouslySetInnerHTML={{ __html: checklist.checklist.map(item => `<p><b>${item.category}:</b> ${item.task}</p>`).join('') }} />
    </div>
  );
};


const AnalysisResult = ({ analysis }: { analysis: AnalyzeContractOutput }) => {
    const riskScore = analysis.riskScore;
    const riskLevel = riskScore > 75 ? "Low" : riskScore > 50 ? "Medium" : "High";
    const riskColor = riskScore > 75 ? "text-green-500" : riskScore > 50 ? "text-yellow-500" : "text-red-500";

    return (
        <Card className="bg-muted rounded-xl max-w-4xl overflow-hidden">
             <CardHeader className="flex flex-row items-center gap-4 bg-muted/50 p-4 border-b">
                <FileScan className="w-6 h-6 text-primary"/>
                <div>
                  <CardTitle className="text-lg">Contract Analysis Report</CardTitle>
                  <CardDescription>AI-powered risk assessment complete.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-6xl font-bold ${riskColor}`}>{riskScore}</p>
                        <p className={`text-lg font-medium ${riskColor}`}>{riskLevel} Risk</p>
                    </CardContent>
                </Card>

                <Accordion type="multiple" defaultValue={['summary', 'risks']} className="w-full">
                    <AccordionItem value="summary">
                        <AccordionTrigger>Contract Summary</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-3 text-sm">
                                <div><span className="font-semibold">Type:</span> {analysis.summary.contractType}</div>
                                <div><span className="font-semibold">Parties:</span> {analysis.summary.parties.join(', ')}</div>
                                <div><span className="font-semibold">Effective Date:</span> {analysis.summary.effectiveDate}</div>
                                <div className="pt-2"><p className="font-semibold mb-1">Purpose:</p><p className="text-muted-foreground">{analysis.summary.purpose}</p></div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="risks">
                        <AccordionTrigger>Risk Flags ({analysis.riskFlags.length})</AccordionTrigger>
                        <AccordionContent>
                            {analysis.riskFlags.length > 0 ? (
                                <div className="space-y-3">
                                {analysis.riskFlags.map((flag, i) => (
                                    <div key={i} className="p-3 bg-card/50 rounded-lg border-l-4 border-l-red-500">
                                        <p className="font-semibold text-sm">Clause: <span className="font-normal italic">"{flag.clause}"</span></p>
                                        <p className="text-muted-foreground text-sm mt-1"><span className="font-medium text-foreground">Risk:</span> {flag.risk}</p>
                                    </div>
                                ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No significant risks found.</p>}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="missing">
                        <AccordionTrigger>Missing Clauses ({analysis.missingClauses.length})</AccordionTrigger>
                        <AccordionContent>
                             {analysis.missingClauses.length > 0 ? (
                                <ul className="space-y-2 list-disc list-inside">
                                {analysis.missingClauses.map((clause, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <FileWarning className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0"/>
                                        <span>{clause}</span>
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No critical clauses seem to be missing.</p>}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};


// --- Main Page Component ---

export default function AiCopilotPage() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [savedConversations, setSavedConversations] = useState<ChatMessage[][]>([]);
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();
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

  const handleFileAnalysis = useCallback(async (file: File) => {
    if (!await deductCredits(5)) return;

    setIsProcessing(true);
    setView('chat');

    const userMessage: ChatMessage = { role: 'user', content: `Analyze the document: ${file.name}` };
    const currentChat = [userMessage];
    setChatHistory(currentChat);

    try {
        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
            const fileDataUri = loadEvent.target?.result as string;
            const response = await analyzeContract({ fileDataUri });
            const assistantMessage: ChatMessage = { role: 'assistant', content: response };
            const newConversation = [...currentChat, assistantMessage];

            setChatHistory(newConversation);
            saveConversation(newConversation);
            setIsProcessing(false);
        };
        reader.onerror = () => {
             throw new Error('Failed to read file.');
        };
        reader.readAsDataURL(file);
    } catch(error) {
        console.error('Error analyzing contract:', error);
        toast({
            title: 'Analysis Failed',
            description: 'Could not analyze the contract. Please try again.',
            variant: 'destructive',
        });
        setChatHistory([]);
        setIsProcessing(false);
    }
  }, [deductCredits, toast]);

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
        handleFileAnalysis(acceptedFiles[0]);
      }
  }, [handleFileAnalysis, toast]);

  const { getRootProps, getInputProps, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]},
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleTextSubmit(undefined, input);
    }
  };

  const suggestionPrompts = [
    { text: 'Register a Private Limited Company', icon: FileText, action: () => handleTextSubmit(undefined, 'Register a Private Limited Company') },
    { text: 'Hire first employee', icon: Clock, action: () => handleTextSubmit(undefined, 'Hire first employee') },
    { text: 'Analyze a document', icon: FileScan, action: openFileDialog },
  ];

  return (
    <div {...getRootProps({
        className: cn("flex flex-col bg-card border rounded-lg shadow-sm", chatHistory.length === 0 && view === 'chat' && !isProcessing ? "h-auto" : "h-full max-h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)]")
    })}>
      <input {...getInputProps()} />
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-lg font-bold font-headline">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Your unified legal copilot.</p>
        </div>
        <div className="flex items-center gap-1">
            <Button variant={view === 'chat' ? 'outline' : 'ghost'} size="sm" className={cn("interactive-lift", view === 'chat' && "bg-muted")} onClick={() => setView('chat')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
            </Button>
            <Button variant={view === 'history' ? 'outline' : 'ghost'} size="sm" className={cn("interactive-lift", view === 'history' && "bg-muted")} onClick={() => setView('history')}>
                <History className="mr-2 h-4 w-4" />
                History
            </Button>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {view === 'chat' && (
        <>
          {chatHistory.length === 0 && !isProcessing && (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Your AI Legal Assistant</h2>
              <p className="text-muted-foreground mb-6">Ask a legal question, drop a file, or try a suggestion.</p>
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
               <Button variant="ghost" className="bg-primary/10 text-primary hover:bg-primary/20 w-full max-w-3xl interactive-lift" onClick={openFileDialog}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Or drag and drop a file anywhere
              </Button>
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
                  ) : isAnalysis(message.content) ? (
                    <AnalysisResult analysis={message.content} />
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

      <div className="p-4 border-t bg-card-background rounded-b-lg">
        <form onSubmit={handleTextSubmit} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Button type="button" variant="ghost" size="icon" disabled={isProcessing} onClick={openFileDialog}>
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
              </Button>
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="e.g., 'What are the compliance requirements for a private limited company?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none pr-14 pl-14 py-3 max-h-48 overflow-y-auto"
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
}
