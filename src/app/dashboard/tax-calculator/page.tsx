
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useTransition } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { getTaxAdviceAction } from "./actions";
import type { TaxAdvisorOutput } from "@/ai/flows/tax-advisor-flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Download, CheckCircle, XCircle, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const incomeSchema = z.object({
  salary: z.coerce.number().min(0).default(0),
  businessIncome: z.coerce.number().min(0).default(0),
  capitalGains: z.coerce.number().min(0).default(0),
  otherIncome: z.coerce.number().min(0).default(0),
});

const deductionsSchema = z.object({
  section80C: z.coerce.number().min(0).max(150000, "Max 1,50,000").default(0),
  section80D: z.coerce.number().min(0).default(0),
  hra: z.coerce.number().min(0).default(0),
  otherDeductions: z.coerce.number().min(0).default(0),
});

const taxCalculatorSchema = z.object({
  income: incomeSchema,
  deductions: deductionsSchema,
});

type FormData = z.infer<typeof taxCalculatorSchema>;

const InfoCard = ({ title, value }: { title: string, value: string }) => (
    <div className="flex justify-between items-center text-sm p-3 border rounded-md bg-muted/30">
        <dt className="text-muted-foreground">{title}</dt>
        <dd className="font-semibold font-mono">{value}</dd>
    </div>
)

export default function TaxCalculatorPage() {
  const { userProfile, deductCredits } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TaxAdvisorOutput | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(taxCalculatorSchema),
    defaultValues: {
      income: { salary: 0, businessIncome: 0, capitalGains: 0, otherIncome: 0 },
      deductions: { section80C: 0, section80D: 0, hra: 0, otherDeductions: 0 },
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!userProfile || !await deductCredits(3)) return;

    startTransition(async () => {
        setResult(null);
        const response = await getTaxAdviceAction({ 
            ...data, 
            entityType: 'Individual', // Assuming individual for now
            legalRegion: userProfile.legalRegion
        });
        if (response.error) {
            toast({ variant: 'destructive', title: "Calculation Failed", description: response.error });
        } else {
            setResult(response.data);
            toast({ title: "Calculation Complete!", description: "Your tax summary and tips are ready." });
        }
    });
  };
  
  const handleDownloadPdf = () => {
    const input = resultRef.current;
    if (!input) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find the report to download.' });
      return;
    }

    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
    
    html2canvas(input, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  if (!userProfile) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Income Tax Advisor</h1>
        <p className="text-muted-foreground">Calculate your tax liability and get AI-powered optimization tips.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Income Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary (Gross)</Label>
                <Controller name="income.salary" control={control} render={({ field }) => <Input type="number" id="salary" {...field} />} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessIncome">Business/Professional Income</Label>
                <Controller name="income.businessIncome" control={control} render={({ field }) => <Input type="number" id="businessIncome" {...field} />} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="capitalGains">Capital Gains</Label>
                <Controller name="income.capitalGains" control={control} render={({ field }) => <Input type="number" id="capitalGains" {...field} />} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherIncome">Other Income</Label>
                <Controller name="income.otherIncome" control={control} render={({ field }) => <Input type="number" id="otherIncome" {...field} />} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Deductions & Exemptions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="section80C">Section 80C (max 1.5L)</Label>
                <Controller name="deductions.section80C" control={control} render={({ field }) => <Input type="number" id="section80C" {...field} />} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="section80D">Section 80D (Health Insurance)</Label>
                <Controller name="deductions.section80D" control={control} render={({ field }) => <Input type="number" id="section80D" {...field} />} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="hra">House Rent Allowance (HRA)</Label>
                <Controller name="deductions.hra" control={control} render={({ field }) => <Input type="number" id="hra" {...field} />} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Controller name="deductions.otherDeductions" control={control} render={({ field }) => <Input type="number" id="otherDeductions" {...field} />} />
              </div>
            </CardContent>
          </Card>
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
            Calculate & Advise
          </Button>
        </form>

        <div className="lg:col-span-3 space-y-6">
            <Card className="min-h-[600px] sticky top-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Tax Report & AI Advice</CardTitle>
                            <CardDescription>Your personalized tax breakdown and recommendations.</CardDescription>
                        </div>
                        {result && (
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf}><Download className="mr-2"/>Download PDF</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isPending && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Our AI is crunching the numbers...</p></div>}
                    {!isPending && !result && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Sparkles className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your tax analysis will appear here.</p></div>}
                    {!isPending && result && (
                        <div ref={resultRef} className="p-4 bg-background animate-in fade-in-50">
                            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-300">
                                <AlertTriangle className="h-4 w-4 !text-amber-500"/>
                                <AlertTitle>Disclaimer</AlertTitle>
                                <AlertDescription>
                                This is an AI-generated estimate for informational purposes only. Please consult a qualified professional for final tax advice.
                                </AlertDescription>
                            </Alert>

                            <div className="p-4 text-center rounded-lg bg-primary/10 border border-primary/20 mb-6">
                                <p className="text-sm font-semibold text-primary">Recommended Regime</p>
                                <p className="text-2xl font-bold">{result.recommendedRegime}</p>
                                <p className="text-xs text-muted-foreground">{result.recommendationReason}</p>
                            </div>
                           
                           <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2"><XCircle className="text-destructive"/> Old Regime</h3>
                                    <dl className="space-y-2">
                                        <InfoCard title="Gross Income" value={result.oldRegime.grossIncome} />
                                        <InfoCard title="Deductions" value={result.oldRegime.totalDeductions} />
                                        <InfoCard title="Taxable Income" value={result.oldRegime.taxableIncome} />
                                        <InfoCard title="Tax Payable" value={result.oldRegime.taxPayable} />
                                    </dl>
                                </div>
                                 <div className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="text-green-500"/> New Regime</h3>
                                     <dl className="space-y-2">
                                        <InfoCard title="Gross Income" value={result.newRegime.grossIncome} />
                                        <InfoCard title="Deductions" value={result.newRegime.totalDeductions} />
                                        <InfoCard title="Taxable Income" value={result.newRegime.taxableIncome} />
                                        <InfoCard title="Tax Payable" value={result.newRegime.taxPayable} />
                                    </dl>
                                </div>
                           </div>
                           
                           <Separator className="my-6"/>

                           <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="text-primary"/> AI Tax Saving Tips</h3>
                                <ul className="space-y-3">
                                    {result.optimizationTips.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-3 p-3 text-sm rounded-md bg-muted/50 border">
                                            <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0"/>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                           </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
