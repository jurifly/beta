
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import type { CapTableEntry } from "@/lib/types";
import { Badge } from "../ui/badge";

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
    
    const newEsopShares = requiredEsopShares - existingEsop;
    
    const totalPostMoneyShares = existingShares + investorShares + newEsopShares;

    const preMoneyTable = currentCapTable.map(entry => ({
      ...entry,
      ownership: (entry.shares / existingShares * 100).toFixed(2) + '%'
    }));
    
    const postMoneyTable = [
      ...currentCapTable.map(entry => ({
        ...entry,
        ownership: (entry.shares / totalPostMoneyShares * 100).toFixed(2) + '%'
      })),
      { id: 'new_investor', holder: 'New Investor', type: 'Investor', shares: Math.round(investorShares), ownership: (investorShares / totalPostMoneyShares * 100).toFixed(2) + '%' },
      { id: 'new_esop', holder: 'New ESOP increase', type: 'ESOP', shares: Math.round(newEsopShares), ownership: (newEsopShares / totalPostMoneyShares * 100).toFixed(2) + '%' },
    ];
    
    setResult({
      preMoney: preMoneyTable,
      postMoney: postMoneyTable,
      sharePrice,
      postMoneyValuation
    });
  };

  const renderTable = (title: string, data: any[]) => (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
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
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.holder}</TableCell>
                <TableCell>{Math.round(row.shares).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{row.ownership}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><TrendingUp/> Cap Table Modeling</DialogTitle>
          <DialogDescription>
            Model a new financing round to understand its impact on your equity structure.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="premoney">Pre-Money Valuation (₹)</Label>
                <Input id="premoney" type="number" value={preMoneyValuation} onChange={e => setPreMoneyValuation(Number(e.target.value))} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="investment">New Investment (₹)</Label>
                <Input id="investment" type="number" value={investment} onChange={e => setInvestment(Number(e.target.value))} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="esop">New ESOP Pool (%)</Label>
                <Input id="esop" type="number" value={newEsopPercent} onChange={e => setNewEsopPercent(Number(e.target.value))} />
            </div>
        </div>
        <div className="flex justify-center">
          <Button onClick={calculateScenario}>Calculate Scenario</Button>
        </div>
        
        {result && (
          <div className="mt-6 border-t pt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-center">
                <Card><CardHeader><CardTitle className="text-sm font-medium">Pre-Money Valuation</CardTitle><CardDescription>₹{preMoneyValuation.toLocaleString()}</CardDescription></CardHeader></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">Post-Money Valuation</CardTitle><CardDescription>₹{result.postMoneyValuation.toLocaleString()}</CardDescription></CardHeader></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">New Share Price</CardTitle><CardDescription>₹{result.sharePrice.toFixed(2)}</CardDescription></CardHeader></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">New ESOP Pool</CardTitle><CardDescription>{newEsopPercent}%</CardDescription></CardHeader></Card>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
              {renderTable("Pre-Financing", result.preMoney)}
              {renderTable("Post-Financing", result.postMoney)}
            </div>
          </div>
        )}
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
