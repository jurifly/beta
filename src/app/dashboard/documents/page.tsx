
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { VaultItem } from '@/lib/types';
import { AddFolderModal } from '@/components/dashboard/add-folder-modal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function DocumentsPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, saveVaultItems, getVaultItems } = useAuth();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Vault' }]);
  const [selectedFile, setSelectedFile] = useState<VaultItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);


  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const items = await getVaultItems();
        setVaultItems(items);
      } catch (error) {
        console.error('Failed to load vault items from Firestore', error);
        toast({
          variant: 'destructive',
          title: 'Load Error',
          description: 'Could not load vault items.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
        loadItems();
    }
  }, [user, getVaultItems, toast]);

  useEffect(() => {
    if (selectedFile && selectedFile.contentType?.startsWith('text/')) {
        setIsPreviewLoading(true);
        setPreviewContent(null);
        fetch(selectedFile.downloadURL!)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => {
                setPreviewContent(text);
                setIsPreviewLoading(false);
            })
            .catch(error => {
                console.error("Error fetching preview content:", error);
                toast({
                    variant: "destructive",
                    title: "Preview Failed",
                    description: "Could not load the file preview.",
                });
                setIsPreviewLoading(false);
            });
    } else {
        setPreviewContent(null);
    }
  }, [selectedFile, toast]);

  const saveItems = async (updatedItems: VaultItem[]) => {
    setVaultItems(updatedItems);
    try {
      await saveVaultItems(updatedItems);
    } catch (error) {
      console.error('Failed to save vault items to Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Storage Error',
        description: 'Could not save vault items.',
      });
    }
  };

  const handleCreateFolder = (name: string) => {
    if (vaultItems.some(item => item.name === name && item.type === 'folder' && item.parentId === currentFolderId)) {
      toast({
        variant: 'destructive',
        title: 'Folder Exists',
        description: 'A folder with this name already exists here.',
      });
      return;
    }
    const newFolder: VaultItem = {
      id: Date.now().toString(),
      type: 'folder',
      name,
      lastModified: new Date().toISOString(),
      parentId: currentFolderId,
    };
    saveItems([newFolder, ...vaultItems]);
    toast({
      title: 'Folder Created',
      description: `Folder "${name}" was successfully created.`,
    });
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const itemToDelete = vaultItems.find(item => item.id === id);
    if (!itemToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${itemToDelete?.name}"? This will also delete all its contents.`)) {
      
      const itemsToDeleteSet = new Set<string>();
      const filesInStorageToDelete: VaultItem[] = [];
      
      const findChildrenRecursive = (folderId: string) => {
          const children = vaultItems.filter(item => item.parentId === folderId);
          for (const child of children) {
              itemsToDeleteSet.add(child.id);
              if (child.type === 'folder') {
                  findChildrenRecursive(child.id);
              } else if (child.type === 'file' && child.downloadURL) {
                  filesInStorageToDelete.push(child);
              }
          }
      }

      itemsToDeleteSet.add(itemToDelete.id);
      if (itemToDelete.type === 'folder') {
          findChildrenRecursive(itemToDelete.id);
      } else if (itemToDelete.type === 'file' && itemToDelete.downloadURL) {
          filesInStorageToDelete.push(itemToDelete);
      }

      const deletePromises = filesInStorageToDelete.map(file => {
          if (file.downloadURL) {
              try {
                // The file ID is the full path in storage
                const fileRef = ref(storage, file.id);
                return deleteObject(fileRef);
              } catch (error) {
                console.error(`Failed to create ref for deletion: ${file.name}`, error);
                return Promise.resolve(); // Don't block other deletions
              }
          }
          return Promise.resolve();
      });

      Promise.all(deletePromises)
        .then(() => {
          const updatedItems = vaultItems.filter(item => !itemsToDeleteSet.has(item.id));
          saveItems(updatedItems);
          toast({
            title: 'Item Deleted',
            description: `"${itemToDelete.name}" and its contents have been deleted.`,
          });
        })
        .catch((error) => {
          console.error("Deletion error:", error);
          toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'Could not delete one or more files from storage.',
          });
        });
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload files.' });
        return;
      }
      
      toast({ title: "Uploading...", description: `Starting upload of ${acceptedFiles.length} file(s).`});

      const uploadPromises = acceptedFiles.map(async (file) => {
        const uniqueFileName = `${Date.now()}-${file.name}`;
        // Use a path that includes the parent folder ID to structure storage
        const storagePath = `vault/${user.uid}/${currentFolderId || 'root'}/${uniqueFileName}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const newFile: VaultItem = {
          id: storagePath, // Use full path as a unique ID
          type: 'file',
          name: file.name,
          lastModified: new Date(file.lastModified).toISOString(),
          size: file.size,
          parentId: currentFolderId,
          downloadURL,
          contentType: file.type,
        };
        return newFile;
      });

      try {
        const newFiles = await Promise.all(uploadPromises);
        saveItems([...vaultItems, ...newFiles]);
        toast({ title: 'Upload Successful', description: `${newFiles.length} file(s) added to the vault.` });
      } catch (error) {
        console.error("Upload error:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'One or more files could not be uploaded.' });
      }
    },
    [user, currentFolderId, vaultItems, saveItems, toast]
  );
  
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


  const { getRootProps, getInputProps, isDragActive, open } =
    useDropzone({ onDrop, noClick: true });
    
  const displayedItems = useMemo(() => {
    return vaultItems.filter(item => item.parentId === currentFolderId);
  }, [vaultItems, currentFolderId]);


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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

  const onModalOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedFile(null);
        setPreviewContent(null);
    }
  };

  return (
    <>
      <AddFolderModal
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onCreateFolder={handleCreateFolder}
      />
      <Dialog open={!!selectedFile} onOpenChange={onModalOpenChange}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 truncate"><FileIcon/> {selectedFile?.name}</DialogTitle>
                <DialogDescription>
                    {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Folder'} | Last Modified: {selectedFile?.lastModified ? format(new Date(selectedFile.lastModified), "PPPpp") : 'N/A'}
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 border rounded-md bg-muted/50 overflow-hidden">
                {isPreviewLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : selectedFile?.contentType?.startsWith('image/') ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img src={selectedFile.downloadURL} alt={selectedFile.name} className="max-w-full max-h-full object-contain" />
                    </div>
                ) : selectedFile?.contentType === 'application/pdf' ? (
                    <iframe src={selectedFile.downloadURL} className="w-full h-full" title={selectedFile.name} />
                ) : previewContent !== null ? (
                     <pre className="text-sm p-4 w-full h-full whitespace-pre-wrap break-words overflow-auto">{previewContent}</pre>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                        <FileIcon className="w-16 h-16 mx-auto mb-4" />
                        <p>No preview available for this file type.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                {selectedFile?.downloadURL && (
                    <Button asChild>
                        <a href={selectedFile.downloadURL} download={selectedFile.name} target="_blank" rel="noopener noreferrer">
                           <Download className="mr-2"/> Download
                        </a>
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Document Vault
          </h1>
          <p className="text-muted-foreground">
            Your one-stop shop for secure document storage.
          </p>
        </div>
        <Card
          {...getRootProps()}
          className={cn(
            'transition-colors',
            isDragActive && 'border-primary bg-primary/10'
          )}
        >
          <input {...getInputProps()} />
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
          <CardContent>
            {isDragActive ? (
              <div className="h-64 flex flex-col items-center justify-center text-primary font-semibold">
                <Upload className="w-12 h-12 mb-4 animate-bounce" />
                Drop files to upload
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>This folder is empty.</p>
                <p className="text-sm">
                  Drag & drop files here, or use the buttons above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedItems
                  .sort((a, b) => (a.type > b.type ? -1 : 1))
                  .map(item => (
                    <div
                      key={item.id}
                      onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleFileClick(item)}
                      className="group relative flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted cursor-pointer interactive-lift"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      {item.type === 'folder' ? (
                        <Folder className="w-16 h-16 text-primary/70" />
                      ) : (
                        <FileIcon className="w-16 h-16 text-muted-foreground" />
                      )}
                      <p
                        className="text-sm font-medium text-center truncate w-full"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground h-4">
                        {item.type === 'file' && item.size
                          ? `${(item.size / 1024).toFixed(1)} KB`
                          : ''}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
