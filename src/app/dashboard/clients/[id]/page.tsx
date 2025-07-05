
'use client';

import { useAuth } from '@/hooks/auth';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import ClientDashboardView from './ClientDashboardView';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/lib/types';

export default function ClientDetailPage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const clientCompany = userProfile.companies.find(c => c.id === clientId);

  if (!clientCompany) {
    return <div className="text-center">Client not found.</div>;
  }
  
  // This is a proxy UserProfile object that makes the FounderDashboard think it's looking at a Founder.
  // We pass the specific client company as the only company in the list.
  const clientViewProfile: UserProfile = {
      ...userProfile, // Inherit CA's profile for plan, etc.
      role: 'Founder', // Simulate founder view
      companies: [clientCompany],
      activeCompanyId: clientCompany.id,
  };


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clientCompany.name}</h1>
          <p className="text-muted-foreground">Viewing client dashboard.</p>
        </div>
      </div>
      <ClientDashboardView userProfile={clientViewProfile} />
    </div>
  );
}
