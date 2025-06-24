
"use client";

import { useEffect, useState } from "react";
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
  Clock,
  Coffee,
  Receipt,
  Ticket,
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/auth";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { format } from "date-fns";

const ComplianceActivityChart = dynamic(
  () => import('@/components/dashboard/compliance-activity-chart').then(mod => mod.ComplianceActivityChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />
  }
);

// --- Helper Components ---

const StatCard = ({ title, value, subtext, icon, colorClass, isLoading }: { title: string, value: string, subtext: string, icon: React.ReactNode, colorClass?: string, isLoading?: boolean }) => (
    <Card className="interactive-lift">
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
                <CardTitle className="flex items-center gap-3">
                    {icon} {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
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

function FounderDashboard({ userProfile }: { userProfile: UserProfile }) {
    const isPro = userProfile.plan !== 'Starter' && userProfile.plan !== 'Free';
    const [dynamicData, setDynamicData] = useState<{
        filings: number;
        checklist: { id: number; text: string; completed: boolean }[];
        riskScore: number;
        alerts: number;
        loading: boolean;
    }>({ filings: 0, checklist: [], riskScore: 0, alerts: 0, loading: true });
    
    const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!activeCompany) {
                setDynamicData(prev => ({ ...prev, loading: false }));
                return;
            }
            setDynamicData(prev => ({ ...prev, loading: true }));

            try {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
                const response = await generateFilings({
                    companyType: activeCompany.type,
                    incorporationDate: activeCompany.incorporationDate,
                    currentDate: currentDate,
                });

                const upcomingFilings = response.filings.filter(f => f.status === 'upcoming');
                const overdueFilings = response.filings.filter(f => f.status === 'overdue');
                
                const checklistItems = response.filings.slice(0, 3).map((filing, index) => ({
                    id: index + 1,
                    text: filing.title,
                    completed: filing.status === 'completed'
                }));

                const riskScore = Math.max(0, 100 - (overdueFilings.length * 20));

                setDynamicData({
                    filings: upcomingFilings.length,
                    checklist: checklistItems,
                    riskScore: riskScore,
                    alerts: overdueFilings.length,
                    loading: false
                });

            } catch (error) {
                console.error("Failed to fetch AI-generated dashboard data:", error);
                setDynamicData({ filings: 0, checklist: [], riskScore: 0, alerts: 0, loading: false });
            }
        }

        fetchDashboardData();
    }, [activeCompany]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
                <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 interactive-lift">
                    <div>
                        <CardTitle className="flex items-center gap-3 font-headline"><Network/> Setup Assistant</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl">Get a step-by-step AI-guided roadmap for registering your company, getting your GST number, and more.</CardDescription>
                    </div>
                    <Button asChild size="lg" className="shrink-0 w-full md:w-auto">
                        <Link href="/dashboard/business-setup">Start Setup <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </Card>
            </div>
            <StatCard title="Risk Score" value={isPro ? `${dynamicData.riskScore}` : "N/A"} subtext="Low Risk" icon={<ShieldCheck className="h-4 w-4" />} colorClass={isPro ? "text-green-600" : ""} isLoading={dynamicData.loading} />
            <StatCard title="Upcoming Filings" value={`${dynamicData.filings}`} subtext="In next 30 days" icon={<Calendar className="h-4 w-4" />} isLoading={dynamicData.loading} />
            <StatCard title="Docs Generated" value="0" subtext="All time" icon={<FileText className="h-4 w-4" />} isLoading={false} />
            <StatCard title="Alerts" value={`${dynamicData.alerts}`} subtext={dynamicData.alerts > 0 ? "Overdue task" : "No overdue tasks"} icon={<AlertTriangle className="h-4 w-4" />} isLoading={dynamicData.loading} />
            
            <div className="md:col-span-2 lg:col-span-2">
              <ComplianceActivityChart />
            </div>

             <Card className="md:col-span-2 lg:col-span-2 interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks /> Compliance Checklist</CardTitle>
                    <CardDescription>Key compliance items for your company.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dynamicData.loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-5/6" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ) : dynamicData.checklist.length > 0 ? (
                        dynamicData.checklist.map(item => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                                <CheckCircle className={cn("h-5 w-5", item.completed ? "text-green-500" : "text-muted-foreground/30")} />
                                <span className={cn(item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                            </div>
                        ))
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
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard title="Client Portfolio Risk" value="N/A" subtext="Connect clients to see risk" icon={<ShieldCheck className="h-4 w-4" />} />
            <StatCard title="Docs Generated" value="0" subtext="This month" icon={<FileText className="h-4 w-4" />} />
            <StatCard title="Pending Actions" value="0" subtext="Across all clients" icon={<FileClock className="h-4 w-4" />} />

            <div className="lg:col-span-3">
                 <ComplianceActivityChart />
            </div>
            
            <QuickLinkCard title="AI Assistant" description="Generate board resolutions or draft replies to notices using AI tailored for CAs." href="/dashboard/ai-copilot" icon={<Sparkles className="text-primary"/>} />
            
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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-4">
                <QuickLinkCard title="AI Contract Analyzer" description="Upload a contract to instantly identify risks, find missing clauses, and get redline suggestions." href="/dashboard/contract-analyzer" icon={<FileScan className="text-primary"/>} />
            </div>
            <StatCard title="Contracts in Review" value="0" subtext="Across all clients" icon={<ClipboardList className="h-4 w-4" />} />
            <StatCard title="Clauses Flagged" value="0" subtext="High-risk clauses found" icon={<Target className="h-4 w-4" />} />
            <StatCard title="Redlines Pending" value="0" subtext="Documents awaiting your review" icon={<FileClock className="h-4 w-4" />} />
            <StatCard title="Notices to Draft" value="0" subtext="Based on recent uploads" icon={<MailWarning className="h-4 w-4" />} />
            <div className="md:col-span-2 lg:col-span-2">
              <ComplianceActivityChart />
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
                        <Link href="/dashboard/regulation-watcher">Go to Regulation Watcher</Link>
                    </Button>
                 </CardFooter>
             </Card>
        </div>
    );
}

function EnterpriseDashboard({ userProfile }: { userProfile: UserProfile }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <StatCard title="Overall Risk Score" value="N/A" subtext="Connect data sources" icon={<ShieldCheck className="h-4 w-4" />} />
             <StatCard title="Data Room Readiness" value="0%" subtext="For upcoming M&amp;A" icon={<GanttChartSquare className="h-4 w-4" />} />
             <StatCard title="Team Tasks" value="0/0" subtext="Completed this week" icon={<Users className="h-4 w-4" />} />
             <div className="lg:col-span-3">
                <ComplianceActivityChart />
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
             <QuickLinkCard title="AI Audit Assistant" description="Prepare for SOC2, ISO, or internal audits by validating your documents against compliance checklists." href="/dashboard/due-diligence" icon={<Sparkles className="text-primary"/>} />
        </div>
    );
}

function MobileDashboardView({ userProfile }: { userProfile: UserProfile }) {
  const isPro = userProfile.plan !== 'Starter' && userProfile.plan !== 'Free';

  const stats = [
    { title: "Risk Score", value: "Low", subtext: "All Good", icon: <ShieldCheck />, color: "text-green-500" },
    { title: "Upcoming", value: "0", subtext: "Filings", icon: <Calendar />, color: "text-orange-500" },
    { title: "Generated", value: "0", subtext: "Documents", icon: <FileText />, color: "text-blue-500" },
    { title: "Alerts", value: "0", subtext: "Overdue", icon: <AlertTriangle />, color: "text-red-500" },
  ];

  const actions = [
    { title: "Ask AI", icon: <Sparkles />, href: "/dashboard/ai-copilot", color: "bg-blue-100 text-blue-600" },
    { title: "New Doc", icon: <FileText />, href: "/dashboard/documents", color: "bg-green-100 text-green-600" },
    { title: "Calendar", icon: <Calendar />, href: "/dashboard/calendar", color: "bg-purple-100 text-purple-600" },
    { title: "Analyze", icon: <FileScan />, href: "/dashboard/contract-analyzer", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground p-4 shadow-lg interactive-lift">
        <h2 className="text-lg font-semibold">Welcome, {userProfile.name.split(' ')[0]}!</h2>
        <p className="text-sm text-primary-foreground/80 mt-1">Here's your legal and compliance overview.</p>
        <Button variant="secondary" className="mt-4 h-9">View Guide</Button>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(stat => (
          <Card key={stat.title} className="interactive-lift">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        {actions.map(action => (
          <Link href={action.href} key={action.title} className="flex flex-col items-center gap-2 interactive-lift p-2 rounded-lg">
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", action.color)}>
              {action.icon}
            </div>
            <span className="text-xs font-medium">{action.title}</span>
          </Link>
        ))}
      </div>

      <Card className="interactive-lift">
        <CardHeader>
          <CardTitle className="text-base">Company Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Company Online</p>
              <p className="text-xs text-muted-foreground">Accepting tasks</p>
            </div>
            <Switch defaultChecked />
          </div>
           <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground">For deadlines</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
      
      <Card className="interactive-lift">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto">View All</Button>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground py-8">
                <p>No recent activity</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function Dashboard() {
  const { userProfile } = useAuth();
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

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
        <h1 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h1>
        {userProfile && <MobileDashboardView userProfile={userProfile} />}
      </div>
    </>
  );
}
