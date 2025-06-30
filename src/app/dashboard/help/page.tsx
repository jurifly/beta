
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
    question: "What is Clausey?",
    answer: "Clausey is an AI-powered platform designed to help startups, CAs, and legal professionals manage their legal and compliance needs efficiently. From document generation to compliance tracking, Clausey is your AI legal co-pilot.",
  },
  {
    question: "How do AI credits work?",
    answer: "Most AI-powered actions in the app, like generating a document or analyzing a contract, consume credits. During our beta period, all users have a generous amount of credits to use for free. We will introduce formal credit packs and subscription plans after the beta.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, security is our top priority. All your data is encrypted in transit and at rest. We use industry-standard security practices to protect your information. Your documents are stored securely and are only accessed for the purpose of providing you with our services.",
  },
  {
    question: "Who can I contact for support?",
    answer: "You can reach our support team by emailing support@clausey.com. We're happy to help with any questions or issues you may have.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Find answers to your questions below.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Can't find an answer? Our team is here to help.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href="mailto:support@clausey.com">
                            <Mail className="mr-2 h-4 w-4" /> Email Support
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
