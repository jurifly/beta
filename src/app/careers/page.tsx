
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background border-b">
        <Link className="flex items-center justify-center font-bold" href="/landing">
          JuriFly
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/landing#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/landing#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Team</h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We're looking for passionate individuals to help us simplify compliance for startups.
            </p>
             <p className="mt-8 text-muted-foreground">
                No open positions at the moment, but check back soon!
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
