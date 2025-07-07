
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { getLearningContentAction } from './actions';
import type { LearnOutput } from '@/ai/flows/learn-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

const learningTopics = [
    {
        category: 'Company Registration',
        topics: ['Private Limited Company', 'Limited Liability Partnership (LLP)', 'One Person Company (OPC)', 'Choosing a Business Name']
    },
    {
        category: 'Tax & Compliance',
        topics: ['GST Basics', 'TDS Explained', 'Director KYC', 'Annual Filings']
    },
    {
        category: 'Funding Basics',
        topics: ['Bootstrapping', 'Angel Investing', 'Venture Capital', 'Term Sheet Basics', 'SAFE vs Convertible Note']
    },
    {
        category: 'Startup Metrics',
        topics: ['Burn Rate', 'CAC (Customer Acquisition Cost)', 'LTV (Lifetime Value)', 'MRR vs ARR', 'Churn Rate']
    }
];

const LoadingState = () => (
    <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
);

export default function LearnPage() {
    const { userProfile, deductCredits } = useAuth();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState<LearnOutput | null>(null);
    const { toast } = useToast();

    const handleTopicSelect = async (topic: string) => {
        if (!userProfile) return;
        if (!await deductCredits(1)) return;

        setSelectedTopic(topic);
        setIsLoading(true);
        setContent(null);

        try {
            const result = await getLearningContentAction({ topic, legalRegion: userProfile.legalRegion });
            setContent(result);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching content', description: error.message });
            setSelectedTopic(null);
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedTopic) {
        return (
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="mb-4">
                    <ArrowLeft className="mr-2" /> Back to Topics
                </Button>
                {isLoading ? (
                    <Card><CardContent className="p-6"><LoadingState /></CardContent></Card>
                ) : content && (
                    <Card className="animate-in fade-in-50">
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">{content.title}</CardTitle>
                            <CardDescription className="pt-2 text-base bg-amber-100/50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-500/20">
                                <strong>ELI5:</strong> {content.summary}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{content.content}</ReactMarkdown>
                            </div>
                            {content.furtherReading && (
                                <div className="mt-8 pt-6 border-t">
                                    <h3 className="font-semibold mb-3">Keep Learning...</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {content.furtherReading.map(topic => (
                                            <Button key={topic} variant="secondary" onClick={() => handleTopicSelect(topic)}>
                                                {topic}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Learn Hub</h1>
                <p className="text-muted-foreground mt-1">
                    AI-powered explainers on key startup, legal, and financial topics.
                </p>
            </div>
            <div className="space-y-8">
                {learningTopics.map(category => (
                    <Card key={category.category} className="interactive-lift">
                        <CardHeader>
                            <CardTitle>{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            {category.topics.map(topic => (
                                <Button
                                    key={topic}
                                    variant="outline"
                                    onClick={() => handleTopicSelect(topic)}
                                    className="interactive-lift"
                                >
                                    {topic}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
