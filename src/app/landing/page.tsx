"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";


const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
                <Link href="/landing" className="flex items-center gap-2 font-bold text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M10 10h4" /><path d="m14 8-2-2-2 2" /><path d="m10 12 2 2 2-2" /></svg>
                    <span>LexIQ</span>
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center gap-4">
                     <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Sign In
                    </Link>
                    <ThemeToggle />
                </nav>
            </div>
        </div>
    </header>
);

const LandingFooter = () => (
     <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M10 10h4" /><path d="m14 8-2-2-2 2" /><path d="m10 12 2 2 2-2" /></svg>
                <p className="text-center text-sm leading-loose md:text-left">
                    © {new Date().getFullYear()} LexIQ. All Rights Reserved.
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
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
                    <div className="text-center lg:text-start space-y-6">
                        <main className="text-5xl md:text-6xl font-bold">
                            <h1 className="inline">
                                <span className="inline bg-gradient-to-r from-primary to-accent/80 text-transparent bg-clip-text">
                                    Your AI Co-Pilot
                                </span>{" "}
                                for Startup Compliance & Docs
                            </h1>
                        </main>
                        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
                            Organize legal tasks, track compliance, and collaborate with your CA in one place.
                        </p>
                        <div className="space-y-4 md:space-y-0 md:space-x-4">
                             <Button className="w-full md:w-1/3 text-lg" asChild>
                                 <Link href="/register">Join Free Beta</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="z-10">
                        <Image
                            src="https://placehold.co/720x480.png"
                            width={720}
                            height={480}
                            alt="LexIQ Dashboard Screenshot"
                            className="rounded-lg border shadow-lg"
                            data-ai-hint="dashboard laptop"
                        />
                    </div>
                    {/* Background Grid */}
                    <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,hsl(var(--primary)_/_15%),transparent)]"></div></div>
                </section>
                
                {/* Key Benefits Section */}
                <section id="features" className="container py-24 sm:py-32 space-y-8">
                    <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
                        Key{" "}
                        <span className="bg-gradient-to-r from-primary to-accent/80 text-transparent bg-clip-text">
                            Benefits
                        </span>
                    </h2>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <Card className="interactive-lift">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldCheck/>Compliance Health Dashboard</CardTitle>
                            </CardHeader>
                            <CardContent>See your company's legal hygiene score, track filing deadlines, and get automated reminders so nothing falls through the cracks.</CardContent>
                        </Card>
                         <Card className="interactive-lift">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Zap/>AI Document Generation & Insights</CardTitle>
                            </CardHeader>
                            <CardContent>Instantly generate NDAs, employment letters, and other legal docs. Analyze incoming contracts for risks and get AI-powered insights.</CardContent>
                        </Card>
                         <Card className="interactive-lift">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users/>Founder-CA Collaboration Tools</CardTitle>
                            </CardHeader>
                            <CardContent>Securely invite your CA or lawyer to your workspace. Request and share documents, and manage compliance tasks together seamlessly.</CardContent>
                        </Card>
                    </div>
                </section>
                
                {/* Screenshots Section */}
                 <section id="demo" className="container py-24 sm:py-32 space-y-8 text-center bg-muted/50 rounded-lg">
                    <h2 className="text-3xl lg:text-4xl font-bold">Product Demo</h2>
                    <p className="text-muted-foreground md:w-1/2 mx-auto">
                        A glimpse into the powerful features that make compliance management effortless.
                    </p>
                    <Image
                        src="https://placehold.co/1200x600.png"
                        width={1200}
                        height={600}
                        alt="Product Demo Screenshot"
                        className="rounded-lg border shadow-lg mx-auto"
                        data-ai-hint="app screenshot"
                    />
                 </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="container py-24 sm:py-32">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl lg:text-4xl font-bold">What Early Adopters Say</h2>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <Card className="interactive-lift">
                            <CardContent className="pt-6">
                                <blockquote className="italic">"LexIQ has been a game-changer for us. The automated compliance calendar saved us from missing critical deadlines."</blockquote>
                            </CardContent>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">AN</div>
                                    <div>
                                        <CardTitle className="text-base">Ananya Sharma</CardTitle>
                                        <p className="text-sm text-muted-foreground">Founder, TechVerse</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="interactive-lift">
                             <CardContent className="pt-6">
                                <blockquote className="italic">"The AI contract analyzer is like having a lawyer on call 24/7. It identified a risky clause in a vendor agreement that we had completely missed."</blockquote>
                            </CardContent>
                           <CardHeader>
                               <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">RV</div>
                                    <div>
                                        <CardTitle className="text-base">Rohan Verma</CardTitle>
                                        <p className="text-sm text-muted-foreground">CEO, Finova</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                         <Card className="interactive-lift">
                             <CardContent className="pt-6">
                                <blockquote className="italic">"As a CA, managing multiple clients' compliance is a challenge. LexIQ's portfolio dashboard gives me a bird's-eye view of everything."</blockquote>
                            </CardContent>
                           <CardHeader>
                               <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">SK</div>
                                    <div>
                                        <CardTitle className="text-base">Suresh Kumar</CardTitle>
                                        <p className="text-sm text-muted-foreground">Chartered Accountant</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section id="cta" className="py-24 sm:py-32">
                    <div className="container text-center">
                         <h2 className="text-3xl md:text-4xl font-bold">
                            Ready to Automate Your Compliance?
                        </h2>
                        <p className="text-xl text-muted-foreground mt-4 mb-8">
                            Join our free beta and take control of your startup's legal health today.
                        </p>
                         <Button className="w-full md:w-auto text-lg" size="lg" asChild>
                             <Link href="/register">Sign Up Free <ArrowRight className="ml-2"/></Link>
                        </Button>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </div>
    );
}