

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
  LayoutDashboard,
  PieChart,
  Network,
  Receipt,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreatureAnimation } from "./CreatureAnimation";


const Logo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 5.5L12 9.5L4 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 16.5L12 18L8.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7L17 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          <span>Jurifly</span>
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
            <CreatureAnimation />
            <div className="container relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight max-w-4xl mx-auto">
                Founders Clarity. Finally.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
                There would be no longer clumsy dashboards. Comparative clarity, all you need on behalf of your company documents, taxes and compliances, in one clean room.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" onClick={() => router.push('/register')}>
                    Join Beta
                </Button>
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                    See Features
                </Button>
            </div>
            </div>
        </section>
    )
};

// Value Props Section
const ValueSection = () => {
    const valueProps = [
        { text: "Auto-generate docs", description: "Legal forms made in seconds.", icon: FileText },
        { text: "Sometimes you have to imagine your finances", description: "Burn-rate, runway, tax summaries, topical and up-to-date.", icon: BarChart },
        { text: "Sync, store, share", description: "All your documents + filings on your drive and always available.", icon: DatabaseZap },
        { text: "Advisor Comments Mode", description: "Collaborate on your workspace with your CA or investor with a single-click.", icon: HeartHandshake },
    ];

    return (
        <section id="features" className="w-full py-20 md:py-32 bg-card/50">
          <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    All you expected a CA to do, but not with the wait.
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
        { title: "Dashboard", icon: LayoutDashboard, imageUrl: "https://ik.imagekit.io/claariai/Dashboard.png?updatedAt=1752544425831" },
        { title: "Analytics", icon: TrendingUp, imageUrl: "https://ik.imagekit.io/claariai/Analytics.png?updatedAt=1752544425818" },
        { title: "Cap Table", icon: PieChart, imageUrl: "https://ik.imagekit.io/claariai/cap%20table.png?updatedAt=1752544425744" },
        { title: "Launch Pad", icon: Network, imageUrl: "https://ik.imagekit.io/claariai/launch%20pad.png?updatedAt=1752544425723" },
        { title: "Financials", icon: Receipt, imageUrl: "https://ik.imagekit.io/claariai/Financial.png?updatedAt=1752544425721" },
    ];
    const [activeGlimpse, setActiveGlimpse] = useState(glimpses[0]);
    
    return (
        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">This is no software. It's sanity.</h2>
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-b pb-4">
                    {glimpses.map((glimpse) => (
                        <Button
                            key={glimpse.title}
                            variant={activeGlimpse.title === glimpse.title ? "default" : "outline"}
                            className="transition-all duration-200"
                            onClick={() => setActiveGlimpse(glimpse)}
                        >
                           <glimpse.icon className="mr-2 h-4 w-4"/>
                            {glimpse.title}
                        </Button>
                    ))}
                </div>
                 <div className="group relative mt-8 aspect-[16/10] w-full max-w-5xl mx-auto [perspective:1000px]">
                    <div className="relative rounded-lg w-full h-full shadow-2xl dark:shadow-black/60 transition-transform duration-500 ease-in-out group-hover:[transform:rotateX(10deg)] [transform-style:preserve-3d]">
                        <Image
                          key={activeGlimpse.imageUrl}
                          src={activeGlimpse.imageUrl}
                          alt={`${activeGlimpse.title} screenshot`}
                          width={1200}
                          height={750}
                          className="w-full h-full object-contain object-center rounded-md"
                          data-ai-hint="application screenshot"
                        />
                         <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                    </div>
                 </div>
            </div>
        </section>
    );
};


// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        { title: "Register & choose position", description: "Advisor or founder, we make everything personal." },
        { title: "Include your own company", description: "Simple data → we download documents, organize you your place of work." },
        { title: "Allow the AI to help me out", description: "PDF-docs, Tax View, share workspace with CA." }
    ];
    return (
        <section className="w-full py-20 md:py-32 bg-card/50">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-4">
                    The time that you will begin using this in &lt; 3 mins
                </h2>
                <p className="text-lg text-muted-foreground">The 180 seconds concept is - chaos to clarity.</p>
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
                    <p className="text-2xl font-medium leading-snug">"Prior to this, I used Gmail to store my legal docs, WhatsApp to send tax reminders, and Notion to manage burn rate. It is now, simply, here - just here in one clear picture."</p>
                    <p className="font-semibold mt-4">— Here is a Founder of beta #47.</p>
                </Card>
                
                <h3 className="text-lg text-muted-foreground mt-16 mb-4">Constructed on 100+ founders, CAs, and early-stage advisors of the community such as:</h3>
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
              It is a beta product. It is influenced by your feedback.
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
