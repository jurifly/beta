
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Search, Users, AlertTriangle, CheckCircle, Loader2, Briefcase, FileText, View, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";
import { startOfToday, format, addDays } from "date-fns";
import { generateFilings } from "@/ai/flows/filing-generator-flow";
import { InviteClientModal } from "@/components/dashboard/invite-client-modal";

export type ClientHealthInfo = Company & {
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  upcomingDeadlines: { title: string; dueDate: string }[];
};

export default function ClientsPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const router = useRouter();
  const [clientHealthData, setClientHealthData] = useState<ClientHealthInfo[]>([]);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const calculateAllClientHealth = useCallback(async (companies: Company[]) => {
      if (companies.length === 0) {
        setIsLoadingHealth(false);
        setClientHealthData([]);
        return;
      }
      setIsLoadingHealth(true);
      try {
        const healthPromises = companies.map(async (company) => {
          try {
            const filingResponse = await generateFilings({
              companyType: company.type,
              incorporationDate: company.incorporationDate,
              currentDate: format(new Date(), 'yyyy-MM-dd'),
              legalRegion: company.legalRegion,
              gstin: company.gstin,
            });

            const totalFilings = filingResponse.filings.length;
            const savedStatuses = company.checklistStatus || {};
            
            const overdueFilings = filingResponse.filings.filter(filing => {
              const dueDate = new Date(filing.date + 'T00:00:00');
              const uniqueId = `${filing.title}-${filing.date}`.replace(/[^a-zA-Z0-9-]/g, '_');
              const isCompleted = savedStatuses[uniqueId] ?? false;
              return dueDate < startOfToday() && !isCompleted;
            }).length;
            
            const filingPerf = totalFilings > 0 ? ((totalFilings - overdueFilings) / totalFilings) * 100 : 100;
            
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
          } catch (error) {
            console.error(`Failed to calculate health for ${company.name}`, error);
            return { ...company, healthScore: 0, riskLevel: 'High' as const, upcomingDeadlines: [] };
          }
        });
        
        const results = await Promise.all(healthPromises);
        setClientHealthData(results);
        
      } catch (error) {
        console.error("An error occurred while calculating client health:", error);
      } finally {
        setIsLoadingHealth(false);
      }
    }, []);
    
  useEffect(() => {
    const companies = userProfile?.companies;
    if (companies) {
      calculateAllClientHealth(companies);
    } else {
      setIsLoadingHealth(false);
    }
  }, [userProfile?.companies, calculateAllClientHealth]);

  const highRiskClientCount = useMemo(() => {
    return clientHealthData.filter(client => client.riskLevel === 'High').length;
  }, [clientHealthData]);

  const complianceRate = useMemo(() => {
    if (isLoadingHealth || clientHealthData.length === 0) return 0;
    const totalScore = clientHealthData.reduce((acc, client) => acc + client.healthScore, 0);
    return Math.round(totalScore / clientHealthData.length);
  }, [clientHealthData, isLoadingHealth]);

  const filteredClients = useMemo(() => {
      if (!searchTerm) return clientHealthData;
      return clientHealthData.filter(client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [clientHealthData, searchTerm]);

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const clientCount = userProfile.companies.length;
  
  const handleViewDetails = (companyId: string) => {
    router.push(`/dashboard/clients/${companyId}`);
  };


  return (
    <>
      <InviteClientModal isOpen={isInviteModalOpen} onOpenChange={setInviteModalOpen} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
            <p className="text-muted-foreground">
              Manage all your client companies from a single dashboard.
            </p>
          </div>
          <Button className="w-full sm:w-auto interactive-lift" onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite New Client
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="interactive-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Clients</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{clientCount}</div><p className="text-xs text-muted-foreground">{clientCount} {clientCount === 1 ? 'client' : 'clients'} managed</p></CardContent>
          </Card>
          <Card className="interactive-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">High-Risk Clients</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader>
            <CardContent>
              {isLoadingHealth ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{highRiskClientCount}</div>}
              <p className="text-xs text-muted-foreground">Clients with low health scores</p>
            </CardContent>
          </Card>
          <Card className="interactive-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Compliance Rate</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader>
            <CardContent>
              {isLoadingHealth ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{complianceRate}%</div>}
              <p className="text-xs text-muted-foreground">Average portfolio health</p>
            </CardContent>
          </Card>
        </div>

        <Card className="interactive-lift">
          <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                  <CardTitle>All Clients</CardTitle>
                  <CardDescription>An overview of all companies in your portfolio.</CardDescription>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search clients..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
              </div>
          </CardHeader>
          <CardContent>
              {isLoadingHealth ? (
                 <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : clientCount > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((company) => (
                      <TableRow key={company.id} onClick={() => handleViewDetails(company.id)} className="cursor-pointer">
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.type}</TableCell>
                        <TableCell><Badge variant={company.riskLevel === 'High' ? 'destructive' : company.riskLevel === 'Medium' ? 'default' : 'secondary'}>{company.riskLevel}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={(e) => { e.stopPropagation(); handleViewDetails(company.id); }}><View className="mr-2"/>View Workspace</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <Users className="w-16 h-16 text-primary/20"/><p className="font-semibold text-lg">No Clients Found</p><p className="text-sm max-w-sm">Invite a new client to get started.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
