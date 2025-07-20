
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { BookText, Calculator, Coffee, Archive, CalendarDays, Brain, Search, Clock, File, Lightbulb, TrendingDown, MessageSquare, Hand, Workflow, Briefcase, Smile, Repeat, FerrisWheel, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const caQuotes = [
    { text: "Relax, your files are safer here than in your drawer full of stapled mysteries.", icon: Archive },
    { text: "Reminder: Coffee ≠ tax deductible. We checked. Twice.", icon: Coffee },
    { text: "Debits, credits, and daily chaos – let’s balance it all.", icon: Calculator },
    { text: "Today’s agenda: File. Audit. Cry internally. Repeat.", icon: Repeat },
    { text: "CA life: where weekends are a myth and balance sheets are bedtime stories.", icon: BookText },
    { text: "Don’t worry, your client's ‘missing invoice’ isn’t hiding in our app either.", icon: Search },
    { text: "TDS deadlines: Because adrenaline junkies need something too.", icon: Clock },
    { text: "Still waiting for someone to invent Ctrl+Z for paper filings.", icon: File },
    { text: "Every CA’s dream? Clients who send documents before due date. Still a dream.", icon: Lightbulb },
    { text: "GST filings – the only rollercoaster ride you never signed up for.", icon: FerrisWheel },
    { text: "Breathe in. Breathe out. Ignore the 38 unread WhatsApps from clients.", icon: MessageSquare },
    { text: "CA toolkit: Calculator, patience, and one sarcastic eyebrow raise.", icon: Briefcase },
    { text: "Client: ‘Can you do this in 5 minutes?’ You: dies inside politely", icon: Smile },
    { text: "Our software doesn’t ask ‘sir balance sheet kya hota hai?’ Promise.", icon: Workflow },
    { text: "You know you’re a CA when ‘Fun’ means completing returns on time.", icon: CalendarDays },
    { text: "We file, we smile, we panic slightly. Repeat.", icon: Repeat },
    { text: "Every CA has a spreadsheet called ‘final_final_THISONE.xlsx’", icon: Archive },
    { text: "Sleep is overrated. Filing season is not.", icon: Clock },
    { text: "If sarcasm was deductible, you’d be a millionaire.", icon: Brain },
    { text: "CA life: Tax season, audit season, random client drama season.", icon: FerrisWheel },
];

const getStorageKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `caQuoteDismissed_${today}`;
};

export function CaQuoteBanner() {
  const { userProfile } = useAuth();
  const [dailyQuote, setDailyQuote] = useState<{ text: string; icon: React.ElementType } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor') {
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
      const quoteIndex = dayIndex % caQuotes.length;
      setDailyQuote(caQuotes[quoteIndex]);
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

  if (!isVisible || !dailyQuote) {
    return null;
  }
  
  const Icon = dailyQuote.icon;

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-between gap-3 rounded-lg border bg-blue-500/10 p-2.5 text-sm shadow-sm mb-6 border-blue-500/20 text-blue-900 dark:text-blue-300',
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
        className="h-7 w-7 text-blue-900/50 dark:text-blue-300/50 hover:bg-blue-500/20 hover:text-blue-900 dark:hover:text-blue-300"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
