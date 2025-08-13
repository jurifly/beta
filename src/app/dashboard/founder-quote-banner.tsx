
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { Lightbulb, Rocket, Clapperboard, ClapperboardIcon, PersonStanding, Drama, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const founderQuotes = [
    { text: "Burn rate high. Morale low. But let’s f*kn go.", icon: Rocket },
    { text: "You haven’t paid yourself in 3 months? Same here, bestie.", icon: Drama },
    { text: "You said MVP. The client heard ‘final product’.", icon: PersonStanding },
    { text: "Pitch deck, panic attacks, and pivot plans — founder life.", icon: Lightbulb },
    { text: "This app doesn’t raise funds. But it saves your a** legally.", icon: PersonStanding },
    { text: "Still waiting for the cofounder to update the Notion doc.", icon: Drama },
    { text: "You wanted freedom. You got founders’ tax season.", icon: PersonStanding },
    { text: "Sleep is for salaried people.", icon: Rocket },
    { text: "Every founder has two moods: ‘Let’s build’ and ‘Let’s exit’.", icon: Lightbulb },
    { text: "Daily reminder: CAs are your real cofounders.", icon: Lightbulb },
    { text: "Compliance is sexy when someone else does it.", icon: Drama },
    { text: "Broke, bold, building — the holy trinity.", icon: Rocket },
    { text: "Revenue? Nah bro, we got ‘traction’.", icon: PersonStanding },
    { text: "Investor said: ‘You’re early’. Me: Bro, I’m broke.", icon: Drama },
    { text: "Your app crashed? At least not your spirit… yet.", icon: Lightbulb },
    { text: "Mood: Hiring. Reality: Can’t pay.", icon: Drama },
    { text: "You’re not late. The market just isn’t ready for your genius.", icon: PersonStanding },
    { text: "Bootstrapper? Or just too broke to raise?", icon: Lightbulb },
    { text: "If anxiety was a product, you'd be unicorn by now.", icon: PersonStanding },
    { text: "Startups: Where plans change faster than app versions.", icon: Rocket },
];

const getStorageKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `founderQuoteDismissed_${today}`;
};

export function FounderQuoteBanner() {
  const { userProfile } = useAuth();
  const [dailyQuote, setDailyQuote] = useState<{ text: string; icon: React.ElementType } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'Founder') {
      try {
        const dismissed = localStorage.getItem(getStorageKey());
        if (dismissed !== 'true') {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Could not access localStorage:', error);
        setIsVisible(true);
      }

      const getDayOfYear = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
      };

      const dayIndex = getDayOfYear(new Date());
      const quoteIndex = dayIndex % founderQuotes.length;
      setDailyQuote(founderQuotes[quoteIndex]);
    }
  }, [userProfile]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(getStorageKey(), 'true');
    } catch (error) {
      console.error('Could not write to localStorage:', error);
    }
    setIsVisible(false);
  };

  if (!isVisible || !dailyQuote || userProfile?.role !== 'Founder') {
    return null;
  }
  
  const Icon = dailyQuote.icon;

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-between gap-3 rounded-lg border bg-amber-500/10 p-2.5 text-sm shadow-sm mb-6 border-amber-500/20 text-amber-900 dark:text-amber-300',
        'animate-in fade-in-50'
      )}
    >
      <div className="flex items-center gap-3 flex-1 justify-center">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="font-medium text-center italic">{dailyQuote.text}</p>
      </div>
       <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-amber-900/50 dark:text-amber-300/50 hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
