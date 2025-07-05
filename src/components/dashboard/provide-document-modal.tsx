
"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Folder, File as FileIcon, UploadCloud } from "lucide-react";
import type { Company, DocumentRequest, VaultItem } from "@/lib/types";
import { useGoogleDrive } from "@/hooks/use-google-drive";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProvideDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  company: Company;
  docRequest: DocumentRequest;
  onFileProvided: (file: { id: string; name: string; url: string }) => void;
}

export function ProvideDocumentModal({ isOpen, onOpenChange, company, docRequest, onFileProvided }: ProvideDocumentModalProps) {
  const { toast } = useToast();
  const { files, isLoading: isDriveLoading, listFiles, uploadFile } = useGoogleDrive();
  const [selectedFile, setSelectedFile] = useState<VaultItem | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Load root files from Drive when modal opens
        listFiles('root');
        setSelectedFile(null);
    }
  }, [isOpen, listFiles]);
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    noClick: true,
    async onDrop(acceptedFiles) {
        if(acceptedFiles.length > 0) {
            await uploadFile(acceptedFiles[0], 'root'); // For simplicity, upload to root
        }
    },
  });

  const handleSelectFile = () => {
    if (selectedFile) {
      onFileProvided({
        id: selectedFile.id,
        name: selectedFile.name,
        url: selectedFile.webViewLink || '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Provide: {docRequest.title}</DialogTitle>
          <DialogDescription>
            Select a file from your Document Vault or upload a new one to fulfill this request.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
            <div {...getRootProps({ className: cn("h-full border-2 border-dashed rounded-lg p-4 flex flex-col", isDragActive && "border-primary bg-primary/10") })}>
                <input {...getInputProps()} />
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {isDriveLoading ? (
                        <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>
                    ) : files.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {files.filter(f => f.type === 'file').map(file => (
                                <button key={file.id} onClick={() => setSelectedFile(file)} className={cn("p-2 border rounded-md text-center hover:bg-muted relative", selectedFile?.id === file.id && "ring-2 ring-primary border-primary")}>
                                     <Image src={file.iconLink!} alt={file.name} width={48} height={48} className="w-12 h-12 mx-auto"/>
                                    <p className="text-xs font-medium truncate mt-2">{file.name}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground">Your vault is empty.</div>
                    )}
                </div>
                 <div className="pt-4 border-t mt-4 flex items-center justify-center">
                    <Button type="button" variant="outline" onClick={openFileDialog}><UploadCloud className="mr-2"/>Upload New File</Button>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSelectFile} disabled={!selectedFile}>
              Share Document
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
