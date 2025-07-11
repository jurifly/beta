
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Folder,
  File as FileIcon,
  Loader2,
  FolderPlus,
  Upload,
  Trash2,
  ChevronRight,
  Download,
  Power,
  PowerOff,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { VaultItem } from '@/lib/types';
import { AddFolderModal } from '@/components/dashboard/add-folder-modal';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { useGoogleDrive } from '@/hooks/use-google-drive';

function GoogleDriveConnect() {
  const { logIn } = useGoogleDrive();
  return (
    <div className="h-96 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
       <Image src="https://www.google.com/images/branding/product/2x/drive_128dp.png" alt="Google Drive" width={80} height={80} className="mb-4"/>
      <h3 className="text-xl font-semibold text-foreground mb-2">Connect to Google Drive</h3>
      <p className="max-w-sm mb-6">
        Securely access, upload, and manage your documents by linking your Google Drive account.
      </p>
      <Button onClick={() => logIn()} size="lg">
        <Power className="mr-2" />
        Connect to Google Drive
      </Button>
    </div>
  )
}

export default function DocumentsPage() {
  const { 
    isLoggedIn, 
    files, 
    isLoading: isDriveLoading,
    logIn,
    logOut,
    listFiles, 
    createFolder, 
    deleteFile,
    uploadFile,
  } = useGoogleDrive();

  const [isModalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<VaultItem | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      listFiles(currentFolderId);
    }
  }, [isLoggedIn, currentFolderId, listFiles]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isLoggedIn) {
        toast({ variant: 'destructive', title: 'Not Connected', description: 'Please connect to Google Drive first.' });
        return;
    }
    toast({ title: "Uploading...", description: `Starting upload of ${acceptedFiles.length} file(s).`});
    
    for (const file of acceptedFiles) {
        await uploadFile(file, currentFolderId);
    }
  }, [isLoggedIn, uploadFile, currentFolderId, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

  const handleCreateFolder = (name: string) => {
    if (files.some(item => item.name === name && item.type === 'folder')) {
      toast({
        variant: 'destructive',
        title: 'Folder Exists',
        description: 'A folder with this name already exists here.',
      });
      return;
    }
    createFolder(name, currentFolderId);
  };

  const handleDeleteItem = (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This will move the item to the trash in your Google Drive.`)) {
      deleteFile(item.id);
    }
  };

  const handleFolderClick = (folder: VaultItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
  };
  
  const handleFileClick = (file: VaultItem) => {
    setSelectedFile(file);
  };

  const handleBreadcrumbClick = (folderId: string | null, index: number) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const BreadcrumbTrail = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id || 'root'} className="flex items-center gap-2">
          <button
            onClick={() => handleBreadcrumbClick(crumb.id, index)}
            className={cn(
              "hover:text-primary",
              index === breadcrumbs.length - 1 && "font-semibold text-foreground"
            )}
            disabled={index === breadcrumbs.length - 1}
          >
            {crumb.name}
          </button>
          {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4" />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <AddFolderModal
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onCreateFolder={handleCreateFolder}
      />
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 truncate"><FileIcon/> {selectedFile?.name}</DialogTitle>
                <DialogDescription>
                    {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Folder'} | Last Modified: {selectedFile?.lastModified ? format(parseISO(selectedFile.lastModified), "PPPpp") : 'N/A'}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                {selectedFile?.webViewLink && (
                    <Button asChild>
                        <a href={selectedFile.webViewLink} target="_blank" rel="noopener noreferrer">
                           <Download className="mr-2"/> View/Download from Drive
                        </a>
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Document Vault
            </h1>
            <p className="text-muted-foreground">
              Your one-stop shop for secure document storage via Google Drive.
            </p>
          </div>
          {isLoggedIn && (
            <Button variant="outline" onClick={logOut}>
                <PowerOff className="mr-2"/> Disconnect Drive
            </Button>
          )}
        </div>
        <Card
          {...getRootProps()}
          className={cn(
            'transition-colors',
            isDragActive && 'border-primary bg-primary/10'
          )}
        >
          <input {...getInputProps()} />
          {isLoggedIn && (
            <CardHeader className="flex-col md:flex-row md:items-center justify-between gap-4">
              <BreadcrumbTrail />
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                  className="interactive-lift flex-1 md:flex-initial"
                >
                  <FolderPlus className="mr-2" /> New Folder
                </Button>
                <Button onClick={open} className="interactive-lift flex-1 md:flex-initial">
                  <Upload className="mr-2" /> Upload
                </Button>
              </div>
            </CardHeader>
          )}
          <CardContent>
            {isDriveLoading && !isLoggedIn && (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {!isLoggedIn && !isDriveLoading && <GoogleDriveConnect />}
            {isLoggedIn && (
              isDragActive ? (
                <div className="h-64 flex flex-col items-center justify-center text-primary font-semibold">
                  <Upload className="w-12 h-12 mb-4 animate-bounce" />
                  Drop files to upload
                </div>
              ) : isDriveLoading ? (
                 <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : files.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                    <Folder className="w-16 h-16 text-primary/20"/>
                    <p className="font-semibold text-lg">This Folder is Empty</p>
                    <p className="text-sm max-w-sm">
                      Drag and drop files here or use the upload button to add documents.
                    </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {files.map(item => (
                      <div
                        key={item.id}
                        onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleFileClick(item)}
                        onDoubleClick={() => item.type === 'folder' ? handleFolderClick(item) : window.open(item.webViewLink, '_blank')}
                        className="group relative flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted cursor-pointer interactive-lift text-center"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => handleDeleteItem(e, item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <Image src={item.iconLink!} alt={item.type} width={48} height={48} className="w-12 h-12"/>
                        <p
                          className="text-xs font-medium w-full break-words"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                      </div>
                    ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
