
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Search, Users, AlertTriangle, CheckCircle, Loader2, Send, Briefcase, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Company, ClientMatter } from "@/lib/types";

const ClientDetailsModal = ({ isOpen, onOpenChange, company }: { isOpen: boolean, onOpenChange: (open: boolean) => void, company: Company | null }) => {
  if (!company) return null;
  
  const matters: ClientMatter[] = company.matters || [
    { id: '1', title: 'Series A Funding Round', status: 'Active', lastActivity: '2 days ago' },
    { id: '2', title: 'Vendor Contract Dispute', status: 'On Hold', lastActivity: '1 month ago' },
  ];
  
  const docRequests = [
    { id: '1', title: 'Signed Term Sheet', status: 'Pending' },
    { id: '2', 'title': 'Board Resolution for Allotment', status: 'Received' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
          <DialogDescription>Details, matters, and document requests for this client.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="matters" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matters">Matters</TabsTrigger>
            <TabsTrigger value="requests">Document Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="matters" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Active Matters</CardTitle>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2"/>New Matter</Button>
              </CardHeader>
              <CardContent>
                  {matters.map(matter => (
                    <div key={matter.id} className="p-2 border-b flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{matter.title}</p>
                          <p className="text-xs text-muted-foreground">Last activity: {matter.lastActivity}</p>
                        </div>
                        <Badge variant={matter.status === 'Active' ? 'default' : 'secondary'} className={matter.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>{matter.status}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests" className="mt-4">
              <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Document Requests</CardTitle>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2"/>New Request</Button>
              </CardHeader>
              <CardContent>
                  {docRequests.map(req => (
                    <div key={req.id} className="p-2 border-b flex justify-between items-center">
                        <p className="font-medium text-sm">{req.title}</p>
                        <Badge variant={req.status === 'Pending' ? 'outline' : 'secondary'} className={req.status === 'Pending' ? 'border-yellow-500/50 text-yellow-600' : 'bg-green-100 text-green-800'}>{req.status}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


export default function ClientsPage() {
  const { userProfile } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const clientCount = userProfile.companies.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(userProfile.companies.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };
  
  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setDetailsModalOpen(true);
  };
  
  const handleBulkSendReminder = () => {
    toast({
      title: "Reminders Sent!",
      description: `Sent filing reminders to ${selectedClients.length} client(s).`,
    });
  };

  return (
    <>
      <AddCompanyModal isOpen={isModalOpen} onOpenChange={setModalOpen} />
      <ClientDetailsModal isOpen={isDetailsModalOpen} onOpenChange={setDetailsModalOpen} company={selectedCompany} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Workspace</h2>
            <p className="text-muted-foreground">
              Manage all your client companies from a single dashboard.
            </p>
          </div>
          <Button className="w-full sm:w-auto interactive-lift" onClick={() => setModalOpen(true)}>
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
                  {selectedClients.length > 0 && <Button variant="outline" onClick={handleBulkSendReminder}><Send className="mr-2"/> Send Reminder</Button>}
              </div>
          </CardHeader>
          <CardContent>
              {clientCount > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={selectedClients.length === clientCount && clientCount > 0} /></TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfile.companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell><Checkbox onCheckedChange={(checked) => handleSelectClient(company.id, !!checked)} checked={selectedClients.includes(company.id)} /></TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.type}</TableCell>
                        <TableCell><Badge variant="secondary" className="bg-green-100 text-green-700">Low</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleViewDetails(company)}><Briefcase className="mr-2"/>View Details</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="mr-2"/>Manage Filings</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <Users className="w-16 h-16 text-primary/20"/><p className="font-semibold text-lg">No Clients Found</p><p className="text-sm max-w-sm">Add a new client to get started.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
