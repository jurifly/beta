

"use client"

import { useState, useEffect, useMemo, type ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookHeart, Loader2, Search } from "lucide-react";
import { learningTerms as founderTerms, categorizedTerms as founderCategorized } from "@/lib/learn-content";
import { caLearningTerms, caCategorizedTerms } from "@/lib/ca-learn-content";
import type { Term, Category } from "@/lib/learn-content";

export default function LearnHubPage() {
    const { userProfile } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

    const isCA = userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor';
    const allContent = useMemo(() => isCA ? caLearningTerms : founderTerms, [isCA]);
    const categorizedContent = useMemo(() => isCA ? caCategorizedTerms : founderCategorized, [isCA]);

    const filteredCategorizedContent = useMemo(() => {
        if (!searchTerm.trim()) {
            return categorizedContent;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered: Record<string, Term[]> = {};

        for (const category in categorizedContent) {
            const terms = categorizedContent[category as Category];
            const matchingTerms = terms.filter(
                (term) =>
                    term.title.toLowerCase().includes(lowercasedFilter) ||
                    term.summary.toLowerCase().includes(lowercasedFilter)
            );
            if (matchingTerms.length > 0) {
                filtered[category] = matchingTerms;
            }
        }
        return filtered;
    }, [searchTerm, categorizedContent]);
    
    if (!userProfile) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    return (
      <>
        <Dialog open={!!selectedTerm} onOpenChange={(isOpen) => !isOpen && setSelectedTerm(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedTerm?.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">{selectedTerm?.summary}</p>
                </div>
            </DialogContent>
        </Dialog>

        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">Learn Hub</h1>
                <p className="text-muted-foreground">
                    Your quick-reference dictionary for {isCA ? "technical compliance" : "startup"} terms.
                </p>
            </div>
            
             <div className="sticky top-[70px] bg-background/80 backdrop-blur-sm z-10 py-4 -my-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for a term (e.g., 'Cap Table', 'GSTR-1')..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {Object.keys(filteredCategorizedContent).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(filteredCategorizedContent).map(([category, terms]) => {
                        if (terms.length === 0) return null;
                        return (
                            <Card key={category} className="interactive-lift">
                                <CardHeader>
                                    <CardTitle>{category}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {terms.map((term: Term) => (
                                        <Button 
                                            key={term.slug}
                                            variant="secondary"
                                            className="h-auto py-1 px-3 interactive-lift"
                                            onClick={() => setSelectedTerm(term)}
                                        >
                                            {term.title}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <BookHeart className="w-16 h-16 text-primary/20"/>
                    <p className="font-semibold text-lg">No Terms Found</p>
                    <p className="text-sm max-w-sm">
                        Your search for "{searchTerm}" did not match any terms. Try a different keyword.
                    </p>
                </div>
            )}
        </div>
      </>
    )
}
