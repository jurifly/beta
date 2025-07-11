

"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import type { TaxAdvisorOutput } from "@/ai/flows/tax-advisor-flow";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Download, CheckCircle, XCircle, Lightbulb, TrendingUp, AlertTriangle, User, Building, Save, BarChart, FileText, Calculator, PlusCircle, Trash2, LineChart as LineChartIcon } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateFinancialForecast } from "@/ai/flows/financial-forecaster-flow";
import type { FinancialForecasterOutput } from "@/ai/flows/financial-forecaster-flow";

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
  const [result, setResult] = useState<TaxAdvisorOutput | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit } = useForm<PersonalFormData>({
    resolver: zodResolver(personalTaxCalculatorSchema),
    defaultValues: {
      income: { salary: 0, businessIncome: 0, capitalGains: 0, otherIncome: 0 },
      deductions: { section80C: 0, section80D: 0, hra: 0, otherDeductions: 0 },
    },
  });
  
  const calculateIndianTax = (data: PersonalFormData): TaxAdvisorOutput => {
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

  const handleDownloadPdf = () => {
    const input = resultRef.current;
    if (!input) return;
    toast({ title: 'Generating PDF...', description: 'Please wait.' });
    html2canvas(input, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Personal_Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card className="interactive-lift">
            <CardHeader><CardTitle>Income Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="salary">Annual Salary (Gross)</Label><Controller name="income.salary" control={control} render={({ field }) => <Input type="number" id="salary" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="businessIncome">Business/Professional Income</Label><Controller name="income.businessIncome" control={control} render={({ field }) => <Input type="number" id="businessIncome" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="capitalGains">Capital Gains</Label><Controller name="income.capitalGains" control={control} render={({ field }) => <Input type="number" id="capitalGains" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="otherIncome">Other Income</Label><Controller name="income.otherIncome" control={control} render={({ field }) => <Input type="number" id="otherIncome" {...field} />} /></div>
            </CardContent>
          </Card>
          <Card className="interactive-lift">
            <CardHeader><CardTitle>Deductions & Exemptions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="section80C">Section 80C Investments</Label><Controller name="deductions.section80C" control={control} render={({ field }) => <Input type="number" id="section80C" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="section80D">Section 80D (Health Insurance)</Label><Controller name="deductions.section80D" control={control} render={({ field }) => <Input type="number" id="section80D" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="hra">House Rent Allowance (HRA)</Label><Controller name="deductions.hra" control={control} render={({ field }) => <Input type="number" id="hra" {...field} />} /></div>
              <div className="space-y-2"><Label htmlFor="otherDeductions">Other Deductions</Label><Controller name="deductions.otherDeductions" control={control} render={({ field }) => <Input type="number" id="otherDeductions" {...field} />} /></div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={isCalculating}>{isCalculating ? <Loader2 className="mr-2 animate-spin"/> : <Calculator className="mr-2"/>}Calculate Tax</Button>
        </form>
        <div className="lg:col-span-3 space-y-6">
            <Card className="min-h-[600px] sticky top-6 interactive-lift">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div><CardTitle>Tax Report</CardTitle><CardDescription>Your personalized tax breakdown.</CardDescription></div>
                        {result && <Button variant="outline" size="sm" onClick={handleDownloadPdf}><Download className="mr-2"/>Download PDF</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    {isCalculating && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="mt-4 font-semibold">Calculating your taxes...</p></div>}
                    {!isCalculating && !result && <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg"><Calculator className="w-12 h-12 text-primary/20 mb-4" /><p className="font-medium">Your tax analysis will appear here.</p></div>}
                    {!isCalculating && result && (
                        <div ref={resultRef} className="p-4 bg-background animate-in fade-in-50">
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
    const [result, setResult] = useState<TaxAdvisorOutput | null>(null);

    const { control, handleSubmit } = useForm<CorporateFormData>({
        resolver: zodResolver(corporateTaxCalculatorSchema),
        defaultValues: { revenue: 0, profit: 0 },
    });
    
    const calculateCorporateTaxes = (data: CorporateFormData, region: string): TaxAdvisorOutput => {
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
                        <div className="space-y-2"><Label>Annual Revenue</Label><Controller name="revenue" control={control} render={({ field }) => <Input type="number" {...field} />} /></div>
                        <div className="space-y-2"><Label>Profit Before Tax (PBT)</Label><Controller name="profit" control={control} render={({ field }) => <Input type="number" {...field} />} /></div>
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

const forecastSchema = z.object({
  revenueGrowthRate: z.coerce.number().min(0).max(100).default(5),
  newHires: z.array(z.object({
    role: z.string().min(1, 'Role is required'),
    monthlySalary: z.coerce.number().min(1, 'Salary is required'),
    startMonth: z.coerce.number().min(1).max(12),
  })).default([]),
  oneTimeExpenses: z.array(z.object({
    item: z.string().min(1, 'Item name is required'),
    amount: z.coerce.number().min(1, 'Amount is required'),
    month: z.coerce.number().min(1).max(12),
  })).default([]),
});
type ForecastFormData = z.infer<typeof forecastSchema>;


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
            chartData: [ { name: 'Revenue', value: revenue, color: 'hsl(var(--chart-2))' }, { name: 'Expenses', value: expenses, color: 'hsl(var(--chart-5))' } ].filter(d => d.value > 0),
        };
    }, [revenue, expenses, cashBalance]);

    const handleSaveFinancials = async () => {
        if (!activeCompany || !userProfile) return;
        setIsSaving(true);
        const updatedCompany = { ...activeCompany, financials: { cashBalance: cashBalance, monthlyRevenue: revenue, monthlyExpenses: expenses }};
        const updatedCompanies = userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c);
        try {
            await updateUserProfile({ companies: updatedCompanies });
            toast({ title: "Financials Saved", description: "Your burn rate and runway have been updated."});
        } catch(e) {
            toast({ variant: 'destructive', title: "Save Failed", description: "Could not save financial data."});
        } finally {
            setIsSaving(false);
        }
    };
    
    const onForecastSubmit = async (data: ForecastFormData) => {
        if (!activeCompany?.financials || !userProfile) {
            toast({ variant: 'destructive', title: 'Missing Data', description: 'Please fill out and save your financial snapshot before generating a forecast.' });
            return;
        }

        setIsForecasting(true);
        setForecastResult(null);

        try {
            const response = await generateFinancialForecast({
                cashBalance: activeCompany.financials.cashBalance,
                monthlyRevenue: activeCompany.financials.monthlyRevenue,
                monthlyExpenses: activeCompany.financials.monthlyExpenses,
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
                        <CardTitle className="flex items-center gap-2"><BarChart className="w-6 h-6 text-primary"/> Financial Snapshot</CardTitle>
                        <CardDescription>Input your key monthly financials.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cashBalance">Current Cash Balance (₹)</Label>
                            <Input id="cashBalance" type="number" value={cashBalance} onChange={(e) => setCashBalance(Number(e.target.value))} placeholder="e.g. 10000000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenue">Average Monthly Revenue (₹)</Label>
                            <Input id="revenue" type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} placeholder="e.g. 500000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expenses">Average Monthly Expenses (₹)</Label>
                            <Input id="expenses" type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} placeholder="e.g. 800000" />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleSaveFinancials} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2"/>}
                            Save & Recalculate
                        </Button>
                    </CardFooter>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Health Overview</CardTitle>
                        <CardDescription>Your startup's key financial health indicators.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
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
                        <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" }, expenses: { label: "Expenses", color: "hsl(var(--chart-5))" } }} className="h-48 w-full">
                            <AreaChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} hideLabel />} />
                                <Area dataKey="value" type="monotone" fill="var(--color-value)" stroke="var(--color-value)" />
                                {chartData.map(entry => (
                                    <Area key={entry.name} dataKey="value" type="monotone" fill={entry.color} stroke={entry.color} name={entry.name} />
                                ))}
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                 </Card>
            </div>
            
            <form onSubmit={handleSubmit(onForecastSubmit)}>
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary"/> Financial Forecaster</CardTitle>
                        <CardDescription>Add assumptions to project your financial future. Results appear below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="revenueGrowthRate">Monthly Revenue Growth Rate (%)</Label>
                            <Controller name="revenueGrowthRate" control={control} render={({ field }) => <Input id="revenueGrowthRate" type="number" {...field} />} />
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                            <Label className="font-semibold">Planned Hires</Label>
                            <div className="space-y-2">
                                {hires.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                                        <Controller name={`newHires.${index}.role`} control={control} render={({ field }) => <Input placeholder="e.g. Engineer" {...field} />} />
                                        <Controller name={`newHires.${index}.monthlySalary`} control={control} render={({ field }) => <Input type="number" placeholder="e.g. 80000" {...field} />} />
                                        <div className="flex items-center gap-1">
                                            <Controller name={`newHires.${index}.startMonth`} control={control} render={({ field }) => <Input type="number" placeholder="Month (1-12)" min="1" max="12" {...field} />} />
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
                                        <Controller name={`oneTimeExpenses.${index}.amount`} control={control} render={({ field }) => <Input type="number" placeholder="e.g. 150000" {...field} />} />
                                        <div className="flex items-center gap-1">
                                            <Controller name={`oneTimeExpenses.${index}.month`} control={control} render={({ field }) => <Input type="number" placeholder="Month (1-12)" min="1" max="12" {...field} />} />
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
                </Card>
             </form>

             {isForecasting && <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-lg text-foreground">Forecasting the future...</p></div>}
             
             {forecastResult && (
                <Card className="interactive-lift animate-in fade-in-50">
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

export default function FinancialsPage() {
    const { userProfile } = useAuth();
    if (!userProfile) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
                <p className="text-muted-foreground">Tools to help you calculate taxes and manage your startup's financial health.</p>
            </div>
            <Tabs defaultValue="financials" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="financials"><BarChart className="mr-2"/>Financials</TabsTrigger>
                    <TabsTrigger value="personal"><User className="mr-2"/>Personal Tax</TabsTrigger>
                    <TabsTrigger value="corporate"><Building className="mr-2"/>Corporate Tax</TabsTrigger>
                </TabsList>
                <TabsContent value="financials" className="mt-6"><FinancialsTab /></TabsContent>
                <TabsContent value="personal" className="mt-6"><PersonalTaxCalculator /></TabsContent>
                <TabsContent value="corporate" className="mt-6"><CorporateTaxCalculator /></TabsContent>
            </Tabs>
        </div>
    );
}
