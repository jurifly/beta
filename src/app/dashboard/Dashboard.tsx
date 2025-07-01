
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
  PieChart,
  Briefcase,
  Building2,
  Zap,
  FileSignature,
  Scale,
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
import type { UserProfile, Company, DocumentRequest } from "@/lib/types";
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

const currentYearString = new Date().getFullYear().toString();
const staticChartDataByYear = {
    [currentYearString]: Array(12).fill(null).map((_, i) => ({ month: format(new Date(Number(currentYearString), i, 1), 'MMM'), activity: 0 })),
};

function DocRequestItem({ request, onComplete }: { request: DocumentRequest, onComplete: (id: string) => void }) {
  const isOverdue = new Date(request.dueDate) < startOfToday() && request.status === 'Pending';
  return (
    <div className={cn("flex items-start gap-3 p-3 text-sm rounded-md transition-colors border", isOverdue && "bg-destructive/10 border-destructive/20")}>
      <div className="flex-1 grid gap-0.5">
        <p className={cn("font-medium", isOverdue && "text-destructive")}>{request.title}</p>
        <p className={cn("text-xs", isOverdue ? "text-destructive/80" : "text-muted-foreground")}>
          Due: {format(new Date(request.dueDate), 'do MMM, yyyy')}
        </p>
      </div>
      {request.status === 'Pending' ? (
        <Button size="sm" variant="outline" onClick={() => onComplete(request.id)}>
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      ) : (
        <Badge variant="secondary" className="bg-green-100 text-green-800 self-center">Received</Badge>
      )}
    </div>
  )
}

function FounderDashboard({ userProfile }: { userProfile: UserProfile }) {
    const { toast, updateUserProfile } = useToast();
    const [dynamicData, setDynamicData] = useState({ filings: 0, hygieneScore: 0, alerts: 0, loading: true });
    const [checklist, setChecklist] = useState<DashboardChecklistItem[]>([]);
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

    const docRequests = activeCompany?.docRequests?.filter(r => r.status === 'Pending') || [];

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!activeCompany) {
                setDynamicData({ loading: false, filings: 0, hygieneScore: 0, alerts: 0 });
                setChecklist([]);
                return;
            }
            setDynamicData(prev => ({ ...prev, loading: true }));

            try {
                const response = await generateFilings({
                    companyType: activeCompany.type,
                    incorporationDate: activeCompany.incorporationDate,
                    currentDate: format(new Date(), 'yyyy-MM-dd'),
                    legalRegion: activeCompany.legalRegion,
                });
                
                const storageKey = `dashboard-checklist-${activeCompany.id}`;
                const savedStatuses: Record<string, boolean> = JSON.parse(localStorage.getItem(storageKey) || '{}');
                
                const checklistItems = response.filings.map((f) => ({
                    id: `${f.title}-${f.date}`, text: f.title, dueDate: f.date, completed: savedStatuses[`${f.title}-${f.date}`] ?? false
                }));
                setChecklist(checklistItems);
                
                const today = startOfToday();
                const upcomingFilings = checklistItems.filter(item => !item.completed && new Date(item.dueDate) >= today && new Date(item.dueDate) <= addDays(today, 30));
                const overdueFilings = checklistItems.filter(item => !item.completed && new Date(item.dueDate) < today);

                const totalFilings = checklistItems.length;
                const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings.length) / totalFilings) * 100 : 100;
                
                let profileCompleteness = 0;
                const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
                if (activeCompany.legalRegion === 'India') requiredFields.push('cin');
                const filledFields = requiredFields.filter(field => activeCompany[field] && String(activeCompany[field]).trim() !== '').length;
                profileCompleteness = (filledFields / requiredFields.length) * 100;
                
                const score = Math.round((filingPerf * 0.7) + (profileCompleteness * 0.3));

                setDynamicData({
                    filings: upcomingFilings.length, hygieneScore: score, alerts: overdueFilings.length, loading: false
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setDynamicData({ filings: 0, hygieneScore: 0, alerts: 0, loading: false });
            }
        }
        fetchDashboardData();
    }, [activeCompany]);

    const handleToggleComplete = (itemId: string) => {
        if (!activeCompany) return;
        const newChecklist = checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
        setChecklist(newChecklist);

        const newStatuses = newChecklist.reduce((acc, item) => ({ ...acc, [item.id]: item.completed }), {});
        localStorage.setItem(`dashboard-checklist-${activeCompany.id}`, JSON.stringify(newStatuses));
    };

    const handleCompleteRequest = async (requestId: string) => {
        if (!userProfile || !activeCompany) return;
    
        const updatedDocRequests = (activeCompany.docRequests || []).map(req => 
          req.id === requestId ? { ...req, status: 'Received' as const } : req
        );
      
        const updatedCompany: Company = { ...activeCompany, docRequests: updatedDocRequests };
        
        const updatedCompanies = userProfile.companies.map(c => 
          c.id === activeCompany.id ? updatedCompany : c
        );
        
        await updateUserProfile({ companies: updatedCompanies });

        toast({
          title: "Document Marked as Uploaded",
          description: "Your advisor has been notified.",
        });
    };
    
    const groupedChecklist = useMemo(() => {
        const grouped = checklist.reduce((acc, item) => {
            const monthKey = format(new Date(item.dueDate), 'MMMM yyyy');
            (acc[monthKey] = acc[monthKey] || []).push(item);
            return acc;
        }, {} as Record<string, DashboardChecklistItem[]>);

        Object.values(grouped).forEach(monthItems => monthItems.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        return grouped;
    }, [checklist]);

    const sortedMonths = useMemo(() => Object.keys(groupedChecklist).sort((a,b) => new Date(a).getTime() - new Date(b).getTime()), [groupedChecklist]);
    
    const complianceChartDataByYear = useMemo(() => {
        const data: Record<string, { month: string; activity: number }[]> = {};
        if (!activeCompany) {
            const currentYear = new Date().getFullYear().toString();
             data[currentYear] = Array(12).fill(0).map((_, i) => ({ month: format(new Date(Number(currentYear), i), 'MMM'), activity: 0 }));
            return data;
        };

        const currentYear = new Date().getFullYear();
        const incorporationYear = new Date(activeCompany.incorporationDate).getFullYear();

        // Ensure all years from incorporation to current year are present
        if (!isNaN(incorporationYear)) {
            for (let year = incorporationYear; year <= currentYear; year++) {
                data[year.toString()] = Array(12).fill(0).map((_, i) => ({ month: format(new Date(year, i), 'MMM'), activity: 0 }));
            }
        }
        
        // If there are no years (e.g. invalid date), at least show the current year
        if (Object.keys(data).length === 0) {
            data[currentYear.toString()] = Array(12).fill(0).map((_, i) => ({ month: format(new Date(currentYear, i), 'MMM'), activity: 0 }));
        }

        checklist.forEach(item => {
            if (item.completed) {
                // adding T00:00:00 to avoid timezone issues where it might become the previous day
                const date = new Date(item.dueDate + 'T00:00:00');
                const year = date.getFullYear().toString();
                if (data[year]) { // only populate if year exists in our range
                    data[year][date.getMonth()].activity++;
                }
            }
        });
        return data;
    }, [checklist, activeCompany]);

    const { hygieneScore, loading: isLoading } = dynamicData;
    const scoreColor = hygieneScore > 80 ? 'text-green-600' : hygieneScore > 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
                <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 interactive-lift">
                    <div>
                        <CardTitle className="flex items-center gap-3 font-headline"><Network/> Setup Assistant</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl break-words">Get a step-by-step AI-guided roadmap for registering your company.</CardDescription>
                    </div>
                    <Button asChild size="lg" className="shrink-0 w-full md:w-auto"><Link href="/dashboard/business-setup">Start Setup <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                </Card>
            </div>
            <Link href="/dashboard/analytics" className="block"><StatCard title="Legal Hygiene Score" value={`${hygieneScore}`} subtext={hygieneScore > 80 ? 'Excellent' : 'Good'} icon={<ShieldCheck />} colorClass={scoreColor} isLoading={isLoading} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Upcoming Filings" value={`${dynamicData.filings}`} subtext="In next 30 days" icon={<Calendar />} isLoading={dynamicData.loading} /></Link>
            <Link href="/dashboard/cap-table" className="block"><StatCard title="Equity Issued" value="0%" subtext="Founder shares" icon={<PieChart />} isLoading={false} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Alerts" value={`${dynamicData.alerts}`} subtext="Overdue tasks" icon={<AlertTriangle />} colorClass={dynamicData.alerts > 0 ? 'text-destructive' : ''} isLoading={dynamicData.loading} /></Link>
            
            <div className="md:col-span-2 lg:col-span-2"><ComplianceActivityChart dataByYear={complianceChartDataByYear} /></div>

             <Card className="md:col-span-2 lg:col-span-2 interactive-lift">
                <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks /> Compliance Checklist</CardTitle><CardDescription>Key compliance items for your company.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-5/6" /></div>
                    : sortedMonths.length > 0 ? (
                        <Accordion type="multiple" defaultValue={sortedMonths.slice(0, 1)} className="w-full">
                            {sortedMonths.map(month => (
                                <AccordionItem value={month} key={month}>
                                    <AccordionTrigger className="text-base font-semibold">{month}</AccordionTrigger>
                                    <AccordionContent>{groupedChecklist[month].map(item => (
                                        <div key={item.id} className="flex items-start gap-3 p-3 text-sm rounded-md"><Checkbox id={item.id} checked={item.completed} onCheckedChange={() => handleToggleComplete(item.id)} className="mt-1" /><div className="grid gap-0.5"><label htmlFor={item.id} className={cn("font-medium", item.completed && "line-through text-muted-foreground")}>{item.text}</label><span className="text-xs text-muted-foreground">Due: {format(new Date(item.dueDate), 'do MMM, yyyy')}</span></div></div>
                                    ))}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : <p className="text-center text-muted-foreground p-8">No items found.</p>}
                </CardContent>
             </Card>

             {docRequests.length > 0 && (
              <Card className="md:col-span-2 lg:col-span-4 interactive-lift">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FileSignature/> Document Requests</CardTitle>
                      <CardDescription>Your advisor has requested the following documents.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      {docRequests.map(req => <DocRequestItem key={req.id} request={req} onComplete={handleCompleteRequest} />)}
                  </CardContent>
              </Card>
             )}
        </div>
    );
}

function CADashboard({ userProfile }: { userProfile: UserProfile }) {
    const clientCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/clients" className="block"><StatCard title="Total Clients" value={`${clientCount}`} subtext="Clients actively managed" icon={<Users />} /></Link>
            <Link href="/dashboard/analytics" className="block"><StatCard title="Portfolio Risk" value="N/A" subtext="Risk analysis coming soon" icon={<ShieldCheck />} /></Link>
            <Link href="/dashboard/calendar" className="block"><StatCard title="Pending Actions" value="N/A" subtext="Across all clients" icon={<FileClock />} /></Link>
            <Link href="/dashboard/ai-toolkit?tab=assistant" className="block"><StatCard title="AI Credits Used" value={`${1000 - (userProfile.credits ?? 1000)}`} subtext="This billing cycle" icon={<Sparkles />} /></Link>

            <div className="md:col-span-4 lg:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>
            
            <div className="md:col-span-2 lg:col-span-4"><QuickLinkCard title="AI Financial Reconciliation" description="Upload GST, ROC, and ITR filings to automatically find discrepancies and ensure financial accuracy." href="/dashboard/ai-toolkit?tab=reconciliation" icon={<Scale className="text-primary"/>} /></div>
        </div>
    );
}

function LegalAdvisorDashboard({ userProfile }: { userProfile: UserProfile }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-4">
                 <QuickLinkCard title="AI Document Analyzer" description="Upload a contract to instantly identify risks, find missing clauses, and get redline suggestions." href="/dashboard/ai-toolkit?tab=analyzer" icon={<FileScan className="text-primary"/>} />
            </div>
            <Link href="/dashboard/clients" className="block"><StatCard title="Active Matters" value="0" subtext="Across all clients" icon={<Briefcase />} /></Link>
            <Link href="/dashboard/ai-toolkit?tab=analyzer" className="block"><StatCard title="Contracts Analyzed" value="0" subtext="This month" icon={<ClipboardList />} /></Link>
            <Link href="/dashboard/documents" className="block"><StatCard title="Redlines Pending" value="0" subtext="Awaiting your review" icon={<FileClock />} /></Link>
            <Link href="/dashboard/ai-toolkit?tab=assistant" className="block"><StatCard title="Notices to Draft" value="0" subtext="Based on recent uploads" icon={<MailWarning />} /></Link>
            <div className="md:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>
        </div>
    );
}

function EnterpriseDashboard({ userProfile }: { userProfile: UserProfile }) {
    const entityCount = userProfile.companies.length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <Link href="/dashboard/team" className="block"><StatCard title="Managed Entities" value={`${entityCount}`} subtext="Across the organization" icon={<Building2 />} /></Link>
             <Link href="/dashboard/analytics" className="block"><StatCard title="Overall Risk Score" value="N/A" subtext="Connect data sources" icon={<ShieldCheck />} /></Link>
             <Link href="/dashboard/team" className="block"><StatCard title="Pending Approvals" value="0" subtext="In your workflows" icon={<Users />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=audit" className="block"><StatCard title="Data Room Readiness" value="N/A" subtext="For upcoming M&A" icon={<GanttChartSquare />} /></Link>
             
             <div className="lg:col-span-4"><ComplianceActivityChart dataByYear={staticChartDataByYear} /></div>

             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="AI Audit Assistant" description="Prepare for SOC2, ISO, or internal audits by validating your documents against compliance checklists." href="/dashboard/ai-toolkit?tab=audit" icon={<Sparkles className="text-primary"/>} />
             </div>
             <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="Workflow Automation" description="Create powerful automations to streamline compliance processes and approvals." href="/dashboard/ai-toolkit?tab=workflows" icon={<Zap className="text-primary"/>} />
             </div>
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
  const { userProfile, updateUserProfile } = useAuth();
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  const renderDesktopDashboardByRole = () => {
    if (!userProfile) return <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-4 gap-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" /></div>
    </div>;
    switch (userProfile.role) {
      case 'Founder': return <FounderDashboard userProfile={userProfile} />;
      case 'CA': return <CADashboard userProfile={userProfile} />;
      case 'Legal Advisor': return <LegalAdvisorDashboard userProfile={userProfile} />;
      case 'Enterprise': return <EnterpriseDashboard userProfile={userProfile} />;
      default: return <FounderDashboard userProfile={userProfile} />;
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
                <Plus className="mr-2 h-4 w-4" /> Add Company
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
