

'use client';

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  BrainCircuit,
  FileSignature,
  LineChart,
  Bell,
  MessageSquare,
  DatabaseZap,
  Check,
  Briefcase,
  GanttChartSquare,
  Users,
  AlertTriangle,
  Book,
  Globe,
  Repeat,
  Sparkles,
  Mail,
  Heart,
  FileText,
  Cookie,
  Settings,
  X,
  Loader2
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { InteractiveLandingEffects } from "./InteractiveLandingEffects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WelcomePopup } from "./WelcomePopup";

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/4wdbj1XL/claifyblacko-1.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);

const JuriFlyWord = () => (
    <span className="jurifly-word">
        <span className="jurifly-word-gradient">Jurifly</span>
    </span>
);

const Marquee = ({ children, reverse = false }: { children: React.ReactNode, reverse?: boolean}) => (
    <div className={cn("marquee-container", reverse && "marquee-reverse")}>
        <div className="marquee-content">
            {children}
            {children}
        </div>
    </div>
);

const LandingHeader = () => {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary font-headline text-xl">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
             <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
             <Link href="#testimonials" className="text-muted-foreground transition-colors hover:text-foreground">Testimonials</Link>
             <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQs</Link>
             <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
             <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
             <Link href="/careers" className="text-muted-foreground transition-colors hover:text-foreground">Careers</Link>
          </div>
          <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
          <Button onClick={() => router.push('/register')} className="hidden sm:inline-flex interactive-lift">Get Started</Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

const PrototypeBanner = () => {
    return (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-t border-b border-yellow-200 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-200">
            <div className="container mx-auto px-4 py-2 text-center text-sm flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <p>
                    <span className="font-semibold">Prototype for User Testing:</span> All AI-generated content is for demonstration and should be verified.
                </p>
            </div>
        </div>
    )
}

const HeroSection = () => {
  const router = useRouter();
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <div 
        className="absolute inset-0 -z-10"
      >
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[120px] animate-pulse-slower"></div>
      </div>
      <div className="container relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight" data-cursor-size="large">
              India's Smartest Legal & Compliance Buddy for Founders & CAs.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mt-6 mx-auto" data-cursor-size="large">
              Why juggle GST, ROC, ITR, MCA, FEMA, ESOPs, and random panic attacks?
              Let <JuriFlyWord /> do the boring bits, while you build the next big thing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" onClick={() => router.push('/register')}>
                    Sign up for Beta
                </Button>
                 <Button variant="outline" className="w-full md:w-auto text-lg interactive-lift" size="lg" asChild>
                    <Link href="#newsletter">Subscribe to Newsletter</Link>
                </Button>
            </div>
        </motion.div>
      </div>
    </section>
  )
};

const AnimatedSection = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const ProblemSection = () => {
    const founderProblems = [
        "Tired of WhatsApp pinging “Send PAN card again”?",
        "Missed an MCA deadline… again?",
        "No clue what 'DIR-3 KYC' even means?",
        "Your CA ghosted you mid-funding round?",
        "Getting notices you don't even understand?",
    ];
    const caProblems = [
        "Clients ask “Why GST again?” every month",
        "Buried under reminders, mails, Excel sheets",
        "Missed filings = angry clients = less renewals",
        "Founders want “one app” but your tools are scattered",
        "You manage 60+ clients with no smart assistant?",
    ];
    return (
         <section id="problem" className="w-full py-20 md:py-24 bg-muted">
            <AnimatedSection className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline" data-cursor-size="large">The Big Problem We're Solving</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="interactive-lift bg-card/50 border-destructive/20 from-destructive/5 to-transparent bg-gradient-to-br">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold flex items-center gap-3"><AlertTriangle className="text-destructive"/> For Founders:</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {founderProblems.map((problem, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-destructive mt-1 shrink-0" />
                                    <p className="text-muted-foreground">{problem}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card className="interactive-lift bg-card/50 border-primary/20 from-primary/5 to-transparent bg-gradient-to-br">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold flex items-center gap-3"><BrainCircuit className="text-primary"/> For CAs:</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             {caProblems.map((problem, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                                    <p className="text-muted-foreground">{problem}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <p className="text-center text-lg text-muted-foreground pt-8" data-cursor-size="large">
                    Welcome to <JuriFlyWord />. We make legal + compliance feel less like brain surgery.
                </p>
            </AnimatedSection>
        </section>
    );
};

const OffersSection = () => {
    const founderFeatures = [
        { text: "Compliance Dashboard", desc: "GST, MCA, ROC, PF/ESI etc.", icon: LineChart },
        { text: "Smart Reminders & Alerts", desc: "Never miss a deadline again.", icon: Bell },
        { text: "Auto-generated Docs", desc: "MOUs, NDAs, Founders' Agreements etc.", icon: FileSignature },
        { text: "One-click Document Vault", desc: "Secure, synced, and shareable.", icon: DatabaseZap },
        { text: "Chat with Verified CAs", desc: "Get expert advice when you need it.", icon: Users },
        { text: "Plain-English Explainers", desc: "For every legal jargon.", icon: Book },
        { text: "Multi-language support", desc: "(Coming soon)", icon: Globe },
    ];
    const caFeatures = [
        { text: "Client-wise dashboard", desc: "One view for your entire portfolio.", icon: Briefcase },
        { text: "Recurring task automations", desc: "Set reminders, track status.", icon: Repeat },
        { text: "AI Summary of Notices", desc: "Understand queries & docs instantly.", icon: Sparkles },
        { text: "Auto-mail client nudges", desc: "e.g. “Send docs by EOD”", icon: Mail },
        { text: "Branded Workspace for Your Firm", desc: "Professional look for your practice.", icon: GanttChartSquare },
        { text: "Reports to show value", desc: "Compliance health scores etc.", icon: FileText },
        { text: "Internal notes for each client", desc: "Stay organized, collaborate.", icon: MessageSquare },
    ];

    return (
        <section id="features" className="w-full py-20 md:py-24">
          <AnimatedSection className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline" data-cursor-size="large">What <JuriFlyWord /> Offers:</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-center">For Founders</h3>
                     {founderFeatures.map((feature, i) => (
                        <Card key={i} className="interactive-lift bg-card/50">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary"><feature.icon className="h-6 w-6" /></div>
                                <div>
                                    <CardTitle className="text-base">{feature.text}</CardTitle>
                                    <CardDescription>{feature.desc}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                     ))}
                 </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-center">For CAs</h3>
                     {caFeatures.map((feature, i) => (
                        <Card key={i} className="interactive-lift bg-card/50">
                           <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary"><feature.icon className="h-6 w-6" /></div>
                                <div>
                                    <CardTitle className="text-base">{feature.text}</CardTitle>
                                    <CardDescription>{feature.desc}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                     ))}
                 </div>
            </div>
          </AnimatedSection>
        </section>
    );
}

const FounderLoveSection = () => {
    const quotes = [
        "Finally an app that understands startup chaos.",
        "Sent my CA docs before she even asked. Miracles do happen.",
        "JuriFly helped me prep for due diligence in 2 hours. Life saver.",
        "I stopped being afraid of MCA emails.",
        "My CA thinks I’m suddenly very organized. Lol.",
    ];
    return (
        <section id="love" className="w-full py-20 md:py-24 bg-muted">
            <AnimatedSection className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-lg text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline" data-cursor-size="large">Why Founders Love <JuriFlyWord /></h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {quotes.map((quote, index) => (
                        <Card key={index} className="p-6 text-left interactive-lift bg-background/50 break-inside-avoid">
                            <CardContent className="p-0">
                                <blockquote className="text-lg font-medium">“{quote}”</blockquote>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </AnimatedSection>
        </section>
    )
}

const TestimonialsSection = () => {
    const testimonials = [
        { quote: "JuriFly is like Notion + AI + LegalZoom made for India.", author: "Rachit Jain, Founder, Pre-seed Startup" },
        { quote: "Earlier I had 40 unread mails from clients daily. Now? 3.", author: "Neha Gupta, CA, 10+ years" },
        { quote: "It felt like my co-founder… but for compliance.", author: "Siddharth Mehra, YC alum" },
        { quote: "Our clients LOVE the dashboard. We saved 10+ hours a week.", author: "Nikhil Agrawal, CA, runs a 40-client firm" },
    ];
    return (
        <section id="testimonials" className="w-full py-20 md:py-24">
             <AnimatedSection className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl text-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-6 text-center interactive-lift bg-card/50">
                            <CardContent className="p-0 flex flex-col items-center">
                                <blockquote className="text-lg font-medium leading-relaxed mt-4">“{testimonial.quote}”</blockquote>
                                <footer className="mt-4 text-sm text-muted-foreground">— {testimonial.author}</footer>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </AnimatedSection>
        </section>
    );
}

const FaqSection = () => {
    const faqs = [
        { q: "Does JuriFly file my taxes or ROC forms?", a: "Nope. We’re not a filing service. JuriFly helps you understand what needs to be done and why — so you can act smarter (and faster)." },
        { q: "Can I invite my CA to JuriFly?", a: "Yes. Invite your CA or investor with one click and collaborate directly in your workspace." },
        { q: "Do I still need a CA?", a: "Yes. We don’t replace your CA — we make your CA 10x faster and you 100x smarter." },
        { q: "What kind of documents can JuriFly help generate?", a: "Board resolutions, NDAs, founder agreements, pitch doc structures, ESOP templates, investor updates, and more." },
        { q: "What startup stage is JuriFly for?", a: "From incorporation to fundraising to exit. Pre-seed to Series A and beyond." },
        { q: "How do you handle my data? Is it secure?", a: "Your workspace is encrypted. For documents, we integrate directly with your Google Drive, meaning your files stay in your control, not on our servers. You grant us permission only to list and manage the files you choose to upload through our interface." },
    ];
    return (
        <section id="faq" className="w-full py-20 md:py-24 bg-muted">
             <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline" data-cursor-size="large">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem value={`item-${i}`} key={i} className="interactive-lift">
                            <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             </AnimatedSection>
        </section>
    );
}

const NewsletterSection = () => {
    return (
        <section id="newsletter" className="w-full py-20 md:py-24">
            <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                <Card className="interactive-lift overflow-hidden bg-card/50">
                     <div className="p-8 md:p-10 flex flex-col justify-center text-center">
                        <h2 className="text-2xl font-bold font-headline" data-cursor-size="large">Want to Stay in the Loop?</h2>
                        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Get weekly founder-friendly tips + early access invites + memes that only startup folks get.</p>
                        <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="your.email@company.com"
                                className="flex-1"
                                aria-label="Email for newsletter"
                            />
                            <Button type="submit" className="sm:w-auto">Subscribe to Jurifly Mail</Button>
                        </form>
                    </div>
                </Card>
            </AnimatedSection>
        </section>
    );
};

const FinalCtaSection = () => {
  const router = useRouter();
  return (
    <section className="w-full py-20 md:py-24">
      <AnimatedSection className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
        <h2 className="text-3xl md:text-5xl font-bold font-headline" data-cursor-size="large">Don’t Worry About Legal Stuff Again.</h2>
        <p className="text-lg text-muted-foreground mt-4">No jargon. No overwhelm. No filings. Just clarity.</p>
        <div className="mt-8">
          <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" onClick={() => router.push('/login')}>
            Get Started – It’s Free for Beta Users
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </AnimatedSection>
    </section>
  );
};

const LandingFooter = () => (
    <footer className="border-t">
        <div className="container mx-auto max-w-screen-xl py-12 px-4 sm:px-6 lg:px-8 text-left">
             <div style={{textAlign: 'left'}}>
              <h1 className="text-[80px] font-extrabold leading-[1.1] text-foreground/80" data-cursor-size="large">
                Live<br />it up!
              </h1>
              <p className="mt-6 text-[18px] text-muted-foreground font-medium flex items-center gap-2">
                Made with <Heart className="w-5 h-5 text-red-500 fill-current" /> in India
              </p>
              <p className="mt-3 text-[16px] text-muted-foreground font-normal italic">
                <JuriFlyWord /> helps <span className="font-semibold text-foreground/90">CAs</span> and <span className="font-semibold text-foreground/90">Startup Founders</span> stay legally unstoppable.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} JuriFly. All rights reserved.</p>
                <div className="flex items-center gap-4">
                     <Link href="/about" className="hover:text-primary">About</Link>
                     <Link href="/contact" className="hover:text-primary">Contact</Link>
                     <Link href="/careers" className="hover:text-primary">Careers</Link>
                     <Link href="/dashboard/settings?tab=policies" className="hover:text-primary">Terms</Link>
                </div>
            </div>
        </div>
    </footer>
);

type CookiePreferences = {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
};

const CookieConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isCustomizeOpen, setCustomizeOpen] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: true,
        marketing: true,
    });

    useEffect(() => {
        const consent = localStorage.getItem('jurifly_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('jurifly_cookie_consent', JSON.stringify({ accepted: true, preferences }));
        setIsVisible(false);
    };

    const handleDeclineAll = () => {
        const newPreferences = { necessary: true, analytics: false, marketing: false };
        localStorage.setItem('jurifly_cookie_consent', JSON.stringify({ accepted: false, preferences: newPreferences }));
        setIsVisible(false);
    };
    
    const handleSavePreferences = () => {
         localStorage.setItem('jurifly_cookie_consent', JSON.stringify({ accepted: true, preferences }));
         setIsVisible(false);
         setCustomizeOpen(false);
    }
    
    const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    if (!isVisible) return null;

    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t p-4 z-[100] animate-in slide-in-from-bottom-8 duration-500">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Cookie className="w-5 h-5 text-primary mt-0.5 shrink-0"/>
                    <p>We use cookies to enhance your experience. By clicking "Accept All", you agree to our use of cookies.</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={handleAcceptAll}>Accept All</Button>
                    <Button variant="outline" onClick={() => setCustomizeOpen(true)}>Customize</Button>
                    <Button variant="ghost" onClick={handleDeclineAll}>Decline</Button>
                </div>
            </div>
        </div>
         <Dialog open={isCustomizeOpen} onOpenChange={setCustomizeOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize Cookie Preferences</DialogTitle>
                    <DialogDescription>
                       You can choose which types of cookies you're comfortable with. Necessary cookies are required for the site to function.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="necessary" className="font-medium">Necessary Cookies</Label>
                        <Checkbox id="necessary" checked disabled />
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="analytics" className="font-medium">Analytics Cookies</Label>
                        <Checkbox id="analytics" checked={preferences.analytics} onCheckedChange={(c) => handlePreferenceChange('analytics', !!c)} />
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="marketing" className="font-medium">Marketing Cookies</Label>
                        <Checkbox id="marketing" checked={preferences.marketing} onCheckedChange={(c) => handlePreferenceChange('marketing', !!c)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCustomizeOpen(false)}>Cancel</Button>
                    <Button onClick={handleSavePreferences}>Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </>
    );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body landing-page-cursor-area relative overflow-x-hidden no-cursor-effect">
      <LandingHeader />
      <PrototypeBanner />
      <main className="flex-1 relative z-10">
        <HeroSection />
        <Suspense fallback={<div className="h-10" />}>
          <WelcomePopup />
        </Suspense>
        <div className="top-marquee py-8">
            <Marquee>
                <span>Compliance Simplified</span><span className="mx-4 text-primary">&bull;</span>
                <span>AI-Powered Legal Tech</span><span className="mx-4 text-primary">&bull;</span>
                <span>For Founders & CAs</span><span className="mx-4 text-primary">&bull;</span>
                <span>Stay Ahead, Stay Compliant</span><span className="mx-4 text-primary">&bull;</span>
                <span>Cap Table Management</span><span className="mx-4 text-primary">&bull;</span>
                <span>Due Diligence Prep</span><span className="mx-4 text-primary">&bull;</span>
                <span>Automated Workflows</span><span className="mx-4 text-primary">&bull;</span>
            </Marquee>
            <Marquee reverse>
                <span>Investor Discovery</span><span className="mx-4 text-primary">&bull;</span>
                <span>Financial Runway & Scenarios</span><span className="mx-4 text-primary">&bull;</span>
                <span>Secure Document Vault</span><span className="mx-4 text-primary">&bull;</span>
                <span>Real-time Collaboration</span><span className="mx-4 text-primary">&bull;</span>
                <span>Smart Alerts</span><span className="mx-4 text-primary">&bull;</span>
                <span>DPIIT & MSME Recognition</span><span className="mx-4 text-primary">&bull;</span>
                <span>Founder-Friendly</span><span className="mx-4 text-primary">&bull;</span>
            </Marquee>
        </div>
        <ProblemSection />
        <OffersSection />
        <FounderLoveSection />
        <TestimonialsSection />
        <FaqSection />
        <NewsletterSection />
        <div className="bottom-marquee py-8">
            <Marquee>
                <span>No Jargon</span><span className="mx-4 text-primary">&bull;</span>
                <span>No Overwhelm</span><span className="mx-4 text-primary">&bull;</span>
                <span>Just Clarity</span><span className="mx-4 text-primary">&bull;</span>
                <span>Your AI Co-pilot</span><span className="mx-4 text-primary">&bull;</span>
                <span>One Unified Workspace</span><span className="mx-4 text-primary">&bull;</span>
                <span>Angel Tax Guidance</span><span className="mx-4 text-primary">&bull;</span>
                <span>Smart Alerts</span><span className="mx-4 text-primary">&bull;</span>
            </Marquee>
            <Marquee reverse>
                <span>ESOP Management</span><span className="mx-4 text-primary">&bull;</span>
                <span>Built for India</span><span className="mx-4 text-primary">&bull;</span>
                <span>Real-time Collaboration</span><span className="mx-4 text-primary">&bull;</span>
                <span>DPIIT & MSME Recognition</span><span className="mx-4 text-primary">&bull;</span>
                <span>Founder-Friendly</span><span className="mx-4 text-primary">&bull;</span>
                <span>No More Spreadsheets</span><span className="mx-4 text-primary">&bull;</span>
                <span>Your Legal Co-pilot</span><span className="mx-4 text-primary">&bull;</span>
            </Marquee>
        </div>
        <FinalCtaSection />
      </main>
      <LandingFooter />
      <InteractiveLandingEffects />
      <CookieConsentBanner />
    </div>
  );
}
