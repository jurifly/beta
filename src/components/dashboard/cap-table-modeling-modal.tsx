
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, Calculator, Landmark, Percent, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import type { CapTableEntry } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  preMoneyValuation: number;
  investorStake: number;
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
            <TableRow key={row.id} className={cn(row.id === 'new_investor' && 'bg-primary/5 text-primary font-medium')}>
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
  const [investment, setInvestment] = useState(10000000); // e.g. 1 Cr
  const [investorStake, setInvestorStake] = useState(20); // e.g. 20%
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const { toast } = useToast();
  
  const calculateScenario = () => {
    const existingShares = currentCapTable.reduce((acc, entry) => acc + entry.shares, 0);

    if (existingShares === 0) {
        toast({
            variant: "destructive",
            title: "Cannot Model Scenario",
            description: "You must have at least one shareholder in your cap table to model a new round.",
        });
        return;
    }
    
    // Derive valuations from investment amount and stake
    const postMoneyValuation = investment / (investorStake / 100);
    const preMoneyValuation = postMoneyValuation - investment;
    
    // Calculate new total shares and investor shares
    const totalPostMoneyShares = existingShares / (1 - (investorStake / 100));
    const investorShares = totalPostMoneyShares - existingShares;
    
    // Calculate new share price
    const sharePrice = investment / investorShares;

    const preMoneyTable = currentCapTable.map(entry => ({
      ...entry,
      shares: Math.round(entry.shares),
      ownership: (entry.shares / existingShares * 100).toFixed(2) + '%'
    })).sort((a,b) => b.shares - a.shares);
    
    const postMoneyTable = [
      ...currentCapTable.map(entry => ({
        ...entry,
        shares: Math.round(entry.shares),
        ownership: (entry.shares / totalPostMoneyShares * 100).toFixed(2) + '%'
      })),
      { id: 'new_investor', holder: 'New Investor', type: 'Investor', shares: Math.round(investorShares), ownership: (investorShares / totalPostMoneyShares * 100).toFixed(2) + '%' },
    ].sort((a,b) => b.shares - a.shares);
    
    setResult({
      preMoney: preMoneyTable,
      postMoney: postMoneyTable,
      sharePrice,
      postMoneyValuation,
      preMoneyValuation,
      investorStake,
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 min-h-0">
            <Card className="interactive-lift flex flex-col">
                <CardHeader>
                    <CardTitle>Scenario Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 flex-1">
                     <div className="space-y-3">
                        <Label htmlFor="investment-slider">New Investment (₹)</Label>
                        <Input
                            id="investment"
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            className="w-full text-lg font-mono"
                        />
                        <Slider
                            id="investment-slider"
                            min={100000}
                            max={100000000}
                            step={100000}
                            value={[investment]}
                            onValueChange={(value) => setInvestment(value[0])}
                        />
                    </div>
                     <div className="space-y-3">
                        <Label htmlFor="stake-slider">Investor's Stake (%)</Label>
                        <div className="relative">
                            <Input
                                id="stake"
                                type="number"
                                value={investorStake}
                                onChange={(e) => setInvestorStake(Number(e.target.value))}
                                className="w-full text-lg font-mono pr-8"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-lg text-muted-foreground">%</span>
                        </div>
                         <Slider
                            id="stake-slider"
                            min={1}
                            max={50}
                            step={1}
                            value={[investorStake]}
                            onValueChange={(value) => setInvestorStake(value[0])}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={calculateScenario} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4"/>
                        Calculate Scenario
                    </Button>
                </CardFooter>
            </Card>

            <ScrollArea className="flex-1 -mx-4 px-4">
                {!result ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
                        <Calculator className="w-16 h-16 text-primary/20 mb-4"/>
                        <p className="font-semibold text-lg">Scenario Results</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Adjust the sliders and click "Calculate" to see the impact of your funding round.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricDisplay title="Pre-Money Valuation" value={`₹${result.preMoneyValuation.toLocaleString()}`} icon={<Landmark className="h-4 w-4"/>} />
                            <MetricDisplay title="Post-Money Valuation" value={`₹${result.postMoneyValuation.toLocaleString()}`} icon={<Banknote className="h-4 w-4"/>} />
                            <MetricDisplay title="New Share Price" value={`₹${result.sharePrice.toFixed(2)}`} icon={<Calculator className="h-4 w-4"/>} />
                            <MetricDisplay title="Investor's Stake" value={`${result.investorStake}%`} icon={<Percent className="h-4 w-4"/>} />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] items-start gap-6">
                            {renderTable("Pre-Financing", result.preMoney)}
                            <div className="hidden xl:flex justify-center items-center h-full">
                                <ArrowRight className="w-8 h-8 text-muted-foreground mt-8"/>
                            </div>
                            {renderTable("Post-Financing", result.postMoney)}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
