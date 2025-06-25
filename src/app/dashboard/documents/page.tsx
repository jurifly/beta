
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
  X,
} from 'lucide-react';
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
import { useAuth } from '@/hooks/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function DocumentsPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { saveVaultItems, getVaultItems } = useAuth();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Vault' }]);
  const [selectedFile, setSelectedFile] = useState<VaultItem | null>(null);


  useEffect(() => {
    const loadItems = async () => {
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
    loadItems();
  }, [getVaultItems, toast]);

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
    e.stopPropagation(); // Prevent folder navigation when clicking delete
    const itemToDelete = vaultItems.find(item => item.id === id);
    if (window.confirm(`Are you sure you want to delete "${itemToDelete?.name}"? This will also delete all its contents.`)) {
      
      const itemsToDelete = new Set<string>([id]);
      let queue = [id];

      // Find all nested items to delete
      if(itemToDelete?.type === 'folder') {
        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = vaultItems.filter(item => item.parentId === currentId);
            for (const child of children) {
                itemsToDelete.add(child.id);
                if (child.type === 'folder') {
                    queue.push(child.id);
                }
            }
        }
      }

      const updatedItems = vaultItems.filter(item => !itemsToDelete.has(item.id));
      saveItems(updatedItems);
      toast({
        title: 'Item Deleted',
        description: `"${itemToDelete?.name}" has been deleted.`,
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: VaultItem[] = acceptedFiles.map(file => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`, // Add random to ensure uniqueness
        type: 'file',
        name: file.name,
        lastModified: new Date(file.lastModified).toISOString(),
        size: file.size,
        parentId: currentFolderId,
      }));

      const uniqueNewFiles = newFiles.filter(
        newFile => !vaultItems.some(existing => existing.id === newFile.id)
      );

      saveItems([...uniqueNewFiles, ...vaultItems]);
      if (uniqueNewFiles.length > 0) {
        toast({
          title: 'Upload Successful',
          description: `${uniqueNewFiles.length} file(s) added to the vault.`,
        });
      }
    },
    [vaultItems, saveItems, toast, currentFolderId]
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

  return (
    <>
      <AddFolderModal
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onCreateFolder={handleCreateFolder}
      />
      <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileIcon/> {selectedFile?.name}</DialogTitle>
                <DialogDescription>File Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {selectedFile?.name}</p>
                <p><strong>Type:</strong> {selectedFile?.type}</p>
                <p><strong>Size:</strong> {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                <p><strong>Last Modified:</strong> {selectedFile?.lastModified ? format(new Date(selectedFile.lastModified), "PPPpp") : 'N/A'}</p>
            </div>
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
