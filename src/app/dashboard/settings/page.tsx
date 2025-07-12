

'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import SettingsForm from './form';
import BillingForm from "./billing-form";
import NotificationsForm from "./notifications-form";
import FeedbackForm from "./feedback-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Bell, Lock, KeyRound, Loader2, MessageCircle, BookLock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddCompanyModal } from "@/components/dashboard/add-company-modal";
import type { Company } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bug, Lightbulb, Palette, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase/config";

// --- Policies Tab Content ---
const policies = {
    "terms": { title: "सेवा की शर्तें", lastUpdated: "अक्टूबर 26, 2023", content: `<p>Claari में आपका स्वागत है। ये नियम और शर्तें हमारी वेबसाइट और सेवाओं के उपयोग के लिए नियमों और विनियमों की रूपरेखा तैयार करती हैं।</p><h3 class="font-semibold mt-4 mb-2">1. शर्तों की स्वीकृति</h3><p>इस प्लेटफ़ॉर्म तक पहुंच कर, आप इन नियमों और शर्तों को स्वीकार करते हैं। यदि आप इस पृष्ठ पर बताए गए सभी नियमों और शर्तों से सहमत नहीं हैं तो Claari का उपयोग जारी न रखें।</p><h3 class="font-semibold mt-4 mb-2">2. उपयोगकर्ता की जिम्मेदारियां</h3><p>आप यह सुनिश्चित करने के लिए जिम्मेदार हैं कि आपके द्वारा प्रदान की गई सभी जानकारी सटीक है और प्लेटफ़ॉर्म का आपका उपयोग वैध है। आपको हमारे प्लेटफ़ॉर्म का उपयोग किसी भी अवैध या अनधिकृत उद्देश्य के लिए नहीं करना चाहिए।</p><h3 class="font-semibold mt-4 mb-2">3. बौद्धिक संपदा</h3><p>सेवा और इसकी मूल सामग्री, सुविधाएँ और कार्यक्षमता Claari और इसके लाइसेंसदाताओं की अनन्य संपत्ति हैं और रहेंगी। हमारे ट्रेडमार्क का उपयोग Claari की पूर्व लिखित सहमति के बिना किसी भी उत्पाद या सेवा के संबंध में नहीं किया जा सकता है।</p><h3 class="font-semibold mt-4 mb-2">4. दायित्व की सीमा</h3><p>किसी भी स्थिति में Claari, न ही इसके निदेशक, कर्मचारी, भागीदार, एजेंट, आपूर्तिकर्ता, या सहयोगी, किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक क्षति के लिए उत्तरदायी नहीं होंगे, जिसमें लाभ, डेटा, उपयोग, सद्भावना की हानि शामिल है, लेकिन इन्हीं तक सीमित नहीं है, जो आपकी सेवा तक पहुंच या उपयोग या उपयोग करने में असमर्थता के परिणामस्वरूप होती है।</p><h3 class="font-semibold mt-4 mb-2">5. शासी कानून</h3><p>ये शर्तें भारत के कानूनों के अनुसार शासित और मानी जाएंगी, इसके कानून के प्रावधानों के टकराव की परवाह किए बिना।</p>` },
    "privacy": { title: "गोपनीयता नीति", lastUpdated: "अक्टूबर 26, 2023", content: `<p>आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह Claari की नीति है कि हम अपनी वेबसाइट पर आपसे एकत्र की जाने वाली किसी भी जानकारी के संबंध में आपकी गोपनीयता का सम्मान करें।</p><h3 class="font-semibold mt-4 mb-2">1. हम जो जानकारी एकत्र करते हैं</h3><p>जब हमें आपको कोई सेवा प्रदान करने के लिए वास्तव में इसकी आवश्यकता होती है तो हम केवल व्यक्तिगत जानकारी मांगते हैं। हम इसे आपके ज्ञान और सहमति से, उचित और वैध तरीकों से एकत्र करते हैं। हम आपका नाम, ईमेल पता, कंपनी विवरण और उपयोग डेटा जैसी जानकारी एकत्र कर सकते हैं।</p><h3 class="font-semibold mt-4 mb-2">2. हम आपके डेटा का उपयोग कैसे करते हैं</h3><p>हम एकत्रित डेटा का उपयोग हमारी सेवा प्रदान करने और बनाए रखने के लिए, आपको हमारी सेवा में बदलाव के बारे में सूचित करने के लिए, जब आप ऐसा करना चुनते हैं तो आपको हमारी सेवा की इंटरैक्टिव सुविधाओं में भाग लेने की अनुमति देने के लिए और ग्राहक सहायता प्रदान करने के लिए करते हैं।</p><h3 class="font-semibold mt-4 mb-2">3. डेटा सुरक्षा</h3><p>हम आपके डेटा की सुरक्षा को गंभीरता से लेते हैं और इसे अनधिकृत या गैरकानूनी प्रसंस्करण और आकस्मिक हानि, विनाश या क्षति से बचाने के लिए उपयुक्त तकनीकी और संगठनात्मक उपायों का उपयोग करते हैं।</p><h3 class="font-semibold mt-4 mb-2">4. उपयोगकर्ता अधिकार</h3><p>आपको हमारे पास मौजूद जानकारी तक पहुंचने, उसे अपडेट करने या हटाने का अधिकार है। जब भी संभव हो, आप सीधे अपनी खाता सेटिंग अनुभाग के भीतर अपने व्यक्तिगत डेटा तक पहुंच सकते हैं, उसे अपडेट कर सकते हैं या हटाने का अनुरोध कर सकते हैं।</p>` },
    "disclaimer": { title: "AI अस्वीकरण", lastUpdated: "अक्टूबर 26, 2023", content: `<p>Claari प्लेटफ़ॉर्म पर आर्टिफिशियल इंटेलिजेंस (AI) द्वारा उत्पन्न सुविधाएँ और जानकारी केवल सूचना के उद्देश्यों के लिए प्रदान की जाती हैं।</p><h3 class="font-semibold mt-4 mb-2">1. पेशेवर सलाह नहीं</h3><p>हमारे AI द्वारा उत्पन्न सामग्री पेशेवर कानूनी, वित्तीय या कर सलाह का विकल्प नहीं है। कानूनी या वित्तीय मामले के संबंध में आपके किसी भी प्रश्न के लिए हमेशा एक योग्य पेशेवर की सलाह लें।</p><h3 class="font-semibold mt-4 mb-2">2. कोई गारंटी नहीं</h3><p>हालांकि हम सटीक और अद्यतित जानकारी प्रदान करने का प्रयास करते हैं, हम AI-जनित सामग्री के संबंध में पूर्णता, सटीकता, विश्वसनीयता, उपयुक्तता या उपलब्धता के बारे में किसी भी प्रकार का कोई प्रतिनिधित्व या वारंटी नहीं देते हैं। ऐसी जानकारी पर आप जो भी भरोसा करते हैं, वह पूरी तरह से आपके अपने जोखिम पर है।</p><h3 class="font-semibold mt-4 mb-2">3. दायित्व की सीमा</h3><p>Claari AI द्वारा प्रदान की गई सामग्री में किसी भी त्रुटि या चूक के लिए और उस सामग्री पर भरोसा करके की गई किसी भी कार्रवाई के लिए सभी दायित्व को अस्वीकार करता है।</p>` }
};
const PoliciesTab = () => (
  <Card className="interactive-lift">
    <CardHeader><CardTitle>कानूनी और नीतियां</CardTitle><CardDescription>हमारी शर्तें, गोपनीयता नीति और अन्य कानूनी दस्तावेज।</CardDescription></CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(policies).map(([key, policy]) => (
          <AccordionItem value={key} key={key}><AccordionTrigger className="text-left hover:no-underline">{policy.title}</AccordionTrigger><AccordionContent className="prose dark:prose-invert max-w-none border-t pt-4"><p className="text-sm text-muted-foreground">अंतिम अपडेट: {policy.lastUpdated}</p><div dangerouslySetInnerHTML={{ __html: policy.content }} /></AccordionContent></AccordionItem>
        ))}
      </Accordion>
    </CardContent>
  </Card>
);

// --- Security Tab ---
const SecurityTab = () => {
    const { user, sendPasswordResetLink } = useAuth();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const handlePasswordReset = async () => {
        if (!user?.email) {
            toast({ variant: 'destructive', title: 'Error', description: 'No email address found for your account.' });
            return;
        }
        setIsSending(true);
        try {
            await sendPasswordResetLink(user.email);
            toast({ title: 'Password Reset Email Sent', description: 'Please check your inbox for instructions to reset your password.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSending(false);
        }
    };
    
    const isEmailProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');

    return (
        <Card className="interactive-lift">
            <CardHeader><CardTitle>सुरक्षा</CardTitle><CardDescription>अपनी कार्यक्षेत्र सुरक्षा सेटिंग्स प्रबंधित करें।</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Card>
                  <CardHeader><CardTitle className="text-base">पासवर्ड बदलें</CardTitle></CardHeader>
                  <CardContent>
                    {isEmailProvider ? (
                      <p className="text-sm text-muted-foreground mb-4">अपने ईमेल पते पर पासवर्ड रीसेट लिंक भेजने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">आपने एक सामाजिक प्रदाता (जैसे, Google) के साथ साइन इन किया है। आप उनके माध्यम से अपना पासवर्ड बदल सकते हैं।</p>
                    )}
                  </CardContent>
                  {isEmailProvider && (
                    <CardFooter>
                      <Button onClick={handlePasswordReset} disabled={isSending}>
                          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          रीसेट लिंक भेजें
                      </Button>
                    </CardFooter>
                  )}
              </Card>
              <Card><CardHeader><CardTitle className="text-base flex items-center justify-between">एकल साइन-ऑन (SSO)<Lock className="w-4 h-4 text-muted-foreground"/></CardTitle><CardDescription>अपनी टीम को अपने कॉर्पोरेट पहचान प्रदाता के साथ साइन इन करने की अनुमति दें।</CardDescription></CardHeader><CardFooter className="border-t pt-4"><p className="text-sm text-muted-foreground">SSO एक एंटरप्राइज सुविधा है। इसे सक्षम करने के लिए कृपया बिक्री से संपर्क करें।</p></CardFooter></Card>
            </CardContent>
        </Card>
    );
};

export default function SettingsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const { userProfile, deductCredits } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleAddCompanyClick = () => {
      setCompanyToEdit(null);
      setModalOpen(true);
  };

  const handleEditCompanyClick = (company: Company) => {
    setCompanyToEdit(company);
    setModalOpen(true);
  };
  
  const onModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setCompanyToEdit(null);
    }
  };

  return (
    <>
      <AddCompanyModal 
        isOpen={isModalOpen} 
        onOpenChange={onModalOpenChange}
        companyToEdit={companyToEdit}
        deductCredits={deductCredits}
      />
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">सेटिंग्स</h2>
            <p className="text-muted-foreground">अपनी व्यक्तिगत, बिलिंग और कंपनी की जानकारी प्रबंधित करें।</p>
        </div>
        <Tabs defaultValue={tab} className="space-y-6">
          <ScrollArea className="w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0" orientation="horizontal">
              <TabsList className="inline-flex h-auto sm:h-10 items-center justify-start w-max">
                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>प्रोफ़ाइल</TabsTrigger>
                <TabsTrigger value="subscription"><CreditCard className="mr-2 h-4 w-4"/>सदस्यता</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>सूचनाएं</TabsTrigger>
                <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4"/>सुरक्षा</TabsTrigger>
                <TabsTrigger value="policies"><BookLock className="mr-2 h-4 w-4"/>नीतियां</TabsTrigger>
                <TabsTrigger value="feedback"><MessageCircle className="mr-2 h-4 w-4"/>प्रतिक्रिया</TabsTrigger>
              </TabsList>
          </ScrollArea>
          <TabsContent value="profile" className="space-y-6">
            <SettingsForm 
              onAddCompanyClick={handleAddCompanyClick}
              onEditCompanyClick={handleEditCompanyClick}
            />
          </TabsContent>
          <TabsContent value="subscription"><BillingForm /></TabsContent>
          <TabsContent value="notifications"><NotificationsForm /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
          <TabsContent value="policies"><PoliciesTab /></TabsContent>
          <TabsContent value="feedback"><FeedbackForm /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
