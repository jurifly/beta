
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout, type TokenResponse } from '@react-oauth/google';
import { gapi } from 'gapi-script';
import type { VaultItem } from '@/lib/types';
import { useToast } from './use-toast';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive";

export function useGoogleDrive() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [files, setFiles] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initClient = useCallback(() => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    }).catch(error => {
      console.error("Error initializing GAPI client", error);
      toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect to Google Drive.' });
    });
  }, [toast]);

  useEffect(() => {
    const loadGapi = async () => {
      await new Promise((resolve) => gapi.load('client', resolve));
      initClient();
    };
    loadGapi();
  }, [initClient]);
  
  const handleAuthResponse = useCallback((tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => {
    gapi.client.setToken({ access_token: tokenResponse.access_token });
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
    if(gapi.client) gapi.client.setToken(null);
    setIsLoggedIn(false);
    setFiles([]);
    localStorage.removeItem('google-token');
    toast({ title: 'Disconnected', description: 'Disconnected from Google Drive.' });
  };
  
  useEffect(() => {
    const token = localStorage.getItem('google-token');
    if (token) {
        const parsedToken = JSON.parse(token);
        if (new Date().getTime() < parsedToken.expires_at) {
             gapi.load('client', () => {
                initClient();
                gapi.client.setToken({ access_token: parsedToken.access_token });
                setIsLoggedIn(true);
             });
        } else {
            setIsLoggedIn(false);
            localStorage.removeItem('google-token');
        }
    }
    setIsLoading(false);
  }, [initClient]);

  const listFiles = useCallback(async (folderId: string | null = 'root') => {
    if (!gapi.client?.drive) {
        toast({ variant: 'destructive', title: 'Error', description: 'Google Drive client is not ready.'});
        return;
    }
    setIsLoading(true);
    try {
      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, modifiedTime, iconLink, webViewLink, size)',
        orderBy: 'folder,name',
      });

      const driveFiles = response.result.files || [];
      const vaultItems: VaultItem[] = driveFiles.map(file => ({
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
    } catch (error) {
      console.error("Error listing files", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch files from Google Drive.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const createFolder = async (name: string, parentId: string | null = 'root') => {
      try {
          const response = await gapi.client.drive.files.create({
              resource: {
                  name,
                  mimeType: 'application/vnd.google-apps.folder',
                  parents: parentId ? [parentId] : [],
              },
              fields: 'id, name, mimeType, modifiedTime, iconLink, webViewLink'
          });
          listFiles(parentId);
          toast({ title: 'Folder Created!', description: `Folder "${name}" was created.` });
      } catch (error) {
          console.error('Error creating folder', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not create folder.' });
      }
  };
  
  const deleteFile = async (fileId: string) => {
      try {
          await gapi.client.drive.files.delete({ fileId });
          setFiles(prev => prev.filter(f => f.id !== fileId));
          toast({ title: 'Item Deleted', description: 'The file or folder has been moved to trash in Google Drive.' });
      } catch (error) {
          console.error('Error deleting file', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the item.' });
      }
  };
  
  const uploadFile = async (file: File, parentId: string | null = 'root') => {
    try {
        const metadata = {
            name: file.name,
            parents: parentId ? [parentId] : []
        };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const token = gapi.client.getToken();
        if (!token?.access_token) {
            throw new Error("Not authenticated");
        }

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
