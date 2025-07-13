
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
  ChevronDown,
  Settings,
  Activity
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
import type { UserProfile, Company, ActivityLogItem } from "@/lib/types";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Language, Translations } from "./layout";

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
    Settings: <Settings className="w-5 h-5 text-gray-500" />,
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

const QuickLinkCard = ({ title, description, href, icon, translations, lang }: { title: string, description: string, href: string, icon: React.ReactNode, translations: Translations, lang: Language }) => (
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
                    {translations.goTo[lang]} {title} <ArrowRight className="ml-2 h-4 w-4" />
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

function FounderDashboard({ userProfile, onAddCompanyClick, translations, lang }: { userProfile: UserProfile, onAddCompanyClick: () => void, translations: Translations, lang: Language }) {
    const activeCompany = Array.isArray(userProfile?.companies) ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId) : null;
    const { toast } = useToast();
    const { updateCompanyChecklistStatus, checkForAcceptedInvites } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [popoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        // New logic to check for accepted invites when the founder dashboard loads
        if (userProfile.role === 'Founder') {
            checkForAcceptedInvites();
        }
    }, [checkForAcceptedInvites, userProfile.role]);

    const { upcomingFilingsCount, overdueFilingsCount, hygieneScore, profileCompleteness } = useMemo(() => {
        if (!checklist || !activeCompany) return { upcomingFilingsCount: 0, overdueFilingsCount: 0, hygieneScore: 0, profileCompleteness: 0 };
        
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

        const totalFilings = checklist.length;
        const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
        
        const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
        if (activeCompany.legalRegion === 'India') requiredFields.push('cin');
        const filledFields = requiredFields.filter(field => activeCompany[field] && String(activeCompany[field]).trim() !== '').length;
        const completeness = (filledFields / requiredFields.length) * 100;
        
        const score = Math.round((filingPerf * 0.7) + (completeness * 0.3));

        return {
            upcomingFilingsCount: upcomingFilings.length,
            overdueFilingsCount: overdueFilings.length,
            hygieneScore: score,
            profileCompleteness: Math.round(completeness),
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
                    title: "Could not fetch filings",
                    description: "There was an error generating the compliance checklist.",
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
                        profileCompleteness: profileCompleteness,
                        overdueCount: overdueFilingsCount,
                        upcomingIn30DaysCount: upcomingFilingsCount,
                        burnRate: burnRate > 0 ? burnRate : 0,
                    }
                });
                setInsights(response.insights);
            } catch (error: any) {
                console.error("Could not fetch insights", error);
                toast({ title: 'AI Suggestion Failed', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [isLoading, activeCompany, hygieneScore, overdueFilingsCount, upcomingFilingsCount, userProfile, toast, profileCompleteness]);
    
    const handleToggleComplete = (itemId: string) => {
        if (!activeCompany) return;

        const updatedChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(updatedChecklist);

        const updatedItem = updatedChecklist.find(item => item.id === itemId);
        if (updatedItem) {
            updateCompanyChecklistStatus(activeCompany.id, [{
                itemId: updatedItem.id,
                completed: updatedItem.completed
            }]);
        }
    };

    const handleCompleteYear = (year: string) => {
      if (!activeCompany) return;
      const today = startOfToday();
      
      const updates: { itemId: string; completed: boolean }[] = [];
      const updatedChecklist = checklist.map(item => {
        const dueDate = new Date(item.dueDate + 'T00:00:00');
        if (dueDate.getFullYear().toString() === year && dueDate <= today && !item.completed) {
          updates.push({ itemId: item.id, completed: true });
          return { ...item, completed: true };
        }
        return item;
      });

      if (updates.length > 0) {
        setChecklist(updatedChecklist);
        updateCompanyChecklistStatus(activeCompany.id, updates);
        toast({ title: translations.toastComplianceUpdatedTitle[lang], description: `${translations.toastComplianceUpdatedDesc[lang]} ${year}.` });
      } else {
        toast({ title: "No tasks to update", description: `All past tasks for ${year} were already complete.` });
      }
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
        if (!capTable || capTable.length === 0) return { equityIssued: "0%", equityIssuedSubtext: "No shares issued" };
        
        const totalShares = capTable.reduce((acc, entry) => acc + entry.shares, 0);
        if (totalShares === 0) return { equityIssued: "0%", equityIssuedSubtext: "No shares issued" };
        
        const esopPoolShares = capTable.find(e => e.type === 'ESOP' && e.holder.toLowerCase().includes('pool'))?.shares || 0;
        const issuedShares = totalShares - esopPoolShares;
        const percentage = (issuedShares / totalShares) * 100;
        
        return { equityIssued: `${percentage.toFixed(0)}%`, equityIssuedSubtext: `of total shares issued (excl. pool)` };
    }, [activeCompany]);

    const scoreColor = hygieneScore > 80 ? 'text-green-600' : hygieneScore > 60 ? 'text-yellow-600' : 'text-red-600';

    if (!activeCompany) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
                <Building2 className="w-16 h-16 text-primary/20 mb-4"/>
                <p className="font-semibold text-lg">{translations.welcomeWorkspace[lang]}</p>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                 {translations.addCompanyPrompt[lang]}
                </p>
                <Button onClick={onAddCompanyClick}>
                <Plus className="mr-2 h-4 w-4"/>
                 {translations.addCompany[lang]}
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                <Link href="/dashboard/analytics" className="block"><StatCard title={translations.hygieneScore[lang]} value={`${hygieneScore}`} subtext={hygieneScore > 80 ? 'Excellent' : 'Good'} icon={<ShieldCheck />} colorClass={scoreColor} isLoading={isLoading} /></Link>
                <Link href="/dashboard/ca-connect" className="block"><StatCard title={translations.upcomingFilings[lang]} value={`${upcomingFilingsCount}`} subtext={translations.inNext30Days[lang]} icon={<Calendar />} isLoading={isLoading} /></Link>
                <Link href="/dashboard/cap-table" className="block"><StatCard title={translations.equityIssued[lang]} value={equityIssued} subtext={equityIssuedSubtext} icon={<PieChart />} isLoading={isLoading} /></Link>
                <Link href="/dashboard/ca-connect" className="block"><StatCard title={translations.alerts[lang]} value={`${overdueFilingsCount}`} subtext={overdueFilingsCount > 0 ? translations.overdueTasks[lang] : translations.noOverdueTasks[lang]} icon={<AlertTriangle className="h-4 w-4" />} colorClass={overdueFilingsCount > 0 ? "text-red-600" : ""} isLoading={isLoading} /></Link>
            </div>
            
            <Card className="interactive-lift">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> {translations.proactiveAISuggestions[lang]}</CardTitle>
                    <CardDescription>{translations.timelyAdvice[lang]}</CardDescription>
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
                            <p>{translations.noSpecialInsights[lang]}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceActivityChart dataByYear={complianceChartDataByYear} />
                
                <Card className="interactive-lift">
                    <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ListChecks /> {translations.complianceChecklist[lang]}</CardTitle>
                            <CardDescription>{translations.keyComplianceItems[lang]}</CardDescription>
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
                                                        <p>{translations.completeAllTasksFor[lang]} {year}</p>
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
                                                                <p>{translations.currentMonth[lang]}</p>
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
                                                                                <p className="font-semibold mb-2">{translations.aboutThisTask[lang]}</p>
                                                                                <p className="text-xs mb-3">{item.description}</p>
                                                                                <p className="font-semibold mb-2">{translations.penaltyForNonCompliance[lang]}</p>
                                                                                <p className="text-xs text-destructive">{item.penalty}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                                <span className={cn("text-xs", isItemOverdue ? "text-destructive/80" : "text-muted-foreground")}>
                                                                {translations.due[lang]}: {format(dueDate, 'do MMM, yyyy')}
                                                                </span>
                                                            </div>
                                                            {isItemOverdue && (
                                                                <Badge variant="destructive" className="self-center">{translations.overdue[lang]}</Badge>
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
                                <p>{translations.noItemsForYear[lang]} {selectedYear}. {translations.selectAnotherYear[lang]}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CADashboard({ userProfile, onAddClientClick, translations, lang }: { userProfile: UserProfile, onAddClientClick: () => void, translations: Translations, lang: Language }) {
    const { toast } = useToast();
    const router = useRouter();
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [clientHealthData, setClientHealthData] = useState<any[]>([]);
    const [isLoadingHealth, setIsLoadingHealth] = useState(true);

    const clientCount = userProfile.companies.length;
    
    useEffect(() => {
        const calculateHealth = async () => {
            if (userProfile.companies.length === 0) {
                setIsLoadingHealth(false);
                return;
            }
            setIsLoadingHealth(true);
            try {
                const healthPromises = userProfile.companies.map(async (company) => {
                    const filingResponse = await generateFilings({
                        companyType: company.type,
                        incorporationDate: company.incorporationDate,
                        currentDate: format(new Date(), 'yyyy-MM-dd'),
                        legalRegion: company.legalRegion,
                        gstin: company.gstin,
                    });
                    
                    const savedStatuses = company.checklistStatus || {};
                    const overdueTasks = filingResponse.filings.filter(filing => {
                        const dueDate = new Date(filing.date + 'T00:00:00');
                        const uniqueId = `${filing.title}-${filing.date}`.replace(/[^a-zA-Z0-9-]/g, '_');
                        const isCompleted = savedStatuses[uniqueId] ?? false;
                        return dueDate < startOfToday() && !isCompleted;
                    }).length;
                    
                    const filingPerf = filingResponse.filings.length > 0 ? ((filingResponse.filings.length - overdueTasks) / filingResponse.filings.length) * 100 : 100;
                    
                    const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
                    if (company.legalRegion === 'India') requiredFields.push('cin');
                    const filledFields = requiredFields.filter(field => company[field] && (company[field] as string).trim() !== '').length;
                    const profileCompleteness = (filledFields / requiredFields.length) * 100;

                    const healthScore = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

                    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
                    if (healthScore < 60) riskLevel = 'High';
                    else if (healthScore < 85) riskLevel = 'Medium';

                    const upcomingDeadlines = filingResponse.filings
                        .filter(f => {
                            const dueDate = new Date(f.date + 'T00:00:00');
                            return dueDate >= startOfToday() && dueDate <= addDays(startOfToday(), 30);
                        })
                        .map(f => ({ title: f.title, dueDate: f.date }));
                    
                    return { ...company, healthScore, riskLevel, upcomingDeadlines };
                });

                const results = await Promise.all(healthPromises);
                setClientHealthData(results);

            } catch (error) {
                console.error("Error calculating client health data", error);
            } finally {
                setIsLoadingHealth(false);
            }
        };

        calculateHealth();
    }, [userProfile.companies]);


    const { highRiskClientCount, portfolioDeadlines } = useMemo(() => {
        const highRisk = clientHealthData.filter(c => c.riskLevel === 'High').length;
        const deadlines = clientHealthData
            .flatMap(c => c.upcomingDeadlines.map((d: any) => ({ ...d, clientName: c.name })))
            .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return {
            highRiskClientCount: highRisk,
            portfolioDeadlines: deadlines.slice(0, 3)
        };
    }, [clientHealthData]);

    const activityLog = useMemo(() => {
        const allLogs: (ActivityLogItem & { clientName: string })[] = [];
        userProfile.companies.forEach(company => {
            if (company.activityLog) {
                allLogs.push(...company.activityLog.map(log => ({ ...log, clientName: company.name })));
            }
        });
        return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [userProfile.companies]);

    useEffect(() => {
        const fetchInsights = async () => {
            if (isLoadingHealth) return;
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
                toast({ title: 'AI Suggestion Failed', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [clientCount, highRiskClientCount, userProfile.legalRegion, toast, isLoadingHealth]);

   if (clientCount === 0) {
     return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
            <Users className="w-16 h-16 text-primary/20 mb-4"/>
            <p className="font-semibold text-lg">{translations.welcomeAdvisor[lang]}</p>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                 {translations.addFirstClientPrompt[lang]}
            </p>
            <div className="flex gap-4">
                <Button onClick={onAddClientClick}>
                    <Plus className="mr-2 h-4 w-4"/> {translations.addClient[lang]}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/invitations">{translations.viewInvitations[lang]}</Link>
                </Button>
            </div>
        </div>
     );
   }

   return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/clients" className="block"><StatCard title={translations.totalClients[lang]} value={`${clientCount}`} subtext={`${clientCount} ${clientCount === 1 ? 'client' : 'clients'} managed`} icon={<Users className="h-4 w-4" />} isLoading={isLoadingHealth} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title={translations.clientsAtRisk[lang]} value={`${highRiskClientCount}`} subtext={translations.clientsWithLowHealth[lang]} icon={<FileWarning className="h-4 w-4" />} colorClass={highRiskClientCount > 0 ? "text-red-600" : ""} isLoading={isLoadingHealth} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title={translations.portfolioAnalytics[lang]} value={translations.view[lang]} subtext={translations.deepDive[lang]} icon={<LineChart className="h-4 w-4" />} isLoading={isLoadingHealth} /></Link>
        </div>
        
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> {translations.proactiveAISuggestions[lang]}</CardTitle>
                <CardDescription>{translations.timelyAdvicePractice[lang]}</CardDescription>
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
                        <p>{translations.noSpecialInsights[lang]}</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarClock/> {translations.portfolioDeadlines[lang]}</CardTitle>
                    <CardDescription>{translations.upcomingKeyDates[lang]}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingHealth ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full"/>
                            <Skeleton className="h-12 w-full"/>
                            <Skeleton className="h-12 w-full"/>
                        </div>
                    ) : portfolioDeadlines.length > 0 ? (
                        <div className="space-y-4">
                            {portfolioDeadlines.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full text-primary"><FileText className="w-5 h-5"/></div>
                                    <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.clientName} &bull; <span className="font-semibold">{translations.due[lang]} {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">{translations.noUpcomingDeadlines[lang]}</p>}
                </CardContent>
            </Card>
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle/> {translations.recentActivity[lang]}</CardTitle>
                    <CardDescription>{translations.latestActions[lang]}</CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLog.length > 0 ? (
                        <div className="space-y-4">
                            {activityLog.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full text-muted-foreground"><Activity className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-sm"><span className="font-semibold">{item.userName}</span> {item.action}.</p>
                                        <p className="text-xs text-muted-foreground">{item.clientName} &bull; {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">{translations.noRecentActivity[lang]}</p>}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

function LegalAdvisorDashboard({ userProfile, translations, lang }: { userProfile: UserProfile, translations: Translations, lang: Language }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="md:col-span-4 lg:col-span-4">
                <QuickLinkCard title={translations.aiDocAnalyzer[lang]} description={translations.aiDocAnalyzerDesc[lang]} href="/dashboard/ai-toolkit?tab=analyzer" icon={<FileScan className="text-primary"/>} translations={translations} lang={lang}/>
             </div>
             <Link href="/dashboard/clients" className="block"><StatCard title={translations.activeMatters[lang]} value={userProfile.companies.reduce((acc, c) => acc + (c.matters?.length || 0), 0).toString()} subtext={translations.acrossAllClients[lang]} icon={<Briefcase />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=analyzer" className="block"><StatCard title={translations.contractsAnalyzed[lang]} value="0" subtext={translations.thisMonth[lang]} icon={<ListChecks />} /></Link>
             <Link href="/dashboard/documents" className="block"><StatCard title={translations.pendingRedlines[lang]} value="0" subtext={translations.awaitingReview[lang]} icon={<FileSignature />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=research" className="block"><StatCard title={translations.legalResearch[lang]} value="0" subtext={translations.queriesThisMonth[lang]} icon={<Scale />} /></Link>
             <div className="md:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>
        </div>
    );
}

function EnterpriseDashboard({ userProfile, translations, lang }: { userProfile: UserProfile, translations: Translations, lang: Language }) {
    const entityCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <Link href="/dashboard/team" className="block"><StatCard title={translations.managedEntities[lang]} value={`${entityCount}`} subtext={translations.acrossOrganization[lang]} icon={<Building2 />} /></Link>
             <Link href="/dashboard/analytics" className="block"><StatCard title={translations.overallRiskScore[lang]} value="N/A" subtext={translations.connectDataSources[lang]} icon={<ShieldCheck />} /></Link>
             <Link href="/dashboard/team" className="block"><StatCard title={translations.pendingApprovals[lang]} value="0" subtext={translations.inYourWorkflows[lang]} icon={<Users />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=audit" className="block"><StatCard title={translations.dataroomReadiness[lang]} value="N/A" subtext={translations.forUpcomingMA[lang]} icon={<GanttChartSquare />} /></Link>
             
             <div className="lg:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>

             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title={translations.aiAuditAssistant[lang]} description={translations.aiAuditAssistantDesc[lang]} href="/dashboard/ai-toolkit?tab=audit" icon={<Sparkles className="text-primary"/>} translations={translations} lang={lang}/>
             </div>
             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title={translations.workflowAutomation[lang]} description={translations.workflowAutomationDesc[lang]} href="/dashboard/ai-toolkit?tab=workflows" icon={<Zap className="text-primary"/>} translations={translations} lang={lang}/>
             </div>
        </div>
    );
}

export default function Dashboard({ translations, lang }: { translations: Translations, lang: Language }) {
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
        return <FounderDashboard userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} translations={translations} lang={lang}/>;
      case 'CA':
        return <CADashboard userProfile={userProfile} onAddClientClick={() => setAddCompanyModalOpen(true)} translations={translations} lang={lang}/>;
      case 'Legal Advisor':
        return <LegalAdvisorDashboard userProfile={userProfile} translations={translations} lang={lang}/>;
      case 'Enterprise':
        return <EnterpriseDashboard userProfile={userProfile} translations={translations} lang={lang}/>;
      default:
        return <FounderDashboard userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} translations={translations} lang={lang}/>;
    }
  };
  
  const activeCompany = Array.isArray(userProfile?.companies)
    ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId)
    : null;

  const getAddButtonText = () => {
      if (userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor') {
          return translations.addClient[lang];
      }
      return translations.addCompany[lang];
  }

  return (
    <>
      <AddCompanyModal isOpen={isAddCompanyModalOpen} onOpenChange={setAddCompanyModalOpen} deductCredits={deductCredits} />
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">
                {translations.welcome[lang]}, {userProfile?.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {translations.workspaceOverview[lang]} {userProfile?.role === 'Founder' && activeCompany ? `${translations.for[lang]} ${activeCompany.name}` : ''}.
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
