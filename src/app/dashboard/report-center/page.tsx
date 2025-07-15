

"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, Sparkles, AlertTriangle, ShieldCheck, CheckCircle, PieChart as PieChartIcon, CalendarClock, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import type { Company, DocumentAnalysis, HistoricalFinancialData } from '@/lib/types';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { generateReportInsights } from '@/ai/flows/generate-report-insights-flow';
import { format, startOfToday } from 'date-fns';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type ReportData = {
  client: Company;
  hygieneScore: number;
  filingPerformance: number;
  profileCompleteness: number;
  upcomingFilings: any[];
  overdueFilings: any[];
  completedFilings: any[];
  ownershipData: { name: string; value: number }[];
  financials: {
    burnRate: number;
    runway: string;
    historicalData: HistoricalFinancialData[];
  };
  executiveSummary?: string;
};

const formatCurrency = (num: number, region = 'India') => {
  const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: region === 'India' ? 'INR' : 'USD'
  };
  return new Intl.NumberFormat(region === 'India' ? 'en-IN' : 'en-US', options).format(num);
}

const ReportTemplate = ({ data, isGeneratingInsights }: { data: ReportData, isGeneratingInsights: boolean }) => {
    const COLORS = ["#005A9C", "#00BFFF", "#7DF9FF", "#D2B48C"]; // Professional Blue, Sky Blue, Electric Blue, Tan
    const scoreColor = data.hygieneScore > 80 ? 'text-green-600' : data.hygieneScore > 60 ? 'text-orange-500' : 'text-red-600';

    return (
        <div style={{ width: '210mm' }}>
            {/* Page 1 */}
            <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl flex flex-col" style={{ minHeight: '297mm' }}>
                <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary">
                            <path d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path>
                        </svg>
                        <span className="text-xl font-bold text-primary">Jurifly</span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">Compliance Health Report</h1>
                        <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                    </div>
                </header>

                <main className="mt-8 flex-1">
                    <section className="p-6 border-2 border-blue-500/20 bg-blue-50/50 rounded-lg mb-8">
                        <h2 className="text-xl font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5"/> AI Executive Summary
                        </h2>
                        {isGeneratingInsights ? (
                            <div className="space-y-2 py-2">
                               <div className="h-4 bg-blue-200 rounded w-full animate-pulse"></div>
                               <div className="h-4 bg-blue-200 rounded w-5/6 animate-pulse"></div>
                               <div className="h-4 bg-blue-200 rounded w-full animate-pulse"></div>
                            </div>
                        ) : (
                             <div className="prose prose-sm prose-p:text-gray-700 max-w-none">
                                <ReactMarkdown
                                  components={{
                                    ul: ({ node, ...props }) => <ul className="list-none p-0 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="flex items-start gap-2 before:content-none p-0 m-0"><span className="text-blue-600 mt-1.5">&bull;</span><div className="m-0 flex-1" {...props} /></li>,
                                  }}
                                >
                                    {data.executiveSummary || "No summary available."}
                                </ReactMarkdown>
                            </div>
                        )}
                    </section>
                    
                    <div className="grid grid-cols-3 gap-6">
                         <div className="col-span-1 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg border">
                            <h3 className="text-base font-semibold text-gray-600 mb-2">Legal Hygiene Score</h3>
                            <div className={`text-7xl font-bold ${scoreColor}`}>{data.hygieneScore}</div>
                            <p className="text-sm font-medium text-gray-500">Out of 100</p>
                        </div>
                        <div className="col-span-2 bg-gray-50 p-6 rounded-lg border flex flex-col justify-center">
                            <h3 className="font-semibold text-gray-700 mb-4">Score Breakdown</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Filing Performance</span><span className="font-semibold text-gray-800">{data.filingPerformance.toFixed(0)}%</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${data.filingPerformance}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Profile Completeness</span><span className="font-semibold text-gray-800">{data.profileCompleteness.toFixed(0)}%</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${data.profileCompleteness}%` }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="p-4 border rounded-lg bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"><PieChartIcon className="w-5 h-5"/> Ownership Structure</h3>
                            {data.ownershipData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RechartsPieChart>
                                        <RechartsTooltip formatter={(value, name, props) => [`${(props.payload.value / data.ownershipData.reduce((acc, p) => acc + p.value, 0) * 100).toFixed(1)}%`, name]} />
                                        <Pie data={data.ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                            {data.ownershipData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-center text-gray-500 py-10">No cap table data available.</p>
                            )}
                        </div>
                         <div className="p-4 border rounded-lg bg-white flex flex-col">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">Financial Snapshot</h3>
                            <div className="flex-1 flex flex-col justify-center space-y-4">
                                <div className="text-center p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm font-medium text-gray-500">{data.financials.burnRate > 0 ? "Net Monthly Burn" : "Net Monthly Profit"}</p>
                                    <p className={`text-2xl font-bold ${data.financials.burnRate > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(data.financials.burnRate))}</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm font-medium text-gray-500">Estimated Runway</p>
                                    <p className="text-2xl font-bold">{data.financials.runway}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="text-center text-xs text-gray-400 mt-8 border-t pt-4">
                    <p>Page 1 of 2 | Generated on {format(new Date(), 'PPpp')} by Jurifly AI</p>
                </footer>
            </div>
            {/* Page 2 */}
            <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl flex flex-col" style={{ minHeight: '297mm', pageBreakBefore: 'always' }}>
                 <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                    <span className="text-xl font-bold text-primary">Jurifly</span>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">Compliance & Financial Appendix</h1>
                        <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                    </div>
                </header>

                <main className="mt-8 flex-1">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-red-700 mb-3 flex items-center gap-2">
                           <AlertTriangle/> Overdue Filings ({data.overdueFilings.length})
                        </h2>
                        {data.overdueFilings.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 font-semibold">Task</th>
                                        <th className="p-2 font-semibold text-right">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.overdueFilings.map((f: any) => (
                                        <tr key={f.id} className="border-b">
                                            <td className="p-2">{f.text}</td>
                                            <td className="p-2 text-right font-mono">{format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yyyy')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">No overdue tasks. Well done!</p>}
                    </section>
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                           <CalendarClock /> Upcoming Filings (Next 30 Days) ({data.upcomingFilings.length})
                        </h2>
                         {data.upcomingFilings.length > 0 ? (
                             <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 font-semibold">Task</th>
                                        <th className="p-2 font-semibold text-right">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.upcomingFilings.map((f: any) => (
                                        <tr key={f.id} className="border-b">
                                            <td className="p-2">{f.text}</td>
                                            <td className="p-2 text-right font-mono">{format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yyyy')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         ) : <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">No filings due in the next 30 days.</p>}
                    </section>

                     <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                           <TrendingUp /> Year-over-Year Financials
                        </h2>
                         {data.financials.historicalData.length > 0 ? (
                             <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 font-semibold">Financial Year</th>
                                        <th className="p-2 font-semibold text-right">Total Revenue</th>
                                        <th className="p-2 font-semibold text-right">Total Expenses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.financials.historicalData.sort((a, b) => a.year.localeCompare(b.year)).map((item) => (
                                        <tr key={item.year} className="border-b">
                                            <td className="p-2 font-medium">{item.year}</td>
                                            <td className="p-2 text-right font-mono text-green-700">{formatCurrency(item.revenue)}</td>
                                            <td className="p-2 text-right font-mono text-red-700">{formatCurrency(item.expenses)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         ) : <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">No historical financial data available for analysis.</p>}
                    </section>
                </main>

                <footer className="text-center text-xs text-gray-400 mt-8 border-t pt-4">
                     <p>Page 2 of 2 | This report is AI-generated and for informational purposes only. Please verify all data.</p>
                </footer>
            </div>
        </div>
    );
};


export default function ReportCenterPage() {
    const { userProfile, deductCredits } = useAuth();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        // If there's only one company, pre-select it.
        if (userProfile?.companies && userProfile.companies.length === 1) {
            setSelectedClientId(userProfile.companies[0].id);
        }
    }, [userProfile?.companies]);
    
    const handleGenerateReport = async () => {
        if (!selectedClientId || !userProfile) return;
        const client = userProfile.companies.find(c => c.id === selectedClientId);
        if (!client) return;
        
        setIsLoading(true);
        setReportData(null);
        
        try {
            // 1. Fetch compliance checklist data
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            const filingResponse = await generateFilings({
                companyType: client.type,
                incorporationDate: client.incorporationDate,
                currentDate: currentDate,
                legalRegion: client.legalRegion,
                gstin: client.gstin,
            });

            // 2. Process data for the report
            const today = startOfToday();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            const savedStatuses = client.checklistStatus || {};
            const checklistItems = filingResponse.filings.map((filing) => {
                const uniqueId = `${filing.title}-${filing.date}`.replace(/[^a-zA-Z0-9-]/g, '_');
                return {
                    id: uniqueId,
                    text: filing.title,
                    dueDate: filing.date,
                    completed: savedStatuses[uniqueId] ?? false,
                };
            });
            
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
            const { founderShares, investorShares, esopPool } = capTable.reduce(
                (acc, entry) => {
                    if (entry.type === 'Founder') acc.founderShares += entry.shares;
                    else if (entry.type === 'Investor') acc.investorShares += entry.shares;
                    else if (entry.type === 'ESOP') acc.esopPool += entry.shares;
                    return acc;
                }, { founderShares: 0, investorShares: 0, esopPool: 0 }
            );
            const ownershipData = [
                { name: 'Founders', value: founderShares },
                { name: 'Investors', value: investorShares },
                { name: 'ESOP Pool', value: esopPool },
            ].filter(d => d.value > 0);

            // 5. Process Financial Data
            const financials = client.financials;
            const burn = financials ? financials.monthlyExpenses - financials.monthlyRevenue : 0;
            const runway = financials && burn > 0 && financials.cashBalance > 0 ? `${Math.floor(financials.cashBalance / burn)} months` : "Profitable / N/A";
            const historicalData = client.historicalFinancials || [];

            const initialReportData = {
                client,
                hygieneScore,
                filingPerformance: filingPerf,
                profileCompleteness,
                upcomingFilings,
                overdueFilings,
                completedFilings,
                ownershipData,
                financials: {
                    burnRate: burn,
                    runway: runway,
                    historicalData: historicalData
                }
            };

            setReportData(initialReportData);
            setIsLoading(false);

            // 6. Asynchronously generate AI insights
            setIsGeneratingInsights(true);
            
            const docHistoryKey = 'documentIntelligenceHistory';
            const savedHistory = localStorage.getItem(docHistoryKey);
            const allAnalyzedDocs: DocumentAnalysis[] = savedHistory ? JSON.parse(savedHistory) : [];
            const recentRisks = allAnalyzedDocs
                .slice(0, 3)
                .flatMap(doc => doc.riskFlags)
                .filter(flag => flag.severity === 'High')
                .map(flag => flag.risk)
                .slice(0, 3);
            
            if(!await deductCredits(1)) {
              setIsGeneratingInsights(false);
              return;
            };
            
            const insightsResponse = await generateReportInsights({
                hygieneScore: hygieneScore,
                overdueFilings: overdueFilings.length,
                upcomingFilings: upcomingFilings.length,
                burnRate: burn > 0 ? burn : 0,
                runwayInMonths: runway,
                recentRiskFlags: recentRisks,
                legalRegion: client.legalRegion
            });

            setReportData(prevData => prevData ? { ...prevData, executiveSummary: insightsResponse.executiveSummary } : null);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report data. ' + error.message });
            setIsLoading(false);
        } finally {
            setIsGeneratingInsights(false);
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
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgHeight = canvas.height * pdfWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          pdf.save(`${reportData?.client.name}_Compliance_Report.pdf`);
        });
    };

    if (!userProfile) {
        return <Loader2 className="animate-spin" />;
    }

    const reportTypes = [
        { id: 'health', name: 'Client Compliance Health Report', description: 'A detailed summary of a client\'s compliance and corporate health.' },
        { id: 'funding', name: 'Fundraising Readiness Report', description: 'Checks document readiness for a funding round. (Coming Soon)', disabled: true },
        { id: 'tax', name: 'Annual Tax Summary', description: 'A consolidated report of tax filings and liabilities for the year. (Coming Soon)', disabled: true },
    ];

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">Report Center</h1>
                <p className="text-muted-foreground">Generate professional, shareable reports for your clients.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Generate a New Report</CardTitle>
                    <CardDescription>Select a report type and a client to begin.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select defaultValue="health">
                           <SelectTrigger><SelectValue/></SelectTrigger>
                           <SelectContent>
                            {reportTypes.map(r => <SelectItem key={r.id} value={r.id} disabled={r.disabled}>{r.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-select">Select a Client</Label>
                        <Select onValueChange={setSelectedClientId} value={selectedClientId || undefined}>
                            <SelectTrigger id="client-select"><SelectValue placeholder="Choose a client..." /></SelectTrigger>
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
                        Generate Report (1 Credit)
                    </Button>
                </CardFooter>
            </Card>

            {isLoading ? (
                <Card className="flex items-center justify-center p-12">
                    <div className="text-center space-y-2">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="font-semibold">Generating Report Data...</p>
                        <p className="text-sm text-muted-foreground">This can take a few moments.</p>
                    </div>
                </Card>
            ) : reportData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>Report Preview</CardTitle>
                            <CardDescription>A preview of the generated report for {reportData.client.name}.</CardDescription>
                        </div>
                        <Button onClick={handleDownloadPdf} disabled={isGeneratingInsights}>
                            <Download className="mr-2" /> Download PDF
                        </Button>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-gray-200 p-8 overflow-auto">
                        <div ref={reportRef}>
                            <ReportTemplate data={reportData} isGeneratingInsights={isGeneratingInsights} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
