
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, DatabaseZap, BrainCircuit, Workflow, ShieldCheck } from 'lucide-react';

const AboutFeature = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary mt-1 shrink-0"/>
        <p className="text-muted-foreground">{text}</p>
    </div>
);

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background border-b">
        <Link className="flex items-center justify-center font-bold" href="/landing">
          JuriFly
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
