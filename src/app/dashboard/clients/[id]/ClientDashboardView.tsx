
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ListChecks,
  PieChart,
  Info,
  CalendarClock,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserProfile, Company } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { addDays, format, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ComplianceActivityChart = dynamic(
  () => import('../../ComplianceActivityChart').then(mod => mod.ComplianceActivityChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />
  }
);

// --- Helper Components ---
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

// --- Dashboards ---
const staticChartDataByYear = {
    [new Date().getFullYear().toString()]: Array(12).fill(null).map((_, i) => ({ month: format(new Date(Number(new Date().getFullYear().toString()), i, 1), 'MMM'), activity: 0 })),
};

type DashboardChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
    dueDate: string;
    description: string;
    penalty: string;
};

// This is essentially the FounderDashboard, repurposed for viewing a single client.
export default function ClientDashboardView({ userProfile }: { userProfile: UserProfile }) {
    const { toast } = useToast();
    const { updateCompanyChecklistStatus } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    
    const activeCompany = Array.isArray(userProfile?.companies) ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId) : null;
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!activeCompany) {
                setIsLoading(false);
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

        const totalFilings = checklist.length;
        const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
        
        const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
        if (activeCompany.legalRegion === 'India') requiredFields.push('cin');
        const filledFields = requiredFields.filter(field => activeCompany[field] && (activeCompany[field] as string).trim() !== '').length;
        const profileCompleteness = (filledFields / requiredFields.length) * 100;
        
        const score = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

        return {
            upcomingFilingsCount: upcomingFilings.length,
            overdueFilingsCount: overdueFilings.length,
            hygieneScore: score,
        }
    }, [checklist, activeCompany]);
    
    const { checklistYears, overdueYears } = useMemo(() => {
        const years = new Set<string>();
        const overdue = new Set<string>();
        const today = startOfToday();

        checklist.forEach(item => {
            const dueDate = new Date(item.dueDate + 'T00:00:00');
            const year = dueDate.getFullYear().toString();
            years.add(year);
            if (dueDate < today && !item.completed) {
                overdue.add(year);
            }
        });

        return {
            checklistYears: Array.from(years).sort((a, b) => Number(b) - Number(a)),
            overdueYears: overdue
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
        if (Object.keys(result).length === 0) return staticChartDataByYear;

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title="Legal Hygiene Score" value={`${hygieneScore}`} subtext={hygieneScore > 80 ? 'Excellent' : 'Good'} icon={<ShieldCheck />} colorClass={scoreColor} isLoading={isLoading} />
                <StatCard title="Upcoming Filings" value={`${upcomingFilingsCount}`} subtext="In next 30 days" icon={<Calendar />} isLoading={isLoading} />
                <StatCard title="Equity Issued" value={equityIssued} subtext={equityIssuedSubtext} icon={<PieChart />} isLoading={isLoading} />
                <StatCard title="Alerts" value={`${overdueFilingsCount}`} subtext={overdueFilingsCount > 0 ? "Overdue tasks" : "No overdue tasks"} icon={<AlertTriangle className="h-4 w-4" />} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceActivityChart dataByYear={complianceChartDataByYear} />
                
                <Card className="interactive-lift">
                    <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><ListChecks /> Compliance Checklist</CardTitle>
                            <CardDescription>Key compliance items for the client, grouped by month.</CardDescription>
                        </div>
                        {checklistYears.length > 0 && (
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-full sm:w-[120px] mt-4 sm:mt-0">
                                    <SelectValue placeholder="Select year"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {checklistYears.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                                                <p>Current Month</p>
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
            </div>
        </div>
    );
}
