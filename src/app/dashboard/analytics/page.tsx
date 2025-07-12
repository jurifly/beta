"use client"

import { useAuth } from "@/hooks/auth"
import { Loader2, ArrowLeft } from "lucide-react"
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { FounderAnalytics, CAAnalytics, LegalAdvisorAnalytics, EnterpriseAnalytics } from "./AnalyticsViews";


export default function AnalyticsPage() {
  const { userProfile } = useAuth();
  const router = useRouter();

  if (!userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const pageTitle = userProfile.role === 'CA' ? "Portfolio Analytics" : "Analytics";
  const pageDescription = userProfile.role === 'CA' 
    ? "An overview of your entire client portfolio's health and risk."
    : "Measure and track your legal and compliance performance.";
  
  const renderAnalyticsByRole = () => {
    switch (userProfile.role) {
      case 'Founder':
        return <FounderAnalytics />;
      case 'CA':
        return <CAAnalytics userProfile={userProfile} />;
      case 'Legal Advisor':
        return <LegalAdvisorAnalytics userProfile={userProfile} />;
      case 'Enterprise':
          return <EnterpriseAnalytics userProfile={userProfile} />;
      default:
        return <FounderAnalytics />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">{pageTitle}</h2>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>
      {renderAnalyticsByRole()}
    </div>
  )
}
