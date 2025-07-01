
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
  CheckCircle,
  FileScan,
  Folders,
  RadioTower,
  Network,
  Users,
  GanttChartSquare,
  FileClock,
  MailWarning,
  ClipboardList,
  Target,
  Upload,
  Loader2,
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
import type { UserProfile, Company } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { addDays, addMonths, format, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ComplianceActivityChart = dynamic(
  () => import('@/components/dashboard/compliance-activity-chart').then(mod => mod.ComplianceActivityChart),
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

const QuickLinkCard = ({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) => (
    <Card className="interactive-lift col-span-1 lg:col-span-2 hover:border-primary/50 transition-colors">
        <Link href={href} className="block h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 break-words">
                    {icon} {title}
                </CardTitle>
                <CardDescription className="break-words">{description}</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="link" className="p-0 h-auto">
                    Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Link>
    </Card>
);


// --- Dashboards ---

type DashboardChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
    dueDate: string;
};

const staticChartDataByYear = {
    '2024': [
        { month: "Jan", activity: 0 },
        { month: "Feb", activity: 0 },
        { month: "Mar", activity: 0 },
        { month: "Apr", activity: 0 },
        { month: "May", activity: 0 },
        { month: "Jun", activity: 0 },
        { month: "Jul", activity: 0 },
        { month: "Aug", activity: 0 },
        { month: "Sep", activity: 0 },
        { month: "Oct", activity: 0 },
        { month: "Nov", activity: 0 },
        { month: "Dec", activity: 0 },
    ],
    '2023': [
        { month: "Jan", activity: 0 },
        { month: "Feb", activity: 0 },
        { month: "Mar", activity: 0 },
        { month: "Apr", activity: 0 },
        { month: "May", activity: 0 },
        { month: "Jun", activity: 0 },
        { month: "Jul", activity: 0 },
        { month: "Aug", activity: 0 },
        { month: "Sep", activity: 0 },
        { month: "Oct", activity: 0 },
        { month: "Nov", activity: 0 },
        { month: "Dec", activity: 0 },
    ],
};


function FounderDashboard({ userProfile }: { userProfile: UserProfile }) {
    const isPro = userProfile.plan !== 'Starter' && userProfile.plan !== 'Free';

    const [dynamicData, setDynamicData] = useState<{
        filings: number;
        hygieneScore: number;
        alerts: number;
        loading: boolean;
    }>({ filings: 0, hygieneScore: 0, alerts: 0, loading: true });
    
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!activeCompany) {
                setDynamicData(prev => ({ ...prev, loading: false, filings: 0, hygieneScore: 0, alerts: 0 }));
                setChecklist([]);
                return;
            }
            setDynamicData(prev => ({ ...prev, loading: true }));

            try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await generateFilings({
                    companyType: activeCompany.type,
                    incorporationDate: activeCompany.incorporationDate,
                    currentDate: currentDate,
                    legalRegion: activeCompany.legalRegion,
                });
                
                let processedFilings = response.filings;
                
                const hasGst = activeCompany.gstin && activeCompany.gstin.trim().length > 0;
                if (hasGst) {
                    processedFilings = processedFilings.filter(f => !f.title.toLowerCase().includes('gst registration'));
                } else {
                    processedFilings = processedFilings.filter(f => !f.title.toLowerCase().startsWith('gstr'));
                }

                const storageKey = `dashboard-checklist-${activeCompany.id}`;
                const savedStatuses: Record<string, boolean> = JSON.parse(localStorage.getItem(storageKey) || '{}');
                
                const checklistItems = processedFilings.map((filing) => {
                    const uniqueId = `${filing.title}-${filing.date}`;
                    return {
                        id: uniqueId,
                        text: filing.title,
                        dueDate: filing.date,
                        completed: savedStatuses[uniqueId] ?? false,
                    };
                });

                setChecklist(checklistItems);
                
                const today = startOfToday();
                const thirtyDaysFromNow = addDays(today, 30);
                const upcomingFilings = checklistItems.filter(item => {
                    const dueDate = new Date(item.dueDate + 'T00:00:00');
                    return dueDate >= today && dueDate <= thirtyDaysFromNow && !item.completed;
                });
                const overdueFilings = checklistItems.filter(item => {
                    const dueDate = new Date(item.dueDate + 'T00:00:00');
                    return dueDate < today && !item.completed;
                });

                // HYGIENE SCORE CALCULATION
                const totalFilings = checklistItems.length;
                const overdueFilingsCount = overdueFilings.length;
                const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilingsCount) / totalFilings) * 100 : 100;

                let profileCompleteness = 0;
                if (activeCompany) {
                    const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
                    if (activeCompany.legalRegion === 'India' && ['Private Limited Company', 'One Person Company', 'LLP'].includes(activeCompany.type)) {
                        requiredFields.push('cin');
                    }
                    const filledFields = requiredFields.filter(field => activeCompany[field] && (activeCompany[field] as string).trim() !== '').length;
                    profileCompleteness = (filledFields / requiredFields.length) * 100;
                }
                
                const score = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

                setDynamicData({
                    filings: upcomingFilings.length,
                    hygieneScore: score,
                    alerts: overdueFilings.length,
                    loading: false
                });

            } catch (error) {
                console.error("Failed to fetch AI-generated dashboard data:", error);
                setDynamicData({ filings: 0, hygieneScore: 0, alerts: 0, loading: false });
            }
        }

        fetchDashboardData();
    }, [activeCompany]);

    const handleToggleComplete = (itemId: string) => {
        if (!activeCompany) return;

        const newChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(newChecklist);

        const storageKey = `dashboard-checklist-${activeCompany.id}`;
        const newStatuses = newChecklist.reduce((acc, item) => {
            acc[item.id] = item.completed;
            return acc;
        }, {} as Record<string, boolean>);
        
        localStorage.setItem(storageKey, JSON.stringify(newStatuses));
    };
    
    const groupedChecklist = useMemo(() => {
        if (!checklist || checklist.length === 0) return {};

        const grouped = checklist.reduce((acc, item) => {
            const monthKey = format(new Date(item.dueDate + 'T00:00:00'), 'MMMM yyyy');
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(item);
            return acc;
        }, {} as Record<string, DashboardChecklistItem[]>);

        const today = startOfToday();
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
    }, [checklist]);

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

    const { hygieneScore, loading: isLoading } = dynamicData;
    const scoreColor = hygieneScore > 80 ? 'text-green-600' : hygieneScore > 60 ? 'text-yellow-600' : 'text-red-600';
    const scoreSubtext = hygieneScore > 80 ? 'Excellent' : hygieneScore > 60 ? 'Good' : 'Needs attention';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
                <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 interactive-lift">
                    <div>
                        <CardTitle className="flex items-center gap-3 font-headline"><Network/> Setup Assistant</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl break-words">Get a step-by-step AI-guided roadmap for registering your company, getting your GST number, and more.</CardDescription>
                    </div>
                    <Button asChild size="lg" className="shrink-0 w-full md:w-auto">
                        <Link href="/dashboard/business-setup">Start Setup <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </Card>
            </div>
            <Link href="/dashboard/analytics" className="block"><StatCard title="Legal Hygiene Score" value={`${hygieneScore}`} subtext={scoreSubtext} icon={<ShieldCheck className="h-4 w-4" />} colorClass={scoreColor} isLoading={isLoading} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Upcoming Filings" value={`${dynamicData.filings}`} subtext="In next 30 days" icon={<Calendar className="h-4 w-4" />} isLoading={dynamicData.loading} /></Link>
            <Link href="/dashboard/ai-toolkit" className="block"><StatCard title="Docs Generated" value="0" subtext="All time" icon={<FileText className="h-4 w-4" />} isLoading={false} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Alerts" value={`${dynamicData.alerts}`} subtext={dynamicData.alerts > 0 ? "Overdue tasks" : "No overdue tasks"} icon={<AlertTriangle className="h-4 w-4" />} colorClass={dynamicData.alerts > 0 ? 'text-destructive' : ''} isLoading={dynamicData.loading} /></Link>
            
            <div className="md:col-span-2 lg:col-span-2">
              <ComplianceActivityChart dataByYear={complianceChartDataByYear} />
            </div>

             <Card className="md:col-span-2 lg:col-span-2 interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks /> Compliance Checklist</CardTitle>
                    <CardDescription>Key compliance items for your company, grouped by month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dynamicData.loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-5/6" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : sortedMonths.length > 0 ? (
                        <Accordion type="multiple" defaultValue={sortedMonths.slice(0, 2)} className="w-full">
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
                                                return (
                                                    <div key={item.id} className={cn("flex items-start gap-3 p-3 text-sm rounded-md transition-colors border", isItemOverdue && "bg-destructive/10 border-destructive/20")}>
                                                        <Checkbox
                                                            id={item.id}
                                                            checked={item.completed}
                                                            onCheckedChange={() => handleToggleComplete(item.id)}
                                                            className={cn("mt-1", isItemOverdue && "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive")}
                                                        />
                                                        <div className="flex-1 grid gap-0.5">
                                                            <label htmlFor={item.id} className={cn("font-medium cursor-pointer", item.completed && "line-through text-muted-foreground", isItemOverdue && "text-destructive")}>
                                                                {item.text}
                                                            </label>
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
                            <p>No items yet. AI couldn't generate a checklist.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
    );
}


function CADashboard({ userProfile }: { userProfile: UserProfile }) {
    const clientCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/clients" className="block"><StatCard title="Total Clients" value={`${clientCount}`} subtext="Clients actively managed" icon={<Users className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title="Portfolio Risk" value="N/A" subtext="Risk analysis coming soon" icon={<ShieldCheck className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Pending Actions" value="N/A" subtext="Across all clients" icon={<FileClock className="h-4 w-4" />} /></Link>

            <div className="lg:col-span-3">
                 <ComplianceActivityChart dataByYear={staticChartDataByYear} />
            </div>
            
            <QuickLinkCard title="AI Assistant" description="Generate board resolutions or draft replies to notices using AI tailored for CAs." href="/dashboard/ai-toolkit?tab=assistant" icon={<Sparkles className="text-primary"/>} />
            
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Folders/> Client Filings</CardTitle>
                    <CardDescription>Go to the calendar for a detailed view of all client deadlines.</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/calendar">View Calendar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function LegalAdvisorDashboard({ userProfile }: { userProfile: UserProfile }) {
    const clientCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="AI Document Intelligence" description="Upload a contract to instantly identify risks, find missing clauses, and get redline suggestions." href="/dashboard/ai-toolkit?tab=analyzer" icon={<FileScan className="text-primary"/>} />
            </div>
            <Link href="/dashboard/clients" className="block"><StatCard title="Active Clients" value={`${clientCount}`} subtext="Clients actively managed" icon={<Users className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/ai-toolkit?tab=studio" className="block"><StatCard title="Contracts in Review" value="0" subtext="Across all clients" icon={<ClipboardList className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/documents" className="block"><StatCard title="Redlines Pending" value="0" subtext="Documents awaiting your review" icon={<FileClock className="h-4 w-4" />} /></Link>
            <Link href="/dashboard/ai-toolkit?tab=assistant" className="block"><StatCard title="Notices to Draft" value="0" subtext="Based on recent uploads" icon={<MailWarning className="h-4 w-4" />} /></Link>
            <div className="md:col-span-2 lg:col-span-2">
              <ComplianceActivityChart dataByYear={staticChartDataByYear} />
            </div>
             <Card className="md:col-span-2 lg:col-span-2 interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><RadioTower /> Regulation Watch Digest</CardTitle>
                    <CardDescription>The latest updates from key regulatory bodies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-center text-muted-foreground p-8">
                   <p>No new updates. Use Regulation Watcher to fetch the latest.</p>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/ai-toolkit?tab=watcher">Go to Regulation Watcher</Link>
                    </Button>
                 </CardFooter>
             </Card>
        </div>
    );
}

function EnterpriseDashboard({ userProfile }: { userProfile: UserProfile }) {
    const clientCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Link href="/dashboard/analytics" className="block"><StatCard title="Overall Risk Score" value="N/A" subtext="Connect data sources" icon={<ShieldCheck className="h-4 w-4" />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=audit" className="block"><StatCard title="Data Room Readiness" value="0%" subtext="For upcoming M&A" icon={<GanttChartSquare className="h-4 w-4" />} /></Link>
             <Link href="/dashboard/team" className="block"><StatCard title="Managed Entities" value={`${clientCount}`} subtext="Across the organization" icon={<Users className="h-4 w-4" />} /></Link>
             <div className="lg:col-span-3">
                <ComplianceActivityChart dataByYear={staticChartDataByYear} />
             </div>
             <Card className="lg:col-span-3 interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Network /> Team Activity Feed</CardTitle>
                    <CardDescription>Recent actions taken by your team across all entities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-center text-muted-foreground p-8">
                   <p>No team activity yet.</p>
                </CardContent>
             </Card>
             <QuickLinkCard title="AI Audit Assistant" description="Prepare for SOC2, ISO, or internal audits by validating your documents against compliance checklists." href="/dashboard/ai-toolkit?tab=audit" icon={<Sparkles className="text-primary"/>} />
        </div>
    );
}

function MobileDashboardView({ userProfile }: { userProfile: UserProfile }) {
  const stats = [
    { title: "Risk Score", value: "Low", icon: <ShieldCheck />, color: "text-green-500", href: "/dashboard/analytics" },
    { title: "Upcoming", value: "0", icon: <Calendar />, color: "text-orange-500", href: "/dashboard/calendar" },
    { title: "Generated", value: "0", icon: <FileText />, color: "text-blue-500", href: "/dashboard/ai-toolkit?tab=generator" },
    { title: "Alerts", value: "0", icon: <AlertTriangle />, color: "text-red-500", href: "/dashboard/calendar" },
  ];

  const actions = [
    { title: "Ask AI Assistant", icon: <Sparkles />, href: "/dashboard/ai-toolkit?tab=assistant", color: "bg-blue-100 text-blue-700" },
    { title: "Analyze Document", icon: <FileScan />, href: "/dashboard/ai-toolkit?tab=analyzer", color: "bg-orange-100 text-orange-700" },
    { title: "Dataroom Audit", icon: <GanttChartSquare />, href: "/dashboard/ai-toolkit?tab=audit", color: "bg-purple-100 text-purple-700" },
    { title: "Upload to Vault", icon: <Upload />, href: "/dashboard/documents", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground p-6 shadow-lg interactive-lift">
        <h2 className="text-xl font-semibold">Welcome, {userProfile.name.split(' ')[0]}!</h2>
        <p className="text-sm text-primary-foreground/80 mt-1">Your legal and compliance overview.</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(stat => (
          <Link href={stat.href} key={stat.title} className="block">
            <Card className="interactive-lift h-full text-center">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <div className={cn("mb-2 h-10 w-10 flex items-center justify-center rounded-full", stat.color.replace('text-', 'bg-') + '/20')}>
                    {React.cloneElement(stat.icon, { className: cn("h-5 w-5", stat.color) })}
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-3">
            {actions.map(action => (
                <Link href={action.href} key={action.title}>
                    <Card className="interactive-lift hover:border-primary/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", action.color)}>
                                    {React.cloneElement(action.icon, { className: "h-5 w-5"})}
                                </div>
                                <span className="font-medium text-sm">{action.title}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const { userProfile, addNotification } = useAuth();
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const fetchDashboardDataCalled = React.useRef(false);

  useEffect(() => {
    if (!userProfile) return;
    const fetchDashboardData = async () => {
        const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);
        if (!activeCompany) return;

        try {
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            const response = await generateFilings({
                companyType: activeCompany.type,
                incorporationDate: activeCompany.incorporationDate,
                currentDate: currentDate,
                legalRegion: activeCompany.legalRegion,
            });
            const overdueFilings = response.filings.filter(f => f.status === 'overdue');
            
            const today = new Date();
            const twoWeeksFromNow = new Date();
            twoWeeksFromNow.setDate(today.getDate() + 14);

            const upcomingSoon = response.filings.filter(filing => {
                const dueDate = new Date(filing.date + 'T00:00:00');
                return filing.status === 'upcoming' && dueDate > today && dueDate <= twoWeeksFromNow;
            });

        } catch (error) {
            console.error("Failed to fetch initial dashboard notifications:", error);
        }
    }
    fetchDashboardData();
  }, [userProfile, addNotification]);

  const renderDesktopDashboardByRole = () => {
    if (!userProfile) return <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
         <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    </div>;
    switch (userProfile.role) {
      case 'Founder':
        return <FounderDashboard userProfile={userProfile} />;
      case 'CA':
        return <CADashboard userProfile={userProfile} />;
      case 'Legal Advisor':
        return <LegalAdvisorDashboard userProfile={userProfile} />;
      case 'Enterprise':
        return <EnterpriseDashboard userProfile={userProfile} />;
      default:
        return <FounderDashboard userProfile={userProfile} />;
    }
  };
  
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

  return (
    <>
      <AddCompanyModal isOpen={isAddCompanyModalOpen} onOpenChange={setAddCompanyModalOpen} />
      <div className="flex-col gap-6 hidden md:flex">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight font-headline">
              Welcome, {userProfile?.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s your {userProfile?.role} overview for {activeCompany?.name || 'your company'}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setAddCompanyModalOpen(true)} className="w-full sm:w-auto interactive-lift">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
            </Button>
          </div>
        </div>
        {renderDesktopDashboardByRole()}
      </div>

      <div className="block md:hidden">
        {userProfile && <MobileDashboardView userProfile={userProfile} />}
      </div>
    </>
  );
}
