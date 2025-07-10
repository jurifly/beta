
"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, PieChart, ShieldCheck, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { format, startOfToday, addDays } from 'date-fns';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';

type ReportData = {
  client: Company;
  hygieneScore: number;
  filingPerformance: number;
  profileCompleteness: number;
  upcomingFilings: any[];
  overdueFilings: any[];
  completedFilings: any[];
  ownershipData: { name: string; value: number; type: string; }[];
  burnRate: number;
  runway: string;
  insights: string[];
};

const ReportTemplate = ({ data }: { data: ReportData }) => {
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
    const scoreColor = data.hygieneScore > 80 ? 'text-green-600' : data.hygieneScore > 60 ? 'text-orange-500' : 'text-red-600';
    const totalShares = data.ownershipData.reduce((acc, p) => acc + p.value, 0);

    return (
        <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Manrope, sans-serif' }}>
            <header className="flex justify-between items-start border-b-2 border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary">
                        <path d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path>
                    </svg>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Claari</h2>
                        <p className="text-xs text-gray-500">AI-Powered Compliance</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-extrabold text-gray-700">Founder Health Report</h1>
                    <p className="text-sm font-medium text-gray-500">{data.client.name}</p>
                    <p className="text-xs text-gray-400">Generated: {format(new Date(), 'do MMM, yyyy')}</p>
                </div>
            </header>

            <main className="mt-8">
                <section className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-600">Legal Hygiene Score</p>
                        <div className={`mt-2 text-7xl font-bold ${scoreColor}`}>{data.hygieneScore}</div>
                        <p className="text-xs font-medium text-gray-500">Out of 100</p>
                    </div>
                    <div className="col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-center">
                        <h3 className="font-semibold text-gray-700 mb-4">Score Breakdown</h3>
                        <div className="space-y-4">
                             <div>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Filing Performance</span><span className="font-semibold text-gray-800">{data.filingPerformance.toFixed(0)}%</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.filingPerformance}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Profile Completeness</span><span className="font-semibold text-gray-800">{data.profileCompleteness.toFixed(0)}%</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{ width: `${data.profileCompleteness}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <div className="grid grid-cols-5 gap-6 mb-8">
                    <div className="col-span-3 space-y-6">
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">Cap Table Analysis</h3>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <RechartsTooltip formatter={(value: number, name: string) => [`${totalShares > 0 ? (value / totalShares * 100).toFixed(1) : 0}%`, name]} />
                                        <Pie data={data.ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                                            {data.ownershipData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Legend iconSize={8} layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', lineHeight: '1.4' }}/>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                               </div>
                               <div>
                                    <p className="text-sm font-semibold mb-2">Key Holders:</p>
                                    <ul className="text-xs space-y-1">
                                        {data.ownershipData.map((d, index) => (
                                            <li key={`${d.name}-${index}`} className="flex justify-between">
                                                <span>{d.name}</span>
                                                <span className="font-mono">{totalShares > 0 ? (d.value / totalShares * 100).toFixed(1) : 0}%</span>
                                            </li>
                                        ))}
                                    </ul>
                               </div>
                            </div>
                        </div>
                         <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">Key Financial Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Monthly Burn</p>
                                    <p className={`text-xl font-bold ${data.burnRate > 0 ? 'text-red-600' : 'text-green-600'}`}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.burnRate)}</p>
                                </div>
                                 <div className="text-center p-2 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Est. Runway</p>
                                    <p className="text-xl font-bold">{data.runway}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="col-span-2 space-y-6">
                        <div className="p-4 border border-red-300 bg-red-50 rounded-xl">
                            <h3 className="text-base font-semibold text-red-700 mb-2">Overdue Filings ({data.overdueFilings.length})</h3>
                            {data.overdueFilings.length > 0 ? (
                                <ul className="text-xs list-disc pl-4 space-y-1 text-red-900">
                                    {data.overdueFilings.slice(0, 4).map((f: any) => <li key={f.id}>{f.text}</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-600">None. All caught up!</p>}
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-2">Upcoming Filings (Next 30 Days) ({data.upcomingFilings.length})</h3>
                            {data.upcomingFilings.length > 0 ? (
                                <ul className="text-xs list-disc pl-4 space-y-1 text-gray-700">
                                    {data.upcomingFilings.slice(0, 4).map((f: any) => <li key={f.id}>{f.text}</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-600">No filings due soon.</p>}
                        </div>
                    </div>
                </div>
                 <section className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">AI-Powered Insights & Red Flags</h2>
                     <div className="space-y-3">
                        {data.insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 text-sm rounded-lg bg-blue-50 border border-blue-200">
                                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <span>{insight}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="text-center text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path></svg>
                    <span>Claari &copy; {new Date().getFullYear()} - All Rights Reserved</span>
                </div>
                <p>This report was generated by Claari AI and is intended for informational purposes only. Please verify all data before taking any action.</p>
            </footer>
        </div>
    );
};


export default function ReportCenterPage() {
    const { userProfile } = useAuth();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    const handleGenerateReport = async () => {
        if (!selectedClientId || !userProfile) return;
        const client = userProfile.companies.find(c => c.id === selectedClientId);
        if (!client) return;
        
        setIsLoading(true);
        setReportData(null);
        
        try {
            // 1. Fetch compliance checklist data
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            const response = await generateFilings({
                companyType: client.type,
                incorporationDate: client.incorporationDate,
                currentDate: currentDate,
                legalRegion: client.legalRegion,
                gstin: client.gstin,
            });

            // 2. Process data for the report
            const today = startOfToday();
            const thirtyDaysFromNow = addDays(today, 30);
            
            const checklistItems = response.filings.map((filing) => ({
                id: `${filing.title}-${filing.date}`,
                text: filing.title,
                dueDate: filing.date,
                completed: false 
            }));
            
            const upcomingFilings = checklistItems.filter(item => {
                const dueDate = new Date(item.dueDate + 'T00:00:00');
                return dueDate >= today && dueDate <= thirtyDaysFromNow && !item.completed;
            });
            const overdueFilings = checklistItems.filter(item => {
                const dueDate = new Date(item.dueDate + 'T00:00:00');
                return dueDate < today && !item.completed;
            });
            const completedFilings = checklistItems.filter(item => item.completed);

            // 3. Calculate Hygiene Score
            const totalFilings = checklistItems.length;
            const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
            const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
            if (client.legalRegion === 'India') requiredFields.push('cin');
            const filledFields = requiredFields.filter(field => client[field] && String(client[field]).trim() !== '').length;
            const profileCompleteness = (filledFields / requiredFields.length) * 100;
            const hygieneScore = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

            // 4. Process Cap Table data
            const capTable = client.capTable || [];
            const ownershipData = capTable.map(e => ({ name: e.holder, value: e.shares, type: e.type }));

            // 5. Financials
            const financials = client.financials || { monthlyRevenue: 0, monthlyExpenses: 0, cashBalance: 0 };
            const burnRate = financials.monthlyExpenses - financials.monthlyRevenue;
            let runway = "Profitable";
            if (burnRate > 0) {
                runway = financials.cashBalance > 0 ? `${Math.floor(financials.cashBalance / burnRate)} months` : "0 months";
            }

            // 6. Generate Insights (mocked for now)
            const insights: string[] = [];
            if (hygieneScore < 70) insights.push(`The company's Legal Hygiene Score of ${hygieneScore} is below the recommended 85. Focus on clearing overdue filings and completing the company profile.`);
            if (burnRate > 0 && (financials.cashBalance / burnRate) < 6) insights.push(`Financial runway is critically low at ${runway}. Immediate action on fundraising or cost reduction is advised.`);
            if (!capTable.some(e => e.type === 'ESOP')) insights.push("No ESOP pool has been created. This could be a risk for hiring and retaining top talent in the future.");
            if (capTable.filter(e => e.type === 'Founder').length === 1 && capTable.reduce((acc, e) => e.type === 'Founder' ? acc + e.shares : acc, 0) / capTable.reduce((acc, e) => acc + e.shares, 1) > 0.75) insights.push("A single founder holds over 75% equity, which can be a potential risk for investors. Consider diversifying ownership or establishing a clear succession plan.");
            if (insights.length === 0) insights.push("The company's core metrics appear healthy. Continue to monitor compliance and financial performance regularly.");

            setReportData({
                client,
                hygieneScore,
                filingPerformance: filingPerf,
                profileCompleteness,
                upcomingFilings,
                overdueFilings,
                completedFilings,
                ownershipData,
                burnRate,
                runway,
                insights,
            });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report data. ' + error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadPdf = () => {
        const input = reportRef.current;
        if (!input) return;
        
        toast({ title: 'Generating PDF...', description: 'Please wait, this may take a moment.' });
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${reportData?.client.name}_Compliance_Report.pdf`);
        });
    };

    if (!userProfile) {
        return <Loader2 className="animate-spin" />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Report Center</h1>
                <p className="text-muted-foreground">Generate professional, shareable reports for your clients or your own records.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Compliance & Health Report</CardTitle>
                    <CardDescription>Select a company to generate a detailed summary PDF.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md space-y-2">
                        <Label htmlFor="client-select">Select a Company</Label>
                        <Select onValueChange={setSelectedClientId} value={selectedClientId || undefined}>
                            <SelectTrigger id="client-select">
                                <SelectValue placeholder="Choose a company..." />
                            </SelectTrigger>
                            <SelectContent>
                                {userProfile.companies.map(company => (
                                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleGenerateReport} disabled={!selectedClientId || isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <FileText className="mr-2"/>}
                        Generate Report
                    </Button>
                </CardFooter>
            </Card>

            {reportData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>Report Preview</CardTitle>
                            <CardDescription>A preview of the generated report for {reportData.client.name}.</CardDescription>
                        </div>
                        <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2" /> Download PDF
                        </Button>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-gray-200 p-8 overflow-auto">
                        <div ref={reportRef}>
                            <ReportTemplate data={reportData} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
