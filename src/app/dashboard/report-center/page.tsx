
"use client";

import { useState, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, PieChart, ShieldCheck, CheckSquare, CalendarClock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { format, startOfToday } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend } from 'recharts';
import Image from 'next/image';

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

    return (
        <div className="bg-white text-black font-sans p-8" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                 <div className="flex items-center gap-2 font-bold text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <span className="text-xl">LexIQ</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Compliance Health Report</h1>
                    <p className="text-sm text-gray-500 text-right">For: {data.client.name}</p>
                    <p className="text-sm text-gray-500 text-right">Generated: {format(new Date(), 'PPP')}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-8 grid grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="col-span-1 space-y-6">
                    <div className="p-4 border rounded-lg text-center">
                        <h3 className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2"><ShieldCheck/> Legal Hygiene Score</h3>
                        <p className="text-5xl font-bold text-blue-600">{data.hygieneScore}</p>
                        <p className="text-xs text-gray-500">Out of 100</p>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Score Components</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-medium">Filing Performance</span><span>{data.filingPerformance.toFixed(0)}%</span></div>
                                <Progress value={data.filingPerformance} className="h-2"/>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1"><span className="font-medium">Profile Completeness</span><span>{data.profileCompleteness.toFixed(0)}%</span></div>
                                <Progress value={data.profileCompleteness} className="h-2"/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2 mb-2"><PieChart/> Ownership Structure</h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <RechartsPieChart>
                                <Pie data={data.ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5}>
                                    {data.ownershipData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{fontSize: "10px"}}/>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-2 space-y-6">
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2"><CalendarClock/> Overdue Filings ({data.overdueFilings.length})</h3>
                        <ul className="text-xs list-disc pl-5 mt-2 space-y-1 text-red-600">
                           {data.overdueFilings.length > 0 ? data.overdueFilings.map((f: any) => <li key={f.id}>{f.text} (Due: {format(new Date(f.dueDate + 'T00:00:00'), 'do MMM')})</li>) : <li>None. Great work!</li>}
                        </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2"><CheckSquare/> Upcoming Filings ({data.upcomingFilings.length})</h3>
                        <ul className="text-xs list-disc pl-5 mt-2 space-y-1 text-gray-700">
                           {data.upcomingFilings.length > 0 ? data.upcomingFilings.map((f: any) => <li key={f.id}>{f.text} (Due: {format(new Date(f.dueDate + 'T00:00:00'), 'do MMM')})</li>) : <li>No filings in the next 30 days.</li>}
                        </ul>
                    </div>
                </div>
            </div>

             {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-12 border-t pt-4">
                This report was generated by LexIQ AI and is intended for informational purposes only.
            </div>
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
            const { totalShares, founderShares, investorShares, esopPool } = capTable.reduce(
                (acc, entry) => {
                    acc.totalShares += entry.shares;
                    if (entry.type === 'Founder') acc.founderShares += entry.shares;
                    else if (entry.type === 'Investor') acc.investorShares += entry.shares;
                    else if (entry.type === 'ESOP') acc.esopPool += entry.shares;
                    return acc;
                }, { totalShares: 0, founderShares: 0, investorShares: 0, esopPool: 0 }
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
