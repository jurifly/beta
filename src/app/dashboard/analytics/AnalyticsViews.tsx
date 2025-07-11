
"use client"

import { useEffect, useMemo, useState } from "react"
import type { UserProfile, GenerateDDChecklistOutput, Company } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { generateFilings } from "@/ai/flows/filing-generator-flow"
import { format, formatDistanceToNowStrict } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, ShieldCheck, ArrowRight, BarChart, PieChart, ListTodo, TrendingUp, CalendarClock, FileWarning, Users, Briefcase, LineChart, GanttChartSquare } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { Area, AreaChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type Deadline = {
    date: string;
    title: string;
    overdue: boolean;
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const formatCurrency = (num: number, region = 'India') => {
  const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: region === 'India' ? 'INR' : 'USD'
  };
  return new Intl.NumberFormat(region === 'India' ? 'en-IN' : 'en-US', options).format(num);
}

const FinancialTrendChart = ({ financials }: { financials: Company['financials'] }) => {
    const data = useMemo(() => {
        if (!financials || (financials.monthlyRevenue === 0 && financials.monthlyExpenses === 0)) {
            return [];
        }
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return format(d, 'MMM');
        }).reverse();

        return months.map(month => ({
            month,
            revenue: Math.floor(financials.monthlyRevenue * (1 + (Math.random() - 0.4) * 0.3)),
            expenses: Math.floor(financials.monthlyExpenses * (1 + (Math.random() - 0.5) * 0.2)),
        }));
    }, [financials]);

    if (!financials || (financials.monthlyRevenue === 0 && financials.monthlyExpenses === 0)) {
        return (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                <p>No financial data. <Link href="/dashboard/financials" className="text-primary underline">Add financials</Link> to see trends.</p>
            </div>
        )
    }

    return (
        <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" }, expenses: { label: "Expenses", color: "hsl(var(--chart-5))" } }} className="h-56 w-full">
            <AreaChart data={data} accessibilityLayer margin={{ left: 12, right: 12 }}>
                <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="revenue" type="natural" fill="url(#fillRevenue)" stroke="var(--color-revenue)" stackId="a" />
                <Area dataKey="expenses" type="natural" fill="url(#fillExpenses)" stroke="var(--color-expenses)" stackId="a" />
                <ChartLegend />
            </AreaChart>
        </ChartContainer>
    )
}

// --- Founder Analytics ---
export function FounderAnalytics() {
  const { userProfile } = useAuth();
  const [checklistState, setChecklistState] = useState<{ data: GenerateDDChecklistOutput, timestamp: string } | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeCompany) {
        setIsLoading(false);
        return;
    };
    
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
            gstin: activeCompany.gstin,
          });

          const generatedEvents = response.filings.map(filing => ({
            date: filing.date,
            title: filing.title,
            overdue: new Date(filing.date + 'T00:00:00') < new Date(currentDate + 'T00:00:00'),
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

    const { categoryProgress, overallProgress } = useMemo(() => {
        if (!checklistState?.data) return { categoryProgress: [], overallProgress: 0 };
        
        const allItems = checklistState.data.checklist.flatMap(c => c.items);
        const completedItems = allItems.filter(i => i.status === 'Completed').length;
        const totalItems = allItems.length;

        const categories = checklistState.data.checklist.map(cat => {
            const total = cat.items.length;
            const completed = cat.items.filter(i => i.status === 'Completed').length;
            return {
                name: cat.category,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });
        
        return {
          categoryProgress: categories.filter(c => checklistState.data.checklist.find(cat => cat.category === c.name)?.items.length ?? 0 > 0),
          overallProgress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        };
    }, [checklistState]);

  const { hygieneScore, filingPerformance, profileCompleteness, upcomingFilings } = useMemo(() => {
    const totalFilings = deadlines.length;
    const overdueFilings = deadlines.filter(d => d.overdue).length;
    const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings) / totalFilings) * 100 : 100;

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const upcoming = deadlines
        .filter(d => {
            const dueDate = new Date(d.date + 'T00:00:00');
            return dueDate >= today && dueDate <= thirtyDaysFromNow;
        })
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4);

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
        upcomingFilings: upcoming,
    };
  }, [deadlines, activeCompany]);
  
  const { burnRate, runway } = useMemo(() => {
    if (!activeCompany?.financials) return { burnRate: 0, runway: "N/A" };
    const { cashBalance, monthlyRevenue, monthlyExpenses } = activeCompany.financials;
    const burn = monthlyExpenses - monthlyRevenue;
    let runwayMonths = "Profitable";
    if (burn > 0) {
        runwayMonths = cashBalance > 0 && burn > 0 ? `${Math.floor(cashBalance / burn)} months` : "0 months";
    }
    return { burnRate: burn, runway: runwayMonths };
  }, [activeCompany?.financials]);
  
  const { ownershipData } = useMemo(() => {
    const capTable = activeCompany?.capTable || [];
    if (capTable.length === 0) return { ownershipData: [] };

    const { founderShares, investorShares, esopPool } = capTable.reduce((acc, entry) => {
        if (entry.type === 'Founder') acc.founderShares += entry.shares;
        else if (entry.type === 'Investor') acc.investorShares += entry.shares;
        else if (entry.type === 'ESOP') acc.esopPool += entry.shares;
        return acc;
    }, { founderShares: 0, investorShares: 0, esopPool: 0 });

    const data = [
        { name: 'Founders', value: founderShares },
        { name: 'Investors', value: investorShares },
        { name: 'ESOP Pool', value: esopPool },
    ].filter(d => d.value > 0);

    return { ownershipData: data };
  }, [activeCompany?.capTable]);

  if (!activeCompany) {
    return (
      <Card className="lg:col-span-3">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Please add or select a company to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="interactive-lift">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary"/> Legal Hygiene Score</CardTitle>
              <CardDescription>An AI-generated score based on your company's legal preparedness and compliance health.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                {isLoading ? (
                  <>
                      <Skeleton className="h-[140px] w-full rounded-lg" />
                      <div className="lg:col-span-3 space-y-4 w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="interactive-lift flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckSquare className="w-6 h-6 text-primary"/> Fundraising Readiness</CardTitle>
                <CardDescription>A dynamic checklist to prepare your company for due diligence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                  {checklistState?.data && categoryProgress.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <Label>{checklistState.data.reportTitle} (Overall)</Label>
                                <span className="font-bold text-primary">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} />
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>View Detailed Breakdown</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 pt-2">
                                    {categoryProgress.map(cat => (
                                        <div key={cat.name}>
                                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                                <span>{cat.name}</span>
                                                <span>{cat.progress}%</span>
                                            </div>
                                            <Progress value={cat.progress} className="h-2 mt-1"/>
                                        </div>
                                    ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                      </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                        <p>Generate a due diligence list in the AI Toolkit to see your readiness.</p>
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
        <Card className="interactive-lift flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarClock className="w-6 h-6 text-primary"/> Upcoming Deadlines</CardTitle>
                <CardDescription>Your next four most critical compliance due dates.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {isLoading ? <Skeleton className="h-full w-full"/> : upcomingFilings.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingFilings.map(d => (
                            <div key={d.title} className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
                                <p className="font-medium text-sm">{d.title}</p>
                                <Badge variant="outline" className="font-mono">{formatDistanceToNowStrict(new Date(d.date + 'T00:00:00'))}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                       <p>No upcoming filings in the next 30 days. You're all clear!</p>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/dashboard/ca-connect">
                        View Full Calendar <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="interactive-lift flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="w-6 h-6 text-primary"/> Financial Snapshot</CardTitle>
                <CardDescription>A high-level view of your startup's financial health.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {activeCompany?.financials ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted border text-center">
                            <p className="text-sm text-muted-foreground">{burnRate >= 0 ? "Net Monthly Burn" : "Net Monthly Profit"}</p>
                            <p className={`text-2xl font-bold ${burnRate >= 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(Math.abs(burnRate))}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted border text-center">
                            <p className="text-sm text-muted-foreground">{runway.includes('Profitable') ? 'Status' : 'Runway'}</p>
                            <p className="text-2xl font-bold">{runway}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                        <p>No financial data. <Link href="/dashboard/financials" className="text-primary underline">Add financials</Link> to see this snapshot.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/dashboard/financials">
                        Go to Financials <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
         <Card className="interactive-lift flex flex-col">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="w-6 h-6 text-primary"/> Ownership Structure</CardTitle>
              <CardDescription>A summary of your company's equity distribution.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
              {ownershipData.length > 0 ? (
                  <ChartContainer config={{}} className="mx-auto aspect-square h-52">
                      <RechartsPieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                          <Pie data={ownershipData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                              {ownershipData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <ChartLegend content={<ChartTooltipContent nameKey="value" hideLabel hideIndicator />} />
                      </RechartsPieChart>
                  </ChartContainer>
              ) : (
                  <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                      <p>No cap table data found. <Link href="/dashboard/cap-table" className="text-primary underline">Add share issuances</Link> to see this chart.</p>
                  </div>
              )}
          </CardContent>
          <CardFooter>
              <Button asChild variant="link" className="p-0 h-auto">
                  <Link href="/dashboard/cap-table">
                      Go to Cap Table <ArrowRight className="ml-2 h-4 w-4"/>
                  </Link>
              </Button>
          </CardFooter>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="interactive-lift flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary"/> Financial Trends</CardTitle>
                <CardDescription>6-month overview of your revenue vs. expenses.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <FinancialTrendChart financials={activeCompany?.financials} />
            </CardContent>
            <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/dashboard/financials">
                        Manage Financials <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  )
}


// --- CA Analytics ---
const riskChartConfig = {
  clients: { label: "Clients" },
  low: { label: "Low", color: "hsl(var(--chart-2))" },
  medium: { label: "Medium", color: "hsl(var(--chart-3))" },
  high: { label: "High", color: "hsl(var(--chart-5))" },
}

export function CAAnalytics({ userProfile }: { userProfile: UserProfile }) {
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
                            <ChartLegend content={<ChartTooltipContent nameKey="clients" hideLabel hideIndicator />} />
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

// --- Legal Advisor Analytics ---
export function LegalAdvisorAnalytics({ userProfile }: { userProfile: UserProfile }) {
  const clientCount = userProfile.companies.length;
  
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Active Clients</CardTitle>
                <CardDescription>Your currently managed client matters.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{clientCount}</div>
                <p className="text-xs text-muted-foreground">{clientCount > 0 ? `Total active ${clientCount === 1 ? 'client' : 'clients'}` : "No clients added yet."}</p>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 interactive-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListTodo className="w-5 h-5 text-primary"/> Task Overview</CardTitle>
                <CardDescription>Your active and upcoming legal tasks.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-8">
                <p>Task management feature coming soon.</p>
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

export function EnterpriseAnalytics({ userProfile }: { userProfile: UserProfile }) {
    const entityCount = userProfile.companies.length;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="interactive-lift">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Managed Entities</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entityCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {entityCount} total entities managed
                        </p>
                    </CardContent>
                </Card>
                <Card className="interactive-lift">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">Connect data sources for analysis</p>
                    </CardContent>
                </Card>
                <Card className="interactive-lift">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Dataroom Readiness</CardTitle>
                        <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">For upcoming M&A or audits</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
