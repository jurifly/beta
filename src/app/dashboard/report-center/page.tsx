

"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode, Suspense } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, Sparkles, AlertTriangle, ShieldCheck, CheckCircle, PieChart as PieChartIcon, CalendarClock, TrendingUp, GanttChartSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import type { Company, DocumentAnalysis, HistoricalFinancialData, GenerateDDChecklistOutput, ChecklistItem, ChecklistCategory } from '@/lib/types';
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

export const maxDuration = 300;

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

const ReportPageShell = ({ children, pageNumber, totalPages, clientName }: { children: ReactNode, pageNumber: number, totalPages: number, clientName: string }) => {
    const Logo = () => (
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png"
        alt="Jurifly Logo"
        width={100}
        height={21}
        className="h-12 w-auto"
        data-ai-hint="logo company"
      />
    );
    return (
        <div className="bg-white text-gray-800 font-sans p-10 shadow-lg report-page" style={{ width: '800px', minHeight: '1120px', display: 'flex', flexDirection: 'column' }}>
            <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                <Logo />
                <div className="text-right">
                    <h1 style={{fontSize: '28px'}} className="font-bold text-gray-800">Compliance Health Report</h1>
                    <p style={{fontSize: '16px'}} className="font-medium text-gray-600">{clientName}</p>
                </div>
            </header>
            <main className="mt-10 flex-grow">
                {children}
            </main>
            <footer className="text-sm text-gray-400 border-t mt-12 pt-4 text-center">
                <p>Page {pageNumber} of {totalPages} | Generated on {format(new Date(), 'PPpp')} by Jurifly AI</p>
                <p className="text-xs mt-1">This report is AI-generated and for informational purposes only. Please verify all data.</p>
            </footer>
        </div>
    );
};

const ReportTemplate = ({ data, executiveSummary, diligenceProgress }: { data: ReportData, executiveSummary?: string | null, diligenceProgress: number }) => {
    const COLORS = ["hsl(221, 68%, 40%)", "hsl(215, 84%, 51%)", "hsl(160, 60%, 45%)", "hsl(260, 80%, 65%)"];
    const scoreColor = data.hygieneScore > 80 ? 'text-green-600' : data.hygieneScore > 60 ? 'text-orange-500' : 'text-red-600';
    
    const chunkArray = (arr: any[], size: number) => {
        const chunkedArr = [];
        for (let i = 0; i < arr.length; i += size) {
            chunkedArr.push(arr.slice(i, i + size));
        }
        return chunkedArr;
    };
    
    const ITEMS_PER_PAGE = 15;
    const yoyDataExists = data.financials.historicalData && data.financials.historicalData.length > 0;
    const overduePages = chunkArray(data.overdueFilings, ITEMS_PER_PAGE);
    const upcomingPages = chunkArray(data.upcomingFilings, ITEMS_PER_PAGE);
    const diligenceChecklist = data.diligenceChecklist?.checklist || [];
    const DILIGENCE_CATEGORIES_PER_PAGE = 4;
    const diligencePages = chunkArray(diligenceChecklist, DILIGENCE_CATEGORIES_PER_PAGE);

    let totalPages = 1;
    if(yoyDataExists) totalPages++;
    totalPages += overduePages.length;
    totalPages += upcomingPages.length;
    totalPages += diligencePages.length;
    if(executiveSummary) totalPages++;
    let currentPageNum = 1;

    return (
        <div id="report-content-for-pdf" className="space-y-4">
            {/* Page 1: Overview */}
            <ReportPageShell pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                 <div className="grid grid-cols-3 gap-8 mb-10">
                     <div className="col-span-1 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border">
                        <h3 style={{fontSize: '20px'}} className="font-semibold text-gray-600 mb-2">Legal Hygiene Score</h3>
                        <div className={`font-bold ${scoreColor}`} style={{fontSize: '72px'}}>{data.hygieneScore}</div>
                        <p style={{fontSize: '16px'}} className="font-medium text-gray-500">Out of 100</p>
                    </div>
                    <div className="col-span-2 bg-gray-50 p-8 rounded-xl border flex flex-col justify-center">
                        <h3 style={{fontSize: '24px'}} className="font-semibold text-gray-700 mb-6">Score Breakdown</h3>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-lg mb-2" style={{fontSize: '18px'}}><span className="font-medium text-gray-600">Filing Performance</span><span className="font-semibold text-gray-800">{data.filingPerformance.toFixed(0)}%</span></div>
                                <Progress value={data.filingPerformance} className="h-3" />
                            </div>
                            <div>
                                <div className="flex justify-between text-lg mb-2" style={{fontSize: '18px'}}><span className="font-medium text-gray-600">Profile Completeness</span><span className="font-semibold text-gray-800">{data.profileCompleteness.toFixed(0)}%</span></div>
                                 <Progress value={data.profileCompleteness} className="h-3"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="p-6 border rounded-xl bg-white" data-jspdf-ignore="true">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2" style={{fontSize: '24px'}}><PieChartIcon className="w-6 h-6"/> Ownership</h3>
                        {data.ownershipData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsPieChart>
                                     <RechartsTooltip formatter={(value, name, props) => {
                                        const total = data.ownershipData.reduce((acc, p) => acc + p.value, 0);
                                        const percentage = total > 0 ? ((props.payload.value / total) * 100).toFixed(1) : 0;
                                        return [`${percentage}% (${(props.payload.value || 0).toLocaleString()} shares)`, name];
                                    }} />
                                    <Pie data={data.ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                                        {data.ownershipData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={12} wrapperStyle={{ fontSize: '16px', paddingTop: '20px' }}/>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 py-10" style={{fontSize: '18px'}}>No cap table data available.</p>
                        )}
                    </div>
                     <div className="p-6 border rounded-xl bg-white flex flex-col">
                        <h3 className="font-semibold text-gray-700 mb-4" style={{fontSize: '24px'}}>Financial Snapshot</h3>
                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            <div className="text-center p-4 bg-gray-50 rounded-md">
                                <p className="font-medium text-gray-500" style={{fontSize: '18px'}}>{data.financials.burnRate > 0 ? "Net Monthly Burn" : "Net Monthly Profit"}</p>
                                <p className={`font-bold ${data.financials.burnRate > 0 ? 'text-red-600' : 'text-green-600'}`} style={{fontSize: '36px'}}>{formatCurrency(Math.abs(data.financials.burnRate))}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-md">
                                <p className="font-medium text-gray-500" style={{fontSize: '18px'}}>Estimated Runway</p>
                                <p className="font-bold" style={{fontSize: '36px'}}>{data.financials.runway}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportPageShell>
            
             {yoyDataExists && (
                <ReportPageShell pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                    <section>
                         <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3" style={{fontSize: '28px'}}>
                           <TrendingUp /> Year-Over-Year Financial Analysis
                        </h2>
                         <div className="p-6 border rounded-xl bg-white mb-8">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.financials.historicalData.sort((a,b) => a.year.localeCompare(b.year))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="year" style={{ fontSize: '14px' }}/>
                                    <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} style={{ fontSize: '14px' }}/>
                                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} wrapperStyle={{fontSize: '16px'}} />
                                    <Legend wrapperStyle={{fontSize: '16px'}} />
                                    <Line type="monotone" dataKey="revenue" stroke={COLORS[0]} strokeWidth={3} name="Revenue"/>
                                    <Line type="monotone" dataKey="expenses" stroke={COLORS[3]} strokeWidth={3} name="Expenses"/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                             {data.financials.historicalData.sort((a,b) => a.year.localeCompare(b.year)).map(item => (
                                <div key={item.year} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg bg-gray-50">
                                    <p className="font-bold col-span-1" style={{fontSize: '22px'}}>{item.year}</p>
                                    <p className="text-green-600 col-span-1" style={{fontSize: '18px'}}>Revenue: <span className="font-semibold">{formatCurrency(item.revenue)}</span></p>
                                    <p className="text-red-600 col-span-1" style={{fontSize: '18px'}}>Expenses: <span className="font-semibold">{formatCurrency(item.expenses)}</span></p>
                                </div>
                             ))}
                        </div>
                    </section>
                </ReportPageShell>
             )}
            
            {overduePages.map((pageItems, index) => (
                <ReportPageShell key={`overdue-${index}`} pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                    <section>
                        <h2 className="text-3xl font-semibold text-red-700 mb-6 flex items-center gap-3" style={{fontSize: '28px'}}>
                           <AlertTriangle/> Overdue Filings ({data.overdueFilings.length})
                        </h2>
                        <table className="w-full text-lg text-left" style={{fontSize: '18px'}}>
                            <thead className="bg-gray-50"><tr><th className="p-4 font-semibold">Task</th><th className="p-4 font-semibold text-right">Due Date</th></tr></thead>
                            <tbody>{pageItems.map((f: any) => (<tr key={f.id} className="border-b"><td className="p-4">{f.text}</td><td className="p-4 text-right font-mono">{format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yyyy')}</td></tr>))}</tbody>
                        </table>
                    </section>
                </ReportPageShell>
            ))}

            {upcomingPages.map((pageItems, index) => (
                 <ReportPageShell key={`upcoming-${index}`} pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                    <section>
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3" style={{fontSize: '28px'}}>
                           <CalendarClock /> Upcoming Filings (Next 30 Days) ({data.upcomingFilings.length})
                        </h2>
                         <table className="w-full text-lg text-left" style={{fontSize: '18px'}}>
                            <thead className="bg-gray-50"><tr><th className="p-4 font-semibold">Task</th><th className="p-4 font-semibold text-right">Due Date</th></tr></thead>
                            <tbody>{pageItems.map((f: any) => (<tr key={f.id} className="border-b"><td className="p-4">{f.text}</td><td className="p-4 text-right font-mono">{format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yyyy')}</td></tr>))}</tbody>
                        </table>
                    </section>
                </ReportPageShell>
            ))}
            
            {diligencePages.map((pageCategories, index) => (
                 <ReportPageShell key={`diligence-${index}`} pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                    <section className="mb-8">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-4 flex items-center gap-3" style={{fontSize: '28px'}}>
                           <GanttChartSquare /> {data.diligenceChecklist!.reportTitle}
                        </h2>
                        <div className="p-6 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between text-lg mb-2" style={{fontSize: '18px'}}><span className="font-medium text-gray-600">Overall Readiness</span><span className="font-semibold text-gray-800">{diligenceProgress}%</span></div>
                            <Progress value={diligenceProgress} className="h-3"/>
                        </div>
                    </section>
                     <div style={{ columnCount: 2, columnGap: '2rem' }}>
                        {pageCategories.map((category: ChecklistCategory) => (
                            <div key={category.category} className="mb-8" style={{ breakInside: 'avoid' }}>
                                <h3 style={{fontSize: '20px'}} className="font-semibold text-gray-700 mb-3 border-b pb-2">{category.category}</h3>
                                <ul className="space-y-2">
                                    {category.items.map((item: ChecklistItem) => (
                                        <li key={item.id} className="flex items-center gap-3 text-lg" style={{fontSize: '16px'}}>
                                            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${item.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span>{item.task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ReportPageShell>
            ))}

            {executiveSummary && (
                <ReportPageShell pageNumber={currentPageNum++} totalPages={totalPages} clientName={data.client.name}>
                     <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3" style={{fontSize: '28px'}}>
                       <Sparkles className="text-primary"/> AI Executive Summary
                    </h2>
                    <div className="prose prose-xl max-w-none" style={{fontSize: '18px'}}>
                        <ReactMarkdown
                            components={{
                                ul: ({ node, ...props }) => <ul className="list-none p-0 space-y-4" {...props} />,
                                li: ({ node, ...props }) => <li className="flex items-start gap-3 before:content-none p-0 m-0"><span className="text-blue-600 mt-1.5">&bull;</span><div className="m-0 flex-1" {...props} /></li>,
                            }}
                        >
                            {executiveSummary}
                        </ReactMarkdown>
                    </div>
                </ReportPageShell>
            )}
        </div>
    );
};

function ReportCenterContent() {
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
            toast({ variant: "destructive", title: "AI Summary Failed", description: "The model may be overloaded. Please try again." });
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

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
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

    const { diligenceProgress } = useMemo(() => {
        if (!reportData?.diligenceChecklist) return { diligenceProgress: 0 };
        const allItems = reportData.diligenceChecklist.checklist.flatMap(c => c.items);
        if (allItems.length === 0) return { diligenceProgress: 0 };
        const completedItems = allItems.filter(i => i.status === 'Completed').length;
        return { diligenceProgress: Math.round((completedItems / allItems.length) * 100) };
    }, [reportData?.diligenceChecklist]);

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
                            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 border rounded-lg">
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
                    <CardContent className="flex justify-center bg-gray-200 dark:bg-gray-800 p-8 overflow-x-auto">
                        {/* Hidden div for PDF generation, ensures light theme */}
                        <div className="absolute -left-[9999px] -top-[9999px]">
                            <div id="report-content-for-pdf-download" className="light">
                                <ReportTemplate data={reportData} executiveSummary={includeSummaryInPdf ? executiveSummary : null} diligenceProgress={diligenceProgress} />
                            </div>
                        </div>
                        {/* Visible preview div */}
                        <div id="report-preview-container" className="light">
                             <ReportTemplate data={reportData} executiveSummary={null} diligenceProgress={diligenceProgress} />
                        </div>
                    </CardContent>
                </Card>
              </>
            )}
        </div>
    );
}

export default function ReportCenterPageWrapper() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ReportCenterContent />
        </Suspense>
    )
}
