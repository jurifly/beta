
"use client";

import { useState, useEffect } from "react";
import SettingsForm from './form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Bell, Lock, Loader2, KeyRound } from 'lucide-react';
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { useAuth } from "@/hooks/auth";
import type { Company } from "@/lib/types";
import BillingForm from "./billing-form";
import NotificationsForm from "./notifications-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const SecurityForm = () => (
    <Card className="interactive-lift">
        <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your workspace security settings like Single Sign-On (SSO).</CardDescription>
        </CardHeader>
        <CardContent>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        Single Sign-On (SSO)
                        <Lock className="w-4 h-4 text-muted-foreground"/>
                    </CardTitle>
                    <CardDescription>
                        Allow your team to sign in with your corporate identity provider.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        SSO is an enterprise feature. Please contact sales to enable it.
                    </p>
                </CardFooter>
            </Card>
        </CardContent>
    </Card>
)

const MyCaSettings = () => {
    const { userProfile, inviteCA, revokeCA } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!userProfile || userProfile.role !== 'Founder') return null;

    const handleInvite = async () => {
        if (!email) return;
        setLoading(true);
        try {
            await inviteCA(email);
            toast({ title: "Invite Sent!", description: `An invitation has been sent to ${email}.`});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }
    
    const handleRevoke = async () => {
        if (!window.confirm("Are you sure you want to revoke access for your advisor?")) return;
        setLoading(true);
        try {
            await revokeCA();
            toast({ title: "Access Revoked" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="interactive-lift">
            <CardHeader><CardTitle>My Advisor</CardTitle><CardDescription>Connect with your CA or Legal Advisor.</CardDescription></CardHeader>
            <CardContent>
                {userProfile.connectedCaUid ? (
                    <div className="space-y-4">
                        <p className="font-semibold text-green-600">You are connected with your advisor.</p>
                        <Button variant="destructive" onClick={handleRevoke} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Revoke Access
                        </Button>
                    </div>
                ) : userProfile.invitedCaEmail ? (
                    <div>
                        <p className="font-semibold text-yellow-600">Invitation Pending</p>
                        <p className="text-sm text-muted-foreground">An invite has been sent to {userProfile.invitedCaEmail}. They need to accept it to connect.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ca-email">Advisor's Email</Label>
                            <Input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your CA's registered email"/>
                        </div>
                        <Button onClick={handleInvite} disabled={loading || !email}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Send Invite
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const PendingInvites = () => {
    const { userProfile, getPendingInvites, acceptInvite } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile?.role === 'CA') {
            getPendingInvites().then(setInvites).finally(() => setLoading(false));
        }
    }, [userProfile, getPendingInvites]);
    
    const handleAccept = async (inviteId: string) => {
        try {
            await acceptInvite(inviteId);
            setInvites(prev => prev.filter(i => i.id !== inviteId));
            toast({ title: 'Connection Successful!', description: 'You can now manage the new client.' });
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    }

    if (userProfile?.role !== 'CA' || loading) return null;
    if (invites.length === 0) return null;

    return (
        <Card className="interactive-lift">
            <CardHeader><CardTitle>Pending Client Invites</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                {invites.map(invite => (
                    <div key={invite.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                            <p className="font-semibold">{invite.companyName}</p>
                            <p className="text-sm text-muted-foreground">From: {invite.founderName}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAccept(invite.id)}>Accept</Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
};


export default function SettingsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const { userProfile, deductCredits } = useAuth();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleAddCompanyClick = () => {
      setCompanyToEdit(null);
      setModalOpen(true);
  };

  const handleEditCompanyClick = (company: Company) => {
    setCompanyToEdit(company);
    setModalOpen(true);
  };
  
  const onModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setCompanyToEdit(null);
    }
  };

  return (
    <>
      <AddCompanyModal 
        isOpen={isModalOpen} 
        onOpenChange={onModalOpenChange}
        companyToEdit={companyToEdit}
        deductCredits={deductCredits}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your personal, billing, and company information.
                </p>
            </div>
        </div>
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto w-full">
              <TabsList className="flex-nowrap w-max sm:w-full">
                <TabsTrigger value="profile" className="interactive-lift"><User className="mr-2 h-4 w-4"/>Profile & Company</TabsTrigger>
                <TabsTrigger value="billing" className="interactive-lift"><CreditCard className="mr-2 h-4 w-4"/>Billing</TabsTrigger>
                <TabsTrigger value="notifications" className="interactive-lift"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
                <TabsTrigger value="security" className="interactive-lift"><Lock className="mr-2 h-4 w-4"/>Security</TabsTrigger>
              </TabsList>
          </div>
          <TabsContent value="profile" className="space-y-6">
            <PendingInvites />
            <SettingsForm 
              onAddCompanyClick={handleAddCompanyClick}
              onEditCompanyClick={handleEditCompanyClick}
            />
            {userProfile.role === 'Founder' && <MyCaSettings />}
          </TabsContent>
          <TabsContent value="billing">
            <BillingForm />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsForm />
          </TabsContent>
           <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
