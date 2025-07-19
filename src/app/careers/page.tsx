
import Link from 'next/link';

const jobOpenings = [
    { title: "Frontend Engineer", description: "React, Tailwind, WebSockets" },
    { title: "Backend Lead", description: "Node.js, Postgres, Firebase" },
    { title: "AI/NLP Engineer", description: "Langchain, Gemini/GPT APIs" },
    { title: "Founding Designer", description: "UX/UI with taste" },
    { title: "Community + Content", description: "Founders-first storytelling" }
];

const Logo = () => (
    <svg role="img" viewBox="0 0 114 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
        <path d="M23.01 24H11.595V0H23.01v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24zM39.695 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM42.23 24V0h11.415v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24H42.23zM60.15 5.1V0h-2.58v5.1c-1.44-1.8-3.3-2.64-5.58-2.64-4.59 0-8.25 3.66-8.25 8.28s3.66 8.28 8.25 8.28c2.28 0 4.14-.84 5.58-2.64v2.04h2.58V5.1h-2.58zM52.01 10.74c0-3.15 2.52-5.7 5.58-5.7s5.58 2.55 5.58 5.7-2.52 5.7-5.58 5.7-5.58-2.55-5.58-5.7zM70.16 24V0h2.58v24h-2.58zM84.77 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM96.425 24h-9.9V0h9.9v2.559h-7.32v7.92h7.32v2.52h-7.32v8.442h7.32V24zM102.83 24V0h2.58v21.48h8.28V24h-10.86zM0 24V0h8.67a11.959 11.959 0 018.61 3.515c2.31 2.31 3.465 5.265 3.465 8.415s-1.155 6.105-3.465 8.415A11.959 11.959 0 018.67 24H0zm2.58-2.52h6.09c5.85 0 8.775-2.925 8.775-8.835S14.52 3.81 8.67 3.81H2.58v17.67z" />
    </svg>
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
                <p>We believe:</p>
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
