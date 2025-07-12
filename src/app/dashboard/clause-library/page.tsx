
"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, PlusCircle, Search, Loader2, Trash2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddClauseModal } from "@/components/dashboard/add-clause-modal";
import type { Clause } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { allClauses as prebuiltClauses } from "@/lib/clause-library-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const USER_CLAUSE_STORAGE_KEY = "userClauseLibrary";

const ClauseCard = ({ clause, onDelete, onCopy }: { clause: Clause; onDelete: (id: string) => void; onCopy: (text: string) => void; }) => (
    <Card key={clause.id} className="group interactive-lift">
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-base">{clause.title}</CardTitle>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(clause.content)}><Copy className="w-4 h-4"/></Button>
                    {clause.id.startsWith('user_') && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(clause.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                    )}
                </div>
            </div>
            {!clause.id.startsWith('user_') && <Badge variant="secondary">Pre-built</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{clause.content}</p>
            <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t">
                {clause.description && <p><strong>Description:</strong> {clause.description}</p>}
                {clause.useCase && <p><strong>Use Case:</strong> {clause.useCase}</p>}
                {clause.relevantSection && <p><strong>Relevant Law:</strong> {clause.relevantSection}</p>}
                {clause.editableFields && <p><strong>Editable Fields:</strong> {clause.editableFields.join(', ')}</p>}
            </div>
        </CardContent>
    </Card>
);

export default function ClauseLibraryPage() {
    const { userProfile } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);
    const [userClauses, setUserClauses] = useState<Clause[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedClauses = localStorage.getItem(USER_CLAUSE_STORAGE_KEY);
            if (savedClauses) {
                setUserClauses(JSON.parse(savedClauses));
            }
        } catch (error) {
            console.error("Failed to load user clauses from localStorage", error);
        }
    }, []);

    const saveUserClauses = (updatedClauses: Clause[]) => {
        setUserClauses(updatedClauses);
        try {
            localStorage.setItem(USER_CLAUSE_STORAGE_KEY, JSON.stringify(updatedClauses));
        } catch (error) {
            console.error("Failed to save user clauses to localStorage", error);
            toast({ variant: "destructive", title: "Storage Error", description: "Could not save your custom clauses."});
        }
    };

    const handleAddClause = (newClauseData: Omit<Clause, 'id'>) => {
        const newClause: Clause = {
            id: `user_${Date.now()}`,
            ...newClauseData,
        };
        saveUserClauses([newClause, ...userClauses]);
    };
    
    const handleDeleteClause = (id: string) => {
        const updatedClauses = userClauses.filter(c => c.id !== id);
        saveUserClauses(updatedClauses);
        toast({ title: "Clause Deleted", description: "The custom clause has been removed from your library." });
    };

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Clause content copied to clipboard.",
        });
    }, [toast]);

    const filteredClauses = useMemo(() => {
        const combined = [...prebuiltClauses, ...userClauses];
        const lowercasedFilter = searchTerm.toLowerCase();

        if (!lowercasedFilter) return combined;

        return combined.filter(clause => 
            clause.title.toLowerCase().includes(lowercasedFilter) ||
            clause.category.toLowerCase().includes(lowercasedFilter) ||
            clause.content.toLowerCase().includes(lowercasedFilter)
        );
    }, [userClauses, searchTerm]);
    
    const categorizedClauses = useMemo(() => {
        const governanceCategories = ['Company Formation', 'Governance', 'Compliance', 'Legal Structure', 'Legal', 'Meetings', 'Corporate Governance', 'Risk & Legal'];
        const hrCategories = ['Employment & HR'];
        const financeCategories = ['Financial & Audit'];
        const agreementCategories = ['Agreements & Contracts', 'Startup & Fundraising', 'Miscellaneous'];

        return {
            'Corporate & Governance': filteredClauses.filter(c => governanceCategories.includes(c.category)),
            'Employment & HR': filteredClauses.filter(c => hrCategories.includes(c.category)),
            'Financial & Audit': filteredClauses.filter(c => financeCategories.includes(c.category)),
            'Agreements & Contracts': filteredClauses.filter(c => agreementCategories.includes(c.category)),
        };
    }, [filteredClauses]);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const totalClauses = prebuiltClauses.length + userClauses.length;

    return (
        <>
            <AddClauseModal isOpen={isModalOpen} onOpenChange={setModalOpen} onClauseAdded={handleAddClause} />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clause Library</h2>
                    <p className="text-muted-foreground">
                        Search, manage, and use pre-approved legal clauses for your documents.
                    </p>
                </div>
                <Card className="interactive-lift">
                    <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Your Clause Collection</CardTitle>
                            <CardDescription>
                               {totalClauses} clauses available. Search or browse by category.
                            </CardDescription>
                        </div>
                        <div className="flex w-full sm:w-auto gap-2">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search clauses..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button className="w-full sm:w-auto interactive-lift" onClick={() => setModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Custom
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Tabs defaultValue="governance" className="w-full">
                           <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                               <TabsTrigger value="governance">Corporate & Governance</TabsTrigger>
                               <TabsTrigger value="hr">Employment & HR</TabsTrigger>
                               <TabsTrigger value="finance">Financial & Audit</TabsTrigger>
                               <TabsTrigger value="contracts">Agreements</TabsTrigger>
                           </TabsList>
                           <TabsContent value="governance" className="pt-6">
                               <div className="space-y-4">
                                   {categorizedClauses['Corporate & Governance'].map(clause => <ClauseCard key={clause.id} clause={clause} onDelete={handleDeleteClause} onCopy={copyToClipboard} />)}
                               </div>
                           </TabsContent>
                           <TabsContent value="hr" className="pt-6">
                                <div className="space-y-4">
                                   {categorizedClauses['Employment & HR'].map(clause => <ClauseCard key={clause.id} clause={clause} onDelete={handleDeleteClause} onCopy={copyToClipboard} />)}
                               </div>
                           </TabsContent>
                           <TabsContent value="finance" className="pt-6">
                                <div className="space-y-4">
                                   {categorizedClauses['Financial & Audit'].map(clause => <ClauseCard key={clause.id} clause={clause} onDelete={handleDeleteClause} onCopy={copyToClipboard} />)}
                               </div>
                           </TabsContent>
                           <TabsContent value="contracts" className="pt-6">
                               <div className="space-y-4">
                                   {categorizedClauses['Agreements & Contracts'].map(clause => <ClauseCard key={clause.id} clause={clause} onDelete={handleDeleteClause} onCopy={copyToClipboard} />)}
                               </div>
                           </TabsContent>
                       </Tabs>
                       {filteredClauses.length === 0 && (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                <Library className="w-16 h-16 text-primary/20"/>
                                <p className="font-semibold text-lg">No Clauses Found</p>
                                <p className="text-sm max-w-sm">
                                    Your search for "{searchTerm}" did not match any terms in the library.
                                </p>
                            </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
