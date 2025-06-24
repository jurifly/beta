
"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Sparkles, UploadCloud, FileText, CheckCircle, AlertTriangle, Scale, Table, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { reconcileDocuments, type ReconciliationOutput } from "@/ai/flows/reconciliation-flow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type FileState = {
  gst: File | null;
  roc: File | null;
  itr: File | null;
};

export default function ReconciliationPage() {
  const { userProfile, deductCredits } = useAuth();
  const [files, setFiles] = useState<FileState>({ gst: null, roc: null, itr: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReconciliationOutput | null>(null);
  const { toast } = useToast();

  const handleDrop = (type: keyof FileState) => useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast({ variant: "destructive", title: "File Upload Error", description: fileRejections[0].errors[0].message });
        return;
      }
      if (acceptedFiles[0]) {
        setFiles(prev => ({ ...prev, [type]: acceptedFiles[0] }));
      }
  }, [toast]);

  const GSTDropzone = useDropzone({ onDrop: handleDrop('gst'), maxFiles: 1, accept: { 'application/pdf': ['.pdf'] }, maxSize: 1024 * 1024 });
  const ROCDropzone = useDropzone({ onDrop: handleDrop('roc'), maxFiles: 1, accept: { 'application/pdf': ['.pdf'] }, maxSize: 1024 * 1024 });
  const ITRDropzone = useDropzone({ onDrop: handleDrop('itr'), maxFiles: 1, accept: { 'application/pdf': ['.pdf'] }, maxSize: 1024 * 1024 });

  const getFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleReconcile = async () => {
    if (!files.gst || !files.roc || !files.itr) {
      toast({ variant: "destructive", title: "Missing Files", description: "Please upload all three documents to proceed." });
      return;
    }
    
    if (!await deductCredits(15)) return;
    
    setIsProcessing(true);
    setResult(null);
    try {
      const [gstDataUri, rocDataUri, itrDataUri] = await Promise.all([
        getFileAsDataURI(files.gst),
        getFileAsDataURI(files.roc),
        getFileAsDataURI(files.itr),
      ]);

      const response = await reconcileDocuments({ gstDataUri, rocDataUri, itrDataUri });
      setResult(response);
      toast({ title: "Reconciliation Complete!", description: "Your report is ready below." });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const DropzoneCard = ({ dz, file, type }: { dz: any, file: File | null, type: string }) => (
    <div {...dz.getRootProps()} className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-muted/40 h-full">
      <input {...dz.getInputProps()} />
      <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
      <p className="font-semibold">Upload {type} Filing</p>
      {file ? (
        <p className="text-sm text-green-600 mt-2 flex items-center gap-2"><FileText className="w-4 h-4"/>{file.name}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Drag 'n' drop a PDF here, or click to select</p>
      )}
    </div>
  );
  
  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!['Pro', 'Enterprise'].includes(userProfile.plan)) {
    return <UpgradePrompt 
      title="Unlock AI Reconciliation Assistant"
      description="Automatically compare GST, ROC, and ITR filings to find discrepancies and ensure accuracy. This is a Pro feature."
      icon={<Scale className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Reconciliation Assistant</h2>
        <p className="text-muted-foreground">
          Upload GST, ROC, and ITR filings to automatically find discrepancies. Costs 15 credits per analysis.
        </p>
      </div>

      <Card className="interactive-lift">
        <CardHeader>
            <CardTitle>Upload Filings</CardTitle>
            <CardDescription>Provide all three documents for a comprehensive reconciliation.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DropzoneCard dz={GSTDropzone} file={files.gst} type="GST" />
                <DropzoneCard dz={ROCDropzone} file={files.roc} type="ROC" />
                <DropzoneCard dz={ITRDropzone} file={files.itr} type="ITR" />
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex-col items-center gap-4">
            <Button onClick={handleReconcile} disabled={isProcessing || !files.gst || !files.roc || !files.itr}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                Reconcile Documents
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4"/>
                This is a mock analysis using AI. Always verify with original documents.
            </p>
        </CardFooter>
      </Card>
      
      {isProcessing && (
         <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="font-semibold text-lg text-foreground">Our AI is crunching the numbers...</p>
         </div>
      )}

      {result && (
        <Card className="interactive-lift animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle>Reconciliation Report</CardTitle>
                <CardDescription>
                    Overall Status: <Badge variant={result.overallStatus === 'Matched' ? 'secondary' : 'destructive'} className={result.overallStatus === 'Matched' ? 'bg-green-100 text-green-800' : ''}>{result.overallStatus}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">AI Summary</h3>
                    <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border">{result.summary}</p>
                </div>
                <Accordion type="multiple" defaultValue={['discrepancies', 'matched']} className="w-full">
                    <AccordionItem value="discrepancies">
                        <AccordionTrigger className="text-base font-medium">Discrepancies Found ({result.discrepancies.length})</AccordionTrigger>
                        <AccordionContent className="pt-2">
                            {result.discrepancies.length > 0 ? (
                                <div className="space-y-4">
                                    {result.discrepancies.map((item, index) => (
                                        <Card key={index} className="bg-destructive/10 border-destructive/20">
                                            <CardHeader>
                                                <CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle/> {item.field}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    {item.values.map(v => (
                                                        <div key={v.source} className="p-2 border rounded-md bg-background">
                                                            <p className="text-xs font-semibold">{v.source}</p>
                                                            <p className="text-sm font-mono">{v.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">Probable Cause:</p>
                                                    <p className="text-sm text-destructive/80">{item.reason}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4">No discrepancies found.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="matched">
                        <AccordionTrigger className="text-base font-medium">Matched Items ({result.matchedItems.length})</AccordionTrigger>
                        <AccordionContent className="pt-2">
                             {result.matchedItems.length > 0 ? (
                                <div className="space-y-3">
                                    {result.matchedItems.map((item, index) => (
                                        <div key={index} className="p-3 border rounded-md flex items-center justify-between bg-muted/50">
                                            <p className="font-medium text-sm flex items-center gap-2"><CheckCircle className="text-green-500"/>{item.field}</p>
                                            <p className="font-mono text-sm">{item.gstValue}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4">No fully matched items found.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  )
}
