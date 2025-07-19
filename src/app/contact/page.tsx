
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare } from 'lucide-react';
import Image from 'next/image';

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/yBQDJHJ8/1-2.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);


export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background border-b">
        <Link className="flex items-center justify-center" href="/landing">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/landing#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/landing#faq">
            FAQs
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
              Whether you're a founder building the next unicorn, or a CA trying to scale your practice—JuriFly is for you.
            </p>
            <p className="mt-2 text-muted-foreground">Reach out, we're friendly.</p>
            <div className="mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
                <Mail className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Email Us</h3>
                <p className="text-muted-foreground">Our inbox is always open.</p>
                <Button asChild>
                  <a href="mailto:hello@jurifly.in">hello@jurifly.in</a>
                </Button>
              </div>
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
                <MessageSquare className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Support Chat</h3>
                <p className="text-muted-foreground">Mon–Sat, 10 AM – 7 PM IST</p>
                <Button disabled>Live Chat (Coming Soon)</Button>
              </div>
            </div>
             <p className="mt-12 text-sm text-muted-foreground">
                📍 Remote-first, proudly made in India 🇮🇳
            </p>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© JuriFly. All rights reserved.</p>
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
