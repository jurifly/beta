
'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ListX,
  Sparkles,
  FileUp,
  Search,
  UserPlus,
  Mail,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { format, startOfToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AddDocRequestModal } from '@/components/dashboard/add-doc-request-modal';
import { ProvideDocumentModal } from '@/components/dashboard/provide-document-modal';
import type { Company, DocumentRequest } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InviteAdvisorModal } from '@/components/dashboard/invite-advisor-modal';
import { InviteClientModal } from '@/components/dashboard/invite-client-modal';


const statusConfig = {
    Overdue: { color: "border-red-500/50 bg-red-500/10 text-red-500", icon: <AlertTriangle className="h-4 w-4" /> },
    Pending: { color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500", icon: <Clock className="h-4 w-4" /> },
    Received: { color: "border-green-500/50 bg-green-500/10 text-green-500", icon: <CheckCircle className="h-4 w-4" /> },
};


const RequestItem = ({ request, onProvide }: { request: DocumentRequest; onProvide: (req: DocumentRequest) => void; }) => {
  const { userProfile } = useAuth();
  const isFounder = userProfile?.role === 'Founder';

  const status = request.status === 'Pending' && new Date(request.dueDate) < startOfToday() ? 'Overdue' : request.status;
  const config = statusConfig[status];

  return (
    <Card className={cn("interactive-lift transition-all", config.color)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 bg-background rounded-md">{config.icon}</div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold">{request.title}</p>
          <div className="text-xs text-muted-foreground">Due {format(new Date(request.dueDate), 'do MMM, yyyy')}</div>
        </div>
        {isFounder && status !== 'Received' && (
            <Button size="sm" onClick={() => onProvide(request)}><FileUp className="mr-2"/>Provide</Button>
        )}
        {request.status === 'Received' && request.providedFile?.url && (
            <Button size="sm" variant="outline" asChild>
                <a href={request.providedFile.url} target="_blank" rel="noopener noreferrer">View</a>
            </Button>
        )}
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ onAddRequest }: { onAddRequest: () => void }) => {
  const { userProfile } = useAuth();
  const isFounder = userProfile?.role === 'Founder';

  return (
    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
        <ListX className="w-16 h-16 text-primary/20"/>
        <p className="font-semibold text-lg">{isFounder ? "No Pending Requests" : "No Document Requests"}</p>
        <p className="text-sm max-w-sm">{isFounder ? "Your advisor hasn't requested any documents yet." : "Request a document from your client to get started."}</p>
        {!isFounder && <Button onClick={onAddRequest}><Plus className="mr-2"/>Request a Document</Button>}
    </div>
  )
}

const FounderActionsCard = ({ onInvite }: { onInvite: () => void }) => {
  const { userProfile } = useAuth();
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

  if (!userProfile || userProfile.role !== 'Founder') return null;

  if (activeCompany?.connectedCaUid) {
      return (
          <Card className="interactive-lift">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Advisor Connected</CardTitle>
                  <CardDescription>You can now collaborate with your advisor on this workspace.</CardDescription>
              </CardHeader>
          </Card>
      );
  }

  return (
      <Card className="interactive-lift bg-muted/50">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Connect with an Advisor</CardTitle>
              <CardDescription>Find a new expert from our marketplace or invite your existing professional to collaborate.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
              <Button asChild>
                  <Link href="/dashboard/ca-connect/marketplace">
                     <Search className="mr-2"/> Find an Advisor
                  </Link>
              </Button>
              <Button onClick={onInvite}>
                  <UserPlus className="mr-2"/> Invite My CA
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/invitations">
                  <Mail className="mr-2"/>View Invitations
                </Link>
              </Button>
          </CardContent>
      </Card>
  )
}

const AdvisorActionsCard = ({ onAddRequest, onInviteClient }: { onAddRequest: () => void; onInviteClient: () => void; }) => {
    const { userProfile } = useAuth();
    if (!userProfile || userProfile.role === 'Founder') return null;

    return (
        <Card className="interactive-lift bg-muted/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Client Management</CardTitle>
                <CardDescription>Manage document requests or invite a new client to your portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <Button onClick={onAddRequest}>
                    <Plus className="mr-2 h-4 w-4"/>Request a Document
                </Button>
                <Button variant="outline" onClick={onInviteClient}>
                    <UserPlus className="mr-2 h-4 w-4"/>Invite a Client
                </Button>
                 <Button variant="outline" asChild>
                    <Link href="/dashboard/invitations">
                        <Mail className="mr-2"/>View Invitations
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};


export default function CaConnectPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [addRequestModalOpen, setAddRequestModalOpen] = useState(false);
  const [provideDocModalOpen, setProvideDocModalOpen] = useState(false);
  const [inviteAdvisorModalOpen, setInviteAdvisorModalOpen] = useState(false);
  const [inviteClientModalOpen, setInviteClientModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

  const activeCompany = useMemo(() => {
    if (!userProfile) return null;
    return userProfile.companies.find(c => c.id === userProfile.activeCompanyId)
  }, [userProfile]);
  
  const handleAddRequest = (data: Omit<DocumentRequest, 'id' | 'status'>) => {
    if (!activeCompany || !userProfile) return;
    const newRequest: DocumentRequest = { ...data, id: Date.now().toString(), status: 'Pending' };
    const updatedCompany: Company = {
      ...activeCompany,
      docRequests: [...(activeCompany.docRequests || []), newRequest]
    };
    updateUserProfile({ companies: userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c) });
    setAddRequestModalOpen(false);
    toast({ title: 'Request Sent!', description: `Your request for "${data.title}" has been sent.` });
  };
  
  const handleProvideDocument = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setProvideDocModalOpen(true);
  };
  
  const handleFileProvided = (file: { id: string; name: string; url: string; }) => {
    if (!activeCompany || !selectedRequest || !userProfile) return;
    const updatedRequest: DocumentRequest = {
        ...selectedRequest,
        status: 'Received',
        providedFile: file
    };
    const updatedCompany: Company = {
        ...activeCompany,
        docRequests: (activeCompany.docRequests || []).map(r => r.id === selectedRequest.id ? updatedRequest : r)
    };
    updateUserProfile({ companies: userProfile.companies.map(c => c.id === activeCompany.id ? updatedCompany : c) });
    setProvideDocModalOpen(false);
    setSelectedRequest(null);
    toast({ title: 'Document Provided!', description: `"${file.name}" has been shared with your advisor.` });
  };


  const { pendingRequests, overdueRequests, completedRequests } = useMemo(() => {
    if (!activeCompany?.docRequests) {
        return { pendingRequests: [], overdueRequests: [], completedRequests: [] };
    }
    const today = startOfToday();
    const requests = activeCompany.docRequests;
    return {
        pendingRequests: requests.filter(r => r.status === 'Pending' && new Date(r.dueDate) >= today).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        overdueRequests: requests.filter(r => r.status === 'Pending' && new Date(r.dueDate) < today).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        completedRequests: requests.filter(r => r.status === 'Received').sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    }
  }, [activeCompany]);

  const allRequests = [...overdueRequests, ...pendingRequests, ...completedRequests];
  const isFounder = userProfile?.role === 'Founder';
  
  return (
    <>
        <AddDocRequestModal isOpen={addRequestModalOpen} onOpenChange={setAddRequestModalOpen} onAddRequest={handleAddRequest} />
        {activeCompany && selectedRequest && (
             <ProvideDocumentModal
                isOpen={provideDocModalOpen}
                onOpenChange={setProvideDocModalOpen}
                onFileProvided={handleFileProvided}
                company={activeCompany}
                docRequest={selectedRequest}
            />
        )}
        <InviteAdvisorModal isOpen={inviteAdvisorModalOpen} onOpenChange={setInviteAdvisorModalOpen} />
        <InviteClientModal isOpen={inviteClientModalOpen} onOpenChange={setInviteClientModalOpen} />
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">Advisor Hub</h1>
                <p className="text-muted-foreground">{isFounder ? "Manage your connection with your advisor and handle document requests." : "Manage document requests for your active client."}</p>
            </div>

            {isFounder ? (
                <FounderActionsCard onInvite={() => setInviteAdvisorModalOpen(true)} />
            ) : (
                <AdvisorActionsCard onAddRequest={() => setAddRequestModalOpen(true)} onInviteClient={() => setInviteClientModalOpen(true)} />
            )}
           
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Document Requests</CardTitle>
                    <CardDescription>
                        {isFounder 
                            ? `Requested from your advisor for ${activeCompany?.name || 'your company'}`
                            : `Requested for your client ${activeCompany?.name || ''}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allRequests.length > 0 ? (
                       <Tabs defaultValue="pending" className="w-full">
                            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                                <TabsTrigger value="pending">Pending ({pendingRequests.length + overdueRequests.length})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending" className="mt-4 space-y-3">
                                {overdueRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />)}
                                {pendingRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />)}
                                {overdueRequests.length === 0 && pendingRequests.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No pending requests. Great work!</p>}
                            </TabsContent>
                             <TabsContent value="completed" className="mt-4 space-y-3">
                                 {completedRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />)}
                                 {completedRequests.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No completed requests yet.</p>}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <EmptyState onAddRequest={() => setAddRequestModalOpen(true)} />
                    )}
                </CardContent>
            </Card>
        </div>
    </>
  );
}
