
"use client"

import { useCallback, useState, useRef, Fragment } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Loader2,
  UploadCloud,
  FileText,
  FileWarning,
  FileSearch2,
  Download,
  FileScan,
  BookText,
} from "lucide-react"
import { analyzeContract, type AnalyzeContractOutput } from "@/ai/flows/contract-analyzer-flow"
import { summarizeDocument, type DocumentSummarizerOutput } from "@/ai/flows/document-summarizer-flow"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { cn } from "@/lib/utils"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTypewriter } from "@/hooks/use-typewriter"

const RiskAnalyzer = () => {
    const { deductCredits } = useAuth();
    const [analysisResult, setAnalysisResult] = useState<AnalyzeContractOutput | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    const handleAnalysis = useCallback(async (fileToAnalyze: File) => {
        if (!await deductCredits(5)) return;

        setFile(fileToAnalyze);
        setIsProcessing(true);
        setAnalysisResult(null);

        const reader = new FileReader();
        reader.readAsDataURL(fileToAnalyze);

        reader.onload = async (loadEvent) => {
            try {
                const fileDataUri = loadEvent.target?.result as string;
                if (!fileDataUri) throw new Error("Could not read file data.");
                const result = await analyzeContract({ fileDataUri });
                setAnalysisResult(result);
                toast({ title: "Analysis Complete", description: "Your contract report is ready." });
            } catch (error: any) {
                console.error('Error analyzing contract:', error);
                toast({ variant: "destructive", title: "Analysis Failed", description: error.message || "Could not analyze the contract." });
            } finally { setIsProcessing(false); }
        };
        reader.onerror = () => {
            toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
            setIsProcessing(false);
        };
    }, [deductCredits, toast]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            toast({ variant: "destructive", title: "File Upload Error", description: fileRejections[0].errors[0].message });
            return;
        }
        if (acceptedFiles[0]) handleAnalysis(acceptedFiles[0]);
    }, [handleAnalysis, toast]);

    const handleExport = async () => {
        if (!analysisResult || !reportRef.current) return;
        toast({ title: "Preparing Report...", description: "Please wait while we generate your PDF." });
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: null, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save('contract-analysis-report.pdf');
        } catch(e) {
            console.error("Error generating PDF", e);
            toast({ variant: "destructive", title: "PDF Export Failed", description: "There was an error generating the PDF report." });
        }
    }

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
        maxFiles: 1,
        maxSize: 1024 * 1024, // 1MB limit
        noClick: true,
        noKeyboard: true,
    });

    if (isProcessing) {
        return (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 h-full min-h-[400px]">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="font-semibold text-lg text-foreground">Analyzing {file?.name || "Document"}...</p>
                <p className="text-sm max-w-xs">Our AI is reading your contract. Key insights will be ready in just a moment.</p>
            </div>
        );
    }

    if (analysisResult) {
        const riskScore = analysisResult.riskScore;
        const riskLevel = riskScore > 75 ? "Low" : riskScore > 50 ? "Medium" : "High";
        const riskColor = riskScore > 75 ? "text-green-500" : riskScore > 50 ? "text-yellow-500" : "text-red-500";
        return (
            <div className="h-full overflow-y-auto rounded-b-lg p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Analysis Report for: <span className="font-normal">{file?.name}</span></h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={openFileDialog} className="interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Upload New</Button>
                        <Button variant="default" size="sm" onClick={handleExport} className="interactive-lift"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                    </div>
                </div>
                <div className="bg-muted/30 p-4 md:p-6" ref={reportRef}>
                    <Card className="max-w-5xl mx-auto">
                        <CardHeader><CardTitle className="text-lg">Contract Analysis Report</CardTitle></CardHeader>
                        <CardContent className="p-4 md:p-6 grid md:grid-cols-5 gap-6">
                            <div className="md:col-span-3 space-y-6">
                                <Accordion type="multiple" defaultValue={['summary', 'risks']} className="w-full">
                                    <AccordionItem value="summary"><AccordionTrigger>Contract Summary</AccordionTrigger><AccordionContent><div className="space-y-3 text-sm p-4 bg-muted/50 rounded-md border"><div><span className="font-semibold">Type:</span> {analysisResult.summary.contractType}</div><div><span className="font-semibold">Parties:</span> {analysisResult.summary.parties.join(', ')}</div><div><span className="font-semibold">Effective Date:</span> {analysisResult.summary.effectiveDate}</div><div className="pt-2"><p className="font-semibold mb-1">Purpose:</p><p className="text-muted-foreground">{analysisResult.summary.purpose}</p></div></div></AccordionContent></AccordionItem>
                                    <AccordionItem value="risks"><AccordionTrigger>Risk Flags ({analysisResult.riskFlags.length})</AccordionTrigger><AccordionContent>{analysisResult.riskFlags.length > 0 ? (<div className="space-y-3">{analysisResult.riskFlags.map((flag, i) => (<div key={i} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-red-500"><p className="font-semibold text-sm">Clause: <span className="font-normal italic">"{flag.clause}"</span></p><p className="text-muted-foreground text-sm mt-1"><span className="font-medium text-foreground">Risk:</span> {flag.risk}</p></div>))}</div>) : <p className="text-sm text-muted-foreground p-4">No significant risks found.</p>}</AccordionContent></AccordionItem>
                                </Accordion>
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                <Card className="text-center interactive-lift"><CardHeader><CardTitle>Overall Risk Score</CardTitle></CardHeader><CardContent><p className={`text-6xl font-bold ${riskColor}`}>{riskScore}</p><p className={`text-lg font-medium ${riskColor}`}>{riskLevel} Risk</p></CardContent></Card>
                                <Accordion type="single" collapsible className="w-full"><AccordionItem value="missing"><AccordionTrigger>Missing Clauses ({analysisResult.missingClauses.length})</AccordionTrigger><AccordionContent>{analysisResult.missingClauses.length > 0 ? (<ul className="space-y-2 list-disc list-inside p-4 bg-muted/50 rounded-md border">{analysisResult.missingClauses.map((clause, i) => (<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><FileWarning className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0"/><span>{clause}</span></li>))}</ul>) : <p className="text-sm text-muted-foreground p-4">No critical clauses seem to be missing.</p>}</AccordionContent></AccordionItem></Accordion>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    return (
        <div {...getRootProps()} className="h-full w-full cursor-pointer min-h-[400px]">
            <input {...getInputProps()} />
            <div className={cn("text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 rounded-b-lg border-2 border-dashed h-full w-full transition-colors", isDragActive ? "border-primary bg-primary/10" : "")}>
                <FileSearch2 className="w-16 h-16 text-primary/20" />
                <p className="font-semibold text-lg text-foreground">Analyze Your Contract for Risks</p>
                <p className="text-sm max-w-xs">Drag and drop a PDF or DOCX file here to get a detailed risk assessment.</p>
                <Button type="button" variant="outline" onClick={openFileDialog} className="mt-4 interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Or Select a File</Button>
            </div>
        </div>
    );
};

const Typewriter = ({ text }: { text: string }) => {
    const displayText = useTypewriter(text, 20);
    const markdownToHtml = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
    };
    return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(displayText) }} />;
};

const DocumentSummarizer = () => {
    const { deductCredits } = useAuth();
    const [summaryResult, setSummaryResult] = useState<DocumentSummarizerOutput | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleSummarize = useCallback(async (fileToAnalyze: File) => {
        if (!await deductCredits(2)) return;

        setFile(fileToAnalyze);
        setIsProcessing(true);
        setSummaryResult(null);

        const reader = new FileReader();
        reader.readAsDataURL(fileToAnalyze);

        reader.onload = async (loadEvent) => {
            try {
                const fileDataUri = loadEvent.target?.result as string;
                if (!fileDataUri) throw new Error("Could not read file data.");
                const result = await summarizeDocument({ fileDataUri, fileName: fileToAnalyze.name });
                setSummaryResult(result);
                toast({ title: "Summary Complete", description: "Your document summary is ready." });
            } catch (error: any) {
                console.error('Error summarizing document:', error);
                toast({ variant: "destructive", title: "Summarization Failed", description: error.message || "Could not summarize the document." });
            } finally { setIsProcessing(false); }
        };
        reader.onerror = () => {
            toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
            setIsProcessing(false);
        };
    }, [deductCredits, toast]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            toast({ variant: "destructive", title: "File Upload Error", description: fileRejections[0].errors[0].message });
            return;
        }
        if (acceptedFiles[0]) handleSummarize(acceptedFiles[0]);
    }, [handleSummarize, toast]);

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
        maxFiles: 1,
        maxSize: 1024 * 1024, // 1MB limit
    });
    
    if (isProcessing) {
        return (
             <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 h-full min-h-[400px]">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="font-semibold text-lg text-foreground">Summarizing {file?.name || "Document"}...</p>
                <p className="text-sm max-w-xs">Our AI is distilling the key points of your document.</p>
            </div>
        )
    }

    if (summaryResult) {
        return (
             <div className="h-full overflow-y-auto rounded-b-lg p-4 md:p-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Summary for: <span className="font-normal">{file?.name}</span></h3>
                    <Button variant="outline" size="sm" onClick={openFileDialog} className="interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Upload New</Button>
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm p-6 bg-muted/50 rounded-lg border">
                    <Typewriter text={summaryResult.summary} />
                </div>
            </div>
        )
    }

    return (
        <div {...getRootProps()} className="h-full w-full cursor-pointer min-h-[400px]">
            <input {...getInputProps()} />
            <div className={cn("text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 rounded-b-lg border-2 border-dashed h-full w-full transition-colors", isDragActive ? "border-primary bg-primary/10" : "")}>
                <BookText className="w-16 h-16 text-primary/20" />
                <p className="font-semibold text-lg text-foreground">Get an AI-Powered Summary</p>
                <p className="text-sm max-w-xs">Upload a document to get a simple, plain-language breakdown of its contents.</p>
                <Button type="button" variant="outline" onClick={openFileDialog} className="mt-4 interactive-lift"><UploadCloud className="mr-2 h-4 w-4" />Or Select a File</Button>
            </div>
        </div>
    )
}

export default function ContractAnalyzerPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (userProfile.plan === 'Free') {
    return <UpgradePrompt 
      title="Unlock the Contract Analyzer & Summarizer"
      description="Let our AI analyze your legal documents for risks, or summarize them into plain language. This feature requires a Pro plan."
      icon={<FileScan className="w-12 h-12 text-primary/20"/>}
    />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Document Intelligence</h2>
        <p className="text-muted-foreground">
          Analyze contracts for risk or summarize documents into plain language.
        </p>
      </div>
       <Tabs defaultValue="analyzer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analyzer" className="interactive-lift"><FileScan className="mr-2"/> Risk Analysis</TabsTrigger>
                <TabsTrigger value="summarizer" className="interactive-lift"><BookText className="mr-2"/> AI Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="analyzer">
                <Card className="min-h-[calc(100vh-20rem)] interactive-lift">
                    <CardHeader>
                        <CardTitle>Contract Analyzer</CardTitle>
                        <CardDescription>Upload a contract to identify risks, find missing clauses, and get redline suggestions. Costs 5 credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RiskAnalyzer />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="summarizer">
                 <Card className="min-h-[calc(100vh-20rem)] interactive-lift">
                    <CardHeader>
                        <CardTitle>AI Document Summarizer</CardTitle>
                        <CardDescription>Get a quick, plain-language summary of any uploaded document. Costs 2 credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DocumentSummarizer />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
