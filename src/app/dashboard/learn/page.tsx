
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookHeart, BookOpenCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { categorizedTopics, learningTopics, type LearningTopic } from '@/lib/learn-content';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const TopicContent = ({ topic, onSelectTopic }: { topic: LearningTopic, onSelectTopic: (slug: string) => void }) => {
    return (
      <Card className="animate-in fade-in-50">
          <CardHeader>
              <CardTitle className="text-3xl font-headline flex items-center gap-3">
                <div className="p-3 bg-muted rounded-lg text-primary"><BookOpenCheck className="w-6 h-6"/></div>
                {topic.title}
              </CardTitle>
              <Alert className="mt-4 border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  <BookHeart className="h-4 w-4 !text-amber-500"/>
                  <AlertTitle className="font-semibold text-amber-800 dark:text-amber-200">ELI5: Explain Like I'm 5</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                      {topic.summary}
                  </AlertDescription>
              </Alert>
          </CardHeader>
          <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{topic.content}</ReactMarkdown>
              </div>
              {topic.furtherReading && topic.furtherReading.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                      <h3 className="font-semibold mb-3 text-lg">Keep Learning...</h3>
                      <div className="flex flex-wrap gap-2">
                          {topic.furtherReading.map(slug => {
                              const nextTopic = learningTopics.find(t => t.slug === slug);
                              if (!nextTopic) return null;
                              return (
                                  <Button key={slug} variant="secondary" onClick={() => onSelectTopic(slug)} className="interactive-lift">
                                      {nextTopic.title}
                                  </Button>
                              );
                          })}
                      </div>
                  </div>
              )}
          </CardContent>
      </Card>
    );
};

export default function LearnPage() {
    const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);

    const handleTopicSelect = (slug: string) => {
        setSelectedTopicSlug(slug);
    };

    const selectedTopic = learningTopics.find(t => t.slug === selectedTopicSlug);

    if (selectedTopic) {
        return (
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setSelectedTopicSlug(null)} className="mb-4">
                    <ArrowLeft className="mr-2" /> Back to All Topics
                </Button>
                <TopicContent topic={selectedTopic} onSelectTopic={handleTopicSelect} />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Learn Hub</h1>
                <p className="text-muted-foreground mt-1">
                    Your knowledge base for key startup, legal, and financial topics.
                </p>
            </div>
            <div className="space-y-8">
                {Object.entries(categorizedTopics).map(([category, topics]) => (
                    <Card key={category} className="interactive-lift">
                        <CardHeader>
                            <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {topics.map(topic => (
                                <button
                                    key={topic.slug}
                                    onClick={() => handleTopicSelect(topic.slug)}
                                    className="p-4 border rounded-lg text-left hover:bg-muted hover:border-primary transition-colors flex flex-col justify-between items-start h-full interactive-lift"
                                >
                                  <div>
                                    <h3 className="font-semibold text-base">{topic.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.summary}</p>
                                  </div>
                                   <div className="text-xs font-medium text-primary mt-3">Read more &rarr;</div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
