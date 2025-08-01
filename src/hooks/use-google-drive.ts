
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout, type TokenResponse } from '@react-oauth/google';
import type { VaultItem } from '@/lib/types';
import { useToast } from './use-toast';

const SCOPES = "https://www.googleapis.com/auth/drive";

const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';

// Helper function to make authenticated API calls
const fetchGoogleAPI = async (endpoint: string, options: RequestInit = {}) => {
    const tokenItem = localStorage.getItem('google-token');
    if (!tokenItem) {
        throw new Error("User not authenticated with Google.");
    }
    const token = JSON.parse(tokenItem);

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token.access_token}`);

    const response = await fetch(`${GOOGLE_API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'An API error occurred');
    }

    return response.json();
};

export function useGoogleDrive() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [files, setFiles] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on component mount
  useEffect(() => {
    setIsLoading(true);
    const tokenItem = localStorage.getItem('google-token');
    if (tokenItem) {
        const token = JSON.parse(tokenItem);
        if (new Date().getTime() < token.expires_at) {
            setIsLoggedIn(true);
        } else {
            localStorage.removeItem('google-token');
            setIsLoggedIn(false);
        }
    } else {
        setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);
  
  const handleAuthResponse = useCallback((tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => {
    setIsLoggedIn(true);
    localStorage.setItem('google-token', JSON.stringify({
        ...tokenResponse,
        expires_at: new Date().getTime() + (tokenResponse.expires_in * 1000)
    }));
    toast({ title: 'Connected!', description: 'Successfully connected to Google Drive.' });
  }, [toast]);

  const logIn = useGoogleLogin({
    onSuccess: handleAuthResponse,
    onError: (error) => {
        console.error('Login Failed:', error)
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Could not sign in with Google.' });
    },
    scope: SCOPES,
  });

  const logOut = () => {
    googleLogout();
    setIsLoggedIn(false);
    setFiles([]);
    localStorage.removeItem('google-token');
    toast({ title: 'Disconnected', description: 'Disconnected from Google Drive.' });
  };
  
  const listFiles = useCallback(async (folderId: string | null = 'root') => {
      setIsLoading(true);
      try {
          const response = await fetchGoogleAPI(`/files?q='${folderId}' in parents and trashed = false&fields=files(id, name, mimeType, modifiedTime, iconLink, webViewLink, size)&orderBy=folder,name`);
          
          const driveFiles = response.files || [];
          const vaultItems: VaultItem[] = driveFiles.map((file: any) => ({
              id: file.id!,
              name: file.name!,
              type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
              lastModified: file.modifiedTime!,
              parentId: folderId,
              iconLink: file.iconLink,
              webViewLink: file.webViewLink,
              size: file.size ? parseInt(file.size, 10) : undefined,
              mimeType: file.mimeType,
          }));
          setFiles(vaultItems);
      } catch (error: any) {
          console.error("Error listing files", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch files. Please try reconnecting to Google Drive.' });
          if(error.message.includes("authenticated")) logOut();
      } finally {
          setIsLoading(false);
      }
  }, [toast]);
  
  const createFolder = async (name: string, parentId: string | null = 'root') => {
      try {
          const metadata = {
              name,
              mimeType: 'application/vnd.google-apps.folder',
              parents: parentId && parentId !== 'root' ? [parentId] : [],
          };
          await fetchGoogleAPI('/files', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(metadata)
          });
          listFiles(parentId);
          toast({ title: 'Folder Created!', description: `Folder "${name}" was created.` });
      } catch (error: any) {
          console.error('Error creating folder', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not create folder.' });
      }
  };
  
  const deleteFile = async (fileId: string) => {
      try {
          await fetchGoogleAPI(`/files/${fileId}`, { method: 'DELETE' });
          setFiles(prev => prev.filter(f => f.id !== fileId));
          toast({ title: 'Item Deleted', description: 'The file or folder has been moved to trash in Google Drive.' });
      } catch (error: any) {
          console.error('Error deleting file', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the item.' });
      }
  };
  
  const uploadFile = async (file: File, parentId: string | null = 'root') => {
    try {
        const metadata = {
            name: file.name,
            parents: parentId && parentId !== 'root' ? [parentId] : []
        };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const tokenItem = localStorage.getItem('google-token');
        if (!tokenItem) throw new Error("Not authenticated");
        const token = JSON.parse(tokenItem);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + token.access_token }),
            body: form,
        });
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error.message);
        }
        toast({ title: 'Upload Successful', description: `"${file.name}" has been uploaded.` });
        listFiles(parentId);
    } catch(error: any) {
        console.error('Error uploading file', error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    }
  };

  return { isLoggedIn, files, isLoading, logIn, logOut, listFiles, createFolder, deleteFile, uploadFile };
}
