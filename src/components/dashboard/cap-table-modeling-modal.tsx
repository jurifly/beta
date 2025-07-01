
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, Banknote, Calculator, Landmark, Percent, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import type { CapTableEntry } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface CapTableModelingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentCapTable: CapTableEntry[];
}

interface ScenarioResult {
  preMoney: any[];
  postMoney: any[];
  sharePrice: number;
  postMoneyValuation: number;
}

const MetricDisplay = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="p-3 border rounded-lg bg-muted/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
            {icon}
            <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
        </div>
        <p className="text-lg font-bold truncate" title={String(value)}>{value}</p>
    </div>
);

const renderTable = (title: string, data: any[]) => (
  <div>
    <h3 className="font-semibold text-lg mb-2 text-center">{title}</h3>
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Holder</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead className="text-right">Ownership</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.id} className={cn(row.id.startsWith('new_') && 'bg-primary/5 text-primary')}>
              <TableCell className="font-medium text-sm">{row.holder}</TableCell>
              <TableCell className="font-mono text-sm">{row.shares.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-sm">{row.ownership}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);


export function CapTableModelingModal({ isOpen, onOpenChange, currentCapTable }: CapTableModelingModalProps) {
  const [preMoneyValuation, setPreMoneyValuation] = useState(50000000); // e.g. 5 Cr
  const [investment, setInvestment] = useState(10000000); // e.g. 1 Cr
  const [newEsopPercent, setNewEsopPercent] = useState(10);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  
  const calculateScenario = () => {
    const existingShares = currentCapTable.reduce((acc, entry) => acc + entry.shares, 0);
    const existingEsop = currentCapTable.find(e => e.type === 'ESOP')?.shares || 0;
    
    // Effective pre-money valuation considering new ESOP pool
    const effectivePreMoney = preMoneyValuation * (1 - (newEsopPercent / 100));
    
    const sharePrice = effectivePreMoney / (existingShares - existingEsop);
    const postMoneyValuation = preMoneyValuation + investment;
    
    const investorShares = investment / sharePrice;
    
    const totalPostMoneySharesPreEsop = existingShares + investorShares;
    const requiredEsopShares = (totalPostMoneySharesPreEsop / (1 - (newEsopPercent/100))) * (newEsopPercent/100);
    
    const newEsopShares = Math.max(0, requiredEsopShares - existingEsop);
    
    const totalPostMoneyShares = existingShares + investorShares + newEsopShares;

    const preMoneyTable = currentCapTable.map(entry => ({
      ...entry,
      shares: Math.round(entry.shares),
      ownership: (entry.shares / existingShares * 100).toFixed(2) + '%'
    }));
    
    const postMoneyHolders = [...currentCapTable];
    const esopIndex = postMoneyHolders.findIndex(e => e.type === 'ESOP');
    if (esopIndex !== -1) {
        postMoneyHolders[esopIndex] = { ...postMoneyHolders[esopIndex], shares: postMoneyHolders[esopIndex].shares + newEsopShares, id: postMoneyHolders[esopIndex].id.startsWith('new_') ? postMoneyHolders[esopIndex].id : `new_${postMoneyHolders[esopIndex].id}`};
    } else if (newEsopShares > 0) {
        postMoneyHolders.push({ id: 'new_esop_pool', holder: 'ESOP Pool', type: 'ESOP', shares: newEsopShares, grantDate: new Date().toISOString().split('T')[0], vesting: 'Unissued' });
    }
    
    const postMoneyTable = [
      ...postMoneyHolders.map(entry => ({
        ...entry,
        shares: Math.round(entry.shares),
        ownership: (entry.shares / totalPostMoneyShares * 100).toFixed(2) + '%'
      })),
      { id: 'new_investor', holder: 'New Investor', type: 'Investor', shares: Math.round(investorShares), ownership: (investorShares / totalPostMoneyShares * 100).toFixed(2) + '%' },
    ].sort((a,b) => b.shares - a.shares);
    
    setResult({
      preMoney: preMoneyTable.sort((a,b) => b.shares - a.shares),
      postMoney: postMoneyTable,
      sharePrice,
      postMoneyValuation
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl"><TrendingUp/> Cap Table Modeling</DialogTitle>
          <DialogDescription>
            Model a new financing round to understand its impact on your equity structure. Results are illustrative.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
              <Card className="interactive-lift">
                  <CardHeader>
                      <CardTitle>Scenario Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="premoney">Pre-Money Valuation (₹)</Label>
                          <Input id="premoney" type="number" value={preMoneyValuation} onChange={e => setPreMoneyValuation(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="investment">New Investment (₹)</Label>
                          <Input id="investment" type="number" value={investment} onChange={e => setInvestment(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="esop">Post-round ESOP Pool Target (%)</Label>
                          <Input id="esop" type="number" value={newEsopPercent} onChange={e => setNewEsopPercent(Number(e.target.value))} />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button onClick={calculateScenario}>
                          <Sparkles className="mr-2 h-4 w-4"/>
                          Calculate Scenario
                      </Button>
                  </CardFooter>
              </Card>

              {!result ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
                      <Calculator className="w-16 h-16 text-primary/20 mb-4"/>
                      <p className="font-semibold text-lg">Scenario Results</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                          Enter your fundraising scenario above and click "Calculate" to see the impact.
                      </p>
                  </div>
              ) : (
                  <div className="space-y-6 animate-in fade-in-50 duration-500">
                      <div>
                          <h3 className="font-semibold text-lg mb-2 text-center">Key Metrics</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <MetricDisplay title="Pre-Money Valuation" value={`₹${preMoneyValuation.toLocaleString()}`} icon={<Landmark className="h-4 w-4"/>} />
                              <MetricDisplay title="Post-Money Valuation" value={`₹${result.postMoneyValuation.toLocaleString()}`} icon={<Banknote className="h-4 w-4"/>} />
                              <MetricDisplay title="New Share Price" value={`₹${result.sharePrice.toFixed(2)}`} icon={<Calculator className="h-4 w-4"/>} />
                              <MetricDisplay title="ESOP Pool Target" value={`${newEsopPercent}%`} icon={<Percent className="h-4 w-4"/>} />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
                        {renderTable("Pre-Financing", result.preMoney)}
                        <div className="hidden md:flex justify-center">
                            <ArrowRight className="w-8 h-8 text-muted-foreground"/>
                        </div>
                        {renderTable("Post-Financing", result.postMoney)}
                      </div>
                  </div>
              )}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t mt-auto -mx-6 px-6 pb-6">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
