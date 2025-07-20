

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Input } from "@/components/ui/input";


const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png"
        alt="2-2"
        width={114}
        height={24}
        className="h-20 w-auto dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/4wdbj1XL/claifyblacko-1.png"
        alt="claifyblacko-1"
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
    <section className="relative w-full py-24 md:py-32">
      <div className="container relative mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
          Your Compliance & Legal Co-Pilot
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
          JuriFly isn’t your average CA tool or filing software.
          It's your personal guide through the messy maze of Indian compliance, taxes, and documents — made especially for founders.
        </p>
        <p className="mt-4 font-semibold text-lg">We don’t file forms. We make sure you understand them.</p>
        <div className="mt-8">
            <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" onClick={() => router.push('/login')}>
                Get Started – It’s Free for Beta Users
                <ArrowRight className="ml-2"/>
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent font-semibold">
              <Flame className="text-orange-500 animate-flicker" />
              Daily free 5 credits
            </p>
        </div>
      </div>
    </section>
  )
};

const FeaturesSection = () => {
    const features = [
        { text: "Know What Matters — Instantly", description: "Cut through jargon. Understand what needs to be done, why, and by when — with crisp AI-powered summaries.", icon: BrainCircuit },
        { text: "Docs Without The Drag", description: "Auto-generate standard legal docs and compliance summaries in seconds. Board resolutions, NDAs, investment term sheets — sorted.", icon: FileSignature },
        { text: "See The Bigger Picture", description: "Visual dashboards for burn, runway, due dates, tax summaries, and upcoming compliances — all in one place.", icon: LineChart },
        { text: "Smart Notifications", description: "No spam. Just timely nudges and reminders before things become penalties.", icon: Bell },
        { text: "Workspace That Works", description: "Chat, collaborate, and comment with your CA or investor — on one single dashboard.", icon: MessageSquare },
        { text: "Sync & Store Everything", description: "Your ROC filings, GST docs, ITR proofs, investor reports — all linked to your Drive and always available.", icon: DatabaseZap },
    ];
    return (
        <section id="features" className="w-full py-20 md:py-24 bg-card/50">
          <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Founders Love JuriFly</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <Card key={index} className="p-6 text-left interactive-lift bg-background/50 animate-in fade-in-25 slide-in-from-bottom-8 duration-500" style={{'animationDelay': `${index * 100}ms`} as React.CSSProperties}>
                        <div className="flex justify-start items-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                            <feature.icon className="h-6 w-6 m-3" />
                        </div>
                        <p className="font-semibold text-lg">{feature.text}</p>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </Card>
                ))}
            </div>
          </div>
        </section>
    );
}

const TestimonialsSection = () => {
    const testimonials = [
        { quote: "JuriFly helped me understand my compliance blind spots, before they became problems.", author: "A founder who stopped fearing MCA." },
        { quote: "My CA does the work, but I finally get what’s happening. That’s priceless.", author: "A startup CEO using JuriFly during fundraising." }
    ];
    return (
        <section id="testimonials" className="w-full py-20 md:py-24">
             <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Built For Founders, Not Filers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-6 text-left interactive-lift bg-card/50 text-center">
                            <CardContent className="p-0">
                                <blockquote className="text-lg font-medium leading-relaxed">“{testimonial.quote}”</blockquote>
                                <footer className="mt-4 text-sm text-muted-foreground">— {testimonial.author}</footer>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

const KeyFeaturesSection = () => {
    const features = [
        { name: "Compliance Calendar", description: "Smart reminders mapped to your company’s actual structure." },
        { name: "Auto-Generated Docs", description: "Get draft NDAs, board resolutions, investment docs, and more." },
        { name: "Workspace Collaboration", description: "Share comments with CA or advisors. No messy email chains." },
        { name: "Financial Insights", description: "Visuals for burn, runway, tax dues, and cash compliance." },
        { name: "Secure Storage", description: "Your filings + important docs, always backed up and in-sync." },
        { name: "Guided Explanations", description: "Don’t just get alerts — learn what each rule, filing, or form means." },
    ];
    return (
        <section id="key-features" className="w-full py-20 md:py-24 bg-card/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Key Features</h2>
                </div>
                {/* Responsive Cards for Mobile */}
                <div className="space-y-4 md:hidden">
                    {features.map((feature, i) => (
                        <Card key={i} className="interactive-lift">
                           <CardHeader>
                            <CardTitle className="text-base">{feature.name}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                           </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Table for Desktop */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">Feature</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features.map((feature, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{feature.name}</TableCell>
                                    <TableCell>{feature.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
};

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
        <section id="faq" className="w-full py-20 md:py-24">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             </div>
        </section>
    );
}

const NewsletterSection = () => {
    return (
        <section id="newsletter" className="w-full py-20 md:py-24 bg-card/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                <Card className="interactive-lift overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <h2 className="text-2xl font-bold font-headline">Stay Ahead of the Curve</h2>
                            <p className="mt-2 text-muted-foreground">Get curated legal-tech updates, compliance tips, and founder stories. No spam, ever.</p>
                            <form className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Input
                                    type="email"
                                    placeholder="your.email@company.com"
                                    className="flex-1"
                                    aria-label="Email for newsletter"
                                />
                                <Button type="submit" className="sm:w-auto">Subscribe</Button>
                            </form>
                        </div>
                        <div className="hidden md:block bg-muted p-4">
                           <Image 
                             src="https://placehold.co/600x400.png"
                             alt="Newsletter illustration"
                             width={600}
                             height={400}
                             className="object-cover w-full h-full rounded-md"
                             data-ai-hint="legal books"
                           />
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};

const FinalCtaSection = () => {
  const router = useRouter();
  return (
    <section className="w-full py-20 md:py-24">
      <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
        <h2 className="text-3xl md:text-5xl font-bold font-headline">Don’t Worry About Legal Stuff Again.</h2>
        <p className="text-lg text-muted-foreground mt-4">No jargon. No overwhelm. No filings. Just clarity.</p>
        <div className="mt-8">
          <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" onClick={() => router.push('/login')}>
            Get Started – It’s Free for Beta Users
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const LandingFooter = () => (
  <footer className="border-t">
    <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 py-8 md:flex-row px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
        <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
          © {new Date().getFullYear()} JuriFly. A product for founders, by founders.
        </p>
      </div>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap justify-center">
        <Button variant="link" size="sm" asChild><Link href="/about">About</Link></Button>
        <Button variant="link" size="sm" asChild><Link href="/contact">Contact</Link></Button>
        <Button variant="link" size="sm" asChild><Link href="/dashboard/settings?tab=policies">Terms & Privacy</Link></Button>
        <Button variant="link" size="sm" asChild><Link href="/careers">Careers</Link></Button>
      </nav>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <KeyFeaturesSection />
        <FaqSection />
        <NewsletterSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
