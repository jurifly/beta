
'use client';

import { useState } from 'react';
import {
  Folder,
  File,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { VaultItem } from '@/lib/types';


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


// --- Main Page Component ---

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Document Vault</h1>
            <p className="text-muted-foreground">Your one-stop shop for secure document storage.</p>
        </div>
        <DocumentVault />
    </div>
  );
}
