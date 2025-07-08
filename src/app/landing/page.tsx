
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, ShieldCheck, Users, Zap, Briefcase, PieChart, BookUser, Archive, Network } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";


const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/landing" className="flex items-center gap-2 font-bold text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Legalizd</span>
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
        { icon: Network, title: "Launch Pad", description: "Choose the right structure. Generate docs. Kickstart your company setup." },
        { icon: PieChart, title: "Cap Table & Runway", description: "Visualize ownership, dilution, burn rate & runway — without spreadsheets." },
        { icon: Zap, title: "AI Legal Toolkit", description: "Draft contracts. Analyze clauses. Ask legal/tax questions — all via AI." },
        { icon: Archive, title: "Document Vault", description: "Store & manage your company’s critical documents, securely and globally." },
        { icon: Users, title: "Advisor Connect", description: "Add your legal/finance advisor. Sync updates, filings, and requests in real time." },
    ];
    
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
                            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
                                Built for Founders. Trusted by Professionals.
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground mx-auto lg:mx-0 max-w-2xl">
                                Incorporate smarter, manage equity, track compliance, and generate legal docs — all in one intelligent workspace.
                            </p>
                            <div className="space-y-4 md:space-y-0 md:space-x-4">
                                 <Button className="w-full md:w-auto text-lg" size="lg" asChild>
                                     <Link href="/register">Join Beta – It’s Free</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="z-10 group">
                            <Image
                                src="https://placehold.co/720x480.png"
                                width={720}
                                height={480}
                                alt="Legalizd Dashboard Screenshot"
                                className="rounded-lg border-2 border-muted shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="dashboard modern"
                            />
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                                Your Command Center for Company Ops
                            </h2>
                        </div>
                        <div className="mx-auto">
                            <Card>
                                <Table>
                                    <TableBody>
                                        {features.map(feature => (
                                            <TableRow key={feature.title}>
                                                <TableCell className="w-12 p-4 align-top"><feature.icon className="w-6 h-6 text-primary"/></TableCell>
                                                <TableCell className="p-4"><h3 className="font-semibold">{feature.title}</h3></TableCell>
                                                <TableCell className="p-4 text-muted-foreground">{feature.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Who is this for? */}
                 <section id="who-is-this-for" className="w-full py-20 md:py-32">
                    <div className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-8 max-w-screen-lg">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Who is this for?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-4">🧑‍🚀 Startup Founders</h3>
                                <ul className="space-y-2 list-inside list-disc text-muted-foreground">
                                    <li>Incorporate with clarity</li>
                                    <li>Track legal health in real-time</li>
                                    <li>Centralize all compliance workflows</li>
                                </ul>
                            </Card>
                             <Card className="p-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-4">👨‍💼 Finance & Legal Pros</h3>
                                <ul className="space-y-2 list-inside list-disc text-muted-foreground">
                                    <li>Manage multiple clients or ventures</li>
                                    <li>Automate reporting & compliance tracking</li>
                                    <li>Collaborate securely with founders & teams</li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* Why Legalizd? */}
                <section id="why" className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Why Legalizd?</h2>
                        </div>
                        <div className="mx-auto max-w-3xl text-muted-foreground text-left space-y-2">
                           <p className="flex items-center gap-2"><ShieldCheck className="text-primary"/> Globally adaptable legal infrastructure</p>
                           <p className="flex items-center gap-2"><Zap className="text-primary"/> AI-powered automation across workflows</p>
                           <p className="flex items-center gap-2"><Users className="text-primary"/> Designed by founders for founders</p>
                           <p className="flex items-center gap-2"><Briefcase className="text-primary"/> Future-ready for remote-first companies</p>
                        </div>
                    </div>
                </section>
                
                {/* Testimonials Section */}
                <section id="testimonials" className="w-full py-20 md:py-32">
                    <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">What Early Users Are Saying</h2>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
                            <Card className="text-left bg-muted/50">
                                <CardContent className="pt-6">
                                    <blockquote className="text-lg">“It’s like Notion + Stripe Atlas + ChatGPT had a baby — I can launch, manage, and stay compliant with less stress.”</blockquote>
                                </CardContent>
                                <CardHeader>
                                    <p className="font-semibold">Ava M., Founder, NYC</p>
                                </CardHeader>
                            </Card>
                             <Card className="text-left bg-muted/50">
                                <CardContent className="pt-6">
                                    <blockquote className="text-lg">“Finally a dashboard that speaks founder.”</blockquote>
                                </CardContent>
                                <CardHeader>
                                    <p className="font-semibold">Liam S., YC-backed CEO</p>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section id="cta" className="relative overflow-hidden py-24 sm:py-32">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary-rgb)/0.1),transparent)]"></div>
                    <div className="container mx-auto text-center relative px-4 sm:px-6 lg:px-8">
                         <h2 className="text-3xl md:text-4xl font-bold font-headline">
                            Beta Access – Now Rolling Out
                        </h2>
                        <p className="text-xl text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
                            Get early access. Earn bonus credits. Help shape the future of founder ops.
                        </p>
                         <Button className="w-full md:w-auto text-lg" size="lg" asChild>
                             <Link href="/register">Join the Waitlist <ArrowRight className="ml-2"/></Link>
                        </Button>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </div>
    );
}
