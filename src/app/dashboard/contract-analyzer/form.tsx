
"use client"

import { useCallback, useState, useEffect, useTransition, useRef } from "react"
import { useFormState } from "react-dom"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Loader2,
  UploadCloud,
  FileText,
  AlertTriangle,
  FileWarning,
  FileSearch2,
  Download,
  Sparkles,
  CheckSquare,
} from "lucide-react"
import type { AnalyzeContractOutput } from "@/ai/flows/contract-analyzer-flow"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth"
import { analyzeContractAction } from "./actions"
import { ScrollArea } from "@/components/ui/scroll-area"

const initialState: { data: AnalyzeContractOutput | null; error: string | null } = {
  data: null,
  error: null,
}

export default function ContractAnalyzerForm() {
  const [state, formAction] = useFormState(analyzeContractAction, initialState)
  const [isPending, startTransition] = useTransition()
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const { deductCredits } = useAuth()
  const reportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
      })
    }
    if (state.data) {
        if(deductCredits(5)) {
            toast({
                title: "Analysis Complete",
                description: "Your contract report is ready.",
            });
        }
    }
  }, [state, toast, deductCredits])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast({
          variant: "destructive",
          title: "File Upload Error",
          description: fileRejections[0].errors[0].message,
        })
        return
      }
      
      const uploadedFile = acceptedFiles[0]
      if (uploadedFile) {
        setFile(uploadedFile)
        const reader = new FileReader()
        reader.onload = (loadEvent) => {
          const uri = loadEvent.target?.result as string
          startTransition(() => {
            const formData = new FormData()
            formData.append('fileDataUri', uri)
            formAction(formData)
          })
        }
        reader.readAsDataURL(uploadedFile)
      }
    },
    [formAction, startTransition, toast]
  )
  
  const handleExport = async () => {
    if (!state.data || !reportRef.current) return;
    
    toast({ title: "Preparing Report...", description: "Please wait while we generate your PDF." });
    
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight); // with margin
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('contract-analysis-report.pdf');
  }

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  })

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 h-full">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="font-semibold text-lg text-foreground">
            Analyzing {file?.name || "Document"}...
          </p>
          <p className="text-sm max-w-xs">
            Our AI is reading your contract. Key insights will be ready in just a moment.
          </p>
        </div>
      )
    }
    if (state.data) {
      const riskScore = state.data.riskScore;
      const riskLevel = riskScore > 75 ? "Low" : riskScore > 50 ? "Medium" : "High";
      const riskColor = riskScore > 75 ? "text-green-500" : riskScore > 50 ? "text-yellow-500" : "text-red-500";
      
      return (
        <div ref={reportRef} className="w-full h-full p-4 md:p-6 bg-muted/30 rounded-b-lg">
           <h3 className="text-2xl font-bold text-center mb-6">Contract Analysis Report</h3>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><FileText className="text-primary"/>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{state.data.summary}</p>
                    </CardContent>
                </Card>
                <Card className="interactive-lift flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><AlertTriangle className="text-red-500"/>Risk Flags ({state.data.riskFlags.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        {state.data.riskFlags.length > 0 ? (
                            <ScrollArea className="h-72">
                                <div className="space-y-4 pr-4">
                                {state.data.riskFlags.map((flag, i) => (
                                <div key={i} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-red-500">
                                    <p className="font-semibold text-foreground text-sm">In Clause: <span className="font-normal italic">"{flag.clause}"</span></p>
                                    <p className="text-muted-foreground text-sm mt-1"><span className="font-medium text-foreground">Risk:</span> {flag.risk}</p>
                                </div>
                                ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground p-4 text-center">No significant risks found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="text-lg">Smart Legal Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center flex flex-col items-center">
                        <div className="relative w-40 h-40 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path className="text-muted/20" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                                <path className={riskColor} strokeWidth="3" strokeDasharray={`${riskScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-4xl font-bold ${riskColor}`}>{riskScore}</span>
                            </div>
                        </div>
                        <p className={`mt-2 text-xl font-medium ${riskColor}`}>{riskLevel} Risk</p>
                         <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={() => toast({ title: 'Feature Coming Soon', description: 'AI-powered revision suggestions will be available in a future update.' })}
                        >
                            Suggest Revisions
                        </Button>
                    </CardContent>
                </Card>
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><FileWarning className="text-yellow-500"/>Missing Clauses</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {state.data.missingClauses.length > 0 ? (
                        <ul className="space-y-2">
                        {state.data.missingClauses.map((clause, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckSquare className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0"/>
                                <span>{clause}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No critical clauses seem to be missing.</p>
                    )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      )
    }
    // Initial / Empty State
    return (
      <div {...getRootProps()} className="h-full w-full cursor-pointer">
        <input {...getInputProps()} />
        <div
          className={`text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed h-full w-full transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : ""
          }`}
        >
          <FileSearch2 className="w-16 h-16 text-primary/20" />
          <p className="font-semibold text-lg text-foreground">Analyze Your Contract</p>
          <p className="text-sm max-w-xs">
            Drag and drop a PDF or DOCX file here to get started.
          </p>
          <Button type="button" variant="outline" onClick={openFileDialog} className="mt-4 interactive-lift">
            <UploadCloud className="mr-2 h-4 w-4" />
            Or Select a File
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col min-h-[calc(100vh-14rem)] interactive-lift">
      <CardHeader className="flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          {file && !isPending ? <FileText className="w-5 h-5 text-primary" /> : <div className="w-5 h-5" />}
          <div>
            <h3 className="font-semibold text-lg">
              {state.data ? "Analysis Complete" : file ? file.name : "Upload a document"}
            </h3>
            {state.data && (
              <p className="text-sm text-muted-foreground">
                Displaying report for: <span className="font-medium">{file?.name}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openFileDialog} className="interactive-lift">
            <UploadCloud className="mr-2 h-4 w-4" />
            {file ? "Upload New" : "Upload Contract"}
          </Button>
          <Button variant="default" size="sm" disabled={!state.data} onClick={handleExport} className="interactive-lift">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">{renderContent()}</CardContent>
    </Card>
  )
}
