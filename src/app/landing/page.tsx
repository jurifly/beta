
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  GanttChartSquare,
  GitCompareArrows,
  HeartHandshake,
  KeyRound,
  Library,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LandingHeader = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link
        href="/landing"
        className="flex items-center gap-2 font-bold text-primary font-headline text-xl"
      >
        <ShieldCheck className="h-6 w-6" />
        <span>Legalizd</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Sign In
        </Link>
        <Button asChild>
          <Link href="/register">Join Beta Now</Link>
        </Button>
        <ThemeToggle />
      </nav>
    </div>
  </header>
);

const LandingFooter = () => (
  <footer className="border-t">
    <div className="container mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <p className="text-center text-sm leading-loose md:text-left">
          © {new Date().getFullYear()} Legalizd. All Rights Reserved.
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/legal-policies?tab=terms">
                Terms of Service
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/legal-policies?tab=privacy">
                Privacy Policy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/legal-policies?tab=disclaimer">
                AI Disclaimer
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </footer>
);

const StickyFooter = () => (
  <div className="fixed bottom-0 z-40 w-full animate-in slide-in-from-bottom-12 duration-500">
    <div className="container mx-auto p-4">
        <div className="rounded-lg bg-background/80 p-3 shadow-2xl ring-1 ring-border backdrop-blur-md">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-center text-sm font-medium">
                    <span className="hidden sm:inline">✨ </span>Early founders get 5 free AI credits/day. No credit card required.
                </p>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/register">Join Beta Now</Link>
                </Button>
            </div>
        </div>
    </div>
  </div>
);

const AnimatedCounter = ({ end }: { end: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 10);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
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

export default function LandingPage() {
  const promiseFeatures = [
    { text: "Auto-generate legal documents", icon: FileText },
    { text: "Visualize runway & tax risks", icon: GanttChartSquare },
    { text: "One-click share with advisors", icon: HeartHandshake },
    { text: "Sync with Google Drive", icon: GitCompareArrows },
  ];
  
  const productMockups = [
    { title: "Compliance Hub", image: "https://placehold.co/1200x750.png", hint: "dashboard compliance" },
    { title: "Document Generator", image: "https://placehold.co/1200x750.png", hint: "document generation" },
    { title: "Cap Table Modeling", image: "https://placehold.co/1200x750.png", hint: "financial chart" },
  ];
  
  const howItWorksSteps = [
    { icon: KeyRound, text: "Sign up as a founder" },
    { icon: Library, text: "Add company details (CIN, PAN, etc.)" },
    { icon: Zap, text: "Start tracking, generating, sharing" },
  ];

  const brandLogos = [
    { name: "Medial", component: <p className="font-bold tracking-widest text-muted-foreground/60">MEDIAL</p> },
    { name: "Product Hunt", component: <p className="font-bold tracking-wider text-muted-foreground/60">PRODUCT HUNT</p> },
    { name: "BetaList", component: <p className="font-bold text-muted-foreground/60">BetaList</p> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <LandingHeader />
      <main className="flex-1 pb-24 sm:pb-16">
        {/* 1. Hero Section */}
        <section className="relative w-full py-20 md:py-32">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary-rgb)/0.1),transparent)]"></div>
          <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight max-w-4xl mx-auto">
              Founders, You Deserve Better Than Chaos.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
              Get instant clarity on your company’s legal docs, finances, and
              compliance — all in one dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="text-lg w-full sm:w-auto" size="lg" asChild>
                <Link href="/register">Join Beta Now</Link>
              </Button>
              <Button
                className="text-lg w-full sm:w-auto"
                size="lg"
                variant="outline"
              >
                See a 30-sec Preview
              </Button>
            </div>
            <div className="mt-16 group interactive-lift">
              <Image
                src="https://placehold.co/800x400.png"
                width={800}
                height={400}
                alt="Abstract hero visual"
                className="rounded-xl border-2 border-muted shadow-2xl"
                data-ai-hint="abstract 3d stack"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2. Promise Section */}
        <section className="w-full py-20 md:py-32 bg-muted/50">
          <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    We’re not a CA. We’re your clarity engine.
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promiseFeatures.map((feature, index) => (
                    <Card key={index} className="p-6 text-center interactive-lift animate-in fade-in-25 slide-in-from-bottom-8 duration-500" style={{'--index': index} as React.CSSProperties}>
                        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                            <feature.icon className="h-8 w-8"/>
                        </div>
                        <p className="font-medium">{feature.text}</p>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        {/* 3. Product Visual Mockups Section */}
         <section className="w-full py-20 md:py-32">
            <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {productMockups.map((mockup, index) => (
                        <Card key={index} className="bg-muted/50 overflow-hidden interactive-lift animate-in fade-in-25 slide-in-from-bottom-8 duration-700" style={{'--index': index} as React.CSSProperties}>
                             <CardContent className="p-0">
                                <Image
                                    src={mockup.image}
                                    width={1200}
                                    height={750}
                                    alt={mockup.title}
                                    className="border-b"
                                    data-ai-hint={mockup.hint}
                                />
                            </CardContent>
                            <div className="p-4"><p className="font-medium text-center">{mockup.title}</p></div>
                        </Card>
                    ))}
                 </div>
            </div>
        </section>

        {/* 4. How It Works Section */}
        <section className="w-full py-20 md:py-32 bg-muted/50">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-12">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-4">
                             <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                                <step.icon className="h-8 w-8"/>
                            </div>
                            <p className="font-semibold text-lg">{step.text}</p>
                        </div>
                    ))}
                </div>
                 <p className="text-xl text-muted-foreground mt-12">Takes 3 mins. Saves you weeks.</p>
            </div>
        </section>

        {/* 5. Community-Beta CTA Section */}
        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
                <p className="font-semibold text-primary mb-4">“Built with feedback from real founders.”</p>
                <div className="my-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                   {brandLogos.map(logo => <div key={logo.name}>{logo.component}</div>)}
                </div>
                <Button className="w-full md:w-auto text-lg" size="lg" asChild>
                    <Link href="/register">Join Founders in Beta</Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                    Get 5 free AI credits/day – no card needed.
                </p>
                <p className="text-lg font-bold mt-6">
                    <AnimatedCounter end={813}/> founders already joined
                </p>
            </div>
        </section>
      </main>
      <StickyFooter />
      <LandingFooter />
    </div>
  );
}
