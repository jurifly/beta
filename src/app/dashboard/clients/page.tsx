
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Search, Users, AlertTriangle, CheckCircle, Loader2, Briefcase, FileText, View } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function ClientsPage() {
  const { userProfile, deductCredits } = useAuth();
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const router = useRouter();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const clientCount = userProfile.companies.length;
  
  const handleViewDetails = (companyId: string) => {
    router.push(`/dashboard/clients/${companyId}`);
  };


  return (
    <>
      <AddCompanyModal isOpen={isAddCompanyModalOpen} onOpenChange={setAddCompanyModalOpen} deductCredits={deductCredits} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
            <p className="text-muted-foreground">
              Manage all your client companies from a single dashboard.
            </p>
          </div>
          <Button className="w-full sm:w-auto interactive-lift" onClick={() => setAddCompanyModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Clients</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{clientCount}</div><p className="text-xs text-muted-foreground">{clientCount} {clientCount === 1 ? 'client' : 'clients'} managed</p></CardContent></Card>
          <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">High-Risk Clients</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold">N/A</div><p className="text-xs text-muted-foreground">Risk analysis coming soon</p></CardContent></Card>
          <Card className="interactive-lift"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Compliance Rate</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">N/A</div><p className="text-xs text-muted-foreground">Calculated from client filings</p></CardContent></Card>
        </div>

        <Card className="interactive-lift">
          <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                  <CardTitle>All Clients</CardTitle>
                  <CardDescription>An overview of all companies in your portfolio.</CardDescription>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search clients..." className="pl-10" /></div>
              </div>
          </CardHeader>
          <CardContent>
              {clientCount > 0 ? (
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
                    {userProfile.companies.map((company) => (
                      <TableRow key={company.id} onClick={() => handleViewDetails(company.id)} className="cursor-pointer">
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.type}</TableCell>
                        <TableCell><Badge variant="secondary" className="bg-green-100 text-green-700">Low</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleViewDetails(company.id)}><View className="mr-2"/>View Dashboard</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <Users className="w-16 h-16 text-primary/20"/><p className="font-semibold text-lg">No Clients Found</p><p className="text-sm max-w-sm">Add a new client to get started by clicking the button above.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
