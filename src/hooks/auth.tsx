'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, VaultItem, ChatMessage } from '@/lib/types';
import { useToast } from './use-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import { add } from 'date-fns';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isPlanActive: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveVaultItems: (items: VaultItem[]) => Promise<void>;
  getVaultItems: () => Promise<VaultItem[]>;
  saveChatHistory: (chat: ChatMessage[]) => Promise<void>;
  getChatHistory: () => Promise<ChatMessage[][]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_PROFILE_STORAGE_KEY = 'userProfile_v2_firebase';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlanActive, setIsPlanActive] = useState(true);
  const { toast } = useToast();

  const createNewUserProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newExpiry = add(new Date(), { days: 30 });
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'New User',
      role: 'Founder',
      plan: 'Starter',
      planStartDate: new Date().toISOString(),
      planExpiryDate: newExpiry.toISOString(),
      companies: [],
      activeCompanyId: '',
      credits: 90,
    };
    await setDoc(userDocRef, newProfile);
    setUserProfile(newProfile);
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
  }

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      setUserProfile(profile);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      await createNewUserProfile(firebaseUser);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
        };
        setUser(userData);
        await fetchUserProfile(userData);
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);
  
  useEffect(() => {
    if (userProfile?.planExpiryDate) {
        const expiryDate = new Date(userProfile.planExpiryDate);
        const isActive = expiryDate > new Date();
        setIsPlanActive(isActive);
        if (!isActive) {
             toast({
                title: "Subscription Expired",
                description: "Your plan has expired. Some features may be locked.",
                variant: "destructive"
            })
        }
    } else {
        setIsPlanActive(true);
    }
  }, [userProfile, toast]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, updates);
    setUserProfile(prev => {
        if (!prev) return null;
        const newProfile = { ...prev, ...updates };
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
        return newProfile;
    });
  }, [user]);
  
  const signUpWithEmailAndPassword = async (email: string, pass: string, name: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        const userData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
        };
        await createNewUserProfile(userData);
      }
  };

  const signInWithEmailAndPassword = async (email: string, pass: string) => {
      await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch(error) {
        console.error("Google Sign-In Error:", error);
        toast({
            title: "Sign-In Failed",
            description: "Could not sign in with Google. Please try again.",
            variant: "destructive"
        });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const deductCredits = useCallback(async (amount: number) => {
    if (!userProfile || !user) return false;
    if (userProfile.plan === 'Enterprise') return true;
    if ((userProfile.credits ?? 0) < amount) {
      toast({ variant: "destructive", title: "Insufficient Credits", description: `You need ${amount} credit(s) for this action. Please upgrade your plan or buy more credits.` });
      return false;
    }
    
    const userDocRef = doc(db, "users", user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw "Document does not exist!";
        const currentCredits = userDoc.data().credits ?? 0;
        if (currentCredits < amount) throw new Error("Insufficient credits.");
        const newCredits = currentCredits - amount;
        transaction.update(userDocRef, { credits: newCredits });
        setUserProfile(prev => prev ? {...prev, credits: newCredits} : null);
      });
      toast({ title: "Credits Deducted", description: `You have ${userProfile.credits - amount} credits remaining.` });
      return true;
    } catch (e: any) {
        toast({ variant: "destructive", title: "Credit Deduction Failed", description: e.message });
        return false;
    }
  }, [user, userProfile, toast]);

  const addCredits = useCallback(async (amount: number) => {
    if(!userProfile || !user) return;
    const newCredits = (userProfile.credits ?? 0) + amount;
    await updateUserProfile({ credits: newCredits });
    toast({ title: "Credits Added!", description: `You have successfully added ${amount} credits. Your new balance is ${newCredits}.` });
  }, [user, userProfile, toast, updateUserProfile]);
  
  const saveVaultItems = async (items: VaultItem[]) => {
    if (!user) return;
    const vaultCollectionRef = collection(db, `users/${user.uid}/vault`);
    const batch = writeBatch(db);
    items.forEach(item => {
        const docRef = doc(vaultCollectionRef, item.id);
        batch.set(docRef, item);
    });
    await batch.commit();
  };

  const getVaultItems = async (): Promise<VaultItem[]> => {
    if (!user) return [];
    const vaultCollectionRef = collection(db, `users/${user.uid}/vault`);
    const q = query(vaultCollectionRef, orderBy('lastModified', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VaultItem);
  };

  const saveChatHistory = async (chat: ChatMessage[]) => {
    if (!user) return;
    const historyCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
    await addDoc(historyCollectionRef, {
        messages: chat,
        createdAt: new Date().toISOString(),
    });
  };

  const getChatHistory = async (): Promise<ChatMessage[][]> => {
    if (!user) return [];
    const historyCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
    const q = query(historyCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().messages as ChatMessage[]);
  };

  const value = { user, userProfile, loading, isPlanActive, updateUserProfile, deductCredits, addCredits, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, saveVaultItems, getVaultItems, saveChatHistory, getChatHistory };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
