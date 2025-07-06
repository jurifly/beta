
'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ListChecks,
  PieChart,
  Info,
  Lightbulb,
  BarChart,
  FileText,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/auth";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { cn } from "@/lib/utils";
import type { UserProfile, Company } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { getProactiveInsights, type ProactiveInsightsOutput } from "@/ai/flows/proactive-insights-flow";
import { addDays, format, startOfToday, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


const ComplianceActivityChart = dynamic(
  () => import('@/components/dashboard/compliance-activity-chart').then(mod => mod.ComplianceActivityChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />
  }
);

// --- Helper Components ---
const InsightCard = ({ insight, onCtaClick }: { insight: ProactiveInsightsOutput['insights'][0], onCtaClick: (href: string) => void }) => {
  const icons: Record<string, React.ReactNode> = {
    Lightbulb: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    BarChart: <BarChart className="w-5 h-5 text-blue-500" />,
    FileText: <FileText className="w-5 h-5 text-green-500" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5 text-red-500" />,
    Users: <Users className="w-5 h-5 text-indigo-500" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-500" />,
  };

  return (
    <div className="p-4 border rounded-lg flex items-start gap-4 bg-card hover:bg-muted/50 transition-colors">
      <div className="p-2 bg-muted rounded-full">{icons[insight.icon] || <Sparkles className="w-5 h-5 text-primary"/>}</div>
      <div className="flex-1">
        <p className="font-semibold">{insight.title}</p>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={() => onCtaClick(insight.href)}>
            {insight.cta} <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};


const StatCard = ({ title, value, subtext, icon, colorClass, isLoading }: { title: string, value: string, subtext: string, icon: React.ReactNode, colorClass?: string, isLoading?: boolean }) => (
    <Card className="interactive-lift h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <>
                    <Skeleton className="h-8 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                </>
            ) : (
                <>
                    <div className={cn("text-2xl font-bold", colorClass)}>{value}</div>
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                </>
            )}
        </CardContent>
    </Card>
);

// --- Dashboard Component ---
type DashboardChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
    dueDate: string;
    description: string;
    penalty: string;
};

function CompanyDetailDashboard({ company }: { company: Company }) {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const router = require("next/navigation").useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const { upcomingFilingsCount, overdueFilingsCount, hygieneScore } = useMemo(() => {
        if (!checklist || !company) return { upcomingFilingsCount: 0, overdueFilingsCount: 0, hygieneScore: 0 };
        
        const today = startOfToday();
        const thirtyDaysFromNow = addDays(today, 30);
        
        const upcomingFilings = checklist.filter(item => {
            const dueDate = new Date(item.dueDate + 'T00:00:00');
            return dueDate >= today && dueDate <= thirtyDaysFromNow && !item.completed;
        });
        const overdueFilings = checklist.filter(item => {
            const dueDate = new Date(item.dueDate + 'T00:00:00');
            return dueDate < today && !item.completed;
        });

        // HYGIENE SCORE CALCULATION
        const totalFilings = checklist.length;
        const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
        
        const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
        if (company.legalRegion === 'India') requiredFields.push('cin');
        const filledFields = requiredFields.filter(field => company[field] && String(company[field]).trim() !== '').length;
        const profileCompleteness = (filledFields / requiredFields.length) * 100;
        
        const score = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

        return {
            upcomingFilingsCount: upcomingFilings.length,
            overdueFilingsCount: overdueFilings.length,
            hygieneScore: score,
        }
    }, [checklist, company]);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!company) {
                setIsLoading(false);
                setInsightsLoading(false);
                setChecklist([]);
                return;
            }
            setIsLoading(true);

            try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await generateFilings({
                    companyType: company.type,
                    incorporationDate: company.incorporationDate,
                    currentDate: currentDate,
                    legalRegion: company.legalRegion,
                });
                
                const processedFilings = response.filings.filter(f => f.date && !isNaN(new Date(f.date).getTime()));
                
                const storageKey = `dashboard-checklist-${company.id}`;
                const savedStatuses: Record<string, boolean> = JSON.parse(localStorage.getItem(storageKey) || '{}');
                
                const today = startOfToday();
                const checklistItems = processedFilings.map((filing) => {
                    const uniqueId = `${filing.title}-${filing.date}`;
                    const dueDate = new Date(filing.date + 'T00:00:00');
                    const isFuture = dueDate > today;
                    const isCompleted = isFuture ? false : (savedStatuses[uniqueId] ?? false);

                    return {
                        id: uniqueId,
                        text: filing.title,
                        dueDate: filing.date,
                        completed: isCompleted,
                        description: filing.description,
                        penalty: filing.penalty,
                    };
                });
                setChecklist(checklistItems);
            } catch (error) {
                console.error("Failed to fetch AI-generated dashboard data:", error);
                 toast({
                    title: "Could not fetch filings",
                    description: "There was an error generating the compliance checklist.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [company, toast]);

    useEffect(() => {
        const fetchInsights = async () => {
            if (isLoading || !company || !userProfile) return;
            setInsightsLoading(true);

            const burnRate = (company.financials?.monthlyExpenses || 0) - (company.financials?.monthlyRevenue || 0);

            try {
                const response = await getProactiveInsights({
                    userRole: 'Founder',
                    legalRegion: userProfile.legalRegion,
                    founderContext: {
                        companyAgeInDays: differenceInDays(new Date(), new Date(company.incorporationDate)),
                        companyType: company.type,
                        hygieneScore: hygieneScore,
                        overdueCount: overdueFilingsCount,
                        upcomingIn30DaysCount: upcomingFilingsCount,
                        burnRate: burnRate > 0 ? burnRate : 0,
                    }
                });
                setInsights(response.insights);
            } catch (error: any) {
                console.error("Could not fetch insights", error);
                toast({ title: 'AI Insights Failed', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [isLoading, company, hygieneScore, overdueFilingsCount, upcomingFilingsCount, userProfile, toast]);
    
    const handleToggleComplete = (itemId: string) => {
        if (!company) return;

        const newChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(newChecklist);

        const storageKey = `dashboard-checklist-${company.id}`;
        const newStatuses = newChecklist.reduce((acc, item) => {
            acc[item.id] = item.completed;
            return acc;
        }, {} as Record<string, boolean>);
        
        localStorage.setItem(storageKey, JSON.stringify(newStatuses));
    };
    
    const checklistYears = useMemo(() => {
        const years = new Set(checklist.map(item => new Date(item.dueDate + 'T00:00:00').getFullYear().toString()));
        return Array.from(years).sort((a,b) => Number(b) - Number(a));
    }, [checklist]);

    useEffect(() => {
        if(checklistYears.length > 0 && !checklistYears.includes(selectedYear)) {
            setSelectedYear(checklistYears[0]);
        }
    }, [checklistYears, selectedYear]);

    const groupedChecklist = useMemo(() => {
        if (!checklist || checklist.length === 0) return {};
        const today = startOfToday();
        
        const filteredByYear = checklist.filter(item => new Date(item.dueDate + 'T00:00:00').getFullYear().toString() === selectedYear);

        const grouped = filteredByYear.reduce((acc, item) => {
            const monthKey = format(new Date(item.dueDate + 'T00:00:00'), 'MMMM yyyy');
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(item);
            return acc;
        }, {} as Record<string, DashboardChecklistItem[]>);
        
        for (const monthKey in grouped) {
            grouped[monthKey].sort((a, b) => {
                const aDueDate = new Date(a.dueDate + 'T00:00:00');
                const bDueDate = new Date(b.dueDate + 'T00:00:00');
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                const aIsOverdue = aDueDate < today && !a.completed;
                const bIsOverdue = bDueDate < today && !b.completed;
                if (aIsOverdue && !bIsOverdue) return -1;
                if (!aIsOverdue && bIsOverdue) return 1;
                return aDueDate.getTime() - bDueDate.getTime();
            });
        }
        return grouped;
    }, [checklist, selectedYear]);
    
    const sortedMonths = useMemo(() => {
        return Object.keys(groupedChecklist).sort((a, b) => {
            return new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime();
        });
    }, [groupedChecklist]);


    const complianceChartDataByYear = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const activityByYear: Record<string, number[]> = {};
        const allYears = new Set<string>();

        allYears.add(new Date().getFullYear().toString());

        if (company) {
            allYears.add(new Date(company.incorporationDate).getFullYear().toString());
        }

        checklist.forEach(item => {
            const dueDate = new Date(item.dueDate + 'T00:00:00');
            const year = dueDate.getFullYear().toString();
            allYears.add(year);

            if (item.completed) {
                const month = dueDate.getMonth(); // 0-11
                if (!activityByYear[year]) {
                    activityByYear[year] = Array(12).fill(0);
                }
                activityByYear[year][month]++;
            }
        });
        
        const result: Record<string, { month: string; activity: number }[]> = {};
        for (const year of Array.from(allYears).sort()) {
            const yearData = activityByYear[year] || Array(12).fill(0);
            result[year] = monthNames.map((monthName, index) => ({
                month: monthName,
                activity: yearData[index]
            }));
        }

        return result;
    }, [checklist, company]);

    const { equityIssued, equityIssuedSubtext } = useMemo(() => {
        const capTable = company?.capTable;
        if (!capTable || capTable.length === 0) return { equityIssued: "0%", equityIssuedSubtext: "No shares issued" };
        
        const totalShares = capTable.reduce((acc, entry) => acc + entry.shares, 0);
        if (totalShares === 0) return { equityIssued: "0%", equityIssuedSubtext: "No shares issued" };
        
        const esopPoolShares = capTable.find(e => e.type === 'ESOP' && e.holder.toLowerCase().includes('pool'))?.shares || 0;
        const issuedShares = totalShares - esopPoolShares;
        const percentage = (issuedShares / totalShares) * 100;
        
        return { equityIssued: `${percentage.toFixed(0)}%`, equityIssuedSubtext: `of total shares issued (excl. pool)` };
    }, [company]);

    const scoreColor = hygieneScore > 80 ? 'text-green-600' : hygieneScore > 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/analytics" className="block"><StatCard title="Legal Hygiene Score" value={`${hygieneScore}`} subtext={hygieneScore > 80 ? 'Excellent' : 'Good'} icon={<ShieldCheck />} colorClass={scoreColor} isLoading={isLoading} /></Link>
            <Link href="/dashboard/ca-connect" className="block"><StatCard title="Upcoming Filings" value={`${upcomingFilingsCount}`} subtext="In next 30 days" icon={<Calendar />} isLoading={isLoading} /></Link>
            <Link href="/dashboard/cap-table" className="block"><StatCard title="Equity Issued" value={equityIssued} subtext={equityIssuedSubtext} icon={<PieChart />} isLoading={isLoading} /></Link>
            <Link href="/dashboard/ca-connect" className="block"><StatCard title="Alerts" value={`${overdueFilingsCount}`} subtext={overdueFilingsCount > 0 ? "Overdue tasks" : "No overdue tasks"} icon={<AlertTriangle className="h-4 w-4" />} isLoading={isLoading} /></Link>
            
            <div className="md:col-span-2 lg:col-span-2"><ComplianceActivityChart dataByYear={complianceChartDataByYear} /></div>
            
            <Card className="md:col-span-2 lg:col-span-2 interactive-lift">
                <CardHeader>
                    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ListChecks /> Compliance Checklist</CardTitle>
                            <CardDescription>Key compliance items for your company, grouped by month.</CardDescription>
                        </div>
                        {checklistYears.length > 0 && (
                             <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full sm:w-auto bg-card border rounded-md px-3 py-2 text-sm">
                                {checklistYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-5/6" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : sortedMonths.length > 0 ? (
                        <Accordion type="multiple" defaultValue={[]} className="w-full">
                            {sortedMonths.map(month => {
                                const today = startOfToday();
                                const hasOverdueItems = groupedChecklist[month].some(item => {
                                    const dueDate = new Date(item.dueDate + 'T00:00:00');
                                    return dueDate < today && !item.completed;
                                });

                                return (
                                <AccordionItem value={month} key={month}>
                                    <AccordionTrigger className="text-base font-semibold hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <span>{month}</span>
                                            {hasOverdueItems && (
                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3">
                                            {groupedChecklist[month].map(item => {
                                                const dueDate = new Date(item.dueDate + 'T00:00:00');
                                                const isItemOverdue = dueDate < today && !item.completed;
                                                const isFuture = dueDate > today;
                                                return (
                                                    <div key={item.id} className={cn("flex items-start gap-3 p-3 text-sm rounded-md transition-colors border", isItemOverdue && "bg-destructive/10 border-destructive/20")}>
                                                        <Checkbox
                                                            id={item.id}
                                                            checked={item.completed}
                                                            onCheckedChange={() => handleToggleComplete(item.id)}
                                                            className={cn("mt-1", isItemOverdue && "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive")}
                                                            disabled={isFuture}
                                                        />
                                                        <div className="flex-1 grid gap-0.5">
                                                             <div className="flex items-center gap-2">
                                                                <label htmlFor={item.id} className={cn("font-medium cursor-pointer", item.completed && "line-through text-muted-foreground", isItemOverdue && "text-destructive", isFuture && "cursor-not-allowed")}>
                                                                    {item.text}
                                                                </label>
                                                                <TooltipProvider delayDuration={0}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="max-w-xs p-3">
                                                                            <p className="font-semibold mb-2">About this task:</p>
                                                                            <p className="text-xs mb-3">{item.description}</p>
                                                                            <p className="font-semibold mb-2">Penalty for non-compliance:</p>
                                                                            <p className="text-xs text-destructive">{item.penalty}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <span className={cn("text-xs", isItemOverdue ? "text-destructive/80" : "text-muted-foreground")}>
                                                            Due: {format(dueDate, 'do MMM, yyyy')}
                                                            </span>
                                                        </div>
                                                        {isItemOverdue && (
                                                            <Badge variant="destructive" className="self-center">Overdue</Badge>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                            )}
                        </Accordion>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No items for {selectedYear}. Select another year or check back later.</p>
                        </div>
                    )}
                </CardContent>
             </Card>

             <Card className="md:col-span-4 lg:col-span-4 interactive-lift">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Proactive AI Insights</CardTitle>
                    <CardDescription>Timely suggestions from our AI to help you stay ahead.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {insightsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : insights.length > 0 ? (
                       insights.map((insight, index) => <InsightCard key={index} insight={insight} onCtaClick={(href) => router.push(href)} />)
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No special insights at the moment. You're all set!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}

export default function CompanyDetailPage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
  }

  const company = userProfile.companies.find(c => c.id === companyId);

  if (!company) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-xl font-semibold">Company Not Found</h2>
            <p className="text-muted-foreground">The requested company could not be found in your profile.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Return to Portfolio
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
                <p className="text-muted-foreground">Viewing detailed company dashboard.</p>
                </div>
            </div>
       </div>
       <CompanyDetailDashboard company={company} />
    </div>
  );
}
