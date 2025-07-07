
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";


const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/landing" className="flex items-center gap-2 font-bold text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M10 10h4" /><path d="m14 8-2-2-2 2" /><path d="m10 12 2 2 2-2" /></svg>
                <span>LexIQ</span>
            </Link>
            <nav className="flex items-center gap-4">
                 <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Sign In
                </Link>
                <ThemeToggle />
            </nav>
        </div>
    </header>
);

const LandingFooter = () => (
     <footer className="border-t">
        <div className="container mx-auto flex max-w-screen-lg flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0 px-4 sm:px-6 lg:px-8">
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
        <div className="flex min-h-screen flex-col bg-background">
            <LandingHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full py-20 md:py-32">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--primary-rgb)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-rgb)/0.05)_1px,transparent_1px)] bg-[size:6rem_4rem]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,hsl(var(--primary-rgb)/0.15),transparent)]"></div>
                    </div>
                    <div className="container mx-auto grid max-w-screen-lg lg:grid-cols-2 place-items-center gap-10 px-4 sm:px-6 lg:px-8">
                        <div className="text-center lg:text-start space-y-6">
                            <div className="text-4xl md:text-6xl font-bold">
                                <h1 className="inline">
                                    <span className="inline text-primary">
                                        Your AI Co-Pilot
                                    </span>{" "}
                                    for Startup Compliance & Docs
                                </h1>
                            </div>
                            <p className="text-lg md:text-xl text-muted-foreground mx-auto lg:mx-0 max-w-2xl">
                                Organize legal tasks, track compliance, and collaborate with your CA in one place.
                            </p>
                            <div className="space-y-4 md:space-y-0 md:space-x-4">
                                 <Button className="w-full md:w-auto text-lg" size="lg" asChild>
                                     <Link href="/register">Join Free Beta</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="z-10 group">
                            <Image
                                src="https://placehold.co/720x480.png"
                                width={720}
                                height={480}
                                alt="LexIQ Dashboard Screenshot"
                                className="rounded-lg border-2 border-muted shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="dashboard laptop"
                            />
                        </div>
                    </div>
                </section>
                
                {/* Key Benefits Section */}
                <section id="features" className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Key <span className="text-primary">Benefits</span>
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Everything you need to stay compliant and scale your business, all in one place.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 justify-center">
                             <div className="grid gap-1 text-left">
                                <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="text-primary"/>Compliance Dashboard</h3>
                                <p className="text-sm text-muted-foreground">
                                    See your company's legal hygiene score, track filing deadlines, and get automated reminders so nothing falls through the cracks.
                                </p>
                             </div>
                             <div className="grid gap-1 text-left">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Zap className="text-primary"/>AI Document Tools</h3>
                                <p className="text-sm text-muted-foreground">
                                    Instantly generate NDAs, employment letters, and other legal docs. Analyze incoming contracts for risks and get AI-powered insights.
                                </p>
                             </div>
                             <div className="grid gap-1 text-left">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Users className="text-primary"/>Collaboration Hub</h3>
                                <p className="text-sm text-muted-foreground">
                                    Securely invite your CA or lawyer to your workspace. Request and share documents, and manage compliance tasks together seamlessly.
                                </p>
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* Screenshots Section */}
                 <section id="demo" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 space-y-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold">Product Demo</h2>
                    <p className="text-muted-foreground md:w-1/2 mx-auto">
                        A glimpse into the powerful features that make compliance management effortless.
                    </p>
                    <div className="group mt-8">
                        <Image
                            src="https://placehold.co/1200x600.png"
                            width={1200}
                            height={600}
                            alt="Product Demo Screenshot"
                            className="rounded-lg border shadow-lg mx-auto transition-transform duration-500 group-hover:scale-105"
                            data-ai-hint="app screenshot"
                        />
                    </div>
                 </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What Early Adopters Say</h2>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="text-left">
                                <CardContent className="pt-6">
                                    <blockquote className="italic border-l-4 border-primary/50 pl-4">"LexIQ has been a game-changer for us. The automated compliance calendar saved us from missing critical deadlines."</blockquote>
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
                            <Card className="text-left">
                                <CardContent className="pt-6">
                                    <blockquote className="italic border-l-4 border-primary/50 pl-4">"The AI contract analyzer is like having a lawyer on call 24/7. It identified a risky clause in a vendor agreement that we had completely missed."</blockquote>
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
                            <Card className="text-left">
                                <CardContent className="pt-6">
                                    <blockquote className="italic border-l-4 border-primary/50 pl-4">"As a CA, managing multiple clients' compliance is a challenge. LexIQ's portfolio dashboard gives me a bird's-eye view of everything."</blockquote>
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
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section id="cta" className="relative overflow-hidden py-24 sm:py-32">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary-rgb)/0.1),transparent)]"></div>
                    <div className="container mx-auto text-center relative px-4 sm:px-6 lg:px-8">
                         <h2 className="text-3xl md:text-4xl font-bold">
                            Ready to Automate Your Compliance?
                        </h2>
                        <p className="text-xl text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
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
