'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from 'react';
import { Bot, Check, Clipboard, FileText, Loader2, Paperclip, Send, Sparkles, User, History, MessageSquare, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateChecklist, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | AssistantOutput;
};

export default function AiCopilotPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    if (e) e.preventDefault();
    const topic = suggestion || input;
    if (!topic.trim()) return;

    setLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: topic }]);
    setInput('');

    try {
      const response = await generateChecklist({ topic });
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error generating checklist:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to generate the response. Please try again.',
        variant: 'destructive',
      });
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(undefined, suggestion);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit(undefined, input);
    }
  };

  const copyToClipboard = (checklist: AssistantOutput) => {
    if (!checklist) return;
    const textToCopy = `${checklist.title}\n\n${checklist.checklist.map(item => `- [ ] ${item.task} (${item.category})`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The checklist has been copied.',
    });
  };

  const suggestionPrompts = [
    { text: 'Register a Pvt Ltd', icon: FileText },
    { text: 'Hire first employee', icon: UserPlus },
    { text: 'Close Financial Year', icon: Clock },
  ];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)] bg-card border rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-lg font-bold font-headline">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Your unified legal copilot.</p>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="bg-muted">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
            </Button>
            <Button variant="ghost" size="sm">
                <History className="mr-2 h-4 w-4" />
                History
            </Button>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {chatHistory.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Your AI Legal Assistant</h2>
            <p className="text-muted-foreground mb-6">Ask a legal question, drop a file, or try a suggestion.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-4">
              {suggestionPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => handleSuggestionClick(prompt.text)}
                  className="p-4 border rounded-lg text-left hover:bg-muted transition-colors flex items-center gap-3 interactive-lift"
                >
                  <prompt.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-sm">{prompt.text}</span>
                </button>
              ))}
            </div>
             <Button variant="ghost" className="bg-primary/10 text-primary hover:bg-primary/20 w-full max-w-3xl interactive-lift">
                <Paperclip className="w-4 h-4 mr-2" />
                Got a notice? Upload it for analysis.
            </Button>
          </div>
        )}

        {chatHistory.map((message, index) => (
          <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : '')}>
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 border">
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
              </Avatar>
            )}
            
            <div className={cn('max-w-2xl rounded-xl', message.role === 'user' ? 'bg-primary text-primary-foreground p-4' : 'p-0')}>
              {typeof message.content === 'string' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="bg-muted rounded-xl">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-bold text-md">{message.content.title}</h3>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(message.content as AssistantOutput)}>
                          <Clipboard className="h-4 w-4" />
                          <span className="sr-only">Copy to clipboard</span>
                        </Button>
                    </div>
                    <ul className="space-y-3 p-4">
                    {message.content.checklist.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
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
            </div>

            {message.role === 'user' && userProfile && (
              <Avatar className="w-8 h-8 border">
                  <AvatarImage src={`https://avatar.vercel.sh/${userProfile.email}.png`} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center space-x-4">
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

      <div className="p-4 border-t bg-card-background rounded-b-lg">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Button type="button" variant="ghost" size="icon" disabled={loading}>
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
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
