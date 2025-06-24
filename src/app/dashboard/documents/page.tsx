
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  FilePenLine,
  Send,
  Download,
  Sparkles,
  ArrowRight,
  FilePlus2,
  History,
  Info,
  ChevronUp,
  ChevronDown,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { cn } from '@/lib/utils';
import { generateDocument, type DocumentGeneratorOutput } from '@/ai/flows/document-generator-flow';
import { useTypewriter } from '@/hooks/use-typewriter';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth';
import type { UserRole } from '@/lib/types';
import Link from 'next/link';

type Template = {
  name: string;
  isPremium: boolean;
};

type TemplateCategoryData = {
  name: string;
  roles: UserRole[];
  templates: Template[];
};

const templateLibrary: TemplateCategoryData[] = [
  {
    name: 'Startup Legal',
    roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'],
    templates: [
      { name: 'Non-Disclosure Agreement', isPremium: false },
      { name: 'Founders Agreement', isPremium: true },
      { name: 'ESOP Plan', isPremium: true },
      { name: 'Terms of Service', isPremium: false },
      { name: 'Privacy Policy', isPremium: false },
    ],
  },
  {
    name: 'Contracts & HR',
    roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'],
    templates: [
        { name: 'Employment Offer Letter', isPremium: false },
        { name: 'Consulting Agreement', isPremium: true },
        { name: 'Vendor Agreement', isPremium: true },
        { name: 'Freelance Services Agreement', isPremium: false },
        { name: 'Statement of Work (SOW)', isPremium: false },
        { name: 'Invoice Template', isPremium: false },
        { name: 'International Contract Rider', isPremium: true },
    ],
  },
    {
    name: 'Corporate Filings',
    roles: ['CA', 'Enterprise'],
    templates: [
      { name: 'Board Resolution', isPremium: false },
      { name: 'MOA (Memorandum of Association)', isPremium: true },
      { name: 'AOA (Articles of Association)', isPremium: true },
      { name: 'Form DIR-3', isPremium: false },
      { name: 'Audit Engagement Letter', isPremium: true },
      { name: 'Statutory Audit Report', isPremium: true },
    ],
  },
  {
    name: 'Fundraising / Dataroom',
    roles: ['Founder', 'Legal Advisor', 'CA', 'Enterprise'],
    templates: [
      { name: 'SAFE Agreement', isPremium: true },
      { name: 'Shareholder Agreement', isPremium: true },
      { name: 'Investor Pitch Deck', isPremium: false },
    ],
  },
  {
    name: 'Legal & Advisory',
    roles: ['Legal Advisor', 'Enterprise'],
    templates: [
      { name: 'Legal Notice Draft', isPremium: false },
      { name: 'GDPR/DPDP Policy Generator', isPremium: true },
      { name: 'Litigation Summary Template', isPremium: true },
      { name: 'Client Brief Template', isPremium: true },
      { name: 'Service Level Agreement (SLA)', isPremium: true },
      { name: 'Non-compete Agreement', isPremium: true },
      { name: 'Client Engagement Letter', isPremium: true },
    ],
  },
  {
    name: 'Enterprise Suite',
    roles: ['Enterprise'],
    templates: [
      { name: 'HR Policy Docs', isPremium: true },
      { name: 'Cross-border NDA', isPremium: true },
    ],
  },
];


const AccordionTrigger = ({ title, isOpen, onClick }: { title: string; isOpen: boolean; onClick: () => void; }) => (
    <button onClick={onClick} className="flex w-full items-center justify-between py-3 text-base font-medium hover:no-underline text-card-foreground">
      <span>{title}</span>
      {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
    </button>
);


export default function DocumentsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<DocumentGeneratorOutput | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentGeneratorOutput[]>([]);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const typewriterText = useTypewriter(generatedDoc?.content || '', 10);

  const availableCategories = useMemo(() => {
    if (!userProfile) return [];
    return templateLibrary.filter(category => category.roles.includes(userProfile.role));
  }, [userProfile]);

  useEffect(() => {
    if (availableCategories.length > 0 && openCategories.length === 0) {
      setOpenCategories([availableCategories[0].name]);
    }
  }, [availableCategories, openCategories]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };
  
  const handleGenerateClick = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'No Template Selected',
        description: 'Please select a template from the library first.',
        variant: 'destructive',
      });
      return;
    }

    const allTemplates = availableCategories.flatMap(c => c.templates);
    const templateDetails = allTemplates.find(t => t.name === selectedTemplate);
    
    if (templateDetails?.isPremium && userProfile?.plan === 'Free') {
        toast({
            title: 'Upgrade to Pro',
            description: 'This is a premium template. Please upgrade your plan to generate it.',
            variant: 'destructive',
            action: <ToastAction altText="Upgrade"><Link href="/dashboard/billing">Upgrade</Link></ToastAction>,
        });
        return;
    }

    setLoading(true);
    setGeneratedDoc(null);
    try {
      const result = await generateDocument({ templateName: selectedTemplate });
      setGeneratedDoc(result);
      setRecentDocs(prev => [result, ...prev].slice(0, 3));
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating your document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start h-full max-h-[calc(100vh-8rem)]">
      {/* Left Column: Template Library */}
      <Card className="lg:col-span-1 xl:col-span-1 h-full flex flex-col bg-card">
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <CardDescription>Select a template to generate.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <Label htmlFor="explain-mode" className="flex items-center gap-2 font-medium text-xs">
              Explain-as-you-build Mode
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button"><Info className="h-4 w-4 text-muted-foreground" /></button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get AI-powered explanations for each field as you fill it out.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Switch id="explain-mode" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" />
          </div>

          <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-2">
             <RadioGroup value={selectedTemplate || ''} onValueChange={setSelectedTemplate} className="w-full">
                {availableCategories.map((category) => (
                    <div key={category.name} className="border-b">
                        <AccordionTrigger 
                            title={category.name}
                            isOpen={openCategories.includes(category.name)}
                            onClick={() => toggleCategory(category.name)}
                        />
                         {openCategories.includes(category.name) && (
                            <div className="pl-2 pt-2 pb-4">
                                <div className="flex flex-col gap-1">
                                {category.templates.map((template) => {
                                  const isLocked = template.isPremium && userProfile.plan === 'Free';
                                  return (
                                    <Label key={template.name} className={cn(
                                        "flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted",
                                        selectedTemplate === template.name && "bg-muted",
                                        isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                    )}>
                                      <RadioGroupItem value={template.name} id={template.name} disabled={isLocked} />
                                      <span className="font-normal text-sm">{template.name}</span>
                                      {isLocked && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
                                    </Label>
                                  )
                                })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
             </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="mt-auto pt-6">
          <Button onClick={handleGenerateClick} disabled={loading || !selectedTemplate} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FilePenLine className="mr-2 h-4 w-4" /> Generate Document
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Right Column: Document Preview */}
      <div className="lg:col-span-2 xl:col-span-3 space-y-8 h-full overflow-y-auto -mr-2 pr-4">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold font-headline">Document Preview</h2>
              <p className="text-muted-foreground">Generate a new document or view a recent one.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" disabled={!generatedDoc}><FilePenLine className="mr-2 h-4 w-4" /> Sign Document</Button>
                <Button variant="outline" disabled={!generatedDoc}><Send className="mr-2 h-4 w-4" /> Send for Signature</Button>
                <Button disabled={!generatedDoc}><Download className="mr-2 h-4 w-4" /> Download</Button>
            </div>
         </div>
         
         <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-base">Legal Stack Generator</CardTitle>
                    <CardDescription className="text-sm">Not sure what you need? Let our AI suggest documents for your business.</CardDescription>
                </div>
                <Button asChild className="ml-auto mt-2 sm:mt-0 shrink-0">
                    <a href="#">Start AI Setup <ArrowRight className="ml-2 h-4 w-4"/></a>
                </Button>
            </CardHeader>
         </Card>

        {loading ? (
          <Card className="min-h-[400px]">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full mt-4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </CardContent>
          </Card>
        ) : generatedDoc ? (
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>{generatedDoc.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Textarea
                readOnly
                value={typewriterText}
                className="font-code text-sm text-card-foreground min-h-[500px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4">
              <FilePlus2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Your Document Appears Here</h3>
            <p className="text-muted-foreground max-w-xs">Select a template from the library and click "Generate" to get started.</p>
          </Card>
        )}
        
         <div>
            <h3 className="text-xl font-bold mb-4">Recent Documents</h3>
            {recentDocs.length > 0 ? (
              <div className="space-y-4">
                {recentDocs.map((doc, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setGeneratedDoc(doc)}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">{doc.title}</CardTitle>
                      <CardDescription>Generated a few moments ago</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed min-h-[150px] flex flex-col items-center justify-center text-center p-8 bg-card">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent documents found.</p>
              </Card>
            )}
         </div>
      </div>
    </div>
  );
}

    