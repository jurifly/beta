
"use client"

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { Loader2, PlusCircle, PieChart, Users, ChevronDown } from "lucide-react";
import type { CapTableEntry, Company } from '@/lib/types';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function CapTablePage() {
    const { userProfile, updateUserProfile } = useAuth();
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
    
    // Using local state for immediate UI updates
    const [capTable, setCapTable] = useState<CapTableEntry[]>(activeCompany?.capTable || [
        { id: '1', holder: 'Founder 1', type: 'Founder', shares: 8000 },
        { id: '2', holder: 'Founder 2', type: 'Founder', shares: 2000 },
    ]);

    const totalShares = useMemo(() => capTable.reduce((acc, entry) => acc + entry.shares, 0), [capTable]);

    const handleAddShareholder = () => {
        // Mock data, in a real app this would open a form
        const newShareholder: CapTableEntry = {
            id: Date.now().toString(),
            holder: `New Shareholder ${capTable.length + 1}`,
            type: 'Investor',
            shares: 1000
        };
        const newCapTable = [...capTable, newShareholder];
        setCapTable(newCapTable);
        // Persist change
        if (userProfile && activeCompany) {
            const updatedCompanies = userProfile.companies.map(c => 
                c.id === activeCompany.id ? { ...c, capTable: newCapTable } : c
            );
            updateUserProfile({ companies: updatedCompanies });
        }
    };
    
    const chartData = useMemo(() => {
        return capTable.map(entry => ({
            name: entry.holder,
            value: entry.shares,
            percentage: totalShares > 0 ? (entry.shares / totalShares * 100).toFixed(2) : 0
        }));
    }, [capTable, totalShares]);

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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Capitalization Table</h2>
                <p className="text-muted-foreground">
                    An overview of {activeCompany.name}'s equity ownership.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 interactive-lift">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Shareholder Summary</CardTitle>
                            <CardDescription>Breakdown of equity holders.</CardDescription>
                        </div>
                        <Button onClick={handleAddShareholder}><PlusCircle className="mr-2"/>Add Shareholder</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shareholder</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Shares</TableHead>
                                    <TableHead className="text-right">Ownership</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {capTable.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.holder}</TableCell>
                                        <TableCell>{entry.type}</TableCell>
                                        <TableCell>{entry.shares.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            {totalShares > 0 ? ((entry.shares / totalShares) * 100).toFixed(2) : 0}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="interactive-lift">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PieChart/> Ownership Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ResponsiveContainer width="100%" height={250}>
                                <RechartsPieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="interactive-lift">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users/>Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Total Shares:</span> <span className="font-medium">{totalShares.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>ESOP Pool:</span> <span className="font-medium">0 shares (0.00%)</span></div>
                            <div className="flex justify-between"><span>Fully Diluted Shares:</span> <span className="font-medium">{totalShares.toLocaleString()}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
