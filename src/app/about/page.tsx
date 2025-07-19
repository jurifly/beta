
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, DatabaseZap, BrainCircuit, Workflow, ShieldCheck, LineChart } from 'lucide-react';

const AboutFeature = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary mt-1 shrink-0"/>
        <p className="text-muted-foreground">{text}</p>
    </div>
);

const Logo = () => (
    <svg role="img" viewBox="0 0 114 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
        <path d="M23.01 24H11.595V0H23.01v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24zM39.695 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM42.23 24V0h11.415v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24H42.23zM60.15 5.1V0h-2.58v5.1c-1.44-1.8-3.3-2.64-5.58-2.64-4.59 0-8.25 3.66-8.25 8.28s3.66 8.28 8.25 8.28c2.28 0 4.14-.84 5.58-2.64v2.04h2.58V5.1h-2.58zM52.01 10.74c0-3.15 2.52-5.7 5.58-5.7s5.58 2.55 5.58 5.7-2.52 5.7-5.58 5.7-5.58-2.55-5.58-5.7zM70.16 24V0h2.58v24h-2.58zM84.77 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM96.425 24h-9.9V0h9.9v2.559h-7.32v7.92h7.32v2.52h-7.32v8.442h7.32V24zM102.83 24V0h2.58v21.48h8.28V24h-10.86zM0 24V0h8.67a11.959 11.959 0 018.61 3.515c2.31 2.31 3.465 5.265 3.465 8.415s-1.155 6.105-3.465 8.415A11.959 11.959 0 018.67 24H0zm2.58-2.52h6.09c5.85 0 8.775-2.925 8.775-8.835S14.52 3.81 8.67 3.81H2.58v17.67z" />
    </svg>
);


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background border-b">
        <Link className="flex items-center justify-center" href="/landing">
            <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/landing#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/landing#faq"
          >
            FAQs
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/about"
          >
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    About JuriFly
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    At JuriFly, we believe Indian founders deserve clarity, not chaos.
                  </p>
                </div>
                <p className="max-w-[600px] text-muted-foreground">
                    Built for entrepreneurs and chartered accountants, JuriFly acts as your intelligent co-pilot—demystifying compliance, visualizing financials, and turning jargon into action.
                </p>
                 <p className="max-w-[600px] text-muted-foreground">
                    No more waiting weeks for updates. No more scrambling through WhatsApp chats or buried emails. We don't just show your numbers—we help you understand them.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg bg-muted/50 p-6 border">
                <AboutFeature icon={LineChart} text="Auto-generated summaries: runway, burn rate, GSTR, ITR timelines" />
                <AboutFeature icon={DatabaseZap} text="Real-time workspace: synced docs, advisor comments, version history" />
                <AboutFeature icon={BrainCircuit} text="Built-in intelligence: timely alerts, human-friendly explanations, and AI-driven insights" />
                <AboutFeature icon={ShieldCheck} text="Zero filing stress—we don’t file, we inform" />
              </div>
            </div>
            <div className="mt-12 text-center">
                 <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg">
                    Whether you're a founder on the run or a CA managing 40 clients, JuriFly gives you control, visibility, and peace of mind.
                 </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © JuriFly. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/dashboard/settings?tab=policies">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/dashboard/settings?tab=policies">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
