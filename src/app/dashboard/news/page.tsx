

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/auth';
import { Loader2, Rss } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getNews, type NewsArticle } from '@/ai/flows/news-flow';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const newsCategories = {
    'India': [
        { key: 'corporate law', name: 'Corporate Law' },
        { key: 'taxation', name: 'Taxation' },
        { key: 'startup funding', name: 'Startup Funding' },
        { key: 'SEBI regulations', name: 'SEBI' },
        { key: 'RBI policy', name: 'RBI' },
    ],
    'USA': [
        { key: 'corporate law', name: 'Corporate Law' },
        { key: 'IRS tax', name: 'Taxation' },
        { key: 'startup funding', name: 'Startup Funding' },
        { key: 'SEC filings', name: 'SEC' },
        { key: 'federal reserve', name: 'The Fed' },
    ],
    // Add other regions as needed
};

const ArticleCard = ({ article }: { article: NewsArticle }) => (
    <Card className="flex flex-col overflow-hidden interactive-lift">
        {article.urlToImage && (
            <div className="relative h-48 w-full">
                <Image
                    src={article.urlToImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                    data-ai-hint="news article"
                />
            </div>
        )}
        <CardHeader>
            <CardTitle className="text-lg leading-snug">{article.title}</CardTitle>
            <CardDescription className="text-xs pt-1">
                {article.source.name} &bull; {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
        </CardContent>
        <CardFooter>
            <Button asChild variant="secondary" className="w-full">
                <a href={article.url} target="_blank" rel="noopener noreferrer">Read Full Article</a>
            </Button>
        </CardFooter>
    </Card>
);

const ArticleSkeleton = () => (
    <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function LatestNewsPage() {
    const { userProfile } = useAuth();
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const legalRegion = userProfile?.legalRegion || 'India';
    const categories = newsCategories[legalRegion as keyof typeof newsCategories] || newsCategories['India'];
    const [activeCategory, setActiveCategory] = useState(categories[0].key);

    useEffect(() => {
        const fetchNews = async () => {
            if (!userProfile) return;
            setIsLoading(true);
            try {
                const newsResult = await getNews({ topic: activeCategory, legalRegion: userProfile.legalRegion });
                setArticles(newsResult.articles);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [activeCategory, userProfile]);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Latest News</h1>
                <p className="text-muted-foreground">The latest headlines and updates relevant to you, powered by NewsAPI.</p>
            </div>

            <div className="sticky top-[70px] bg-background/80 backdrop-blur-sm z-10 py-4 -my-4">
                 <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.key} value={cat.key}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)
                ) : articles.length > 0 ? (
                    articles.map((article, index) => <ArticleCard key={article.url + index} article={article} />)
                ) : (
                    <div className="md:col-span-2 lg:col-span-3">
                         <Card className="flex items-center justify-center min-h-[400px]">
                            <CardContent className="text-center p-8">
                                <Rss className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="font-semibold text-lg">No Articles Found</p>
                                <p className="text-sm text-muted-foreground">Could not find recent news for this topic.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
