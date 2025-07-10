
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categorizedTerms, type Term } from '@/lib/learn-content';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LearnPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = Object.entries(categorizedTerms)
      .map(([category, terms]) => {
        const filteredTerms = terms.filter(term =>
          term.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { category, terms: filteredTerms };
      })
      .filter(category => category.terms.length > 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">The Playbook</h1>
                <p className="text-muted-foreground mt-1">
                    Your searchable glossary for key startup, legal, and financial terms.
                </p>
            </div>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mt-2 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for a term (e.g., 'Vesting', 'CAC', 'Term Sheet')..."
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
                              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                  {terms.map(term => (
                                      <div key={term.slug} className="group relative">
                                          <dt className="font-semibold">{term.title}</dt>
                                          <dd className="text-sm text-muted-foreground">{term.summary}</dd>
                                      </div>
                                  ))}
                              </dl>
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
    );
}
