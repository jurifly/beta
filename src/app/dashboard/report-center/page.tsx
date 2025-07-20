

"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, Sparkles, AlertTriangle, ShieldCheck, CheckCircle, PieChart as PieChartIcon, CalendarClock, TrendingUp, GanttChartSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import type { Company, DocumentAnalysis, HistoricalFinancialData, GenerateDDChecklistOutput } from '@/lib/types';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { generateReportInsights } from '@/ai/flows/generate-report-insights-flow';
import { format, startOfToday, parseISO } from 'date-fns';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip as RechartsTooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';


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
  diligenceChecklist?: GenerateDDChecklistOutput;
};

const formatCurrency = (num: number, region = 'India') => {
  const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: region === 'India' ? 'INR' : 'USD'
  };
  return new Intl.NumberFormat(region === 'India' ? 'en-IN' : 'en-US', options).format(num);
}

const ReportTemplate = ({ data, executiveSummary }: { data: ReportData, executiveSummary?: string | null }) => {
    const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
    const scoreColor = data.hygieneScore > 80 ? 'text-green-600' : data.hygieneScore > 60 ? 'text-orange-500' : 'text-red-600';
    
    const diligenceProgress = useMemo(() => {
        if (!data.diligenceChecklist) return 0;
        const allItems = data.diligenceChecklist.checklist.flatMap(c => c.items);
        const completedItems = allItems.filter(i => i.status === 'Completed').length;
        const totalItems = allItems.length;
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }, [data.diligenceChecklist]);
    
    const diligenceChecklist = data.diligenceChecklist?.checklist || [];
    const checklistMidpoint = Math.ceil(diligenceChecklist.length / 2);
    const diligencePage1 = diligenceChecklist.slice(0, checklistMidpoint);
    const diligencePage2 = diligenceChecklist.slice(checklistMidpoint);

    let totalPages = 2;
    if(data.diligenceChecklist && diligencePage1.length > 0) totalPages++;
    if(data.diligenceChecklist && diligencePage2.length > 0) totalPages++;
    if(executiveSummary) totalPages++;

    const Logo = () => (
      <>
        <Image 
          src="https://i.ibb.co/yc2DGvPk/2-2.png"
          alt="Jurifly Logo"
          width={114}
          height={24}
          className="h-20 w-auto text-primary"
          data-ai-hint="logo company"
        />
      </>
    );

    return (
        <div id="report-content-for-pdf" className="space-y-4">
            {/* Page 1 */}
            <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl report-page">
                <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">Compliance Health Report</h1>
                        <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                    </div>
                </header>
                <main className="mt-8">
                     <div className="grid grid-cols-3 gap-6 mb-8">
                         <div className="col-span-1 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg border">
                            <h3 className="text-base font-semibold text-gray-600 mb-2">Legal Hygiene Score</h3>
                            <div className={`text-6xl font-bold ${scoreColor}`}>{data.hygieneScore}</div>
                            <p className="text-sm font-medium text-gray-500">Out of 100</p>
                        </div>
                        <div className="col-span-2 bg-gray-50 p-6 rounded-lg border flex flex-col justify-center">
                            <h3 className="font-semibold text-gray-700 mb-4">Score Breakdown</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Filing Performance</span><span className="font-semibold text-gray-800">{data.filingPerformance.toFixed(0)}%</span></div>
                                    <Progress value={data.filingPerformance} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Profile Completeness</span><span className="font-semibold text-gray-800">{data.profileCompleteness.toFixed(0)}%</span></div>
                                     <Progress value={data.profileCompleteness} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="p-4 border rounded-lg bg-white" data-jspdf-ignore="true">
                            <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"><PieChartIcon className="w-5 h-5"/> Ownership Structure</h3>
                            {data.ownershipData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RechartsPieChart>
                                         <RechartsTooltip formatter={(value, name, props) => {
                                            const total = data.ownershipData.reduce((acc, p) => acc + p.value, 0);
                                            const percentage = total > 0 ? ((value as number / total) * 100).toFixed(1) : 0;
                                            return [`${percentage}%`, name];
                                        }} />
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
                <footer className="text-center text-xs text-gray-400 pt-8 border-t mt-8">
                    <p>Page 1 of {totalPages} | Generated on {format(new Date(), 'PPpp')} by Jurifly AI</p>
                </footer>
            </div>
            
            {/* Page 2 */}
            <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl report-page">
                <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                    <Logo />
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">Compliance & Financial Appendix</h1>
                        <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                    </div>
                </header>
                <main className="mt-8">
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
                            <div className="space-y-4">
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
                                <div className="h-64 w-full pt-4" data-jspdf-ignore="true">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.financials.historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickFormatter={(val) => `₹${Number(val)/100000}L`} tickLine={false} axisLine={false}/>
                                            <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Legend wrapperStyle={{fontSize: '12px'}}/>
                                            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Revenue" />
                                            <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} name="Expenses" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                         ) : <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">No historical financial data available for analysis.</p>}
                    </section>
                </main>
                <footer className="text-center text-xs text-gray-400 pt-8 border-t mt-8">
                     <p>Page 2 of {totalPages} | This report is AI-generated and for informational purposes only. Please verify all data.</p>
                </footer>
            </div>

            {/* Page 3 - Due Diligence Part 1 */}
            {data.diligenceChecklist && diligencePage1.length > 0 && (
                <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl report-page">
                    <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                        <Logo />
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-gray-800">Due Diligence Appendix (1/2)</h1>
                            <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                        </div>
                    </header>
                    <main className="mt-8">
                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                               <GanttChartSquare /> {data.diligenceChecklist.reportTitle}
                            </h2>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Overall Readiness</span><span className="font-semibold text-gray-800">{diligenceProgress}%</span></div>
                                <Progress value={diligenceProgress} />
                            </div>
                        </section>
                        <div style={{ columnCount: 2, columnGap: '2rem' }}>
                            {diligencePage1.map((category, index) => (
                                <div key={index} className="mb-6" style={{ breakInside: 'avoid' }}>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">{category.category}</h3>
                                    <ul className="space-y-1">
                                        {category.items.map(item => (
                                            <li key={item.id} className="flex items-center gap-2 text-sm">
                                                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${item.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span>{item.task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </main>
                    <footer className="text-center text-xs text-gray-400 pt-8 border-t mt-8">
                        <p>Page 3 of {totalPages} | This report is AI-generated and for informational purposes only. Please verify all data.</p>
                    </footer>
                </div>
            )}
            
            {/* Page 4 - Due Diligence Part 2 */}
            {data.diligenceChecklist && diligencePage2.length > 0 && (
                 <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl report-page">
                    <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                        <Logo />
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-gray-800">Due Diligence Appendix (2/2)</h1>
                            <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                        </div>
                    </header>
                    <main className="mt-8">
                        <div style={{ columnCount: 2, columnGap: '2rem' }}>
                            {diligencePage2.map((category, index) => (
                                <div key={index} className="mb-6" style={{ breakInside: 'avoid' }}>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">{category.category}</h3>
                                    <ul className="space-y-1">
                                        {category.items.map(item => (
                                            <li key={item.id} className="flex items-center gap-2 text-sm">
                                                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${item.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span>{item.task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </main>
                    <footer className="text-center text-xs text-gray-400 pt-8 border-t mt-8">
                        <p>Page 4 of {totalPages} | This report is AI-generated and for informational purposes only. Please verify all data.</p>
                    </footer>
                </div>
            )}

            {/* Page 5 - AI Summary */}
            {executiveSummary && (
                <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl report-page">
                    <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                        <Logo />
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-gray-800">AI Executive Summary</h1>
                            <p className="text-sm font-medium text-gray-600">{data.client.name}</p>
                        </div>
                    </header>
                    <main className="mt-8">
                        <div className="prose prose-sm prose-p:text-gray-700 max-w-none">
                            <ReactMarkdown
                                components={{
                                    ul: ({ node, ...props }) => <ul className="list-none p-0 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="flex items-start gap-2 before:content-none p-0 m-0"><span className="text-blue-600 mt-1.5">&bull;</span><div className="m-0 flex-1" {...props} /></li>,
                                }}
                            >
                                {executiveSummary}
                            </ReactMarkdown>
                        </div>
                    </main>
                    <footer className="text-center text-xs text-gray-400 pt-8 border-t mt-8">
                        <p>Page {totalPages} of {totalPages} | This report is AI-generated and for informational purposes only. Please verify all data.</p>
                    </footer>
                </div>
            )}
        </div>
    );
};


export default function ReportCenterPage() {
    const { userProfile, deductCredits } = useAuth();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
    const [includeSummaryInPdf, setIncludeSummaryInPdf] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile?.companies && userProfile.companies.length > 0) {
            const activeCompanyId = userProfile.activeCompanyId;
            if (activeCompanyId && userProfile.companies.some(c => c.id === activeCompanyId)) {
                setSelectedClientId(activeCompanyId);
            } else {
                setSelectedClientId(userProfile.companies[0].id);
            }
        }
    }, [userProfile?.companies, userProfile?.activeCompanyId]);
    
    const handleGenerateReport = async () => {
        if (!selectedClientId || !userProfile) return;
        const client = userProfile.companies.find(c => c.id === selectedClientId);
        if (!client) return;
        
        setIsLoading(true);
        setReportData(null);
        setExecutiveSummary(null);
        setIncludeSummaryInPdf(false);
        
        try {
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            const filingResponse = await generateFilings({
                companyType: client.type,
                incorporationDate: client.incorporationDate,
                currentDate: currentDate,
                legalRegion: client.legalRegion,
                gstin: client.gstin,
            });

            const today = startOfToday();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            const savedStatuses = client.checklistStatus || {};
            const checklistItems = filingResponse.filings.map((filing) => {
                const uniqueId = `${filing.title}-${filing.date}`.replace(/[^a-zA-Z0-9-]/g, '_');
                return { id: uniqueId, text: filing.title, dueDate: filing.date, completed: savedStatuses[uniqueId] ?? false };
            });
            
            const upcomingFilings = checklistItems.filter(item => new Date(item.dueDate + 'T00:00:00') >= today && new Date(item.dueDate + 'T00:00:00') <= thirtyDaysFromNow && !item.completed);
            const overdueFilings = checklistItems.filter(item => new Date(item.dueDate + 'T00:00:00') < today && !item.completed);
            
            const totalFilings = checklistItems.length;
            const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
            const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
            if (client.legalRegion === 'India') requiredFields.push('cin');
            const filledFields = requiredFields.filter(field => client[field] && String(client[field]).trim() !== '').length;
            const profileCompleteness = (filledFields / requiredFields.length) * 100;
            const hygieneScore = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

            const capTable = client.capTable || [];
            const { founderShares, investorShares, esopPool } = capTable.reduce((acc, entry) => {
                if (entry.type === 'Founder') acc.founderShares += entry.shares;
                else if (entry.type === 'Investor') acc.investorShares += entry.shares;
                else if (entry.type === 'ESOP') acc.esopPool += entry.shares;
                return acc;
            }, { founderShares: 0, investorShares: 0, esopPool: 0 });
            const ownershipData = [{ name: 'Founders', value: founderShares }, { name: 'Investors', value: investorShares }, { name: 'ESOP Pool', value: esopPool }].filter(d => d.value > 0);

            const financials = client.financials;
            const burn = financials ? financials.monthlyExpenses - financials.monthlyRevenue : 0;
            const runway = financials && burn > 0 && financials.cashBalance > 0 ? `${Math.floor(financials.cashBalance / burn)} months` : "Profitable / N/A";
            const historicalData = client.historicalFinancials || [];
            
            setReportData({
                client,
                hygieneScore,
                filingPerformance: filingPerf,
                profileCompleteness,
                upcomingFilings,
                overdueFilings,
                completedFilings: checklistItems.filter(item => item.completed),
                ownershipData,
                financials: { burnRate: burn, runway, historicalData },
                diligenceChecklist: client.diligenceChecklist,
            });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report data. ' + error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateInsights = async () => {
        if (!reportData || !userProfile) return;
        if (!await deductCredits(1)) return;
        
        setIsGeneratingInsights(true);
        setExecutiveSummary(null);
        try {
            const { client, hygieneScore, overdueFilings, upcomingFilings, financials } = reportData;
            const docHistoryKey = 'documentIntelligenceHistory';
            const savedHistory = localStorage.getItem(docHistoryKey);
            const allAnalyzedDocs: DocumentAnalysis[] = savedHistory ? JSON.parse(savedHistory) : [];
            const recentRisks = allAnalyzedDocs.slice(0, 3).flatMap(doc => doc.riskFlags).filter(flag => flag.severity === 'High').map(flag => flag.risk).slice(0, 3);

            const insightsResponse = await generateReportInsights({
                hygieneScore,
                overdueFilings: overdueFilings.length,
                upcomingFilings: upcomingFilings.length,
                burnRate: financials.burnRate > 0 ? financials.burnRate : 0,
                runwayInMonths: financials.runway,
                recentRiskFlags: recentRisks,
                legalRegion: client.legalRegion
            });

            setExecutiveSummary(insightsResponse.executiveSummary);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "AI Summary Failed", description: "The model may be overloaded. Please try again." });
        } finally {
            setIsGeneratingInsights(false);
        }
    }
    
    const handleDownloadPdf = async () => {
      const container = document.getElementById('report-content-for-pdf-download');
      if (!container) {
          toast({ variant: 'destructive', title: 'Error', description: 'Report container not found.' });
          return;
      }

      toast({ title: 'Generating PDF...', description: 'Please wait, this may take a moment.' });
      setIsLoading(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pages = container.querySelectorAll<HTMLElement>('.report-page');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pageHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${reportData?.client.name}_Compliance_Report.pdf`);
      setIsLoading(false);
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
                        Generate Report Preview
                    </Button>
                </CardFooter>
            </Card>

            {isLoading && !reportData && (
                <Card className="flex items-center justify-center p-12">
                    <div className="text-center space-y-2">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="font-semibold">Generating Report Data...</p>
                        <p className="text-sm text-muted-foreground">This can take a few moments.</p>
                    </div>
                </Card>
            )}
            
            {reportData && (
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Executive Summary</CardTitle>
                        <CardDescription>Generate an AI-powered summary of the report's key findings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isGeneratingInsights ? (
                             <div className="space-y-2 py-2">
                                <div className="h-4 bg-primary/20 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-primary/20 rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-primary/20 rounded w-full animate-pulse"></div>
                            </div>
                        ) : executiveSummary ? (
                            <div className="prose prose-sm prose-p:text-gray-700 dark:prose-invert max-w-none p-4 bg-muted/50 border rounded-lg">
                                <ReactMarkdown
                                  components={{
                                    ul: ({ node, ...props }) => <ul className="list-none p-0 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="flex items-start gap-2 before:content-none p-0 m-0"><span className="text-primary mt-1.5">&bull;</span><div className="m-0 flex-1" {...props} /></li>,
                                  }}
                                >
                                    {executiveSummary}
                                </ReactMarkdown>
                            </div>
                        ) : (
                           <div className="text-center p-6 border-2 border-dashed rounded-lg">
                               <p className="text-muted-foreground">Click the button below to generate insights.</p>
                           </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Button onClick={handleGenerateInsights} disabled={isGeneratingInsights}>
                            {isGeneratingInsights ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                            {executiveSummary ? "Regenerate Summary" : "Generate AI Summary"} (1 Credit)
                        </Button>
                        {executiveSummary && (
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="include-summary" 
                                    checked={includeSummaryInPdf}
                                    onCheckedChange={(checked) => setIncludeSummaryInPdf(!!checked)}
                                />
                                <Label htmlFor="include-summary" className="text-sm font-normal">
                                    Include summary in PDF
                                </Label>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            )}

            {reportData && (
              <>
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div>
                            <CardTitle>Report Preview</CardTitle>
                            <CardDescription>A preview of the generated report for {reportData.client.name}.</CardDescription>
                        </div>
                        <Button onClick={handleDownloadPdf} disabled={isLoading || isGeneratingInsights}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
                            Download PDF
                        </Button>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-gray-200 p-8 overflow-y-auto max-h-[100vh]">
                        {/* Hidden div for PDF generation, ensures light theme */}
                        <div className="absolute -left-[9999px] -top-[9999px] light">
                            <div id="report-content-for-pdf-download">
                                <ReportTemplate data={reportData} executiveSummary={includeSummaryInPdf ? executiveSummary : null} />
                            </div>
                        </div>
                        {/* Visible preview div */}
                        <div id="report-preview-container">
                            <ReportTemplate data={reportData} />
                        </div>
                    </CardContent>
                </Card>
              </>
            )}
        </div>
    );
}

