
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <ScrollArea className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex h-auto sm:h-10 items-center justify-start w-max">
                <TabsTrigger value="profile" className="interactive-lift"><User className="mr-2 h-4 w-4"/>Profile & Company</TabsTrigger>
                <TabsTrigger value="billing" className="interactive-lift"><CreditCard className="mr-2 h-4 w-4"/>Billing</TabsTrigger>
                <TabsTrigger value="notifications" className="interactive-lift"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
                <TabsTrigger value="security" className="interactive-lift"><Lock className="mr-2 h-4 w-4"/>Security</TabsTrigger>
              </TabsList>
          </ScrollArea>
          <TabsContent value="profile" className="space-y-6">
            <SettingsForm 
              onAddCompanyClick={handleAddCompanyClick}
              onEditCompanyClick={handleEditCompanyClick}
            />
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
