
import Link from 'next/link';
import Image from 'next/image';

const jobOpenings = [
    { title: "Frontend Engineer", description: "React, Tailwind, WebSockets" },
    { title: "Backend Lead", description: "Node.js, Postgres, Firebase" },
    { title: "AI/NLP Engineer", description: "Langchain, Gemini/GPT APIs" },
    { title: "Founding Designer", description: "UX/UI with taste" },
    { title: "Community + Content", description: "Founders-first storytelling" }
];

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/N6p2H0cq/jurifly-icon-new.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/B58rpgyK/jurifly-icon-new-dark.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);


export default function CareersPage() {
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">🚀 Join us in making compliance non-boring.</h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
              We're a fast-moving team obsessed with building the smartest legal-finance layer for Indian startups.
            </p>
            <div className="mx-auto mt-8 grid max-w-lg text-left gap-4">
                <p className="font-semibold">We believe:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                    <li>Compliance should be a superpower, not a burden</li>
                    <li>Founders deserve visibility without chaos</li>
                    <li>CAs need tools as sharp as their minds</li>
                </ul>
            </div>
            <div className="mx-auto mt-12 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight">Current Openings</h2>
                <div className="mt-6 grid gap-4">
                  {jobOpenings.map(job => (
                    <div key={job.title} className="p-4 border rounded-lg text-left">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                  ))}
                </div>
                 <p className="mt-8 text-muted-foreground">
                   ✨ Write to us at <a href="mailto:careers@jurifly.in" className="font-medium text-primary hover:underline">careers@jurifly.in</a> with a link to your work, LinkedIn/GitHub, and a meme you love.
                </p>
            </div>
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
