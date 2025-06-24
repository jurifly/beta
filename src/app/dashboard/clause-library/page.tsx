"use client"
import { useState } from "react";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, PlusCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddClauseModal } from "@/components/dashboard/add-clause-modal";
import type { Clause } from "@/lib/types";

export default function ClauseLibraryPage() {
    const { userProfile } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);
    const [clauses, setClauses] = useState<Clause[]>([]);

    const handleAddClause = (newClauseData: Omit<Clause, 'id'>) => {
        const newClause: Clause = {
            id: Date.now().toString(),
            ...newClauseData,
        };
        setClauses(prev => [newClause, ...prev]);
    };

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!['Pro', 'CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) {
        return <UpgradePrompt
            title="Unlock the Clause Library"
            description="Access a library of pre-approved legal clauses, add your own, and build contracts faster. This is a Pro feature."
            icon={<Library className="w-12 h-12 text-primary/20" />}
        />;
    }

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
                                <Input placeholder="Search clauses..." className="pl-10" />
                            </div>
                            <Button className="w-full sm:w-auto interactive-lift" onClick={() => setModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Clause
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {clauses.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                <Library className="w-16 h-16 text-primary/20"/>
                                <p className="font-semibold text-lg">Your Library is Empty</p>
                                <p className="text-sm max-w-sm">Add a new clause to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {clauses.map(clause => (
                                    <Card key={clause.id} className="interactive-lift flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-base">{clause.title}</CardTitle>
                                            <CardDescription>{clause.category}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{clause.content}</p>
                                        </CardContent>
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
