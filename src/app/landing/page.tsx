
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/landing" className="flex items-center gap-2 font-bold text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Legalizd</span>
            </Link>
            <nav className="flex items-center gap-4">
                 <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Sign In
                </Link>
                <Button asChild>
                   <Link href="/register">Get Started Free</Link>
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
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <p className="text-center text-sm leading-loose md:text-left">
                    © {new Date().getFullYear()} Legalizd. All Rights Reserved.
                </p>
            </div>
             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/dashboard/legal-policies?tab=terms" className="hover:text-primary">Terms of Service</Link>
                <Link href="/dashboard/legal-policies?tab=privacy" className="hover:text-primary">Privacy Policy</Link>
            </div>
        </div>
    </footer>
);


export default function LandingPage() {
    const features = [
        { 
            title: "Company Overview", 
            description: "Stay on top of your compliance health, alerts, and key filings.", 
            image: { src: "https://placehold.co/1200x675.png", hint: "dashboard compliance" }
        },
        { 
            title: "LaunchPad", 
            description: "AI-guided company formation. Choose the right structure, NIC code, and generate setup docs in minutes.",
            image: { src: "https://placehold.co/1200x675.png", hint: "business setup" }
        },
        { 
            title: "AI Document Generator", 
            description: "From NDAs to board resolutions — just describe, and generate.", 
            image: { src: "https://placehold.co/1200x675.png", hint: "document generation" }
        },
        { 
            title: "Document Vault", 
            description: "Secure your compliance files. Integrated with your Google Drive.",
            image: { src: "https://placehold.co/1200x675.png", hint: "cloud storage" }
        },
        { 
            title: "Cap Table & Equity Modeling", 
            description: "See founder holdings, simulate dilution, plan fundraising.",
            image: { src: "https://placehold.co/1200x675.png", hint: "financial chart" }
        },
        { 
            title: "Financials", 
            description: "Track burn rate, runway, and calculate taxes (personal + corporate). Global support.",
            image: { src: "https://placehold.co/1200x675.png", hint: "tax calculator" }
        },
    ];

    const globalFeatures = [
        "No legal jargon",
        "No missed filings",
        "No chaos",
    ];

    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

    const nextFeature = () => {
        setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    };

    const prevFeature = () => {
        setCurrentFeatureIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
    };
    
    return (
        <div className={`flex min-h-screen flex-col bg-background ${inter.variable} font-body`}>
            <LandingHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full py-24 md:py-32">
                     <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary-rgb)/0.1),transparent)]"></div>
                    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight max-w-4xl mx-auto">
                            Your Startup’s Legal & Compliance Copilot
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-3xl mt-6">
                            One smart workspace to manage company setup, documents, compliance, and financial insights — all in plain English, powered by AI.
                        </p>
                        <div className="mt-8">
                             <Button className="text-lg interactive-lift" size="lg" asChild>
                                 <Link href="/register">Sign Up Free <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </div>
                        <div className="mt-16 group interactive-lift">
                            <Image
                                src="https://placehold.co/1200x600.png"
                                width={1200}
                                height={600}
                                alt="Legalizd App Screenshot"
                                className="rounded-xl border-2 border-muted shadow-2xl"
                                data-ai-hint="dashboard modern"
                                priority
                            />
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container mx-auto space-y-16 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                                Smarter Dashboard for Founders
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Everything your startup needs, one clean interface.
                            </p>
                        </div>
                        
                        <div className="relative max-w-4xl mx-auto">
                            <Card key={features[currentFeatureIndex].title} className="bg-card/80 backdrop-blur-sm overflow-hidden interactive-lift animate-in fade-in-50 duration-500">
                                <CardHeader className="p-0">
                                    <Image
                                        src={features[currentFeatureIndex].image.src}
                                        width={1200}
                                        height={675}
                                        alt={features[currentFeatureIndex].title}
                                        className="border-b"
                                        data-ai-hint={features[currentFeatureIndex].image.hint}
                                    />
                                </CardHeader>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{features[currentFeatureIndex].title}</h3>
                                    <p className="text-muted-foreground">{features[currentFeatureIndex].description}</p>
                                </CardContent>
                            </Card>

                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full h-12 w-12 hidden md:flex interactive-lift"
                                onClick={prevFeature}
                            >
                                <ChevronLeft className="h-6 w-6" />
                                <span className="sr-only">Previous feature</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full h-12 w-12 hidden md:flex interactive-lift"
                                onClick={nextFeature}
                            >
                                <ChevronRight className="h-6 w-6" />
                                <span className="sr-only">Next feature</span>
                            </Button>
                        </div>
                         <div className="flex md:hidden items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                className="interactive-lift"
                                onClick={prevFeature}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                className="interactive-lift"
                                onClick={nextFeature}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>

                 {/* Global Entrepreneurs Section */}
                 <section id="global-features" className="w-full py-20 md:py-32">
                    <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-screen-md">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                            Made for Global Entrepreneurs
                        </h2>
                        <div className="my-8 flex flex-wrap justify-center gap-4">
                            {globalFeatures.map(item => (
                                <Card key={item} className="p-4 bg-muted/50 interactive-lift">
                                    <p className="font-semibold text-lg flex items-center gap-2"><CheckCircle className="text-primary"/>{item}</p>
                                </Card>
                            ))}
                        </div>
                        <p className="text-xl text-muted-foreground">
                            Just clarity, AI guidance, and founder-first design.
                        </p>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section id="cta" className="relative overflow-hidden py-24 sm:py-32 bg-muted/50">
                    <div className="container mx-auto text-center relative px-4 sm:px-6 lg:px-8">
                         <h2 className="text-3xl md:text-4xl font-bold font-headline">
                            Get Early Access — 5 AI Credits Daily
                        </h2>
                        <p className="text-xl text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
                            Beta users get 5 free AI credits/day to generate docs, ask questions, and simulate scenarios.
                        </p>
                         <Button className="w-full md:w-auto text-lg interactive-lift" size="lg" asChild>
                             <Link href="/register">Sign Up Free <ArrowRight className="ml-2"/></Link>
                        </Button>
                         <p className="text-sm text-muted-foreground mt-4">
                            No card. No spam. Just tools that work.
                        </p>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </div>
    );
}
