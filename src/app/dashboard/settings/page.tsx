"use client";

import { useState } from "react";
import SettingsForm from './form';
import BillingForm from './billing-form';
import NotificationsForm from './notifications-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Bell, Lock, Loader2 } from 'lucide-react';
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Company } from "@/lib/types";

export default function SettingsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const companyLimit = userProfile.plan === 'Free' ? 1 : userProfile.plan === 'Pro' ? 5 : Infinity;
  const canAddCompany = userProfile.companies.length < companyLimit;

  const handleAddCompanyClick = () => {
    if (canAddCompany) {
      setCompanyToEdit(null);
      setModalOpen(true);
    }
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
        {!canAddCompany && (
          <Alert variant="default" className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300">
              <Lock className="h-4 w-4 text-amber-500" />
              <AlertTitle>Company Limit Reached</AlertTitle>
              <AlertDescription>
                Your current plan's company limit has been reached. Please upgrade to add more.
                <Button asChild variant="link" className="p-0 h-auto ml-1 text-amber-900 dark:text-amber-300">
                    <Link href="/dashboard/billing">Upgrade Plan</Link>
                </Button>
              </AlertDescription>
          </Alert>
        )}
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto w-full">
              <TabsList className="flex-nowrap w-max sm:w-full">
              <TabsTrigger value="profile" className="interactive-lift"><User className="mr-2 h-4 w-4"/>Profile & Company</TabsTrigger>
              <TabsTrigger value="billing" className="interactive-lift"><CreditCard className="mr-2 h-4 w-4"/>Billing</TabsTrigger>
              <TabsTrigger value="notifications" className="interactive-lift"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
              </TabsList>
          </div>
          <TabsContent value="profile">
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
        </Tabs>
      </div>
    </>
  );
}
