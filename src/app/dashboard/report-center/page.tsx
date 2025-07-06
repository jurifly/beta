
"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, PieChart, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { format, startOfToday } from 'date-fns';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';

type ReportData = {
  client: Company;
  hygieneScore: number;
  filingPerformance: number;
  profileCompleteness: number;
  upcomingFilings: any[];
  overdueFilings: any[];
  completedFilings: any[];
  ownershipData: { name: string; value: number }[];
};

const ReportTemplate = ({ data }: { data: ReportData }) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    const scoreColor = data.hygieneScore > 80 ? 'text-green-600' : data.hygieneScore > 60 ? 'text-orange-500' : 'text-red-500';

    return (
        <div className="bg-white text-gray-800 font-sans p-8 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header className="flex justify-between items-start border-b-2 border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-blue-600"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600">LexIQ</h2>
                        <p className="text-xs text-gray-500">AI-Powered Compliance</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-extrabold text-gray-700">Compliance Health Report</h1>
                    <p className="text-sm font-medium text-gray-500">{data.client.name}</p>
                    <p className="text-xs text-gray-400">Generated: {format(new Date(), 'do MMM, yyyy')}</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="mt-8">
                {/* Score Section */}
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
                
                <div className="grid grid-cols-5 gap-6">
                    {/* Left Column */}
                    <div className="col-span-2 space-y-6">
                         <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">Client Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Company:</span><span className="font-medium text-right">{data.client.name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium">{data.client.type}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Inc. Date:</span><span className="font-medium">{format(new Date(data.client.incorporationDate + 'T00:00:00'), 'do MMM, yyyy')}</span></div>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <h3 className="text-base font-semibold text-gray-700 mb-2">Ownership Structure</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <RechartsPieChart>
                                    <RechartsTooltip formatter={(value, name, props) => [`${(props.payload.value / data.ownershipData.reduce((acc, p) => acc + p.value, 0) * 100).toFixed(1)}%`, name]} />
                                    <Pie data={data.ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                                        {data.ownershipData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={8} layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', lineHeight: '1.4' }}/>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column */}
                     <div className="col-span-3 space-y-6">
                        <div className="p-4 border border-red-300 bg-red-50 rounded-xl h-full">
                            <h3 className="text-base font-semibold text-red-700 mb-2">Overdue Filings ({data.overdueFilings.length})</h3>
                            {data.overdueFilings.length > 0 ? (
                                <ul className="text-sm list-disc pl-5 space-y-1.5 text-red-900">
                                    {data.overdueFilings.map((f: any) => <li key={f.id}>{f.text} <span className="font-medium">(Due: {format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yy')})</span></li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-600">None. All caught up!</p>}
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl bg-white h-full">
                            <h3 className="text-base font-semibold text-gray-700 mb-2">Upcoming Filings (Next 30 Days) ({data.upcomingFilings.length})</h3>
                            {data.upcomingFilings.length > 0 ? (
                                <ul className="text-sm list-disc pl-5 space-y-1.5 text-gray-700">
                                    {data.upcomingFilings.map((f: any) => <li key={f.id}>{f.text} <span className="font-medium">(Due: {format(new Date(f.dueDate + 'T00:00:00'), 'dd-MMM-yy')})</span></li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-600">No filings due in the next 30 days.</p>}
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4">
                This report was generated by LexIQ AI and is intended for informational purposes only. Please verify all data before taking any action.
                <br />
                LexIQ &copy; {new Date().getFullYear()} - All Rights Reserved
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
            });

            // 2. Process data for the report
            const today = startOfToday();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            const checklistItems = response.filings.map((filing) => ({
                id: `${filing.title}-${filing.date}`,
                text: filing.title,
                dueDate: filing.date,
                completed: filing.status === 'completed'
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

            setReportData({
                client,
                hygieneScore,
                filingPerformance: filingPerf,
                profileCompleteness,
                upcomingFilings,
                overdueFilings,
                completedFilings,
                ownershipData
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
                <p className="text-muted-foreground">Generate professional, shareable reports for your clients.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Client Compliance Health Report</CardTitle>
                    <CardDescription>Select a client to generate a detailed compliance and health summary PDF.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md space-y-2">
                        <Label htmlFor="client-select">Select a Client</Label>
                        <Select onValueChange={setSelectedClientId} value={selectedClientId || undefined}>
                            <SelectTrigger id="client-select">
                                <SelectValue placeholder="Choose a client..." />
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
    )
}
`