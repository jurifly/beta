
'use client';

import { useAuth } from '@/hooks/auth';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, LayoutDashboard, Briefcase, Plus, LineChart } from 'lucide-react';
import ClientDashboardView from './ClientDashboardView';
import { Button } from '@/components/ui/button';
import type { UserProfile, Company, ClientMatter } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddMatterModal } from '@/components/dashboard/add-matter-modal';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { FounderAnalytics } from '../../analytics/AnalyticsViews';

const MattersView = ({ clientCompany }: { clientCompany: Company }) => {
    const { updateUserProfile, userProfile } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [matterToEdit, setMatterToEdit] = useState<ClientMatter | null>(null);

    const matters = clientCompany.matters || [];

    const handleSaveMatter = (data: Omit<ClientMatter, 'id' | 'lastActivity'> & { id?: string }) => {
        if (!userProfile) return;

        let newMatters: ClientMatter[];
        if (data.id) { // Editing
            newMatters = matters.map(m => m.id === data.id ? { ...m, ...data, lastActivity: new Date().toISOString() } : m);
        } else { // Adding
            const newMatter: ClientMatter = { ...data, id: Date.now().toString(), lastActivity: new Date().toISOString() };
            newMatters = [...matters, newMatter];
        }
        
        const updatedCompany: Company = { ...clientCompany, matters: newMatters };
        const updatedCompanies = userProfile.companies.map(c => c.id === clientCompany.id ? updatedCompany : c);
        
        updateUserProfile({ companies: updatedCompanies });
        toast({ title: data.id ? 'Matter Updated!' : 'Matter Created!' });
        setModalOpen(false);
    };

    const openModal = (matter?: ClientMatter) => {
        setMatterToEdit(matter || null);
        setModalOpen(true);
    };

    return (
        <>
            <AddMatterModal
                isOpen={isModalOpen}
                onOpenChange={setModalOpen}
                onSave={handleSaveMatter}
                matterToEdit={matterToEdit}
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Client Matters</CardTitle>
                        <CardDescription>Track specific projects, audits, or advisory work for this client.</CardDescription>
                    </div>
                    <Button onClick={() => openModal()}><Plus className="mr-2"/>New Matter</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Activity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matters.length > 0 ? matters.map(matter => (
                                <TableRow key={matter.id}>
                                    <TableCell className="font-medium">{matter.title}</TableCell>
                                    <TableCell><Badge variant={matter.status === 'Active' ? 'default' : 'secondary'}>{matter.status}</Badge></TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(matter.lastActivity), { addSuffix: true })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => openModal(matter)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No matters created for this client yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}

export default function ClientDetailPage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const companies = Array.isArray(userProfile.companies) ? userProfile.companies : [];
  const clientCompany = companies.find(c => c.id === clientId);

  if (!clientCompany) {
    return <div className="text-center">Client not found.</div>;
  }
  
  const clientViewProfile: UserProfile = {
      ...userProfile,
      role: 'Founder',
      companies: [clientCompany],
      activeCompanyId: clientCompany.id,
  };

  return (
    <div className="space-y-6">
       <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/clients')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">{clientCompany.name}</h1>
                  <p className="text-muted-foreground">Viewing client workspace.</p>
                </div>
            </div>
       </div>
      <Tabs defaultValue="dashboard">
          <TabsList>
              <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2"/>Dashboard</TabsTrigger>
              <TabsTrigger value="analytics"><LineChart className="mr-2"/>Analytics</TabsTrigger>
              <TabsTrigger value="matters"><Briefcase className="mr-2"/>Matters</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
              <ClientDashboardView userProfile={clientViewProfile} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
              <FounderAnalytics />
          </TabsContent>
           <TabsContent value="matters" className="mt-6">
              <MattersView clientCompany={clientCompany} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
