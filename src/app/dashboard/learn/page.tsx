
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { learningTerms as founderTerms, categorizedTerms as founderCategorizedTerms, type Term as FounderTerm, type Category as FounderCategory } from '@/lib/learn-content';
import { caLearningTerms, caCategorizedTerms, type Term as CaTerm, type Category as CaCategory } from '@/lib/ca-learn-content';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';

type AnyTerm = FounderTerm | CaTerm;
type AnyCategory = FounderCategory | CaCategory;

export default function LearnPage() {
    const { userProfile } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState<AnyTerm | null>(null);

    const isCaOrPro = useMemo(() => {
        return userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor' || userProfile?.role === 'Enterprise';
    }, [userProfile]);

    const categorizedTerms = isCaOrPro ? caCategorizedTerms : founderCategorizedTerms;

    const filteredCategories = useMemo(() => {
        const source = isCaOrPro ? caCategorizedTerms : founderCategorizedTerms;
        if (!searchTerm) {
          return Object.entries(source).map(([category, terms]) => ({ category, terms }));
        }

        return Object.entries(source)
          .map(([category, terms]) => {
            const filteredTerms = (terms as AnyTerm[]).filter(term =>
              term.title.toLowerCase().includes(searchTerm.toLowerCase()) || term.summary.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return { category, terms: filteredTerms };
          })
          .filter(category => category.terms.length > 0)
    }, [searchTerm, isCaOrPro]);

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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedTerm?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">{selectedTerm?.summary}</p>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">The Playbook</h1>
                    <p className="text-muted-foreground mt-1">
                        {isCaOrPro 
                            ? "Your searchable glossary for key compliance, tax, and legal terms."
                            : "Your searchable glossary for key startup, legal, and financial terms."
                        }
                    </p>
                </div>
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mt-2 pt-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for a term (e.g., 'Vesting', 'GSTR-1', 'CARO 2020')..."
                            className="pl-12 h-12 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="space-y-8">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(({ category, terms }) => (
                          <Card key={category} className="interactive-lift">
                              <CardHeader>
                                  <CardTitle>{category}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex flex-wrap gap-2">
                                      {terms.map((term: any) => (
                                          <Button 
                                            key={term.slug} 
                                            variant="outline"
                                            onClick={() => setSelectedTerm(term)}
                                            className="interactive-lift"
                                          >
                                            {term.title}
                                          </Button>
                                      ))}
                                  </div>
                              </CardContent>
                          </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                          <p className="font-semibold text-lg">No terms found</p>
                          <p className="text-sm max-w-sm">
                              Your search for "{searchTerm}" did not match any terms in the playbook.
                          </p>
                      </div>
                    )}
                </div>
            </div>
        </>
    );
}
