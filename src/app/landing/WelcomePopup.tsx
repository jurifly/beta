
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const [name, setName] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs on the client after the component mounts
    const timer = setTimeout(() => {
      // Find the name from query params (e.g., ?@Alex)
      for (const key of searchParams.keys()) {
          if (key.startsWith('@')) {
              setName(key.substring(1));
              break;
          }
      }
      
      // Get the source from the URL hash (e.g., #Facebook)
      if (window.location.hash) {
          setSource(window.location.hash.substring(1));
      }

      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleGetStarted = () => {
    setIsOpen(false);
  }

  const renderContent = () => {
    if (name && source) {
      return {
        title: `Welcome, ${name}!`,
        description: `Great to see you here from ${source}. Jurifly is the smartest way for Indian founders to manage compliance, financials, and legal work without the headache. Explore how we turn chaos into clarity.`
      };
    }
    if (name) {
      return {
        title: `Welcome, ${name}!`,
        description: `Glad you're here. Jurifly is designed to be an intelligent co-pilot for Indian founders, demystifying everything from GST and ROC filings to cap tables and fundraising documents. Let's get started.`
      };
    }
    if (source) {
      return {
        title: `Welcome from ${source}!`,
        description: `We're excited you found us. Jurifly is built to solve the unique legal and compliance challenges Indian startups face. See how our AI-powered dashboard can give you peace of mind.`
      };
    }
    // Default detailed message
    return {
      title: "Welcome to Jurifly! From Chaos to Clarity for Indian Founders.",
      description: (
        <div className="text-sm text-muted-foreground text-left space-y-3 pt-4 max-h-[60vh] overflow-y-auto px-1">
          <p>
              Are you a founder drowning in a sea of acronyms like ROC, GST, TDS, and MCA? Do you spend more time chasing your CA for updates on WhatsApp than you do building your product? We get it. The journey of building a startup in India is a thrilling rollercoaster, but the compliance and legal hurdles can feel like a nightmare of endless paperwork, confusing jargon, and looming deadlines.
          </p>
          <p>
              You didn't start a company to become a part-time paralegal. You started it to innovate, to build, and to solve real-world problems. That's where Jurifly comes in.
          </p>
          <p>
              Jurifly is your intelligent co-pilot, designed specifically for the unique challenges faced by Indian startups and their advisors. We're not another filing service; we're your central nervous system for all things legal and financial. Our platform translates the chaos into clarity.
          </p>
          <p className="font-semibold text-foreground">
              Here’s how we help you reclaim your time and peace of mind:
          </p>
          <ul className="list-disc list-outside space-y-2 pl-5">
              <li>
                  <strong>One Dashboard to Rule Them All:</strong> See your compliance calendar, financial health (like burn rate and runway), and key deadlines in a single, beautiful interface. No more spreadsheet-hopping.
              </li>
              <li>
                  <strong>AI-Powered Insights:</strong> Our AI doesn't just show you data; it explains it. Get plain-English summaries of legal documents, proactive alerts for upcoming filings, and suggestions to keep your company's legal hygiene in top shape.
              </li>
              <li>
                  <strong>Seamless Collaboration:</strong> Invite your CA or legal advisor to your secure workspace. Share documents, get feedback, and track progress in real-time. End the email and WhatsApp clutter forever.
              </li>
               <li>
                  <strong>Document Generation & Vault:</strong> From founders' agreements to ESOP policies, generate crucial legal documents from vetted templates. Store everything securely in one place.
              </li>
          </ul>
           <p>
              Stop letting compliance be a bottleneck. Start building your vision with the confidence that your legal and financial house is in order. Let Jurifly handle the boring stuff, so you can get back to changing the world.
          </p>
        </div>
      ),
    };
  };

  const { title, description } = renderContent();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-headline">{title}</DialogTitle>
          <DialogDescription asChild>
            <div>{description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col justify-center sm:justify-center pt-4 gap-2">
           <p className="text-[9px] text-muted-foreground/20">
            This is an internal beta version.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="w-full interactive-lift">
            Get Started for Free <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
