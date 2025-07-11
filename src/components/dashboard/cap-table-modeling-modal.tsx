
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Sparkles, TrendingUp, Info } from "lucide-react";
import type { CapTableEntry } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const MetricDisplay = ({ title, value, tooltipText }: { title: string, value: string | number, tooltipText: string }) => (
    <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {title}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button" className="text-left">
                            <Info className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
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
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl"><TrendingUp/> Cap Table Modeling</DialogTitle>
          <DialogDescription>
            Model a new financing round to understand its impact on your equity structure. Results are illustrative.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div className="p-6 pt-0 space-y-6">
                <Card className="interactive-lift bg-card/80 backdrop-blur-sm shadow-none border">
                    <CardHeader>
                        <CardTitle>Scenario Inputs</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
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
                        <Button onClick={calculateScenario} className="w-full sm:w-auto mx-auto">
                            <Sparkles className="mr-2 h-4 w-4"/>
                            Calculate Scenario
                        </Button>
                    </CardFooter>
                </Card>

                {!result ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px] border-2 border-dashed rounded-md bg-muted/40 h-full">
                        <Calculator className="w-16 h-16 text-primary/20 mb-4"/>
                        <p className="font-semibold text-lg">Scenario Results</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Adjust the sliders and click "Calculate" to see the impact of your funding round.
                        </p>
                    </div>
                ) : (
                    <Card className="space-y-6 animate-in fade-in-50 duration-500 interactive-lift">
                         <CardHeader>
                            <CardTitle>Scenario Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricDisplay 
                                title="Pre-Money Valuation" 
                                value={formatCurrency(result.preMoneyValuation)} 
                                tooltipText="The company's value before the new investment. Calculated as: Post-Money Valuation - Investment Amount."
                            />
                            <MetricDisplay 
                                title="Post-Money Valuation" 
                                value={formatCurrency(result.postMoneyValuation)} 
                                tooltipText="The company's value after the investment. Calculated as: Investment Amount / (Investor's Stake / 100)."
                            />
                            <MetricDisplay 
                                title="New Share Price" 
                                value={formatCurrency(result.sharePrice)} 
                                tooltipText="The price per share for the new round. Calculated as: Investment Amount / New Investor Shares."
                            />
                            <MetricDisplay 
                                title="Investor's Stake" 
                                value={`${result.investorStake.toFixed(2)}%`}
                                tooltipText="The percentage of the company the new investor will own post-investment."
                            />
                        </CardContent>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            {renderTable("Pre-Financing", result.preMoney)}
                            {renderTable("Post-Financing", result.postMoney)}
                        </CardContent>
                    </Card>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
