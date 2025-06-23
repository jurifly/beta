'use client';

import { useState } from 'react';
import { ArrowRight, Bot, Check, Clipboard, Loader2, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateChecklist, type AssistantOutput } from '@/ai/flows/assistant-flow';

export default function AiCopilotPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: 'Input required',
        description: 'Please enter a topic for the checklist.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await generateChecklist({ topic });
      setResult(response);
    } catch (error) {
      console.error('Error generating checklist:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to generate the compliance checklist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `${result.title}\n\n${result.checklist.map(item => `- [ ] ${item.task} (${item.category})`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: 'The checklist has been copied.',
    });
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">AI Assistant</h1>
          <p className="text-muted-foreground">
            Generate personalized compliance checklists for any business scenario.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>What checklist do you need?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., 'monthly compliance for a new startup'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              disabled={loading}
            />
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                 <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-1/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="interactive-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result.title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Clipboard className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {result.checklist.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
