
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';

const BETA_BANNER_DISMISSED_KEY = 'fomoBannerDismissed';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.signupIndex) {
      try {
        const dismissed = localStorage.getItem(BETA_BANNER_DISMISSED_KEY);
        if (dismissed !== 'true') {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Could not access localStorage:', error);
        setIsVisible(true);
      }
    }
  }, [userProfile]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(BETA_BANNER_DISMISSED_KEY, 'true');
    } catch (error) {
      console.error('Could not write to localStorage:', error);
    }
    setIsVisible(false);
  };

  if (!isVisible || !userProfile?.signupIndex) {
    return null;
  }

  const { signupIndex, dailyCreditLimit } = userProfile;

  return (
    <div
      className={cn(
        'relative flex items-center justify-between gap-4 rounded-lg border bg-primary/10 p-3 text-sm text-primary-foreground shadow-sm mb-6',
        'animate-in fade-in-50'
      )}
    >
      <div className="flex items-center gap-3">
        <Rocket className="h-5 w-5 text-primary shrink-0" />
        <p className="font-medium text-primary">
          आप उपयोगकर्ता #{signupIndex} हैं — {dailyCreditLimit} मुफ्त दैनिक AI क्रेडिट का आनंद लें! 🚀
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-primary hover:bg-primary/20 hover:text-primary"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
