

"use client"

import { useState, useMemo, type MouseEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { Loader2, PlusCircle, PieChart as PieChartIcon, Users, Scale, Edit, Trash2, TrendingUp, ChevronsRight, FileText, Lock, Building } from "lucide-react";
import type { CapTableEntry, Company } from '@/lib/types';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { CapTableModal } from '@/components/dashboard/cap-table-modal';
import { useToast } from '@/hooks/use-toast';
import { CapTableModelingModal } from '@/components/dashboard/cap-table-modeling-modal';
import { FeatureLockedModal } from '@/components/dashboard/feature-locked-modal';
import { planHierarchy } from '@/lib/types';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function CapTablePage() {
    const { userProfile, updateUserProfile, isDevMode } = useAuth();
    const { toast } = useToast();
    
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
    const capTable = activeCompany?.capTable || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModelingModalOpen, setIsModelingModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<CapTableEntry | null>(null);
    const [lockedFeature, setLockedFeature] = useState<string | null>(null);

    const handleAddOrEdit = async (entry: Omit<CapTableEntry, 'id'> & { id?: string }) => {
        if (!userProfile || !activeCompany) return;

        let newCapTable;
        let toastTitle = "";
        let toastDescription = "";

        if (entry.id) { // Editing
            newCapTable = (activeCompany.capTable || []).map(e => e.id === entry.id ? { ...e, ...entry } as CapTableEntry : e);
            toastTitle = "Entry Updated";
            toastDescription = `Details for ${entry.holder} have been updated.`;
        } else { // Adding
            const newEntry: CapTableEntry = { ...entry, id: Date.now().toString() };
            newCapTable = [...(activeCompany.capTable || []), newEntry];
            toastTitle = "Issuance Added";
            toastDescription = `Shares issued to ${entry.holder} have been recorded.`;
        }

        const updatedCompany: Company = { ...activeCompany, capTable: newCapTable };
        const updatedCompanies = userProfile.companies.map(c => 
            c.id === activeCompany.id ? updatedCompany : c
        );

        try {
            await updateUserProfile({ companies: updatedCompanies });
            toast({ title: toastTitle, description: toastDescription });
        } catch (e) {
            toast({ variant: 'destructive', title: "Save Failed", description: "Could not save cap table changes." });
        }
    };
    
    const handleDelete = async (e: MouseEvent, idToDelete: string) => {
        // Prevent any other click events from firing.
        e.stopPropagation();

        if (!userProfile || !activeCompany) {
            toast({ variant: 'destructive', title: "Error", description: "Cannot perform action. User or company not found." });
            return;
        }

        if (!window.confirm("Are you sure you want to delete this cap table entry? This action cannot be undone.")) {
            return;
        }

        // Create a new array with the item removed.
        const newCapTable = (activeCompany.capTable || []).filter(e => e.id !== idToDelete);
        
        // Create an updated company object with the new cap table.
        const updatedCompany: Company = { ...activeCompany, capTable: newCapTable };

        // Create a new list of all companies, with the active one replaced by the updated version.
        const updatedCompanies = userProfile.companies.map(c => 
            c.id === activeCompany.id ? updatedCompany : c
        );
        
        // Call the master update function with the new list of companies.
        try {
            await updateUserProfile({ companies: updatedCompanies });
            toast({ title: "Entry Deleted", description: "The shareholder has been removed from the ledger." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Delete Failed", description: error.message || "Could not save changes to the database." });
        }
    };

    const handleOpenModal = (entry?: CapTableEntry) => {
        setEntryToEdit(entry || null);
        setIsModalOpen(true);
    };

    const handleModelRoundClick = () => {
        setIsModelingModalOpen(true);
    };
    
    const handleCompanyChange = (companyId: string) => {
        updateUserProfile({ activeCompanyId: companyId });
    };

    const { totalShares, esopPool, founderShares, investorShares } = useMemo(() => {
        return capTable.reduce(
            (acc, entry) => {
                acc.totalShares += entry.shares;
                if (entry.type === 'Founder') {
                    acc.founderShares += entry.shares;
                } else if (entry.type === 'Investor') {
                    acc.investorShares += entry.shares;
                } else if (entry.type === 'ESOP') {
                    acc.esopPool += entry.shares;
                }
                return acc;
            },
            { totalShares: 0, founderShares: 0, investorShares: 0, esopPool: 0 }
        );
    }, [capTable]);
    
    const chartData = useMemo(() => {
        return [
            { name: 'Founders', value: founderShares },
            { name: 'Investors', value: investorShares },
            { name: 'ESOP Pool', value: esopPool },
        ].filter(d => d.value > 0);
    }, [founderShares, investorShares, esopPool]);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const isAdvisorRole = userProfile.role !== 'Founder';

    if (!activeCompany) {
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Please add or select a company to manage its Cap Table.</p>
            </CardContent>
          </Card>
        );
    }
    
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          const percentage = totalShares > 0 ? ((data.value / totalShares) * 100).toFixed(2) : 0;
          return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[0.70rem] uppercase text-muted-foreground">{data.name}</span>
                  <span className="font-bold text-muted-foreground">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        }
        return null;
    };

    return (
        <>
            <CapTableModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleAddOrEdit}
                entryToEdit={entryToEdit}
                totalShares={totalShares}
            />
            <CapTableModelingModal
                isOpen={isModelingModalOpen}
                onOpenChange={setIsModelingModalOpen}
                currentCapTable={capTable}
            />
             <FeatureLockedModal
                featureName={lockedFeature}
                onOpenChange={() => setLockedFeature(null)}
            />
            <div className="space-y-6">
                 <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-primary">Capitalization Table & ESOPs</h2>
                            <p className="text-muted-foreground">An overview of {activeCompany.name}'s equity ownership.</p>
                        </div>
                        {isAdvisorRole && userProfile.companies.length > 1 && (
                            <Select onValueChange={handleCompanyChange} value={userProfile.activeCompanyId}>
                                <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Select a client..." /></SelectTrigger>
                                <SelectContent>
                                    {userProfile.companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <div className="flex items-center gap-2"><Building className="w-4 h-4"/>{c.name}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Shares</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalShares.toLocaleString()}</div><p className="text-xs text-muted-foreground">Issued and outstanding</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Founder Ownership</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalShares > 0 ? ((founderShares / totalShares) * 100).toFixed(1) : 0}%</div><p className="text-xs text-muted-foreground">of total issued equity</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Investor Ownership</CardTitle><PieChartIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalShares > 0 ? ((investorShares / totalShares) * 100).toFixed(1) : 0}%</div><p className="text-xs text-muted-foreground">of total issued equity</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">ESOP Pool</CardTitle><ChevronsRight className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalShares > 0 ? ((esopPool / totalShares) * 100).toFixed(1) : 0}%</div><p className="text-xs text-muted-foreground">of total equity reserved</p></CardContent></Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 interactive-lift">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Shareholder Ledger</CardTitle>
                                <CardDescription>A detailed breakdown of all equity holders.</CardDescription>
                            </div>
                             <div className="flex w-full sm:w-auto gap-2">
                                <Button variant="outline" onClick={handleModelRoundClick} className="flex-1 sm:flex-initial">
                                    <TrendingUp className="mr-2"/>
                                    Model Round
                                </Button>
                                <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-initial"><PlusCircle className="mr-2"/>Add Issuance</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Shareholder</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Valuation</TableHead>
                                            <TableHead>Shares</TableHead>
                                            <TableHead className="text-right">Ownership</TableHead>
                                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {capTable.length > 0 ? (
                                            capTable.map(entry => (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="font-medium">{entry.holder}</TableCell>
                                                    <TableCell><Badge variant="outline">{entry.type}</Badge></TableCell>
                                                    <TableCell className="font-mono">{entry.type === 'Investor' && entry.valuation ? formatCurrency(entry.valuation) : 'N/A'}</TableCell>
                                                    <TableCell>{entry.shares.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {totalShares > 0 ? ((entry.shares / totalShares) * 100).toFixed(2) : 0}%
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(entry)}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    Your shareholder ledger is empty. Click "Add Issuance" to begin.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                             <div className="md:hidden space-y-4">
                                {capTable.length > 0 ? (
                                    capTable.map(entry => (
                                        <Card key={entry.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{entry.holder}</p>
                                                    <Badge variant="outline" className="mt-1">{entry.type}</Badge>
                                                </div>
                                                <div className="flex gap-1">
                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(entry)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(e, entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Shares</p>
                                                    <p className="font-medium">{entry.shares.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-muted-foreground">Ownership</p>
                                                    <p className="font-medium font-mono">
                                                        {totalShares > 0 ? ((entry.shares / totalShares) * 100).toFixed(2) : 0}%
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-muted-foreground">Valuation (at time of investment)</p>
                                                    <p className="font-medium font-mono">{entry.type === 'Investor' && entry.valuation ? formatCurrency(entry.valuation) : 'N/A'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-muted-foreground">Grant Date</p>
                                                    <p className="font-medium">{entry.grantDate}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md">
                                        Your shareholder ledger is empty. Click "Add Issuance" to begin.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 interactive-lift">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PieChartIcon/> Ownership Structure</CardTitle>
                            <CardDescription>Visual breakdown by holder type.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ResponsiveContainer width="100%" height={250}>
                                <RechartsPieChart>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} labelLine={false}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend iconSize={10} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
