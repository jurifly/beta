
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
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Header Component
const LandingHeader = () => {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/landing')} className="flex items-center gap-2 font-bold text-primary font-headline text-xl">
          <ShieldCheck className="h-6 w-6" />
          <span>Legalizd</span>
        </button>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="link" onClick={() => router.push('/login')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Sign In
          </Button>
          <Button onClick={() => router.push('/register')}>Join Beta Free</Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};


// Animated Counter for social proof
const AnimatedCounter = ({ end }: { end: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 2000;
        if (start === end) return;

        const increment = end / (duration / 10);
        const timer = setInterval(() => {
            start += increment;
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, 10);

        return () => clearInterval(timer);
    }, [end]);

    return <span>{count.toLocaleString()}</span>;
};


// Hero Section
const HeroSection = () => {
    const router = useRouter();
    return (
        <section className="relative w-full py-20 md:py-32">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.05),transparent)]"></div>
            <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight max-w-4xl mx-auto">
                Founders, You Deserve a Clearer Company.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
                Ditch the spreadsheets and chaos. Manage your legal docs, equity, tax, and runway — all from one smart dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" onClick={() => router.push('/register')}>
                    Join Beta Free
                </Button>
                <Button className="text-lg w-full sm:w-auto interactive-lift" size="lg" variant="outline" onClick={() => router.push('/dashboard')}>
                    Preview the Dashboard
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">Built with <AnimatedCounter end={813} />+ founders. Loved by early adopters.</p>
            <div className="mt-12 group interactive-lift">
                <Image
                    src="https://placehold.co/1200x600.png"
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
    const promiseFeatures = [
        { text: "Auto-generate legal documents", icon: FileText },
        { text: "Visualize runway, burn rate & taxes", icon: BarChart },
        { text: "Share clean reports with investors or CAs", icon: HeartHandshake },
        { text: "Sync everything to your Google Drive", icon: DatabaseZap },
    ];

    return (
        <section className="w-full py-20 md:py-32 bg-card/50">
          <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    We don’t replace your CA. We amplify your clarity.
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promiseFeatures.map((feature, index) => (
                    <Card key={index} className="p-6 text-center interactive-lift bg-background/50 animate-in fade-in-25 slide-in-from-bottom-8 duration-500" style={{'animationDelay': `${index * 100}ms`} as React.CSSProperties}>
                        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <feature.icon className="h-8 w-8"/>
                        </div>
                        <p className="font-medium">{feature.text}</p>
                    </Card>
                ))}
            </div>
          </div>
        </section>
    );
}

// Product Demo Section
const productFeatures = [
    { title: "AI Document Generation", description: "Generate compliant legal documents like NDAs, Founders' Agreements, and more, tailored to your context.", image: "https://placehold.co/1200x750.png", hint: "document generation ui" },
    { title: "Financial Snapshot", description: "Visualize your runway, burn rate, and tax liabilities with simple, clear charts. No more spreadsheet headaches.", image: "https://placehold.co/1200x750.png", hint: "financial chart dashboard" },
    { title: "Cap Table Simulator", description: "Model funding rounds and see the dilution impact on your equity structure instantly.", image: "https://placehold.co/1200x750.png", hint: "cap table graph" },
];

const FeatureCarousel = () => {
    const [currentFeature, setCurrentFeature] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const nextFeature = () => setCurrentFeature((prev) => (prev + 1) % productFeatures.length);
    const prevFeature = () => setCurrentFeature((prev) => (prev - 1 + productFeatures.length) % productFeatures.length);
    
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    
    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 50) {
            nextFeature();
        }
        if (touchStartX.current - touchEndX.current < -50) {
            prevFeature();
        }
    };
    
    return (
        <div className="relative max-w-5xl mx-auto">
            <div 
                className="relative w-full overflow-hidden" 
                onTouchStart={handleTouchStart} 
                onTouchMove={handleTouchMove} 
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentFeature * 100}%)` }}>
                    {productFeatures.map((feature, index) => (
                        <div key={index} className="w-full shrink-0 p-2">
                             <Card className="bg-card/50 overflow-hidden interactive-lift">
                                <CardContent className="p-0">
                                    <Image
                                        alt={feature.title}
                                        data-ai-hint={feature.hint}
                                        fetchPriority={index === 0 ? "high" : "low"}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        width={1200}
                                        height={750}
                                        className="border-b"
                                        src={feature.image}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                    {productFeatures.map((_, index) => (
                        <button key={index} onClick={() => setCurrentFeature(index)} className={cn("h-2.5 w-2.5 rounded-full transition-all", currentFeature === index ? 'w-8 bg-primary' : 'bg-muted-foreground/30')}></button>
                    ))}
                </div>
                <div className="text-left md:text-right max-w-sm">
                    <p className="font-bold text-lg">{productFeatures[currentFeature].title}</p>
                    <p className="text-sm text-muted-foreground">{productFeatures[currentFeature].description}</p>
                </div>
            </div>
        </div>
    );
};

const DemoSection = () => {
    return (
        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What does clarity look like?</h2>
                <FeatureCarousel />
                <p className="text-xl font-medium text-muted-foreground mt-12">You don’t need 5 tools. Just one that works.</p>
            </div>
        </section>
    );
};

// How It Works Section
const HowItWorksSection = () => {
    const router = useRouter();
    const howItWorksSteps = [
        { icon: KeyRound, text: "Sign up as founder (or CA)" },
        { icon: Building2, text: "Add company basics (CIN, PAN, etc.)" },
        { icon: TrendingUp, text: "Start tracking, generating & sharing" },
    ];
    return (
        <section className="w-full py-20 md:py-32 bg-card/50">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-12">
                    From chaos to clarity — in 3 steps.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-4 text-center">
                             <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                                <step.icon className="h-8 w-8"/>
                            </div>
                            <p className="font-semibold text-lg">{step.text}</p>
                        </div>
                    ))}
                </div>
                 <p className="text-xl text-muted-foreground mt-12">Takes 3 minutes. Saves you hours every week.</p>
                 <Button className="mt-6" variant="outline" onClick={() => router.push('/dashboard')}>See in Action</Button>
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-8">
                    Built with Founders, not for them.
                </h2>
                <div className="my-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                   {brandLogos.map(logo => <div key={logo.name}>{logo.component}</div>)}
                </div>
                <Card className="p-6 max-w-lg mx-auto bg-card/50 text-left interactive-lift">
                    <p className="text-lg italic mb-4">“This is exactly what we needed before fundraising.”</p>
                    <p className="font-semibold">— Niket, Medial</p>
                </Card>
                <Button className="w-full md:w-auto text-lg interactive-lift mt-12" size="lg" onClick={() => router.push('/register')}>
                    Join Our Beta Community
                </Button>
            </div>
        </section>
    );
};

// Sticky CTA Banner
const StickyCTABanner = () => {
    const router = useRouter();
    return (
        <div className="fixed bottom-0 z-40 w-full animate-in slide-in-from-bottom-12 duration-500">
            <div className="container mx-auto p-4">
                <div className="rounded-lg bg-background/80 p-3 shadow-2xl ring-1 ring-border backdrop-blur-md">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-center text-sm font-medium">
                            <span className="font-semibold text-accent">💥 Early users get 5 free credits/day.</span> No card needed.
                        </p>
                        <Button onClick={() => router.push('/register')} className="w-full sm:w-auto" variant="accent">
                            Reserve Your Spot
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Footer
const LandingFooter = () => {
    const router = useRouter();
    return (
      <footer className="border-t">
        <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose md:text-left">
              Your company’s clarity, one click away.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  📜 Policies <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push('/dashboard/legal-policies?tab=terms')}>Terms of Service</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/legal-policies?tab=privacy')}>Privacy Policy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/legal-policies?tab=disclaimer')}>AI Disclaimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
             <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Legalizd</p>
          </div>
        </div>
      </footer>
    );
};


// Main Page Component
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <LandingHeader />
      <main className="flex-1 pb-24 sm:pb-16">
        <HeroSection />
        <ValueSection />
        <DemoSection />
        <HowItWorksSection />
        <SocialValidationSection />
      </main>
      <StickyCTABanner />
      <LandingFooter />
    </div>
  );
}
