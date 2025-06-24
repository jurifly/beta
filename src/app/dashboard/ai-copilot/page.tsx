'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from 'react';
import { Bot, Check, Clipboard, FileText, Loader2, Send, Sparkles, User, History, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateChecklist, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';

// Type guard to differentiate message content
function isChecklist(content: any): content is AssistantOutput {
  return content && typeof content === 'object' && 'checklist' in content;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | AssistantOutput;
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


// --- Main Page Component ---

export default function AiCopilotPage() {
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
    <div className={cn("flex flex-col bg-card border rounded-lg shadow-sm", chatHistory.length === 0 && view === 'chat' && !isProcessing ? "h-auto" : "h-full max-h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)]")}>
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

      <div className="p-4 border-t bg-card-background rounded-b-lg">
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
}
