
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  Plus,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ListChecks,
  FileScan,
  Users,
  GanttChartSquare,
  FileWarning,
  Loader2,
  PieChart,
  Briefcase,
  Building2,
  Zap,
  FileSignature,
  Scale,
  Lock,
  Info,
  Receipt,
  Check,
  Lightbulb,
  BarChart,
  CalendarClock,
  CheckCircle,
  FileUp,
  LineChart,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/auth";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { cn } from "@/lib/utils";
import type { UserProfile, Company, ActivityLog } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getProactiveInsights, type ProactiveInsightsOutput } from "@/ai/flows/proactive-insights-flow";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell } from "recharts";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { addDays, format, startOfToday, differenceInDays, formatDistanceToNow } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ComplianceActivityChart = dynamic(
  () => import('./ComplianceActivityChart').then(mod => mod.ComplianceActivityChart),
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

const QuickLinkCard = ({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) => (
    <Card className="interactive-lift hover:border-primary/50 transition-colors h-full">
        <Link href={href} className="block h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 break-words">
                    {icon} {title}
                </CardTitle>
                <CardDescription className="break-words">{description}</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="link" className="p-0 h-auto">
                    {title} पर जाएं <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Link>
    </Card>
);


// --- Dashboards ---
const staticChartDataByYear = {
    [new Date().getFullYear().toString()]: Array(12).fill(null).map((_, i) => ({ month: new Date(Number(new Date().getFullYear().toString()), i, 1).toLocaleString('default', { month: 'short' }), activity: 0 })),
};

type DashboardChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
    dueDate: string;
    description: string;
    penalty: string;
};

function FounderDashboard({ userProfile, onAddCompanyClick }: { userProfile: UserProfile, onAddCompanyClick: () => void }) {
    const activeCompany = Array.isArray(userProfile?.companies) ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId) : null;
    const { toast } = useToast();
    const { updateCompanyChecklistStatus } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { upcomingFilingsCount, overdueFilingsCount, hygieneScore } = useMemo(() => {
        if (!checklist || !activeCompany) return { upcomingFilingsCount: 0, overdueFilingsCount: 0, hygieneScore: 0 };
        
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
        if (activeCompany.legalRegion === 'India') requiredFields.push('cin');
        const filledFields = requiredFields.filter(field => activeCompany[field] && String(activeCompany[field]).trim() !== '').length;
        const profileCompleteness = (filledFields / requiredFields.length) * 100;
        
        const score = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

        return {
            upcomingFilingsCount: upcomingFilings.length,
            overdueFilingsCount: overdueFilings.length,
            hygieneScore: score,
        }
    }, [checklist, activeCompany]);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!activeCompany) {
                setIsLoading(false);
                setInsightsLoading(false);
                setChecklist([]);
                return;
            }
            setIsLoading(true);

            try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await generateFilings({
                    companyType: activeCompany.type,
                    incorporationDate: activeCompany.incorporationDate,
                    currentDate: currentDate,
                    legalRegion: activeCompany.legalRegion,
                    gstin: activeCompany.gstin,
                });
                
                const processedFilings = response.filings.filter(f => f.date && !isNaN(new Date(f.date).getTime()));
                
                const savedStatuses = activeCompany.checklistStatus || {};
                
                const checklistItems = processedFilings.map((filing) => {
                    const uniqueId = `${filing.title}-${filing.date}`.replace(/[^a-zA-Z0-9-]/g, '_');
                    const isCompleted = savedStatuses[uniqueId] ?? false;
                    
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
                    title: "फाइलिंग लोड नहीं हो सकी",
                    description: "अनुपालन चेकलिस्ट बनाने में एक त्रुटि हुई।",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [activeCompany, toast]);

    useEffect(() => {
        const fetchInsights = async () => {
            if (isLoading || !activeCompany || !userProfile) return;
            setInsightsLoading(true);

            const burnRate = (activeCompany.financials?.monthlyExpenses || 0) - (activeCompany.financials?.monthlyRevenue || 0);

            try {
                const response = await getProactiveInsights({
                    userRole: 'Founder',
                    legalRegion: userProfile.legalRegion,
                    founderContext: {
                        companyAgeInDays: differenceInDays(new Date(), new Date(activeCompany.incorporationDate)),
                        companyType: activeCompany.type,
                        hygieneScore: hygieneScore,
                        overdueCount: overdueFilingsCount,
                        upcomingIn30DaysCount: upcomingFilingsCount,
                        burnRate: burnRate > 0 ? burnRate : 0,
                    }
                });
                setInsights(response.insights);
            } catch (error: any) {
                console.error("Could not fetch insights", error);
                toast({ title: 'AI सुझाव विफल', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [isLoading, activeCompany, hygieneScore, overdueFilingsCount, upcomingFilingsCount, userProfile, toast]);
    
    const handleToggleComplete = (itemId: string) => {
        if (!activeCompany) return;

        const newChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(newChecklist);

        const newStatuses = newChecklist.reduce((acc, item) => {
            acc[item.id] = item.completed;
            return acc;
        }, {} as Record<string, boolean>);
        
        updateCompanyChecklistStatus(activeCompany.id, newStatuses);
    };

    const handleCompleteYear = (year: string) => {
      if (!activeCompany) return;
      const today = startOfToday();
      
      const updatedChecklist = checklist.map(item => {
        const dueDate = new Date(item.dueDate + 'T00:00:00');
        if (dueDate.getFullYear().toString() === year && dueDate <= today) {
          return { ...item, completed: true };
        }
        return item;
      });
      setChecklist(updatedChecklist);

      const updatedStatuses = updatedChecklist.reduce((acc, item) => {
          acc[item.id] = item.completed;
          return acc;
      }, {} as Record<string, boolean>);
      
      updateCompanyChecklistStatus(activeCompany.id, updatedStatuses);
      toast({ title: "अनुपालन अपडेट किया गया", description: `${year} के लिए सभी पिछले कार्यों को पूर्ण के रूप में चिह्नित किया गया है।` });
    };

    const { checklistYears, overdueYears, yearCompletionStatus } = useMemo(() => {
        const years = new Set<string>();
        const overdue = new Set<string>();
        const completionStatus: Record<string, boolean> = {};
        const today = startOfToday();

        checklist.forEach(item => {
            const dueDate = new Date(item.dueDate + 'T00:00:00');
            const year = dueDate.getFullYear().toString();
            years.add(year);
            if (dueDate < today && !item.completed) {
                overdue.add(year);
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => Number(b) - Number(a));

        sortedYears.forEach(year => {
            const itemsForYear = checklist.filter(item => new Date(item.dueDate).getFullYear().toString() === year);
            const pastItems = itemsForYear.filter(item => new Date(item.dueDate) <= today);
            if (pastItems.length > 0) {
              completionStatus[year] = pastItems.every(item => item.completed);
            } else {
              completionStatus[year] = true; // No past items, so considered complete
            }
        });

        return {
            checklistYears: sortedYears,
            overdueYears: overdue,
            yearCompletionStatus: completionStatus,
        };
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

        if (activeCompany) {
            allYears.add(new Date(activeCompany.incorporationDate).getFullYear().toString());
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
    }, [checklist, activeCompany]);

    const { equityIssued, equityIssuedSubtext } = useMemo(() => {
        const capTable = activeCompany?.capTable;
        if (!capTable || capTable.length === 0) return { equityIssued: "0%", equityIssuedSubtext: "कोई शेयर जारी नहीं किया गया" };
        
        const totalShares = capTable.reduce((acc, entry) => acc + entry.shares, 0);
        if (totalShares === 0) return { equityIssued: "0%", equityIssuedSubtext: "कोई शेयर जारी नहीं किया गया" };
        
        const esopPoolShares = capTable.find(e => e.type === 'ESOP' && e.holder.toLowerCase().includes('pool'))?.shares || 0;
        const issuedShares = totalShares - esopPoolShares;
        const percentage = (issuedShares / totalShares) * 100;
        
        return { equityIssued: `${percentage.toFixed(0)}%`, equityIssuedSubtext: `कुल जारी किए गए शेयरों का (पूल को छोड़कर)` };
    }, [activeCompany]);

    const scoreColor = hygieneScore > 80 ? 'text-green-600' : hygieneScore > 60 ? 'text-yellow-600' : 'text-red-600';

    if (!activeCompany) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
                <Building2 className="w-16 h-16 text-primary/20 mb-4"/>
                <p className="font-semibold text-lg">आपके कार्यक्षेत्र में आपका स्वागत है!</p>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                एक अनुपालन कैलेंडर बनाने और AI टूल तक पहुंचने के लिए अपनी पहली कंपनी जोड़ें।
                </p>
                <Button onClick={onAddCompanyClick}>
                <Plus className="mr-2 h-4 w-4"/>
                कंपनी जोड़ें
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                <Link href="/dashboard/analytics" className="block"><StatCard title="कानूनी स्वच्छता स्कोर" value={`${hygieneScore}`} subtext={hygieneScore > 80 ? 'उत्कृष्ट' : 'अच्छा'} icon={<ShieldCheck />} colorClass={scoreColor} isLoading={isLoading} /></Link>
                <Link href="/dashboard/ca-connect" className="block"><StatCard title="आगामी फाइलिंग" value={`${upcomingFilingsCount}`} subtext="अगले 30 दिनों में" icon={<Calendar />} isLoading={isLoading} /></Link>
                <Link href="/dashboard/cap-table" className="block"><StatCard title="जारी इक्विटी" value={equityIssued} subtext={equityIssuedSubtext} icon={<PieChart />} isLoading={isLoading} /></Link>
                <Link href="/dashboard/ca-connect" className="block"><StatCard title="अलर्ट" value={`${overdueFilingsCount}`} subtext={overdueFilingsCount > 0 ? "अतिदेय कार्य" : "कोई अतिदेय कार्य नहीं"} icon={<AlertTriangle className="h-4 w-4" />} colorClass={overdueFilingsCount > 0 ? "text-red-600" : ""} isLoading={isLoading} /></Link>
            </div>
            
            <Card className="interactive-lift">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> सक्रिय AI सुझाव</CardTitle>
                    <CardDescription>आपको आगे रहने में मदद करने के लिए हमारे AI से समय पर सुझाव।</CardDescription>
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
                            <p>फिलहाल कोई विशेष जानकारी नहीं है। आप पूरी तरह तैयार हैं!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceActivityChart dataByYear={complianceChartDataByYear} />
                
                <Card className="interactive-lift">
                    <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ListChecks /> अनुपालन चेकलिस्ट</CardTitle>
                            <CardDescription>आपकी कंपनी के लिए महीने के हिसाब से समूहीकृत मुख्य अनुपालन आइटम।</CardDescription>
                        </div>
                        {checklistYears.length > 0 && (
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto mt-4 sm:mt-0">
                                        {overdueYears.has(selectedYear) && <AlertTriangle className="h-4 w-4 text-destructive mr-2"/>}
                                        {selectedYear}
                                        <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="space-y-1">
                                    {checklistYears.map(year => (
                                        <div key={year} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-muted">
                                            <button 
                                                onClick={() => { setSelectedYear(year); setPopoverOpen(false); }}
                                                className={cn("flex-1 text-left flex items-center gap-2", selectedYear === year && "font-bold text-primary")}
                                            >
                                                {overdueYears.has(year) && <AlertTriangle className="h-4 w-4 text-destructive"/>}
                                                {year}
                                            </button>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Checkbox 
                                                            checked={yearCompletionStatus[year]}
                                                            onCheckedChange={() => handleCompleteYear(year)}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{year} के लिए सभी पिछले कार्यों को पूरा करें</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
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
                                    const isCurrentMonth = month === format(today, 'MMMM yyyy');
                                    const hasOverdueItems = groupedChecklist[month].some(item => {
                                        const dueDate = new Date(item.dueDate + 'T00:00:00');
                                        return dueDate < today && !item.completed;
                                    });

                                    return (
                                    <AccordionItem value={month} key={month}>
                                        <AccordionTrigger className="text-base font-semibold hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                {isCurrentMonth && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                            <CalendarClock className="h-4 w-4 text-primary" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>चालू महीना</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
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
                                                                                <p className="font-semibold mb-2">इस कार्य के बारे में:</p>
                                                                                <p className="text-xs mb-3">{item.description}</p>
                                                                                <p className="font-semibold mb-2">गैर-अनुपालन के लिए जुर्माना:</p>
                                                                                <p className="text-xs text-destructive">{item.penalty}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                                <span className={cn("text-xs", isItemOverdue ? "text-destructive/80" : "text-muted-foreground")}>
                                                                देय: {format(dueDate, 'do MMM, yyyy')}
                                                                </span>
                                                            </div>
                                                            {isItemOverdue && (
                                                                <Badge variant="destructive" className="self-center">अतिदेय</Badge>
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
                                <p>{selectedYear} के लिए कोई आइटम नहीं। दूसरा वर्ष चुनें या बाद में जांचें।</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CADashboard({ userProfile, onAddClientClick }: { userProfile: UserProfile, onAddClientClick: () => void }) {
    const { toast } = useToast();
    const router = useRouter();
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);

    const clientCount = userProfile.companies.length;
    
    const { highRiskClientCount, portfolioDeadlines } = useMemo(() => {
        let highRisk = 0;
        let deadlines: any[] = [];
        
        userProfile.companies.forEach(company => {
            const overdueTasks = company.docRequests?.filter(r => r.status === 'Pending' && new Date(r.dueDate) < startOfToday()).length || 0;
            const filingPerf = Math.max(0, 100 - (overdueTasks * 20)); // Simplified health calc
            
            const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
            if (company.legalRegion === 'India') requiredFields.push('cin');
            const filledFields = requiredFields.filter(field => company[field] && (company[field] as string).trim() !== '').length;
            const profileCompleteness = (filledFields / requiredFields.length) * 100;
            
            const healthScore = Math.round((filingPerf * 0.5) + (profileCompleteness * 0.5));
            if (healthScore < 60) highRisk++;

            const upcomingRequests = company.docRequests
                ?.filter(r => r.status === 'Pending' && new Date(r.dueDate) >= startOfToday())
                .map(r => ({ ...r, clientName: company.name })) || [];
            
            deadlines = [...deadlines, ...upcomingRequests];
        });
        
        deadlines.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return {
            highRiskClientCount: highRisk,
            portfolioDeadlines: deadlines.slice(0, 3)
        };
    }, [userProfile.companies]);

    useEffect(() => {
        const fetchInsights = async () => {
            setInsightsLoading(true);
            try {
                const response = await getProactiveInsights({
                    userRole: 'CA',
                    legalRegion: userProfile.legalRegion,
                    caContext: {
                        clientCount: clientCount,
                        highRiskClientCount: highRiskClientCount,
                    }
                });
                setInsights(response.insights);
            } catch (error: any) {
                console.error("Could not fetch insights", error);
                toast({ title: 'AI सुझाव विफल', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [clientCount, highRiskClientCount, userProfile.legalRegion, toast]);

   const activityLog = userProfile.activityLog || [];

   if (clientCount === 0) {
     return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
            <Users className="w-16 h-16 text-primary/20 mb-4"/>
            <p className="font-semibold text-lg">स्वागत है, सलाहकार!</p>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                शुरू करने के लिए अपनी पहली क्लाइंट कंपनी जोड़ें, या लंबित आमंत्रण स्वीकार करें।
            </p>
            <div className="flex gap-4">
                <Button onClick={onAddClientClick}>
                    <Plus className="mr-2 h-4 w-4"/> क्लाइंट जोड़ें
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/invitations">आमंत्रण देखें</Link>
                </Button>
            </div>
        </div>
     );
   }

   return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/clients" className="block"><StatCard title="कुल क्लाइंट" value={`${clientCount}`} subtext={`${clientCount} ${clientCount === 1 ? 'क्लाइंट' : 'क्लाइंट'} प्रबंधित`} icon={<Users className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title="जोखिम वाले क्लाइंट" value={`${highRiskClientCount}`} subtext="कम स्वास्थ्य स्कोर वाले क्लाइंट" icon={<FileWarning className="h-4 w-4" />} colorClass={highRiskClientCount > 0 ? "text-red-600" : ""} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title="पोर्टफोलियो एनालिटिक्स" value="देखें" subtext="क्लाइंट स्वास्थ्य में गहराई से जाएं" icon={<LineChart className="h-4 w-4" />} /></Link>
        </div>
        
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> सक्रिय AI सुझाव</CardTitle>
                <CardDescription>आपके अभ्यास को प्रबंधित करने में मदद करने के लिए समय पर सुझाव।</CardDescription>
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
                        <p>फिलहाल कोई विशेष जानकारी नहीं है। आप पूरी तरह तैयार हैं!</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarClock/> पोर्टफोलियो डेडलाइन</CardTitle>
                    <CardDescription>आपके सभी क्लाइंट्स के लिए आने वाली महत्वपूर्ण तिथियां।</CardDescription>
                </CardHeader>
                <CardContent>
                    {portfolioDeadlines.length > 0 ? (
                        <div className="space-y-4">
                            {portfolioDeadlines.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full text-primary"><FileText className="w-5 h-5"/></div>
                                    <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.clientName} &bull; <span className="font-semibold">देय {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">कोई आगामी समय सीमा नहीं।</p>}
                </CardContent>
            </Card>
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle/> हाल की गतिविधि</CardTitle>
                    <CardDescription>आपके पोर्टफोलियो से नवीनतम कार्रवाइयां।</CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLog.length > 0 ? (
                        <div className="space-y-4">
                            {activityLog.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full text-muted-foreground"><Users className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-sm"><span className="font-semibold">{item.userName}</span> {item.action}.</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">कोई हाल की गतिविधि नहीं।</p>}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

function LegalAdvisorDashboard({ userProfile }: { userProfile: UserProfile }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="md:col-span-4 lg:col-span-4">
                <QuickLinkCard title="AI दस्तावेज़ विश्लेषक" description="जोखिमों की पहचान करने, गुम हुए खंडों को खोजने और रेडलाइन सुझाव प्राप्त करने के लिए तुरंत एक अनुबंध अपलोड करें।" href="/dashboard/ai-toolkit?tab=analyzer" icon={<FileScan className="text-primary"/>} />
             </div>
             <Link href="/dashboard/clients" className="block"><StatCard title="सक्रिय मामले" value={userProfile.companies.reduce((acc, c) => acc + (c.matters?.length || 0), 0).toString()} subtext="सभी क्लाइंट्स में" icon={<Briefcase />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=analyzer" className="block"><StatCard title="विश्लेषित अनुबंध" value="0" subtext="इस महीने" icon={<ListChecks />} /></Link>
             <Link href="/dashboard/documents" className="block"><StatCard title="लंबित रेडलाइन" value="0" subtext="आपकी समीक्षा की प्रतीक्षा में" icon={<FileSignature />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=research" className="block"><StatCard title="कानूनी अनुसंधान" value="0" subtext="इस महीने के प्रश्न" icon={<Scale />} /></Link>
             <div className="md:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>
        </div>
    );
}

function EnterpriseDashboard({ userProfile }: { userProfile: UserProfile }) {
    const entityCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <Link href="/dashboard/team" className="block"><StatCard title="प्रबंधित इकाइयां" value={`${entityCount}`} subtext="संगठन भर में" icon={<Building2 />} /></Link>
             <Link href="/dashboard/analytics" className="block"><StatCard title="समग्र जोखिम स्कोर" value="N/A" subtext="डेटा स्रोत कनेक्ट करें" icon={<ShieldCheck />} /></Link>
             <Link href="/dashboard/team" className="block"><StatCard title="लंबित स्वीकृतियां" value="0" subtext="आपके वर्कफ़्लो में" icon={<Users />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=audit" className="block"><StatCard title="डेटा रूम तैयारी" value="N/A" subtext="आगामी M&A के लिए" icon={<GanttChartSquare />} /></Link>
             
             <div className="lg:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>

             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="AI ऑडिट सहायक" description="अनुपालन चेकलिस्ट के विरुद्ध अपने दस्तावेज़ों को मान्य करके SOC2, ISO, या आंतरिक ऑडिट की तैयारी करें।" href="/dashboard/ai-toolkit?tab=audit" icon={<Sparkles className="text-primary"/>} />
             </div>
             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="वर्कफ़्लो ऑटोमेशन" description="अनुपालन प्रक्रियाओं और अनुमोदनों को सुव्यवस्थित करने के लिए शक्तिशाली ऑटोमेशन बनाएं।" href="/dashboard/ai-toolkit?tab=workflows" icon={<Zap className="text-primary"/>} />
             </div>
        </div>
    );
}

export default function Dashboard() {
  const { userProfile, deductCredits } = useAuth();
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  const renderDashboardByRole = () => {
    if (!userProfile) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[450px] w-full rounded-lg" />
                    <Skeleton className="h-[450px] w-full rounded-lg" />
                </div>
            </div>
        );
    }
    switch (userProfile.role) {
      case 'Founder':
        return <FounderDashboard userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} />;
      case 'CA':
        return <CADashboard userProfile={userProfile} onAddClientClick={() => setAddCompanyModalOpen(true)} />;
      case 'Legal Advisor':
        return <LegalAdvisorDashboard userProfile={userProfile} />;
      case 'Enterprise':
        return <EnterpriseDashboard userProfile={userProfile} />;
      default:
        return <FounderDashboard userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} />;
    }
  };
  
  const activeCompany = Array.isArray(userProfile?.companies)
    ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId)
    : null;

  const getAddButtonText = () => {
      if (userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor') {
          return 'क्लाइंट जोड़ें';
      }
      return 'कंपनी जोड़ें';
  }

  return (
    <>
      <AddCompanyModal isOpen={isAddCompanyModalOpen} onOpenChange={setAddCompanyModalOpen} deductCredits={deductCredits} />
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">
                स्वागत है, {userProfile?.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                यहाँ आपके {userProfile?.role} का अवलोकन है {userProfile?.role === 'Founder' && activeCompany ? `${activeCompany.name} के लिए` : ''}.
              </p>
            </div>
              <div className="flex items-center gap-4">
                  <Button onClick={() => setAddCompanyModalOpen(true)} className="w-full sm:w-auto interactive-lift">
                      <Plus className="mr-2 h-4 w-4" />
                      {getAddButtonText()}
                  </Button>
              </div>
          </div>
        </div>
        {renderDashboardByRole()}
      </div>
    </>
  );
}
