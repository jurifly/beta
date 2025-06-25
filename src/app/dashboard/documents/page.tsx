
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Folder,
  File,
  Loader2,
  FolderPlus,
  Upload,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { VaultItem } from '@/lib/types';
import { AddFolderModal } from '@/components/dashboard/add-folder-modal';
import { cn } from '@/lib/utils';


const VAULT_STORAGE_KEY = 'documentVault';

export default function DocumentsPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(VAULT_STORAGE_KEY);
      if (savedItems) {
        setVaultItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error("Failed to load vault items from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveItems = (updatedItems: VaultItem[]) => {
    setVaultItems(updatedItems);
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Failed to save vault items to localStorage", error);
      toast({ variant: "destructive", title: "Storage Error", description: "Could not save vault items." });
    }
  };

  const handleCreateFolder = (name: string) => {
    if (vaultItems.some(item => item.name === name && item.type === 'folder')) {
        toast({ variant: 'destructive', title: 'Folder Exists', description: 'A folder with this name already exists.'});
        return;
    }
    const newFolder: VaultItem = {
      id: Date.now().toString(),
      type: 'folder',
      name,
      lastModified: new Date().toISOString(),
    };
    saveItems([newFolder, ...vaultItems]);
    toast({ title: "Folder Created", description: `Folder "${name}" was successfully created.` });
  };
  
  const handleDeleteItem = (id: string) => {
    const itemToDelete = vaultItems.find(item => item.id === id);
    if (window.confirm(`Are you sure you want to delete "${itemToDelete?.name}"?`)) {
      const updatedItems = vaultItems.filter(item => item.id !== id);
      saveItems(updatedItems);
      toast({ title: "Item Deleted", description: `"${itemToDelete?.name}" has been deleted.` });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: VaultItem[] = acceptedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}`,
      type: 'file',
      name: file.name,
      lastModified: new Date(file.lastModified).toISOString(),
      size: file.size,
    }));
    
    const uniqueNewFiles = newFiles.filter(newFile => !vaultItems.some(existing => existing.id === newFile.id));
    saveItems([...uniqueNewFiles, ...vaultItems]);
    if (uniqueNewFiles.length > 0) {
      toast({ title: "Upload Successful", description: `${uniqueNewFiles.length} file(s) added to the vault.` });
    }
  }, [vaultItems, saveItems, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <AddFolderModal isOpen={isModalOpen} onOpenChange={setModalOpen} onCreateFolder={handleCreateFolder} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Document Vault</h1>
          <p className="text-muted-foreground">Your one-stop shop for secure document storage.</p>
        </div>
        <Card {...getRootProps()} className={cn("transition-colors", isDragActive && "border-primary bg-primary/10")}>
            <input {...getInputProps()} />
            <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>My Vault</CardTitle>
                  <CardDescription>Your secure, centralized document repository.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setModalOpen(true)} className="interactive-lift"><FolderPlus className="mr-2"/> New Folder</Button>
                    <Button onClick={() => toast({ title: "Feature coming soon!" })} className="interactive-lift"><Upload className="mr-2"/> Upload Document</Button>
                </div>
            </CardHeader>
            <CardContent>
                {isDragActive ? (
                    <div className="h-64 flex flex-col items-center justify-center text-primary font-semibold">
                        <Upload className="w-12 h-12 mb-4 animate-bounce"/>
                        Drop files to upload
                    </div>
                ) : vaultItems.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Your vault is empty.</p>
                        <p className="text-sm">Drag & drop files here, or use the buttons above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {vaultItems.sort((a,b) => (a.type > b.type) ? -1 : 1).map(item => (
                            <div key={item.id} className="group relative flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted cursor-pointer interactive-lift">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                    <span className="sr-only">Delete</span>
                                </Button>
                                {item.type === 'folder' ? <Folder className="w-16 h-16 text-primary/70" /> : <File className="w-16 h-16 text-muted-foreground" />}
                                <p className="text-sm font-medium text-center truncate w-full" title={item.name}>{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.type === 'file' && item.size ? `${(item.size / 1000000).toFixed(1)} MB` : ""}</p>
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
