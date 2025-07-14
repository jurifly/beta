
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  BarChart,
  HeartHandshake,
  DatabaseZap,
  KeyRound,
  ShieldCheck,
  Building2,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
  >
    <path
      d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);


// Header Component
const LandingHeader = () => {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/landing')} className="flex items-center gap-2 font-bold text-primary font-headline text-xl">
          <Logo />
          <span>Claari</span>
        </button>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="link" onClick={() => router.push('/login')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Sign In
          </Button>
          <Button onClick={() => router.push('/register')}>Join Beta</Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
    const router = useRouter();
    return (
        <section className="relative w-full py-24 md:py-40">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.05),transparent)]"></div>
            <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight max-w-4xl mx-auto">
                Clarity for Founders. Finally.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
                No more cluttered dashboards. Just the clarity you need — for your company’s documents, taxes, and compliances — in one clean space.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" onClick={() => router.push('/register')}>
                    Join Beta
                </Button>
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                    See Features
                </Button>
            </div>
             <div className="mt-16 group interactive-lift">
                <Image
                    src="https://i.ibb.co/yY5JcR1/image.png"
                    width={1200}
                    height={600}
                    alt="Dashboard Preview"
                    className="rounded-xl border-2 border-border/10 shadow-2xl shadow-primary/10"
                    data-ai-hint="dashboard ui dark"
                    priority
                />
            </div>
            </div>
        </section>
    )
};

// Value Props Section
const ValueSection = () => {
    const valueProps = [
        { text: "Auto-generate docs", description: "Founder letters to legal forms, done in seconds.", icon: FileText },
        { text: "Visualize your finances", description: "Burn-rate, runway, tax overviews — always up-to-date.", icon: BarChart },
        { text: "Sync, store, share", description: "All your docs + filings stored on your drive, always ready.", icon: DatabaseZap },
        { text: "Founder <> Advisor Mode", description: "Share workspace with your CA or investor in one click.", icon: HeartHandshake },
    ];

    return (
        <section id="features" className="w-full py-20 md:py-32 bg-card/50">
          <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    Everything you expected a CA to do — without the wait.
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {valueProps.map((feature, index) => (
                    <Card key={index} className="p-6 text-left interactive-lift bg-background/50 animate-in fade-in-25 slide-in-from-bottom-8 duration-500" style={{'animationDelay': `${index * 100}ms`} as React.CSSProperties}>
                        <div className="flex justify-start items-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                            <feature.icon className="h-6 w-6 m-3" suppressHydrationWarning />
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

// Product Glimpse Section
const ProductGlimpseSection = () => {
    const glimpses = [
        { title: "Launchpad", description: "Get your company started in 5 clicks.", image: "https://i.ibb.co/j3qYf6m/image.png", hint: "company setup" },
        { title: "Financials", description: "Visualize burn rate, runway, and project future growth.", image: "https://i.ibb.co/3sZ8Xw2/image.png", hint: "financial dashboard" },
        { title: "Analytics", description: "Track your Legal Hygiene Score and fundraising readiness.", image: "https://i.ibb.co/F8qPqTz/image.png", hint: "analytics charts" },
        { title: "Cap Table Preview", description: "See your dilution before it dilutes.", image: "https://i.ibb.co/mBf7h4F/image.png", hint: "cap table graph" },
    ];
    
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextGlimpse = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % glimpses.length);
    };

    const prevGlimpse = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + glimpses.length) % glimpses.length);
    };


    return (
        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">This is not software. It's sanity.</h2>
                <div className="relative group">
                     <Card className="p-4 bg-card/30 interactive-lift overflow-hidden">
                        <CardContent className="p-0">
                             <div className="relative overflow-hidden rounded-lg">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                                    {glimpses.map((glimpse) => (
                                        <div key={glimpse.title} className="w-full flex-shrink-0">
                                            <Image
                                                alt={glimpse.title}
                                                data-ai-hint={glimpse.hint}
                                                loading="lazy"
                                                width={1200}
                                                height={800}
                                                className="w-full object-cover aspect-[3/2] border shadow-md"
                                                src={glimpse.image}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 text-left">
                                <h3 className="font-semibold">{glimpses[currentIndex].title}</h3>
                                <p className="text-sm text-muted-foreground">{glimpses[currentIndex].description}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Button onClick={prevGlimpse} variant="outline" size="icon" className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10">
                        <ChevronLeft />
                    </Button>
                    <Button onClick={nextGlimpse} variant="outline" size="icon" className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10">
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </section>
    );
};


// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        { title: "Sign-up & select role", description: "Founder or advisor — we personalize everything." },
        { title: "Add your company", description: "Basic info → we fetch docs, structure your workspace." },
        { title: "Let the AI assist", description: "Generate docs, review tax view, share workspace with CA." }
    ];
    return (
        <section className="w-full py-20 md:py-32 bg-card/50">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-4">
                    How you start using this in &lt; 3 mins
                </h2>
                <p className="text-lg text-muted-foreground">"From chaos to clarity in 180 seconds."</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center gap-4 text-center">
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/4 left-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-muted-foreground/30 -z-10" style={{ transform: 'translateY(-50%)' }}></div>
                            )}
                             <div className="flex justify-center items-center h-12 w-12 rounded-full bg-background border text-lg font-bold text-primary z-10">
                                {index + 1}
                            </div>
                            <h3 className="font-semibold text-xl mt-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Social Validation Section
const SocialValidationSection = () => {
    const router = useRouter();
    const brandLogos = [
        { name: "Medial", component: <p className="font-bold tracking-widest text-muted-foreground/60">MEDIAL</p> },
        { name: "Product Hunt", component: <p className="font-bold tracking-wider text-muted-foreground/60">PRODUCT HUNT</p> },
        { name: "BetaList", component: <p className="font-bold text-muted-foreground/60">BetaList</p> },
    ];
    return (
        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
                <Card className="p-6 md:p-10 max-w-2xl mx-auto bg-card/50 text-center interactive-lift">
                    <p className="text-2xl font-medium leading-snug">"Before this, I had legal docs in Gmail, tax reminders in WhatsApp, and burn rate in Notion. Now, it's just here — in one clean view."</p>
                    <p className="font-semibold mt-4">— Beta Founder #47</p>
                </Card>
                
                <h3 className="text-lg text-muted-foreground mt-16 mb-4">Built with 100+ founders, CAs, and early-stage advisors from communities like:</h3>
                <div className="my-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                   {brandLogos.map(logo => <div key={logo.name}>{logo.component}</div>)}
                </div>
                <Button className="w-full md:w-auto text-lg interactive-lift mt-8" size="lg" onClick={() => router.push('/register')}>
                    Join Beta
                </Button>
            </div>
        </section>
    );
};


// Footer
const LandingFooter = () => {
    const router = useRouter();
    return (
      <footer className="border-t">
        <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
              This is a beta product. Your feedback shapes it.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <Button variant="link" size="sm" onClick={() => router.push('/dashboard/settings?tab=policies')} className="text-muted-foreground">Terms of Use</Button>
             <Button variant="link" size="sm" onClick={() => router.push('/dashboard/settings?tab=policies')} className="text-muted-foreground">Privacy Policy</Button>
             <Button variant="link" size="sm" onClick={() => router.push('/dashboard/settings?tab=policies')} className="text-muted-foreground">AI Disclaimer</Button>
          </div>
        </div>
      </footer>
    );
};


// Main Page Component
export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" suppressHydrationWarning />
        </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ValueSection />
        <ProductGlimpseSection />
        <HowItWorksSection />
        <SocialValidationSection />
      </main>
      <LandingFooter />
    </div>
  );
}
