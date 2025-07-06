
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
  Upload,
  Lightbulb,
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
import { getProactiveInsights, type ProactiveInsightsOutput } from "@/ai/flows/proactive-insights-flow";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend } from "recharts";


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
const staticChartDataByYear = {
    [new Date().getFullYear().toString()]: Array(12).fill(null).map((_, i) => ({ month: new Date(Number(new Date().getFullYear().toString()), i, 1).toLocaleString('default', { month: 'short' }), activity: 0 })),
};

function FounderPortfolioView({ userProfile, onAddCompanyClick }: { userProfile: UserProfile, onAddCompanyClick: () => void }) {
  const router = useRouter();

  if (userProfile.companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] border-2 border-dashed rounded-md bg-muted/40 h-full">
        <Building2 className="w-16 h-16 text-primary/20 mb-4"/>
        <p className="font-semibold text-lg">Welcome to your workspace!</p>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Add your first company to generate a compliance calendar and access AI tools.
        </p>
        <Button onClick={onAddCompanyClick}>
          <Plus className="mr-2 h-4 w-4"/>
          Add Company
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProfile.companies.map((company) => (
          <Link key={company.id} href={`/dashboard/company/${company.id}`} className="block">
            <Card className="interactive-lift h-full flex flex-col">
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>{company.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Badge variant="secondary">{company.legalRegion}</Badge>
              </CardContent>
              <CardFooter>
                <p className="text-sm font-medium text-primary">View Dashboard <ArrowRight className="inline ml-1 h-4 w-4"/></p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}


const riskChartConfig = {
  clients: { label: "Clients" },
  low: { label: "Low", color: "hsl(var(--chart-2))" },
  medium: { label: "Medium", color: "hsl(var(--chart-3))" },
  high: { label: "High", color: "hsl(var(--chart-5))" },
}

function CAAnalytics({ userProfile }: { userProfile: UserProfile }) {
   const clientCount = userProfile.companies.length;
   
    const { avgProfileCompleteness, riskDistribution, clientHealthData, highRiskClientCount } = useMemo(() => {
        if (clientCount === 0) return { avgProfileCompleteness: 0, riskDistribution: [], clientHealthData: [], highRiskClientCount: 0 };
        
        let totalCompleteness = 0;
        const healthData = userProfile.companies.map(company => {
            const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
            if (company.legalRegion === 'India' && ['Private Limited Company', 'One Person Company', 'LLP'].includes(company.type)) {
                requiredFields.push('cin');
            }
            const filledFields = requiredFields.filter(field => company[field] && (company[field] as string).trim() !== '').length;
            const completeness = (filledFields / requiredFields.length) * 100;
            totalCompleteness += completeness;
            
            const overdueTasks = Math.floor(Math.random() * 5); 
            const filingPerf = Math.max(0, 100 - (overdueTasks * 20));
            const healthScore = Math.round((completeness * 0.5) + (filingPerf * 0.5));
            
            let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
            if (healthScore < 60) riskLevel = 'High';
            else if (healthScore < 85) riskLevel = 'Medium';

            return { ...company, completeness, overdueTasks, healthScore, riskLevel };
        });

        const riskCounts = healthData.reduce((acc, client) => {
            if (client.riskLevel === 'Low') acc.low++;
            else if (client.riskLevel === 'Medium') acc.medium++;
            else if (client.riskLevel === 'High') acc.high++;
            return acc;
        }, { low: 0, medium: 0, high: 0 });

        const riskChartData = [
            { name: 'Low', clients: riskCounts.low, fill: "var(--color-low)" },
            { name: 'Medium', clients: riskCounts.medium, fill: "var(--color-medium)" },
            { name: 'High', clients: riskCounts.high, fill: "var(--color-high)" },
        ].filter(d => d.clients > 0);

        return {
            avgProfileCompleteness: Math.round(totalCompleteness / clientCount),
            riskDistribution: riskChartData,
            clientHealthData: healthData.sort((a,b) => a.healthScore - b.healthScore),
            highRiskClientCount: riskCounts.high,
        };
    }, [userProfile.companies, clientCount]);
    
    const [insights, setInsights] = useState<ProactiveInsightsOutput['insights']>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const { toast } = useToast();
    const router = require("next/navigation").useRouter();

     useEffect(() => {
        const fetchInsights = async () => {
            if (clientCount === 0 && avgProfileCompleteness === 0) {
                 try {
                    const response = await getProactiveInsights({
                        userRole: 'CA',
                        legalRegion: userProfile.legalRegion,
                        caContext: {
                            clientCount: 0,
                            highRiskClientCount: 0,
                        }
                    });
                    setInsights(response.insights);
                } catch (error: any) {
                    toast({ title: 'AI Insights Failed', description: error.message, variant: 'destructive' });
                } finally {
                    setInsightsLoading(false);
                }
                return;
            }

            if (clientHealthData.length === 0) return;
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
                toast({ title: 'AI Insights Failed', description: error.message, variant: 'destructive' });
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, [clientCount, highRiskClientCount, userProfile.legalRegion, toast, avgProfileCompleteness, clientHealthData]);


   return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="interactive-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{clientCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {clientCount > 0 ? `${clientCount} ${clientCount === 1 ? 'client' : 'clients'} managed` : "No clients added yet"}
                    </p>
                </CardContent>
            </Card>
            <Card className="interactive-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Profile Completeness</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{avgProfileCompleteness}%</div>
                    <p className="text-xs text-muted-foreground">Average across all clients</p>
                </CardContent>
            </Card>
             <Card className="interactive-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Clients at Risk</CardTitle><FileWarning className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-destructive">{highRiskClientCount}</div><p className="text-xs text-muted-foreground">Clients with a 'High' risk score</p></CardContent>
            </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Portfolio Risk</CardTitle>
                        <CardDescription>Breakdown of client risk levels based on compliance health.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={riskChartConfig} className="mx-auto aspect-square h-52">
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="clients" hideLabel />} />
                            <Pie data={riskDistribution} dataKey="clients" nameKey="name" innerRadius={60} strokeWidth={5} />
                            <Legend content={<ChartTooltipContent nameKey="clients" hideLabel hideIndicator />} />
                        </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <Card className="lg:col-span-3 interactive-lift">
                 <CardHeader>
                    <CardTitle>Client Health Overview</CardTitle>
                    <CardDescription>Prioritize your work by focusing on clients who need the most attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    {clientHealthData.length > 0 ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Profile</TableHead><TableHead>Health Score</TableHead><TableHead className="text-right">Risk Level</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {clientHealthData.map(client => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>{client.completeness.toFixed(0)}%</TableCell>
                                        <TableCell>
                                            <Progress value={client.healthScore} className="w-24 h-2" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={client.riskLevel === 'High' ? 'destructive' : client.riskLevel === 'Medium' ? 'default' : 'secondary'}>{client.riskLevel}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center text-muted-foreground p-8">
                            <p>No clients to display.</p>
                        </div>
                    )}
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
                <QuickLinkCard title="AI Document Analyzer" description="Upload a contract to instantly identify risks, find missing clauses, and get redline suggestions." href="/dashboard/ai-toolkit?tab=analyzer" icon={<FileScan className="text-primary"/>} />
             </div>
             <Link href="/dashboard/clients" className="block"><StatCard title="Active Matters" value="0" subtext="Across all clients" icon={<Briefcase />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=analyzer" className="block"><StatCard title="Contracts Analyzed" value="0" subtext="This month" icon={<ListChecks />} /></Link>
             <Link href="/dashboard/documents" className="block"><StatCard title="Redlines Pending" value="0" subtext="Awaiting your review" icon={<FileSignature />} /></Link>
             <Link href="/dashboard/ai-toolkit?tab=research" className="block"><StatCard title="Legal Research" value="0" subtext="Queries this month" icon={<Scale />} /></Link>
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
    { title: "Upcoming", value: "0", icon: <Calendar />, color: "text-orange-500", href: "/dashboard/ca-connect" },
    { title: "Generated", value: "0", icon: <FileText />, color: "text-blue-500", href: "/dashboard/ai-toolkit?tab=generator" },
    { title: "Alerts", value: "0", icon: <AlertTriangle />, color: "text-red-500", href: "/dashboard/ca-connect" },
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
  const { userProfile, deductCredits } = useAuth();
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
        return <FounderPortfolioView userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} />;
      case 'CA':
        return <CAAnalytics userProfile={userProfile} />;
      case 'Legal Advisor':
        return <LegalAdvisorDashboard userProfile={userProfile} />;
      case 'Enterprise':
        return <EnterpriseDashboard userProfile={userProfile} />;
      default:
        return <FounderPortfolioView userProfile={userProfile} onAddCompanyClick={() => setAddCompanyModalOpen(true)} />;
    }
  };
  
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

  return (
    <>
      <AddCompanyModal isOpen={isAddCompanyModalOpen} onOpenChange={setAddCompanyModalOpen} deductCredits={deductCredits} />
      <div className="flex-col gap-6 hidden md:flex">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight font-headline">
              Welcome, {userProfile?.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s your {userProfile?.role} overview {userProfile?.role === 'Founder' && activeCompany ? `for your companies` : ''}.
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
