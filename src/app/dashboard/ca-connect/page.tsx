
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Calendar as CalendarIcon,
  Receipt,
  ClipboardCheck,
  Save,
  ListX,
  Send,
  FileUp,
  Zap,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { format, startOfToday, formatDistanceToNowStrict } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AddDocRequestModal } from '@/components/dashboard/add-doc-request-modal';
import { ProvideDocumentModal } from '@/components/dashboard/provide-document-modal';
import type { Company, DocumentRequest } from '@/lib/types';


const HowItWorks = () => {
  const { userProfile } = useAuth();
  const isFounder = userProfile?.role === 'Founder';

  const steps = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "1. Connect with your Advisor",
      description: isFounder 
        ? "Invite your CA or legal professional to the platform using their email address." 
        : "Accept invitations from your founder clients to link your workspaces."
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "2. Request & Provide",
      description: isFounder
        ? "Your advisor requests documents they need. You get notified and can provide them directly from your vault."
        : "Request necessary documents from your clients for compliance tasks. They are notified instantly."
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "3. Track Everything",
      description: "All requests and submissions are tracked in one place, creating a clear audit trail and ensuring deadlines are met."
    }
  ];

  return (
    <Card className="bg-primary/5 border-primary/20 interactive-lift">
        <CardHeader>
            <CardTitle>How CA Connect Works</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
            {steps.map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">{step.icon}</div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-muted-foreground text-xs">{step.description}</p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
};

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
            <Button size="sm" onClick={() => onProvide(request)}><FileUp className="mr-2"/>Provide Document</Button>
        )}
        {request.status === 'Received' && request.providedFile?.url && (
            <Button size="sm" variant="outline" asChild>
                <a href={request.providedFile.url} target="_blank" rel="noopener noreferrer">View Document</a>
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

export default function CaConnectPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [addRequestModalOpen, setAddRequestModalOpen] = useState(false);
  const [provideDocModalOpen, setProvideDocModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

  const activeCompany = useMemo(() => {
    return userProfile?.companies.find(c => c.id === userProfile.activeCompanyId)
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
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h1 className="text-2xl font-bold font-headline">CA Connect</h1>
                <p className="text-muted-foreground">The central hub for all advisor communication and document requests.</p>
            </div>
            {!isFounder && <Button onClick={() => setAddRequestModalOpen(true)}><Plus className="mr-2 h-4 w-4"/>Request a Document</Button>}
            </div>

            <HowItWorks/>

            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Document Requests for {activeCompany?.name || 'your company'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {allRequests.length > 0 ? (
                        <Accordion type="multiple" defaultValue={['overdue', 'pending']} className="w-full">
                            <AccordionItem value="overdue">
                                <AccordionTrigger>Overdue ({overdueRequests.length})</AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-4">
                                    {overdueRequests.length > 0 ? overdueRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />) : <p className="text-sm text-muted-foreground">No overdue requests. Great work!</p>}
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="pending">
                                <AccordionTrigger>Pending ({pendingRequests.length})</AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-4">
                                    {pendingRequests.length > 0 ? pendingRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />) : <p className="text-sm text-muted-foreground">No pending requests.</p>}
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="completed">
                                <AccordionTrigger>Completed ({completedRequests.length})</AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-4">
                                     {completedRequests.length > 0 ? completedRequests.map(req => <RequestItem key={req.id} request={req} onProvide={handleProvideDocument} />) : <p className="text-sm text-muted-foreground">No completed requests yet.</p>}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : (
                        <EmptyState onAddRequest={() => setAddRequestModalOpen(true)} />
                    )}
                </CardContent>
            </Card>
        </div>
    </>
  );
}
