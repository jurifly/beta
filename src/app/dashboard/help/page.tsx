
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { LifeBuoy, Mail } from "lucide-react"

const faqs = [
  {
    question: "What is Claari?",
    answer: "Claari is an AI-powered platform designed to help startups, CAs, and legal professionals manage their legal and compliance needs efficiently. From document generation to compliance tracking, Claari is your AI legal co-pilot.",
  },
  {
    question: "How do AI credits work?",
    answer: "Most AI-powered actions in the app, like generating a document or analyzing a contract, consume credits. During our beta period, all users have a generous amount of credits to use for free. We will introduce formal credit packs and subscription plans after the beta.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, security is our top priority. All your data is encrypted in transit and at rest. We use industry-standard security practices to protect your information. Your documents are stored securely and are only accessed for the purpose of providing our services to you.",
  },
  {
    question: "How does the Founder-CA connect feature work?",
    answer: "A founder can invite their Chartered Accountant (CA) or legal advisor via email. Once the advisor accepts, they gain access to the founder's company dashboard to manage compliance, review documents, and collaborate seamlessly.",
  },
  {
    question: "What kind of documents can I analyze with the AI?",
    answer: "Our AI can analyze various legal and financial documents, including contracts, agreements, government notices, and policy documents. It can identify risks, extract key details, and even suggest replies.",
  },
  {
    question: "Can I use Claari for multiple companies or clients?",
    answer: "Yes. You can add and manage multiple companies from the settings page. This is ideal for founders with multiple ventures or professionals (CAs, Lawyers) managing a portfolio of clients.",
  },
  {
    question: "What happens when I run out of credits?",
    answer: "You can purchase one-time credit packs from the billing page to top up your account. These credits never expire. We will also offer subscription plans with higher credit limits.",
  },
  {
    question: "Who can I contact for support?",
    answer: "You can reach our support team by emailing us at support@claari.com. We'd be happy to help with any questions or issues you may have.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
        <h2 className="text-3xl font-bold tracking-tight font-headline text-[var(--feature-color,hsl(var(--primary)))]">Help & Support</h2>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions. If you can't find what you're looking for, feel free to contact us.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-b">
                            <AccordionTrigger className="text-left hover:no-underline">
                                <span className="font-medium">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Mail />Contact Support</CardTitle>
                    <CardDescription>Can't find an answer? Our team is here to help.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href="mailto:support@claari.com">
                            Email Support
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
