
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  FilePenLine,
  Send,
  Download,
  Sparkles,
  ArrowRight,
  FilePlus2,
  History,
  Loader2,
  Lock,
  Folder,
  File,
  Upload,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { cn } from '@/lib/utils';
import { generateDocument, type DocumentGeneratorOutput } from '@/ai/flows/document-generator-flow';
import { generateWiki, type WikiGeneratorOutput } from '@/ai/flows/wiki-generator-flow';
import { useTypewriter } from '@/hooks/use-typewriter';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth';
import type { UserRole, VaultItem } from '@/lib/types';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';

// --- Template Generator Tab ---

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
  { name: 'Startup Legal', roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'], templates: [ { name: 'Non-Disclosure Agreement', isPremium: false }, { name: 'Founders Agreement', isPremium: true }, { name: 'ESOP Plan', isPremium: true }, { name: 'Terms of Service', isPremium: false }, { name: 'Privacy Policy', isPremium: false }, { name: 'NOC from Landlord', isPremium: false }, { name: 'Board Resolution for Incorporation', isPremium: true }, { name: 'Registered Address Declaration', isPremium: true }, ], },
  { name: 'Contracts & HR', roles: ['Founder', 'CA', 'Legal Advisor', 'Enterprise'], templates: [ { name: 'Employment Offer Letter', isPremium: false }, { name: 'Consulting Agreement', isPremium: true }, { name: 'Vendor Agreement', isPremium: true }, { name: 'Freelance Services Agreement', isPremium: false }, { name: 'Statement of Work (SOW)', isPremium: false }, { name: 'Invoice Template', isPremium: false }, { name: 'International Contract Rider', isPremium: true }, ], },
  { name: 'Corporate Filings', roles: ['CA', 'Enterprise'], templates: [ { name: 'Board Resolution', isPremium: false }, { name: 'MOA (Memorandum of Association)', isPremium: true }, { name: 'AOA (Articles of Association)', isPremium: true }, { name: 'Form DIR-3', isPremium: false }, { name: 'Audit Engagement Letter', isPremium: true }, { name: 'Statutory Audit Report', isPremium: true }, { name: 'MSME Application Draft', isPremium: false }, ], },
  { name: 'Fundraising / Dataroom', roles: ['Founder', 'Legal Advisor', 'CA', 'Enterprise'], templates: [ { name: 'SAFE Agreement', isPremium: true }, { name: 'Shareholder Agreement', isPremium: true }, { name: 'Investor Pitch Deck', isPremium: false }, { name: 'Startup India Pitch Deck', isPremium: false }, ], },
  { name: 'Legal & Advisory', roles: ['Legal Advisor', 'Enterprise'], templates: [ { name: 'Legal Notice Draft', isPremium: false }, { name: 'GDPR/DPDP Policy Generator', isPremium: true }, { name: 'Litigation Summary Template', isPremium: true }, { name: 'Client Brief Template', isPremium: true }, { name: 'Service Level Agreement (SLA)', isPremium: true }, { name: 'Non-compete Agreement', isPremium: true }, { name: 'Client Engagement Letter', isPremium: true }, ], },
  { name: 'Enterprise Suite', roles: ['Enterprise'], templates: [ { name: 'HR Policy Docs', isPremium: true }, { name: 'Cross-border NDA', isPremium: true }, ], },
];

const TemplateGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<DocumentGeneratorOutput | null>(null);
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();
  const [editorContent, setEditorContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasUserEdited = useRef(false);
  const typewriterText = useTypewriter(isTyping ? (generatedDoc?.content || '') : '', 10);
  
  useEffect(() => {
    if (isTyping && !hasUserEdited.current) setEditorContent(typewriterText);
    if (isTyping && typewriterText.length > 0 && typewriterText.length === (generatedDoc?.content || '').length) setIsTyping(false);
  }, [typewriterText, isTyping, generatedDoc]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTyping) { hasUserEdited.current = true; setIsTyping(false); }
    setEditorContent(e.target.value);
  };

  const availableCategories = useMemo(() => {
    if (!userProfile) return [];
    return templateLibrary.filter(category => category.roles.includes(userProfile.role));
  }, [userProfile]);

  useEffect(() => {
    if (availableCategories.length > 0 && !activeAccordion) setActiveAccordion(availableCategories[0].name);
  }, [availableCategories]);
  
  const handleGenerateClick = async () => {
    if (!selectedTemplate) {
      toast({ title: 'No Template Selected', description: 'Please select a template from the library first.', variant: 'destructive' });
      return;
    }
    const templateDetails = availableCategories.flatMap(c => c.templates).find(t => t.name === selectedTemplate);
    if (templateDetails?.isPremium && userProfile?.plan === 'Free') {
        toast({ title: 'Upgrade to Pro', description: 'This is a premium template. Please upgrade your plan.', variant: 'destructive', action: <ToastAction altText="Upgrade"><Link href="/dashboard/billing">Upgrade</Link></ToastAction> });
        return;
    }
    if (!await deductCredits(1)) return;
    setLoading(true);
    setGeneratedDoc(null);
    setEditorContent('');
    hasUserEdited.current = false;
    try {
      const result = await generateDocument({ templateName: selectedTemplate });
      setGeneratedDoc(result);
      setIsTyping(true);
    } catch (error) {
      console.error("Error generating document:", error);
      toast({ title: 'Generation Failed', description: 'There was an error generating your document.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${generatedDoc.title.replace(/ /g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!userProfile) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start h-full max-h-[calc(100vh-16rem)]">
      <Card className="lg:col-span-1 xl:col-span-1 h-full flex flex-col bg-card interactive-lift">
        <CardHeader><CardTitle>Template Library</CardTitle><CardDescription>Select a template to generate.</CardDescription></CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search templates..." className="pl-10" /></div>
          <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-2">
             <RadioGroup value={selectedTemplate || ''} onValueChange={setSelectedTemplate} className="w-full">
                <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                    {availableCategories.map((category) => (
                        <AccordionItem value={category.name} key={category.name}>
                            <AccordionTrigger className="text-base font-medium hover:no-underline interactive-lift py-3 px-2">{category.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-1 pl-2">
                                {category.templates.map((template) => {
                                  const isLocked = template.isPremium && userProfile.plan === 'Free';
                                  return (
                                    <Label key={template.name} className={cn("flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted interactive-lift", selectedTemplate === template.name && "bg-muted", isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
                                      <RadioGroupItem value={template.name} id={template.name} disabled={isLocked} />
                                      <span className="font-normal text-sm">{template.name}</span>
                                      {isLocked && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
                                    </Label>
                                  )
                                })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="mt-auto pt-6"><Button onClick={handleGenerateClick} disabled={loading || !selectedTemplate} className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FilePenLine className="mr-2 h-4 w-4" /> Generate Document</>}</Button></CardFooter>
      </Card>
      <div className="lg:col-span-2 xl:col-span-3 h-full overflow-y-auto -mr-2 pr-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 className="text-2xl font-bold font-headline">Document Preview</h2><p className="text-muted-foreground">Generate a new document or view a recent one.</p></div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-start">
                <Button variant="outline" disabled={!generatedDoc || isTyping} onClick={() => toast({ title: "Feature Coming Soon"})} className="interactive-lift w-full sm:w-auto justify-center"><FilePenLine className="mr-2 h-4 w-4" /> Sign Document</Button>
                <Button variant="outline" disabled={!generatedDoc || isTyping} onClick={() => toast({ title: "Feature Coming Soon"})} className="interactive-lift w-full sm:w-auto justify-center"><Send className="mr-2 h-4 w-4" /> Send for Signature</Button>
                <Button disabled={!generatedDoc || isTyping} onClick={handleDownload} className="interactive-lift w-full sm:w-auto justify-center"><Download className="mr-2 h-4 w-4" /> Download</Button>
            </div>
        </div>
        {loading ? (
          <Card className="min-h-[400px]"><CardHeader><Skeleton className="h-6 w-1/2 rounded-md" /></CardHeader><CardContent className="space-y-4 pt-4"><Skeleton className="h-4 w-full rounded-md" /><Skeleton className="h-4 w-5/6 rounded-md" /><Skeleton className="h-4 w-full rounded-md" /><Skeleton className="h-4 w-3/4 rounded-md" /><Skeleton className="h-4 w-full mt-4 rounded-md" /><Skeleton className="h-4 w-full rounded-md" /><Skeleton className="h-4 w-2/3 rounded-md" /></CardContent></Card>
        ) : generatedDoc ? (
          <Card className="min-h-[400px] flex flex-col"><CardHeader><CardTitle>{generatedDoc.title}</CardTitle></CardHeader><CardContent className="flex-1 overflow-y-auto"><Textarea value={editorContent} onChange={handleEditorChange} readOnly={isTyping} className="font-code text-sm text-card-foreground min-h-[500px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" /></CardContent></Card>
        ) : (
          <Card className="border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card"><div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4"><FilePlus2 className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-xl font-semibold mb-1">Your Document Appears Here</h3><p className="text-muted-foreground max-w-xs">Select a template from the library and click "Generate" to get started.</p></Card>
        )}
      </div>
    </div>
  )
}

// --- Document Vault Tab ---

const mockVaultItems: VaultItem[] = [
    { id: '1', type: 'folder', name: 'Fundraising', lastModified: new Date().toISOString() },
    { id: '2', type: 'folder', name: 'Board Meetings', lastModified: new Date().toISOString() },
    { id: '3', type: 'file', name: 'Founders_Agreement_v1.pdf', lastModified: new Date().toISOString(), size: 1200000 },
    { id: '4', type: 'file', name: 'Pitch_Deck_Final.pdf', lastModified: new Date().toISOString(), size: 5400000 },
];

const DocumentVault = () => {
    const { toast } = useToast();
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Document Vault</CardTitle><CardDescription>Your secure, centralized document repository.</CardDescription></div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => toast({title: "Coming Soon!"})}>New Folder</Button><Button onClick={() => toast({title: "Coming Soon!"})}>Upload Document</Button></div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mockVaultItems.map(item => (
                        <div key={item.id} className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted cursor-pointer interactive-lift">
                            {item.type === 'folder' ? <Folder className="w-16 h-16 text-primary/70" /> : <File className="w-16 h-16 text-muted-foreground" />}
                            <p className="text-sm font-medium text-center truncate w-full">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.type === 'file' && item.size ? `${(item.size / 1000000).toFixed(1)} MB` : ""}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// --- Internal Wiki Tab ---
const Typewriter = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 20);
    const markdownToHtml = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*$)/mg, '<li>$1</li>')
            .replace(/## (.*$)/mg, '<h2>$1</h2>')
            .replace(/\n/g, '<br />');
    };
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(displayText).replace(/<li>/g, '<li style="list-style-type: disc; margin-left: 20px;">') }} />;
};


const WikiGenerator = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<WikiGeneratorOutput | null>(null);
    const { toast } = useToast();
    const { deductCredits } = useAuth();
    
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            const uploadedFile = acceptedFiles[0];
            setFile(uploadedFile);
            setResult(null);
            setIsProcessing(true);
            if (!await deductCredits(3)) {
                setIsProcessing(false);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(uploadedFile);
            reader.onload = async (loadEvent) => {
                try {
                    const fileDataUri = loadEvent.target?.result as string;
                    const response = await generateWiki({ fileDataUri, documentTitle: uploadedFile.name });
                    setResult(response);
                } catch (error: any) {
                    toast({ variant: "destructive", title: "Wiki Generation Failed", description: error.message });
                } finally {
                    setIsProcessing(false);
                }
            };
        }
    }, [toast, deductCredits]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 1 });

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Internal Wiki Generator</CardTitle>
                    <CardDescription>Upload a policy document to generate a simple, internal wiki page for your team. Costs 3 credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div {...getRootProps()} className={cn("p-10 border-2 border-dashed rounded-lg text-center bg-muted/40 cursor-pointer", isDragActive && "border-primary bg-primary/10")}>
                        <input {...getInputProps()} />
                        <BrainCircuit className="mx-auto h-12 w-12 text-primary/20" />
                        <p className="mt-4 font-semibold">{file ? `Selected: ${file.name}` : "Drag & drop a policy document"}</p>
                        <p className="text-sm text-muted-foreground">or click to select a file</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="interactive-lift min-h-[400px]">
                <CardHeader>
                    <CardTitle>Generated Wiki Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="mt-4 font-semibold">Generating wiki page...</p>
                        </div>
                    ) : result ? (
                        <div className="p-4 bg-muted/50 rounded-lg border">
                           <Typewriter text={result.wikiContent} />
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                            <p className="font-medium">Your generated wiki will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// --- Main Page Component ---

export default function DocumentsPage() {
  const { userProfile, loading } = useAuth();
  
  if (loading || !userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Document Center</h1>
            <p className="text-muted-foreground">Your one-stop shop for document generation, storage, and intelligence.</p>
        </div>
        <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="generator" className="interactive-lift">Template Generator</TabsTrigger>
                <TabsTrigger value="vault" className="interactive-lift">Document Vault</TabsTrigger>
                <TabsTrigger value="wiki" className="interactive-lift">Internal Wiki</TabsTrigger>
            </TabsList>
            <TabsContent value="generator" className="mt-6">
                <TemplateGenerator />
            </TabsContent>
            <TabsContent value="vault" className="mt-6">
                <DocumentVault />
            </TabsContent>
            <TabsContent value="wiki" className="mt-6">
                <WikiGenerator />
            </TabsContent>
        </Tabs>
    </div>
  );
}
