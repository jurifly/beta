

"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Download, CheckCircle, XCircle, Lightbulb, TrendingUp, AlertTriangle, User, Building, Save, BarChart as BarChartIcon, FileText, Calculator, PlusCircle, Trash2, LineChart as LineChartIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateFinancialForecast } from "@/ai/flows/financial-forecaster-flow";
import type { FinancialForecasterOutput } from "@/ai/flows/financial-forecaster-flow";
import { getYoYAnalysisAction } from './actions';
import type { YoYOutput } from '@/ai/flows/yoy-analysis-flow';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const personalIncomeSchema = z.object({
  salary: z.coerce.number().min(0).default(0),
  businessIncome: z.coerce.number().min(0).default(0),
  capitalGains: z.coerce.number().min(0).default(0),
  otherIncome: z.coerce.number().min(0).default(0),
});

const personalDeductionsSchema = z.object({
  section80C: z.coerce.number().min(0).max(150000, "Max 1,50,000 for India").default(0),
  section80D: z.coerce.number().min(0).default(0),
  hra: z.coerce.number().min(0).default(0),
  otherDeductions: z.coerce.number().min(0).default(0),
});

const personalTaxCalculatorSchema = z.object({
  income: personalIncomeSchema,
  deductions: personalDeductionsSchema,
});
type PersonalFormData = z.infer<typeof personalTaxCalculatorSchema>;

const corporateTaxCalculatorSchema = z.object({
    revenue: z.coerce.number().min(0, "Revenue cannot be negative.").default(0),
    profit: z.coerce.number().min(0, "Profit cannot be negative.").default(0),
});
type CorporateFormData = z.infer<typeof corporateTaxCalculatorSchema>;

const payrollSchema = z.object({
    ctc: z.coerce.number().min(1, "CTC must be greater than zero."),
    employeeName: z.string().optional(),
    basicPercentage: z.coerce.number().min(30).max(60).default(40),
    hraPercentage: z.coerce.number().min(0).max(100).default(50),
    otherAllowances: z.coerce.number().min(0).default(0),
});
type PayrollFormData = z.infer<typeof payrollSchema>;

const hireSchema = z.object({
  role: z.string().min(1, "Role is required."),
  monthlySalary: z.coerce.number().min(1, "Salary must be positive."),
  startMonth: z.coerce.number().min(1).max(12),
});

const oneTimeExpenseSchema = z.object({
  item: z.string().min(1, "Item description is required."),
  amount: z.coerce.number().min(1, "Amount must be positive."),
  month: z.coerce.number().min(1).max(12),
});

const forecastSchema = z.object({
  revenueGrowthRate: z.coerce.number().min(0).max(100),
  newHires: z.array(hireSchema),
  oneTimeExpenses: z.array(oneTimeExpenseSchema),
});
type ForecastFormData = z.infer<typeof forecastSchema>;


const InfoCard = ({ title, value }: { title: string, value: string }) => (
    <div className="flex justify-between items-center text-sm p-3 border rounded-md bg-muted/30">
        <dt className="text-muted-foreground">{title}</dt>
        <dd className="font-semibold font-mono">{value}</dd>
    </div>
)

const formatCurrency = (num: number, region = 'India') => {
  const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: region === 'India' ? 'INR' : 'USD' // Simple region check
  };
  return new Intl.NumberFormat(region === 'India' ? 'en-IN' : 'en-US', options).format(num);
}

const PersonalTaxCalculator = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const { control, handleSubmit } = useForm<PersonalFormData>({
    resolver: zodResolver(personalTaxCalculatorSchema),
    defaultValues: {
      income: { salary: 0, businessIncome: 0, capitalGains: 0, otherIncome: 0 },
      deductions: { section80C: 0, section80D: 0, hra: 0, otherDeductions: 0 },
    },
  });
  
  const calculateIndianTax = (data: PersonalFormData): any => {
      const grossIncome = data.income.salary + data.income.businessIncome + data.income.capitalGains + data.income.otherIncome;

      // --- New Regime Calculation ---
      const standardDeductionNew = data.income.salary > 0 ? 50000 : 0;
      const taxableNew = Math.max(0, grossIncome - standardDeductionNew);
      let taxNew = 0;
      if (taxableNew <= 700000) {
          taxNew = 0; // Full rebate
      } else {
          if (taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.30;
          if (taxableNew > 1200000) taxNew += (Math.min(taxableNew, 1500000) - 1200000) * 0.20;
          if (taxableNew > 900000) taxNew += (Math.min(taxableNew, 1200000) - 900000) * 0.15;
          if (taxableNew > 600000) taxNew += (Math.min(taxableNew, 900000) - 600000) * 0.10;
          if (taxableNew > 300000) taxNew += (Math.min(taxableNew, 600000) - 300000) * 0.05;
      }
      const finalTaxNew = taxNew > 0 ? taxNew * 1.04 : 0; // 4% cess

      // --- Old Regime Calculation ---
      const standardDeductionOld = data.income.salary > 0 ? 50000 : 0;
      const totalDeductionsOld = data.deductions.section80C + data.deductions.section80D + data.deductions.hra + data.deductions.otherDeductions + standardDeductionOld;
      const taxableOld = Math.max(0, grossIncome - totalDeductionsOld);
      let taxOld = 0;
      if (taxableOld <= 500000) {
        taxOld = 0; // Full rebate
      } else {
        if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.30 + 112500;
        else if (taxableOld > 500000) taxOld += (taxableOld - 500000) * 0.20 + 12500;
        else if (taxableOld > 250000) taxOld += (taxableOld - 250000) * 0.05;
      }
      const finalTaxOld = taxOld > 0 ? taxOld * 1.04 : 0; // 4% cess

      const recommended = finalTaxNew < finalTaxOld ? 'New' : 'Old';

      return {
          oldRegime: {
              grossIncome: formatCurrency(grossIncome),
              totalDeductions: formatCurrency(totalDeductionsOld),
              taxableIncome: formatCurrency(taxableOld),
              taxPayable: formatCurrency(finalTaxOld),
              effectiveRate: grossIncome > 0 ? `${((finalTaxOld / grossIncome) * 100).toFixed(2)}%` : '0.00%',
          },
          newRegime: {
              grossIncome: formatCurrency(grossIncome),
              totalDeductions: formatCurrency(standardDeductionNew),
              taxableIncome: formatCurrency(taxableNew),
              taxPayable: formatCurrency(finalTaxNew),
              effectiveRate: grossIncome > 0 ? `${((finalTaxNew / grossIncome) * 100).toFixed(2)}%` : '0.00%',
          },
          recommendedRegime: recommended,
          recommendationReason: `The ${recommended} Regime results in lower tax liability for your income and deduction profile.`,
          optimizationTips: [
              'Maximize 80C deductions: PPF, ELSS, life insurance premiums, and home loan principal are common options.',
              'Claim 80D for health insurance premiums for yourself, your family, and senior citizen parents.',
              'If you live on rent and receive HRA, ensure you claim the full eligible exemption.',
              'Contribute to the National Pension Scheme (NPS) for an additional deduction under Sec 80CCD(1B).'
          ],
          summary: `Based on your inputs, your estimated tax liability is ${formatCurrency(Math.min(finalTaxOld, finalTaxNew))}. The ${recommended} regime is recommended.`
      };
  }

  const onSubmit = (data: PersonalFormData) => {
    setIsCalculating(true);
    setResult(null);
    // Simulate calculation time
    setTimeout(() => {
        if (userProfile?.legalRegion !== 'India') {
             toast({ variant: 'destructive', title: "Unsupported Region", description: "The tax calculator currently only supports tax laws for India." });
             setIsCalculating(false);
             return;
        }
        const calculatedResult = calculateIndianTax(data);
        setResult(calculatedResult);
        toast({ title: "Calculation Complete!", description: "Your tax summary is ready." });
        setIsCalculating(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card className="interactive-lift">
            <CardHeader><CardTitle>Income Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="salary">Annual Salary (Gross)</Label><Controller name="income.salary" control={control} render={({ field }) => <Input type="number" id="salary" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />} /></div>
              <div className="space-y-2"><Label htmlFor="businessIncome">Business/Professional Income</Label><Controller name="income.businessIncome" control={control} render={({ field }) => <Input type="number" id="businessIncome" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
              <div className="space-y-2"><Label htmlFor="capitalGains">Capital Gains</Label><Controller name="income.capitalGains" control={control} render={({ field }) => <Input type="number" id="capitalGains" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
              <div className="space-y-2"><Label htmlFor="otherIncome">Other Income</Label><Controller name="income.otherIncome" control={control} render={({ field }) => <Input type="number" id="otherIncome" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
            </CardContent>
          </Card>
          <Card className="interactive-lift">
            <CardHeader><CardTitle>Deductions & Exemptions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="section80C">Section 80C Investments</Label><Controller name="deductions.section80C" control={control} render={({ field }) => <Input type="number" id="section80C" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
              <div className="space-y-2"><Label htmlFor="section80D">Section 80D (Health Insurance)</Label><Controller name="deductions.section80D" control={control} render={({ field }) => <Input type="number" id="section80D" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
              <div className="space-y-2"><Label htmlFor="hra">House Rent Allowance (HRA)</Label><Controller name="deductions.hra" control={control} render={({ field }) => <Input type="number" id="hra" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
              <div className="space-y-2"><Label htmlFor="otherDeductions">Other Deductions</Label><Controller name="deductions.otherDeductions" control={control} render={({ field }) => <Input type="number" id="otherDeductions" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={isCalculating}>{isCalculating ? <Loader2 className="mr-2 animate-spin"/> : <Calculator className="mr-2"/>}Calculate Tax</Button>
        </form>
        <div className="lg:col-span-3 space-y-6">
            <Card className="min-h-[600px] sticky top-6 interactive-lift">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div><CardTitle>Tax Report</CardTitle><CardDescription>Your personalized tax breakdown.</CardDescription></div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isCalculating && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Calculating your taxes...</p></div>}
                    {!isCalculating && !result && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Calculator className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your tax analysis will appear here.</p></div>}
                    {!isCalculating && result && (
                        <div className="p-4 bg-background animate-in fade-in-50">
                            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-300"><AlertTriangle className="h-4 w-4 !text-amber-500"/><AlertTitle>Disclaimer</AlertTitle><AlertDescription>This is an estimate for informational purposes only. Consult a professional for final tax advice.</AlertDescription></Alert>
                            <div className="p-4 text-center rounded-lg bg-primary/10 border border-primary/20 mb-6"><p className="text-sm font-semibold text-primary">Recommended Regime</p><p className="text-2xl font-bold">{result.recommendedRegime}</p><p className="text-xs text-muted-foreground">{result.recommendationReason}</p></div>
                             <p className="text-sm text-center text-muted-foreground mb-6">{result.summary}</p>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="p-4 border rounded-lg space-y-3"><h3 className="font-semibold flex items-center gap-2"><XCircle className="text-destructive"/> Old Regime</h3><dl className="space-y-2"><InfoCard title="Gross Income" value={result.oldRegime.grossIncome} /><InfoCard title="Deductions" value={result.oldRegime.totalDeductions} /><InfoCard title="Taxable Income" value={result.oldRegime.taxableIncome} /><InfoCard title="Tax Payable" value={result.oldRegime.taxPayable} />{result.oldRegime.effectiveRate && <InfoCard title="Effective Tax Rate" value={result.oldRegime.effectiveRate} />}</dl></div>
                                <div className="p-4 border rounded-lg space-y-3"><h3 className="font-semibold flex items-center gap-2"><CheckCircle className="text-green-500"/> New Regime</h3><dl className="space-y-2"><InfoCard title="Gross Income" value={result.newRegime.grossIncome} /><InfoCard title="Deductions" value={result.newRegime.totalDeductions} /><InfoCard title="Taxable Income" value={result.newRegime.taxableIncome} /><InfoCard title="Tax Payable" value={result.newRegime.taxPayable} />{result.newRegime.effectiveRate && <InfoCard title="Effective Tax Rate" value={result.newRegime.effectiveRate} />}</dl></div>
                            </div>
                           <Separator className="my-6"/>
                           <div><h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="text-primary"/> Tax Saving Tips</h3><ul className="space-y-3">{result.optimizationTips.map((tip, index) => (<li key={index} className="flex items-start gap-3 p-3 text-sm rounded-md bg-muted/50 border"><TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0"/><span>{tip}</span></li>))}</ul></div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

const CorporateTaxCalculator = () => {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const { control, handleSubmit } = useForm<CorporateFormData>({
        resolver: zodResolver(corporateTaxCalculatorSchema),
        defaultValues: { revenue: 0, profit: 0 },
    });
    
    const calculateCorporateTaxes = (data: CorporateFormData, region: string): any => {
        const { revenue, profit } = data;
        let tax = 0;
        let summary = "";
        let tips: string[] = [];

        if (region === 'India') {
            const taxRate = revenue <= 4000000000 ? 0.25 : 0.30;
            let baseTax = profit * taxRate;
            let surcharge = 0;
            if (profit > 100000000) { // 10 Cr
                surcharge = baseTax * 0.12;
            } else if (profit > 10000000) { // 1 Cr
                surcharge = baseTax * 0.07;
            }
            tax = (baseTax + surcharge) * 1.04; // 4% cess
            summary = `For a company with a profit of ${formatCurrency(profit)}, the estimated tax is ${formatCurrency(tax)} based on a ${taxRate*100}% rate plus applicable surcharge and cess.`;
            tips = [
                'Claim full depreciation on eligible assets as per the Companies Act and Income Tax Act.',
                'Ensure accurate classification of capital vs. revenue expenditure to optimize tax outgo.',
                'File Form 15CA/CB for foreign remittances to avoid penalties.'
            ];
        } else {
            // Simplified USA C-Corp for demo
            tax = profit * 0.21;
            summary = `For a US C-Corporation, the estimated federal tax is ${formatCurrency(tax, 'USA')} based on a flat 21% rate. State taxes are not included.`;
            tips = ['Explore R&D tax credits for eligible technology-related expenses.', 'Structure employee benefits in a tax-efficient manner.', 'Consult with a CPA for state-specific tax planning opportunities.'];
        }

        const calculation = {
            grossIncome: formatCurrency(revenue, region),
            totalDeductions: "N/A",
            taxableIncome: formatCurrency(profit, region),
            taxPayable: formatCurrency(tax, region),
            effectiveRate: revenue > 0 ? `${((tax / revenue) * 100).toFixed(2)}%` : '0.00%',
        };
        
        return {
            oldRegime: calculation,
            newRegime: calculation,
            recommendedRegime: 'N/A',
            recommendationReason: 'Only one tax regime applies for corporate entities.',
            optimizationTips: tips,
            summary: summary,
        };
    };

    const onSubmit = (data: CorporateFormData) => {
        if (!userProfile) return;
        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            const calculatedResult = calculateCorporateTaxes(data, userProfile.legalRegion);
            setResult(calculatedResult);
            toast({ title: "Calculation Complete!" });
            setIsCalculating(false);
        }, 500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader><CardTitle>Corporate Financials</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Annual Revenue</Label><Controller name="revenue" control={control} render={({ field }) => <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
                        <div className="space-y-2"><Label>Profit Before Tax (PBT)</Label><Controller name="profit" control={control} render={({ field }) => <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} /></div>
                    </CardContent>
                </Card>
                <Button type="submit" className="w-full" disabled={isCalculating}>{isCalculating ? <Loader2 className="mr-2 animate-spin"/> : <Calculator className="mr-2"/>}Calculate Corporate Tax</Button>
            </form>
            <div className="lg:col-span-3 space-y-6">
                <Card className="min-h-[400px] interactive-lift">
                    <CardHeader><CardTitle>Corporate Tax Report</CardTitle><CardDescription>A simplified corporate tax estimation.</CardDescription></CardHeader>
                    <CardContent>
                        {isCalculating && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Calculating...</p></div>}
                        {!isCalculating && !result && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Calculator className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your corporate tax report will appear here.</p></div>}
                        {!isCalculating && result && (
                            <div className="animate-in fade-in-50">
                                <Alert className="mb-6"><AlertTriangle className="h-4 w-4"/><AlertTitle>Disclaimer</AlertTitle><AlertDescription>This is a simplified estimate. Consult a professional for accurate tax filing.</AlertDescription></Alert>
                                <p className="text-sm text-center text-muted-foreground mb-6">{result.summary}</p>
                                <div className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-semibold text-lg">Tax Calculation</h3>
                                    <dl className="space-y-2">
                                        <InfoCard title="Taxable Income" value={result.newRegime.taxableIncome} />
                                        <InfoCard title="Final Tax Payable" value={result.newRegime.taxPayable} />
                                        {result.newRegime.effectiveRate && <InfoCard title="Effective Tax Rate" value={result.newRegime.effectiveRate} />}
                                    </dl>
                                </div>
                                <Separator className="my-6"/>
                                <div><h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="text-primary"/> Tax Optimization Tips</h3><ul className="space-y-3">{result.optimizationTips.map((tip, index) => (<li key={index} className="flex items-start gap-3 p-3 text-sm rounded-md bg-muted/50 border"><TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0"/><span>{tip}</span></li>))}</ul></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const PayrollCalculator = () => {
    const { toast } = useToast();
    const [result, setResult] = useState<any | null>(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<PayrollFormData>({
        resolver: zodResolver(payrollSchema),
    });

    const calculatePayroll = (data: PayrollFormData) => {
        const ctc = data.ctc;
        const basic = ctc * (data.basicPercentage / 100);
        const hra = basic * (data.hraPercentage / 100);
        const specialAllowance = ctc - basic - hra - data.otherAllowances;

        const grossMonthly = (basic + hra + specialAllowance + data.otherAllowances) / 12;

        const pfEmployee = Math.min(basic, 1800 * 12) * 0.12 / 12; // 12% of basic, capped at 1800/mo
        const pfEmployer = pfEmployee;
        const esiEmployee = grossMonthly <= 21000 ? grossMonthly * 0.0075 : 0;
        const esiEmployer = grossMonthly <= 21000 ? grossMonthly * 0.0325 : 0;
        const totalDeductions = pfEmployee + esiEmployee;

        const netSalary = grossMonthly - totalDeductions;
        const employerCost = grossMonthly + pfEmployer + esiEmployer;

        setResult({
            name: data.employeeName || 'Employee',
            breakdown: [
                { item: 'Basic Salary', amount: basic / 12, type: 'earning' },
                { item: 'House Rent Allowance (HRA)', amount: hra / 12, type: 'earning' },
                { item: 'Other Allowances', amount: data.otherAllowances / 12, type: 'earning' },
                { item: 'Special Allowance', amount: specialAllowance / 12, type: 'earning' },
            ],
            deductions: [
                { item: 'EPF (Employee)', amount: pfEmployee, type: 'deduction' },
                { item: 'ESI (Employee)', amount: esiEmployee, type: 'deduction' },
            ],
            employerContributions: [
                { item: 'EPF (Employer)', amount: pfEmployer, type: 'contribution' },
                { item: 'ESI (Employer)', amount: esiEmployer, type: 'contribution' },
            ],
            summary: {
                ctc: ctc,
                grossMonthly: grossMonthly,
                totalDeductions: totalDeductions,
                netSalary: netSalary,
                employerCost: employerCost,
            }
        });
        toast({ title: "Payroll Calculated!" });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <form onSubmit={handleSubmit(calculatePayroll)} className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Payroll Calculator</CardTitle>
                        <CardDescription>Estimate monthly take-home salary from CTC with more detailed inputs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ctc">Annual CTC (Cost to Company)</Label>
                            <Controller name="ctc" control={control} render={({ field }) => <Input id="ctc" type="number" placeholder="e.g. 1200000" {...field} onChange={e => field.onChange(Number(e.target.value))}/>} />
                             {errors.ctc && <p className="text-sm text-destructive">{errors.ctc.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Basic Salary (% of CTC)</Label>
                            <Controller name="basicPercentage" control={control} render={({ field }) => <Input type="number" placeholder="40" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                        </div>
                         <div className="space-y-2">
                            <Label>HRA (% of Basic)</Label>
                            <Controller name="hraPercentage" control={control} render={({ field }) => <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                        </div>
                        <div className="space-y-2">
                            <Label>Other Allowances (Annual)</Label>
                            <Controller name="otherAllowances" control={control} render={({ field }) => <Input type="number" placeholder="e.g. 24000" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="employeeName">Employee Name (Optional)</Label>
                            <Controller name="employeeName" control={control} render={({ field }) => <Input id="employeeName" placeholder="e.g. Ramesh Kumar" {...field} />} />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Calculator className="mr-2"/>}
                            Calculate Payroll
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            <div className="lg:col-span-3">
                <Card className="min-h-[400px] interactive-lift">
                     <CardHeader>
                        <CardTitle>Salary Breakdown</CardTitle>
                        <CardDescription>An estimated monthly salary structure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <Calculator className="w-12 h-12 text-primary/20 mb-4" />
                                <p className="font-medium">Your payroll calculation will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in-50">
                                <Alert><AlertTriangle className="h-4 w-4"/><AlertTitle>Disclaimer</AlertTitle><AlertDescription>This is an estimate. TDS and other statutory deductions may vary.</AlertDescription></Alert>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="p-2 border rounded-md bg-muted/50"><p className="text-xs text-muted-foreground">Gross Monthly</p><p className="font-bold text-lg">{formatCurrency(result.summary.grossMonthly)}</p></div>
                                    <div className="p-2 border rounded-md bg-muted/50"><p className="text-xs text-muted-foreground">Deductions</p><p className="font-bold text-lg text-red-600">{formatCurrency(result.summary.totalDeductions)}</p></div>
                                    <div className="p-2 border rounded-md bg-muted/50"><p className="text-xs text-muted-foreground">Take-Home</p><p className="font-bold text-lg text-green-600">{formatCurrency(result.summary.netSalary)}</p></div>
                                    <div className="p-2 border rounded-md bg-muted/50"><p className="text-xs text-muted-foreground">Cost to Employer</p><p className="font-bold text-lg">{formatCurrency(result.summary.employerCost)}</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-green-600">Earnings</h4>
                                        <dl className="space-y-2">{result.breakdown.filter((i:any) => i.amount > 0).map((item: any) => <InfoCard key={item.item} title={item.item} value={formatCurrency(item.amount)} />)}</dl>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-red-600">Deductions</h4>
                                        <dl className="space-y-2">{result.deductions.filter((i:any) => i.amount > 0).map((item: any) => <InfoCard key={item.item} title={item.item} value={formatCurrency(item.amount)} />)}</dl>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-blue-600">Employer Contributions</h4>
                                        <dl className="space-y-2">{result.employerContributions.filter((i:any) => i.amount > 0).map((item: any) => <InfoCard key={item.item} title={item.item} value={formatCurrency(item.amount)} />)}</dl>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const GstCalculatorTab = () => {
    const [amount, setAmount] = useState<number | ''>('');
    const [rate, setRate] = useState<number>(18);
    const [amountType, setAmountType] = useState<'exclusive' | 'inclusive'>('exclusive');
  
    const calculation = useMemo(() => {
        if (typeof amount !== 'number' || amount <= 0) return null;
        let base = 0, gst = 0, total = 0;
        if (amountType === 'exclusive') {
            base = amount;
            gst = amount * (rate / 100);
            total = base + gst;
        } else {
            total = amount;
            base = amount / (1 + rate / 100);
            gst = total - base;
        }
        return { base, gst, total };
    }, [amount, rate, amountType]);
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="interactive-lift">
              <CardHeader>
                  <CardTitle>GST Calculator</CardTitle>
                  <CardDescription>Quickly calculate GST for any amount.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="amount">Enter Amount (₹)</Label>
                      <Input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || '')} placeholder="e.g. 10000" className="text-lg"/>
                  </div>
                   <div className="space-y-2">
                      <Label>Amount is</Label>
                      <RadioGroup value={amountType} onValueChange={(v) => setAmountType(v as any)} className="grid grid-cols-2 gap-2">
                         <Label className={cn("p-3 border rounded-md text-center cursor-pointer", amountType === 'exclusive' && 'bg-primary/10 border-primary ring-1 ring-primary')}>
                          <RadioGroupItem value="exclusive" className="sr-only"/>
                          Exclusive of GST
                         </Label>
                          <Label className={cn("p-3 border rounded-md text-center cursor-pointer", amountType === 'inclusive' && 'bg-primary/10 border-primary ring-1 ring-primary')}>
                          <RadioGroupItem value="inclusive" className="sr-only"/>
                          Inclusive of GST
                         </Label>
                      </RadioGroup>
                  </div>
                   <div className="space-y-3">
                      <Label>Select GST Rate</Label>
                      <div className="flex flex-wrap gap-2">
                          {[3, 5, 12, 18, 28].map(r => (
                              <Button key={r} variant={rate === r ? 'default' : 'outline'} onClick={() => setRate(r)}>{r}%</Button>
                          ))}
                      </div>
                  </div>
              </CardContent>
          </Card>
        </div>

        <Card className="interactive-lift">
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
            <CardDescription>The breakdown of your entered amount.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {calculation ? (
                <div className="space-y-3 animate-in fade-in-50">
                    <InfoCard title="Base Amount" value={formatCurrency(calculation.base)} />
                    <InfoCard title={`GST (${rate}%)`} value={formatCurrency(calculation.gst)} />
                    <Separator/>
                    <div className="flex justify-between items-center text-lg p-3 border-2 border-primary/20 rounded-md bg-primary/10">
                        <dt className="font-semibold text-primary">Total Amount</dt>
                        <dd className="font-bold font-mono">{formatCurrency(calculation.total)}</dd>
                    </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <p>Enter an amount to see the calculation.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    );
};


const FinancialsTab = () => {
    const { userProfile, updateUserProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isForecasting, setIsForecasting] = useState(false);
    const [forecastResult, setForecastResult] = useState<FinancialForecasterOutput | null>(null);
    const { toast } = useToast();

    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

    const [cashBalance, setCashBalance] = useState(activeCompany?.financials?.cashBalance || 0);
    const [revenue, setRevenue] = useState(activeCompany?.financials?.monthlyRevenue || 0);
    const [expenses, setExpenses] = useState(activeCompany?.financials?.monthlyExpenses || 0);

    const { control, handleSubmit, formState: { errors } } = useForm<ForecastFormData>({
        resolver: zodResolver(forecastSchema),
        defaultValues: { revenueGrowthRate: 5, newHires: [], oneTimeExpenses: [] },
    });
    
    const { fields: hires, append: appendHire, remove: removeHire } = useFieldArray({ control, name: "newHires" });
    const { fields: oneTimeExpenses, append: appendExpense, remove: removeExpense } = useFieldArray({ control, name: "oneTimeExpenses" });

    const { burnRate, runway, runwayLabel, chartData } = useMemo(() => {
        const burn = expenses - revenue;
        let runwayMonthsText = "Profitable";
        if (burn > 0) {
            runwayMonthsText = cashBalance > 0 ? `${Math.floor(cashBalance / burn)} months` : "0 months";
        }
        
        return {
            burnRate: burn,
            runway: runwayMonthsText,
            runwayLabel: burn > 0 ? "Estimated Runway" : "Financial Status",
            chartData: [ 
                { name: 'Revenue', value: revenue, fill: 'hsl(var(--chart-2))' }, 
                { name: 'Expenses', value: expenses, fill: 'hsl(var(--chart-5))' } 
            ],
        };
    }, [revenue, expenses, cashBalance]);

    useEffect(() => {
        if (activeCompany?.financials) {
            setCashBalance(activeCompany.financials.cashBalance);
            setRevenue(activeCompany.financials.monthlyRevenue);
            setExpenses(activeCompany.financials.monthlyExpenses);
        }
    }, [activeCompany]);

    const handleSaveFinancials = async () => {
        if (!activeCompany || !userProfile) return;
        
        setIsSaving(true);
        const updatedCompany = { ...activeCompany, financials: { cashBalance, monthlyRevenue: revenue, monthlyExpenses: expenses } };
        const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
        try {
            await updateUserProfile({ companies: updatedCompanies });
            toast({ title: "Financials Saved!", description: "Your runway and health metrics have been updated."});
        } catch(e) {
            toast({ variant: 'destructive', title: "Save Failed", description: "Could not save financial data."});
        } finally {
            setIsSaving(false);
        }
    };
    
    const onForecastSubmit = async (data: ForecastFormData) => {
        if (!activeCompany || !userProfile) {
            toast({ variant: 'destructive', title: 'Missing Data', description: 'Please fill out and save your financial snapshot before generating a forecast.' });
            return;
        }

        setIsForecasting(true);
        setForecastResult(null);

        try {
            const response = await generateFinancialForecast({
                cashBalance: cashBalance,
                monthlyRevenue: revenue,
                monthlyExpenses: expenses,
                revenueGrowthRate: data.revenueGrowthRate,
                newHires: data.newHires,
                oneTimeExpenses: data.oneTimeExpenses,
                forecastPeriodInMonths: 12,
                legalRegion: userProfile.legalRegion,
            });
            setForecastResult(response);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Forecast Failed', description: error.message });
        } finally {
            setIsForecasting(false);
        }
    };
    
    if (!activeCompany) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Please add or select a company to view its financials.
          </CardContent>
        </Card>
      );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChartIcon className="w-6 h-6 text-primary"/> Runway Calculator</CardTitle>
                        <CardDescription>Input your key monthly financials to calculate your runway and save for analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cashBalance">Current Cash Balance (₹)</Label>
                            <Input id="cashBalance" type="number" value={cashBalance} onChange={(e) => setCashBalance(Number(e.target.value) || 0)} placeholder="e.g. 10000000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenue">Average Monthly Revenue (₹)</Label>
                            <Input id="revenue" type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value) || 0)} placeholder="e.g. 500000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expenses">Average Monthly Expenses (₹)</Label>
                            <Input id="expenses" type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value) || 0)} placeholder="e.g. 800000" />
                        </div>
                    </CardContent>
                     <CardFooter>
                      <Button onClick={handleSaveFinancials} disabled={isSaving}>
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2"/>}
                          Save Financials
                      </Button>
                    </CardFooter>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Health Overview</CardTitle>
                        <CardDescription>Your startup's key financial health indicators.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {(revenue > 0 || expenses > 0 || cashBalance > 0) ? (
                            <>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted border text-center">
                                        <p className="text-sm text-muted-foreground">{burnRate > 0 ? "Net Monthly Burn" : "Net Monthly Profit"}</p>
                                        <p className={`text-2xl font-bold ${burnRate > 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(Math.abs(burnRate))}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted border text-center">
                                        <p className="text-sm text-muted-foreground">{runwayLabel}</p>
                                        <p className="text-2xl font-bold">{runway}</p>
                                    </div>
                                </div>
                                <ChartContainer config={{ revenue: { label: "Revenue" }, expenses: { label: "Expenses" } }} className="h-48 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Tooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(Number(value))} hideLabel />} />
                                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="60%" cy="50%">
                                         {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </Pie>
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </ChartContainer>
                            </>
                        ) : (
                             <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                <p>Enter your financial data to see an overview.</p>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
            
            <Card className="col-span-full interactive-lift">
                <form onSubmit={handleSubmit(onForecastSubmit)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary"/> Financial Forecaster</CardTitle>
                        <CardDescription>Add assumptions to project your financial future. Results appear below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="revenueGrowthRate">Monthly Revenue Growth Rate (%)</Label>
                            <Controller name="revenueGrowthRate" control={control} render={({ field }) => <Input id="revenueGrowthRate" type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />} />
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                            <Label className="font-semibold">Planned Hires</Label>
                            <div className="space-y-2">
                                {hires.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                                        <Controller name={`newHires.${index}.role`} control={control} render={({ field }) => <Input placeholder="e.g. Engineer" {...field} />} />
                                        <Controller name={`newHires.${index}.monthlySalary`} control={control} render={({ field }) => <Input type="number" placeholder="e.g. 80000" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} />
                                        <div className="flex items-center gap-1">
                                            <Controller name={`newHires.${index}.startMonth`} control={control} render={({ field }) => <Input type="number" placeholder="Month (1-12)" min="1" max="12" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeHire(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendHire({ role: '', monthlySalary: 0, startMonth: 1 })}><PlusCircle className="mr-2"/>Add Hire</Button>
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                            <Label className="font-semibold">One-Time Expenses</Label>
                            <div className="space-y-2">
                                {oneTimeExpenses.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                                        <Controller name={`oneTimeExpenses.${index}.item`} control={control} render={({ field }) => <Input placeholder="e.g. Laptops" {...field} />} />
                                        <Controller name={`oneTimeExpenses.${index}.amount`} control={control} render={({ field }) => <Input type="number" placeholder="e.g. 150000" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} />
                                        <div className="flex items-center gap-1">
                                            <Controller name={`oneTimeExpenses.${index}.month`} control={control} render={({ field }) => <Input type="number" placeholder="Month (1-12)" min="1" max="12" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExpense(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExpense({ item: '', amount: 0, month: 1 })}><PlusCircle className="mr-2"/>Add Expense</Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isForecasting} className="w-full">
                            {isForecasting ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                            Generate Forecast
                        </Button>
                    </CardFooter>
                </form>
             </Card>
             
             {isForecasting && <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1 col-span-full"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Forecasting the future...</p></div>}
             
             {forecastResult && (
                <Card className="col-span-full interactive-lift animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Forecast Report</CardTitle>
                        <CardDescription>Your 12-month financial projection.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Sparkles className="h-4 w-4"/>
                            <AlertTitle>Summary</AlertTitle>
                            <AlertDescription>{forecastResult.summary}</AlertDescription>
                        </Alert>
                         <div className="p-4 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Projected Runway</p>
                            <p className={`text-2xl font-bold ${forecastResult.runwayInMonths && forecastResult.runwayInMonths <= 6 ? 'text-destructive' : 'text-foreground'}`}>
                                {forecastResult.runwayInMonths ? `${forecastResult.runwayInMonths} Months` : '12+ Months / Profitable'}
                            </p>
                        </div>
                        <ChartContainer config={{ closingBalance: { label: "Cash Balance", color: "hsl(var(--primary))" } }} className="h-64 w-full">
                            <AreaChart data={forecastResult.forecast} margin={{ left: 12, right: 12 }}>
                                 <defs>
                                    <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-closingBalance)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-closingBalance)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                                <Area dataKey="closingBalance" type="natural" fill="url(#fillBalance)" stroke="var(--color-closingBalance)" stackId="a" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
             )}
        </div>
    )
}

const FinancialAnalysisTab = () => {
    const { userProfile, updateUserProfile, deductCredits } = useAuth();
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
    
    const [historicalData, setHistoricalData] = useState(activeCompany?.historicalFinancials || []);
    const [chartData, setChartData] = useState<any[]>([]);
    const [insights, setInsights] = useState<YoYOutput | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [newYear, setNewYear] = useState("");
    const [newRevenue, setNewRevenue] = useState<number | ''>('');
    const [newExpenses, setNewExpenses] = useState<number | ''>('');
    const { toast } = useToast();

    useEffect(() => {
        setHistoricalData(activeCompany?.historicalFinancials || []);
    }, [activeCompany]);
    
    const addHistoricalData = async () => {
        if (newYear && typeof newRevenue === 'number' && typeof newExpenses === 'number') {
            if (historicalData.some(d => d.year === newYear)) {
                toast({ variant: 'destructive', title: 'Duplicate Year', description: 'Data for this year already exists.'});
                return;
            }
            const updatedData = [...historicalData, { year: newYear, revenue: newRevenue, expenses: newExpenses }];
            await saveToProfile(updatedData);
            setNewYear('');
            setNewRevenue('');
            setNewExpenses('');
        } else {
            toast({ variant: 'destructive', title: 'Invalid Data', description: 'Please fill out all fields for the historical record.'});
        }
    };

    const removeHistoricalData = async (year: string) => {
        const updatedData = historicalData.filter(d => d.year !== year);
        await saveToProfile(updatedData);
    };
    
    const saveToProfile = async (data: any[]) => {
      if (!activeCompany || !userProfile) return;
      setHistoricalData(data); // Optimistic update
      const updatedCompany = { ...activeCompany, historicalFinancials: data };
      const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
      await updateUserProfile({ companies: updatedCompanies });
      toast({ title: 'Historical Data Saved!' });
    };

    const handleGenerateAnalysis = async () => {
        if (!userProfile) return;
        if (!await deductCredits(1)) return;

        setIsAnalyzing(true);
        setChartData([]);
        setInsights(null);

        try {
            const response = await getYoYAnalysisAction({
                historicalData,
                legalRegion: userProfile.legalRegion,
            });
            setInsights(response);
            setChartData(historicalData.sort((a,b) => a.year.localeCompare(b.year)));
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message });
        } finally {
            setIsAnalyzing(false);
        }
    };
  
    if (!activeCompany) { return null; }

    return (
      <div className="space-y-6">
        <Card className="interactive-lift">
            <CardHeader>
              <CardTitle>Year-Over-Year Financial Analysis</CardTitle>
              <CardDescription>Add historical data and then generate an AI-powered trend analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {historicalData.map(data => (
                        <div key={data.year} className="flex items-center gap-4 p-3 border rounded-md">
                            <p className="font-semibold flex-1">{data.year}</p>
                            <p className="text-sm text-green-600">Revenue: {formatCurrency(data.revenue)}</p>
                            <p className="text-sm text-red-600">Expenses: {formatCurrency(data.expenses)}</p>
                            <Button variant="ghost" size="icon" onClick={() => removeHistoricalData(data.year)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end p-4 border-t">
                         <div className="space-y-1.5"><Label htmlFor="new-year">Year (e.g., 2023-24)</Label><Input id="new-year" value={newYear} onChange={e => setNewYear(e.target.value)} /></div>
                         <div className="space-y-1.5"><Label htmlFor="new-revenue">Total Revenue (₹)</Label><Input id="new-revenue" type="number" value={newRevenue} onChange={e => setNewRevenue(Number(e.target.value) || '')} /></div>
                         <div className="space-y-1.5"><Label htmlFor="new-expenses">Total Expenses (₹)</Label><Input id="new-expenses" type="number" value={newExpenses} onChange={e => setNewExpenses(Number(e.target.value) || '')} /></div>
                         <Button onClick={addHistoricalData}><PlusCircle className="mr-2"/>Add Year</Button>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex-col gap-2 items-center">
                 <Button onClick={handleGenerateAnalysis} disabled={isAnalyzing || historicalData.length === 0} className="w-full max-w-xs">
                     {isAnalyzing ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                     Generate YoY Analysis
                 </Button>
                  <p className="text-xs text-muted-foreground">1 Credit per analysis</p>
            </CardFooter>
        </Card>
        
        {isAnalyzing ? (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1 col-span-full"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Analyzing your data...</p></div>
        ) : (
          (chartData.length > 0 || insights) && (
            <div className="space-y-6 animate-in fade-in-50">
              <Card className="interactive-lift">
                  <CardHeader><CardTitle>Financial Trends</CardTitle></CardHeader>
                  <CardContent>
                       <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" }, expenses: { label: "Expenses", color: "hsl(var(--chart-5))" } }} className="h-80 w-full">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                              <Tooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                              <Legend />
                              <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} name="Revenue" />
                              <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} name="Expenses" />
                          </LineChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
              {insights && (
                <Card className="interactive-lift">
                   <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI-Generated Insights</CardTitle></CardHeader>
                   <CardContent>
                      <ul className="space-y-3">
                          {insights.insights.map((insight, index) => (
                              <li key={index} className="flex items-start gap-3 p-3 text-sm rounded-md bg-muted/50 border">
                                  <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0"/>
                                  <span>{insight}</span>
                              </li>
                          ))}
                      </ul>
                   </CardContent>
                </Card>
              )}
            </div>
          )
        )}
      </div>
    );
  };

export default function FinancialsPage() {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('financials');

    if (!userProfile) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const isCA = userProfile.role === 'CA';

    const founderTabs = [
        { value: 'financials', label: 'Runway & Forecast', icon: BarChartIcon, component: <FinancialsTab /> },
        { value: 'analysis', label: 'YoY Analysis', icon: LineChartIcon, component: <FinancialAnalysisTab /> },
        { value: 'gst', label: 'GST Calculator', icon: Calculator, component: <GstCalculatorTab /> },
        { value: 'payroll', label: 'Payroll Calculator', icon: User, component: <PayrollCalculator /> },
        { value: 'personal', label: 'Personal Tax', icon: User, component: <PersonalTaxCalculator /> },
        { value: 'corporate', label: 'Corporate Tax', icon: Building, component: <CorporateTaxCalculator /> },
    ];
    
    const caTabs = [
        { value: 'gst', label: 'GST Calculator', icon: Calculator, component: <GstCalculatorTab /> },
        { value: 'payroll', label: 'Payroll Calculator', icon: User, component: <PayrollCalculator /> },
        { value: 'personal', label: 'Personal Tax', icon: User, component: <PersonalTaxCalculator /> },
        { value: 'corporate', label: 'Corporate Tax', icon: Building, component: <CorporateTaxCalculator /> },
    ];

    const tabs = isCA ? caTabs : founderTabs;
    const defaultTab = isCA ? 'gst' : 'financials';

    const currentTab = tabs.find(t => t.value === activeTab) || tabs[0];
    const CurrentIcon = currentTab?.icon || Sparkles;

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">{isCA ? 'Taxes & Calculation' : 'Financials & Tax'}</h1>
                <p className="text-muted-foreground">Tools to calculate taxes and manage your startup's financial health.</p>
            </div>
            <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                 <div className="md:hidden">
                    <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                                <CurrentIcon className="w-4 h-4" />
                                <span>{currentTab?.label}</span>
                           </div>
                        </SelectTrigger>
                        <SelectContent>
                            {tabs.map(tab => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    <div className="flex items-center gap-2">
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                <TabsList className="hidden md:grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)`}}>
                    {tabs.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            <tab.icon className="mr-2"/>{tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="mt-6">
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
