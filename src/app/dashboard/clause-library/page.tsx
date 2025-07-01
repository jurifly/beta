
"use client"
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, PlusCircle, Search, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddClauseModal } from "@/components/dashboard/add-clause-modal";
import type { Clause } from "@/lib/types";
import { planHierarchy } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const CLAUSE_STORAGE_KEY = "clauseLibrary";

export default function ClauseLibraryPage() {
    const { userProfile } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedClauses = localStorage.getItem(CLAUSE_STORAGE_KEY);
            if (savedClauses) {
                setClauses(JSON.parse(savedClauses));
            }
        } catch (error) {
            console.error("Failed to load clauses from localStorage", error);
        }
    }, []);

    const saveClauses = (updatedClauses: Clause[]) => {
        setClauses(updatedClauses);
        try {
            localStorage.setItem(CLAUSE_STORAGE_KEY, JSON.stringify(updatedClauses));
        } catch (error) {
            console.error("Failed to save clauses to localStorage", error);
            toast({ variant: "destructive", title: "Storage Error", description: "Could not save clauses."});
        }
    };

    const handleAddClause = (newClauseData: Omit<Clause, 'id'>) => {
        const newClause: Clause = {
            id: Date.now().toString(),
            ...newClauseData,
        };
        saveClauses([newClause, ...clauses]);
    };
    
    const handleDeleteClause = (id: string) => {
        const updatedClauses = clauses.filter(c => c.id !== id);
        saveClauses(updatedClauses);
        toast({ title: "Clause Deleted", description: "The clause has been removed from your library." });
    };

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const filteredClauses = useMemo(() => {
        return clauses.filter(clause => 
            clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clauses, searchTerm]);

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
                <Card>
                    <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Your Clause Collection</CardTitle>
                            <CardDescription>
                               All your saved clauses in one place.
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
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Clause
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredClauses.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                <Library className="w-16 h-16 text-primary/20"/>
                                <p className="font-semibold text-lg">{clauses.length === 0 ? "Your Library is Empty" : "No Clauses Found"}</p>
                                <p className="text-sm max-w-sm">
                                    {clauses.length === 0 
                                      ? "Add a new clause to get started."
                                      : "No clauses match your search term."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredClauses.map(clause => (
                                    <Card key={clause.id} className="interactive-lift flex flex-col group">
                                        <CardHeader>
                                            <CardTitle className="text-base">{clause.title}</CardTitle>
                                            <CardDescription>{clause.category}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{clause.content}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="ghost" size="icon" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteClause(clause.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
