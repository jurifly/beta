
"use client"

import { AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, Area } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Activity, AlertTriangle, ArrowRight, Award, Briefcase, CalendarClock, CheckSquare, FileText, LineChart as LineChartIcon, ListTodo, Loader2, MessageSquare, Scale, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { UserProfile, GenerateDDChecklistOutput, Company } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { generateFilings } from "@/ai/flows/filing-generator-flow"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Deadline = {
    date: string;
    title: string;
    overdue: boolean;
};

// --- Founder Analytics ---
function FounderAnalytics() {
  const { userProfile } = useAuth();
  const [checklistState, setChecklistState] = useState<{ data: GenerateDDChecklistOutput, timestamp: string } | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeCompany) return;
    
    const checklistKey = `ddChecklistData-${activeCompany.id}`;
    try {
        const savedChecklist = localStorage.getItem(checklistKey);
        if (savedChecklist) {
            setChecklistState(JSON.parse(savedChecklist));
        }
    } catch (error) {
        console.error("Failed to parse checklist data from localStorage", error);
        localStorage.removeItem(checklistKey);
    }
    
    const fetchFilings = async () => {
        if (!activeCompany) {
          setIsLoading(false);
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
          });

          const generatedEvents = response.filings.map(filing => ({
            date: filing.date,
            title: filing.title,
            overdue: filing.status === 'overdue'
          }));
          
          setDeadlines(generatedEvents);

        } catch (error) {
            console.error("Failed to fetch AI-generated filings for analytics:", error);
            toast({
                title: "Could not fetch filings",
                description: "There was an error generating analytics data.",
                variant: "destructive"
            });
            setDeadlines([]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchFilings();

  }, [activeCompany, toast]);

  const { completedCount, totalCount, progress: dataroomProgress, pendingItems } = useMemo(() => {
    if (!checklistState?.data) return { completedCount: 0, totalCount: 0, progress: 0, pendingItems: [] };
    
    const allItems = checklistState.data.checklist.flatMap(c => c.items);
    const completedItems = allItems.filter(i => i.status === 'Completed');
    const pending = allItems.filter(i => i.status !== 'Completed').slice(0, 3); // Take top 3 pending
    const totalItems = allItems.length;

    if (totalItems === 0) return { completedCount: 0, totalCount: 0, progress: 0, pendingItems: [] };
    
    return {
      completedCount: completedItems.length,
      totalCount: totalItems,
      progress: Math.round((completedItems.length / totalItems) * 100),
      pendingItems: pending,
    };
  }, [checklistState]);

  const { hygieneScore, filingPerformance, profileCompleteness } = useMemo(() => {
    const totalFilings = deadlines.length;
    const overdueFilings = deadlines.filter(d => d.overdue).length;
    const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings) / totalFilings) * 100 : 100;

    let profileScore = 0;
    if (activeCompany) {
        const requiredFields: (keyof Company)[] = ['name', 'type', 'pan', 'incorporationDate', 'sector', 'location'];
        if (activeCompany.legalRegion === 'India' && ['Private Limited Company', 'One Person Company', 'LLP'].includes(activeCompany.type)) {
            requiredFields.push('cin');
        }
        const filledFields = requiredFields.filter(field => activeCompany[field] && (activeCompany[field] as string).trim() !== '').length;
        profileScore = (filledFields / requiredFields.length) * 100;
    }
    
    const score = Math.round((filingPerf * 0.7) + (profileScore * 0.3));

    return {
        hygieneScore: score || 0,
        filingPerformance: Math.round(filingPerf),
        profileCompleteness: Math.round(profileScore),
    };
  }, [deadlines, activeCompany]);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-3 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><ShieldCheck className="w-6 h-6 text-primary"/> Legal Hygiene Score</CardTitle>
                <CardDescription>An AI-generated score based on your company's legal preparedness and compliance health.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                 {isLoading ? (
                    <>
                        <Skeleton className="h-[140px] w-full rounded-lg" />
                        <div className="lg:col-span-3 space-y-4 w-full">
                            <Skeleton className="h-8 w-full rounded-lg" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </>
                 ) : (
                    <>
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-lg text-center border">
                            <p className="text-6xl font-bold text-primary">{hygieneScore}</p>
                            <p className="text-lg font-medium">Out of 100</p>
                        </div>
                        <div className="lg:col-span-3 space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium"><span>Filing Performance (70% weight)</span><span>{filingPerformance}%</span></div>
                                <Progress value={filingPerformance} />
                                <p className="text-xs text-muted-foreground mt-1">Based on timely completion of compliance calendar tasks.</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium"><span>Profile Completeness (30% weight)</span><span>{profileCompleteness}%</span></div>
                                <Progress value={profileCompleteness} />
                                <p className="text-xs text-muted-foreground mt-1">Based on completeness of your company's records in Settings.</p>
                            </div>
                        </div>
                    </>
                 )}
            </CardContent>
        </Card>

        <Card className="lg:col-span-3 interactive-lift flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckSquare className="w-6 h-6 text-primary"/> Fundraising Readiness</CardTitle>
                <CardDescription>A dynamic checklist to prepare your company for due diligence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                 {checklistState?.data ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-sm font-medium">
                                <Label>{checklistState.data.reportTitle} ({completedCount}/{totalCount})</Label>
                                <span className="font-bold text-primary">{dataroomProgress}%</span>
                           </div>
                           <Progress value={dataroomProgress} />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-2">Pending Items:</h4>
                            <div className="space-y-2">
                                {pendingItems.length > 0 ? (
                                    pendingItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/>
                                            <span>{item.task}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">All items completed!</p>
                                )}
                            </div>
                        </div>
                     </div>
                 ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                        <p>Generate a due diligence list to see your readiness.</p>
                    </div>
                 )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/dashboard/ai-toolkit?tab=audit">
                        Go to Audit Hub <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}

// --- CA Analytics ---
const complianceTrendData = [
  { month: "Jan", compliance: 0 },
  { month: "Feb", compliance: 0 },
  { month: "Mar", compliance: 0 },
  { month: "Apr", compliance: 0 },
  { month: "May", compliance: 0 },
  { month: "Jun", compliance: 0 },
]

function CAAnalytics({ userProfile }: { userProfile: UserProfile }) {
   const clientCount = userProfile.companies.length;

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
                        {clientCount > 0 ? `${clientCount} clients managed` : "No clients added yet"}
                    </p>
                </CardContent>
            </Card>
            <Card className="interactive-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Portfolio Risk</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{clientCount > 0 ? "Low" : "N/A"}</div>
                    <p className="text-xs text-muted-foreground">{clientCount > 0 ? "No overdue filings" : "Add clients to calculate"}</p>
                </CardContent>
            </Card>
            <Card className="interactive-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{clientCount > 0 ? "100%" : "N/A"}</div>
                    <p className="text-xs text-muted-foreground">{clientCount > 0 ? "Across all clients" : "No data available"}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
            <Card className="lg:col-span-3 interactive-lift">
                <CardHeader>
                    <CardTitle>Quarterly Compliance Trend</CardTitle>
                    <CardDescription>Aggregate compliance score across all clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                        <AreaChart data={complianceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                            <Area type="monotone" dataKey="compliance" strokeWidth={2} stroke="hsl(var(--chart-1))" fill="url(#colorCompliance)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 interactive-lift">
                 <CardHeader>
                    <CardTitle>Client Leaderboard</CardTitle>
                    <CardDescription>Filing performance this quarter.</CardDescription>
                </CardHeader>
                <CardContent>
                    {clientCount === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No clients to display.</p>
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground p-8">
                            <p>Leaderboard data coming soon.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

// --- Legal Advisor Analytics ---
function LegalAdvisorAnalytics({ userProfile }: { userProfile: UserProfile }) {
  const clientCount = userProfile.companies.length;
  
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Case Load</CardTitle>
                <CardDescription>Distribution of active matters.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{clientCount}</div>
                <p className="text-xs text-muted-foreground">{clientCount > 0 ? "Total active clients" : "No clients added yet."}</p>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListTodo className="w-5 h-5 text-primary"/> Task Overview</CardTitle>
                <CardDescription>Your active and upcoming legal tasks.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-8">
                <p>No tasks found.</p>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5 text-primary"/> Upcoming Hearings &amp; Deadlines</CardTitle>
                <CardDescription>Key dates for your cases that need your attention.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-8">
                <p>All clear! No upcoming deadlines.</p>
            </CardContent>
        </Card>
    </div>
  )
}


export default function AnalyticsPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const renderAnalyticsByRole = () => {
    switch (userProfile.role) {
      case 'Founder':
        return <FounderAnalytics />;
      case 'CA':
        return <CAAnalytics userProfile={userProfile} />;
      case 'Legal Advisor':
        return <LegalAdvisorAnalytics userProfile={userProfile} />;
      default:
        return <p>No analytics available for this role.</p>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Insights &amp; Analytics</h2>
        <p className="text-muted-foreground">
          Measure and track your legal and compliance performance.
        </p>
      </div>
      {renderAnalyticsByRole()}
    </div>
  )
}
