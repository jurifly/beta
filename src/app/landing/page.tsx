
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Flame,
  Star,
  FileText,
  AlertTriangle,
  HeartHandshake,
  Mail,
  Repeat,
  Sparkles,
  Book,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { InteractiveLandingEffects } from "./InteractiveLandingEffects";


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
          </div>
          <Button onClick={() => router.push('/login')} className="hidden sm:inline-flex interactive-lift">Get Started</Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const router = useRouter();
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <InteractiveLandingEffects />
      <div className="container relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left"
        >
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
              India's Smartest Legal & Compliance Buddy for Founders & CAs.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mt-6">
              Why juggle GST, ROC, ITR, MCA, FEMA, ESOPs, and random panic attacks?
              Let jurifly do the boring bits, while you build the next big thing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start justify-start gap-4">
                <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" onClick={() => router.push('/register')}>
                    Sign up for Beta
                </Button>
                 <Button variant="outline" className="w-full md:w-auto text-lg interactive-lift" size="lg" asChild>
                    <Link href="#newsletter">Subscribe to Newsletter</Link>
                </Button>
            </div>
        </motion.div>
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="relative"
        >
            <Image 
                src="https://ik.imagekit.io/claariai/Untitled%20design%20(5)%20(1).png?updatedAt=1753176057262" 
                alt="Jurifly dashboard preview"
                width={600}
                height={600}
                className="rounded-xl shadow-2xl mx-auto interactive-lift"
                data-ai-hint="dashboard preview"
            />
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
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">The Big Problem We're Solving</h2>
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
                <p className="text-center text-lg text-muted-foreground pt-8">
                    Welcome to Jurifly. We make legal + compliance feel less like brain surgery.
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What Jurifly Offers:</h2>
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Founders Love JuriFly</h2>
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
        { quote: "JuriFly  is like Notion + AI + LegalZoom made for India.", author: "Rachit Jain, Founder, Pre-seed Startup" },
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
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
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
                        <h2 className="text-2xl font-bold font-headline">Want to Stay in the Loop?</h2>
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
        <h2 className="text-3xl md:text-5xl font-bold font-headline">Don’t Worry About Legal Stuff Again.</h2>
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
    <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 py-8 md:flex-row px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
        <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
          💡 Built with ❤️ in India by founders, for founders
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap justify-center">
        <p>⚡ Jurifly is currently in beta</p>
        <span className="mx-1">|</span>
        <Button variant="link" size="sm" asChild><Link href="/about">About</Link></Button>
        <Button variant="link" size="sm" asChild><Link href="/contact">Contact</Link></Button>
        <Button variant="link" size="sm" asChild><Link href="/dashboard/settings?tab=policies">Terms</Link></Button>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <OffersSection />
        <FounderLoveSection />
        <TestimonialsSection />
        <FaqSection />
        <NewsletterSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
