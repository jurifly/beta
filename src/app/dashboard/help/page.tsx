
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
    question: "Claari क्या है?",
    answer: "Claari एक AI-संचालित प्लेटफ़ॉर्म है जिसे स्टार्टअप्स, सीए और कानूनी पेशेवरों को उनकी कानूनी और अनुपालन आवश्यकताओं को कुशलतापूर्वक प्रबंधित करने में मदद करने के लिए डिज़ाइन किया गया है। दस्तावेज़ निर्माण से लेकर अनुपालन ट्रैकिंग तक, Claari आपका AI कानूनी सह-पायलट है।",
  },
  {
    question: "AI क्रेडिट कैसे काम करते हैं?",
    answer: "ऐप में अधिकांश AI-संचालित कार्रवाइयाँ, जैसे दस्तावेज़ बनाना या अनुबंध का विश्लेषण करना, क्रेडिट की खपत करती हैं। हमारे बीटा अवधि के दौरान, सभी उपयोगकर्ताओं के पास मुफ्त में उपयोग करने के लिए पर्याप्त मात्रा में क्रेडिट हैं। हम बीटा के बाद औपचारिक क्रेडिट पैक और सदस्यता योजनाएं पेश करेंगे।",
  },
  {
    question: "क्या मेरा डेटा सुरक्षित है?",
    answer: "हाँ, सुरक्षा हमारी सर्वोच्च प्राथमिकता है। आपका सारा डेटा पारगमन और आराम के समय एन्क्रिप्ट किया गया है। हम आपकी जानकारी की सुरक्षा के लिए उद्योग-मानक सुरक्षा प्रथाओं का उपयोग करते हैं। आपके दस्तावेज़ सुरक्षित रूप से संग्रहीत किए जाते हैं और केवल आपको हमारी सेवाएं प्रदान करने के उद्देश्य से ही उन तक पहुँचा जाता है।",
  },
  {
    question: "संस्थापक-सीए कनेक्ट सुविधा कैसे काम करती है?",
    answer: "संस्थापक अपने चार्टर्ड अकाउंटेंट (सीए) या कानूनी सलाहकार को ईमेल के माध्यम से आमंत्रित कर सकते हैं। एक बार जब सलाहकार स्वीकार कर लेता है, तो वे अनुपालन का प्रबंधन करने, दस्तावेजों की समीक्षा करने और निर्बाध रूप से सहयोग करने के लिए संस्थापक के कंपनी डैशबोर्ड तक पहुंच प्राप्त करते हैं।",
  },
  {
    question: "मैं AI के साथ किस प्रकार के दस्तावेज़ों का विश्लेषण कर सकता हूँ?",
    answer: "हमारा AI विभिन्न कानूनी और वित्तीय दस्तावेज़ों का विश्लेषण कर सकता है, जिसमें अनुबंध, समझौते, सरकारी नोटिस और नीति दस्तावेज़ शामिल हैं। यह जोखिमों की पहचान कर सकता है, मुख्य विवरण निकाल सकता है, और यहाँ तक कि उत्तर भी सुझा सकता है।",
  },
  {
    question: "क्या मैं कई कंपनियों या ग्राहकों के लिए Claari का उपयोग कर सकता हूँ?",
    answer: "हाँ। आप सेटिंग पेज से कई कंपनियों को जोड़ और प्रबंधित कर सकते हैं। यह कई उद्यमों वाले संस्थापकों या ग्राहकों के पोर्टफोलियो का प्रबंधन करने वाले पेशेवरों (सीए, वकील) के लिए आदर्श है।",
  },
  {
    question: "जब मेरे क्रेडिट खत्म हो जाएंगे तो क्या होगा?",
    answer: "आप अपने खाते को टॉप अप करने के लिए बिलिंग पेज से एकमुश्त क्रेडिट पैक खरीद सकते हैं। ये क्रेडिट कभी समाप्त नहीं होते हैं। हम उच्च क्रेडिट सीमा वाली सदस्यता योजनाएं भी पेश करेंगे।",
  },
  {
    question: "मैं समर्थन के लिए किससे संपर्क कर सकता हूँ?",
    answer: "आप support@claari.com पर ईमेल करके हमारी सहायता टीम तक पहुँच सकते हैं। हमें आपके किसी भी प्रश्न या समस्या में मदद करने में खुशी होगी।",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
        <h2 className="text-3xl font-bold tracking-tight font-headline text-[var(--feature-color,hsl(var(--primary)))]">मदद और समर्थन</h2>
        <p className="text-muted-foreground mt-1">
          सामान्य प्रश्नों के उत्तर खोजें। यदि आप जो खोज रहे हैं वह आपको नहीं मिल रहा है, तो बेझिझक हमसे संपर्क करें।
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> अक्सर पूछे जाने वाले प्रश्न</CardTitle>
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
                    <CardTitle className="flex items-center gap-2"><Mail />समर्थन से संपर्क करें</CardTitle>
                    <CardDescription>उत्तर नहीं मिल रहा है? हमारी टीम मदद के लिए यहाँ है।</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href="mailto:support@claari.com">
                            ईमेल समर्थन
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
