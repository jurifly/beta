
'use client';

import Dashboard from '@/app/dashboard/Dashboard';
import { useAuth } from '@/hooks/auth';
import type { Language, Translations } from './layout'; // Assuming layout exports these
import { translations as allTranslations } from './layout'; // Assuming layout exports these
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [lang, setLang] = useState<Language>('en');
  const { userProfile } = useAuth(); // Assuming useAuth provides userProfile

  useEffect(() => {
    // This logic should align with how you set language in your layout
    // For now, let's assume it's stored in localStorage or comes from userProfile
    const savedLang = localStorage.getItem('claari-lang') as Language;
    if (savedLang) {
      setLang(savedLang);
    } else if (userProfile?.legalRegion) {
      // Potentially map region to lang here if desired
    }
  }, [userProfile]);
  
  // This page now acts as a wrapper to pass translation props
  return <Dashboard translations={allTranslations} lang={lang} />;
}
