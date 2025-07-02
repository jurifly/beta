
"use client"

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { Loader2, PlusCircle, PieChart as PieChartIcon, Users, Scale, ChevronsRight, MoreHorizontal, Edit, Trash2, TrendingUp } from "lucide-react";
import type { CapTableEntry, Company } from '@/lib/types';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { CapTableModal } from '@/components/dashboard/cap-table-modal';
import { useToast } from '@/hooks/use-toast';
import { CapTableModelingModal } from '@/components/dashboard/cap-table-modeling-modal';

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const initialCapTable: CapTableEntry[] = [
    { id: '1', holder: 'Aarav Sharma', type: 'Founder', shares: 4500, grantDate: '2023-01-15', vesting: '4-year, 1-year cliff' },
    { id: '2', holder: 'Diya Patel', type: 'Founder', shares: 3500, grantDate: '2023-01-15', vesting: '4-year, 1-year cliff' },
    { id: '3', holder: 'Sequoia Capital India', type: 'Investor', shares: 1500, grantDate: '2024-03-10', vesting: 'N/A' },
    { id: '4', holder: 'ESOP Pool', type: 'ESOP', shares: 500, grantDate: '2024-01-01', vesting: 'Unissued' },
];

export default function CapTablePage() {
    const { userProfile, updateUserProfile } = useAuth();
    const { toast } = useToast();
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModelingModalOpen, setIsModelingModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<CapTableEntry | null>(null);

    const capTable = useMemo(() => activeCompany?.capTable || initialCapTable, [activeCompany]);

    const handleSaveCapTable = async (newCapTable: CapTableEntry[]) => {
        if (!userProfile || !activeCompany) return;
        
        const updatedCompany: Company = { ...activeCompany, capTable: newCapTable };
        const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
        
        try {
            await updateUserProfile({ companies: updatedCompanies });
        } catch (e) {
            toast({ variant: 'destructive', title: "Save Failed", description: "Could not save cap table changes." });
        }
    };

    const handleAddOrEdit = (entry: Omit<CapTableEntry, 'id'> & { id?: string }) => {
        let newCapTable;
        if (entry.id) { // Editing existing entry
            newCapTable = capTable.map(e => e.id === entry.id ? { ...e, ...entry } : e);
            toast({ title: "Entry Updated", description: `Details for ${entry.holder} have been updated.` });
        } else { // Adding new entry
            const newEntry = { ...entry, id: Date.now().toString() };
            newCapTable = [...capTable, newEntry];
            toast({ title: "Issuance Added", description: `Shares issued to ${entry.holder} have been recorded.` });
        }
        handleSaveCapTable(newCapTable);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this cap table entry?")) {
            const newCapTable = capTable.filter(e => e.id !== id);
            handleSaveCapTable(newCapTable);
            toast({ title: "Entry Deleted", description: "The cap table entry has been removed." });
        }
    };

    const handleOpenModal = (entry?: CapTableEntry) => {
        setEntryToEdit(entry || null);
        setIsModalOpen(true);
    };

    const { totalShares, fullyDilutedShares, esopPool, founderShares, investorShares } = useMemo(() => {
        const total = capTable.reduce((acc, entry) => acc + entry.shares, 0);
        const esop = capTable.find(e => e.type === 'ESOP')?.shares || 0;
        const founders = capTable.filter(e => e.type === 'Founder').reduce((acc, e) => acc + e.shares, 0);
        const investors = capTable.filter(e => e.type === 'Investor').reduce((acc, e) => acc + e.shares, 0);

        return {
            totalShares: total,
            fullyDilutedShares: total, // simplified for now
            esopPool: esop,
            founderShares: founders,
            investorShares: investors,
        };
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
          const percentage = ((data.value / totalShares) * 100).toFixed(2);
          return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
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
            />
            <CapTableModelingModal
                isOpen={isModelingModalOpen}
                onOpenChange={setIsModelingModalOpen}
                currentCapTable={capTable}
            />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Capitalization Table</h2>
                    <p className="text-muted-foreground">An overview of {activeCompany.name}'s equity ownership.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Shares</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalShares.toLocaleString()}</div><p className="text-xs text-muted-foreground">Issued and outstanding</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Founder Ownership</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{((founderShares / totalShares) * 100).toFixed(1)}%</div><p className="text-xs text-muted-foreground">{founderShares.toLocaleString()} shares</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Investor Ownership</CardTitle><PieChartIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{((investorShares / totalShares) * 100).toFixed(1)}%</div><p className="text-xs text-muted-foreground">{investorShares.toLocaleString()} shares</p></CardContent></Card>
                     <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">ESOP Pool</CardTitle><ChevronsRight className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{((esopPool / totalShares) * 100).toFixed(1)}%</div><p className="text-xs text-muted-foreground">{esopPool.toLocaleString()} shares remaining</p></CardContent></Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 interactive-lift">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Shareholder Ledger</CardTitle>
                                <CardDescription>A detailed breakdown of all equity holders.</CardDescription>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsModelingModalOpen(true)}><TrendingUp className="mr-2"/>Model Round</Button>
                                <Button onClick={() => handleOpenModal()}><PlusCircle className="mr-2"/>Add Issuance</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shareholder</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Grant Date</TableHead>
                                        <TableHead>Shares</TableHead>
                                        <TableHead className="text-right">Ownership</TableHead>
                                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {capTable.map(entry => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">{entry.holder}</TableCell>
                                            <TableCell><Badge variant="outline">{entry.type}</Badge></TableCell>
                                            <TableCell>{entry.grantDate}</TableCell>
                                            <TableCell>{entry.shares.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {totalShares > 0 ? ((entry.shares / totalShares) * 100).toFixed(2) : 0}%
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(entry)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
