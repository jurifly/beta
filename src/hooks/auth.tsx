
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, ChatMessage, AppNotification, Transaction, UserRole } from '@/lib/types';
import { useToast } from './use-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword as signInWithEmail, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, orderBy, limit, writeBatch, serverTimestamp, increment, where } from 'firebase/firestore';
import { add, type Duration } from 'date-fns';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isPlanActive: boolean;
  notifications: AppNotification[];
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, pass: string, name: string, legalRegion: string, refId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveChatHistory: (chat: ChatMessage[]) => Promise<void>;
  getChatHistory: () => Promise<ChatMessage[][]>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlanActive, setIsPlanActive] = useState(true);
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    try {
      const devMode = localStorage.getItem('devMode') === 'true';
      setIsDevMode(devMode);
    } catch (error) {
      console.error("Could not access localStorage for devMode", error);
    }
  }, []);

  const setDevMode = (enabled: boolean) => {
    try {
      localStorage.setItem('devMode', String(enabled));
      setIsDevMode(enabled);
      toast({
        title: `Developer Mode ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `Role switching is now ${enabled ? 'unlocked' : 'locked'}.`,
      });
    } catch (error) {
      console.error("Could not access localStorage for devMode", error);
    }
  };


  const createNewUserProfile = useCallback(async (firebaseUser: User, legalRegion: string, refId?: string): Promise<UserProfile> => {
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
      legalRegion: legalRegion || 'India',
      creditBalance: 10,
      dailyCreditLimit: 5,
      dailyCreditsUsed: 0,
      lastCreditReset: new Date().toISOString(),
    };
    
    await setDoc(userDocRef, newProfile);
    
    return newProfile;
  }, []);

  const addNotification = useCallback(async (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!user) return;
    const notificationsRef = collection(db, `users/${user.uid}/notifications`);

    const q = query(notificationsRef, where('title', '==', notificationData.title), where('read', '==', false));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return;
    }

    const notification: Omit<AppNotification, 'id'> = {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const newDocRef = await addDoc(notificationsRef, notification);
    setNotifications(prev => [{ ...notification, id: newDocRef.id }, ...prev]);
  }, [user]);

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      let profile = userDoc.data() as UserProfile;
      if (!profile.legalRegion) {
        profile.legalRegion = 'India';
        updateDoc(userDocRef, { legalRegion: 'India' }).catch(e => console.error("Failed to backfill legalRegion", e));
      }
      
      const today = new Date();
      const lastReset = profile.lastCreditReset ? new Date(profile.lastCreditReset) : new Date(0);
      const isNewUTCDay = today.getUTCFullYear() > lastReset.getUTCFullYear() ||
                        today.getUTCMonth() > lastReset.getUTCMonth() ||
                        today.getUTCDate() > lastReset.getUTCDate();

      if (isNewUTCDay) {
        profile.dailyCreditsUsed = 0;
        profile.lastCreditReset = today.toISOString();
        await updateDoc(userDocRef, {
          dailyCreditsUsed: 0,
          lastCreditReset: today.toISOString()
        });
      }
      setUserProfile(profile);
    } else {
      const newProfile = await createNewUserProfile(firebaseUser, 'India');
      setUserProfile(newProfile);
    }
  }, [createNewUserProfile]);

  const fetchNotifications = useCallback(async (uid: string) => {
    if (!uid) return;
    const notificationsCollectionRef = collection(db, `users/${uid}/notifications`);
    const q = query(notificationsCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    const fetchedNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    setNotifications(fetchedNotifications);
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    if (!user) return;
    const notificationRef = doc(db, `users/${user.uid}/notifications`, id);
    await updateDoc(notificationRef, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [user]);
  
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
        if (!n.read) {
             const notificationRef = doc(db, `users/${user.uid}/notifications`, n.id);
             batch.update(notificationRef, { read: true });
        }
    });
    await batch.commit();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user, notifications]);

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
        await fetchNotifications(userData.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        setNotifications([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile, fetchNotifications]);
  
  useEffect(() => {
    setIsPlanActive(true); // All features unlocked
  }, [userProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, updates);
    setUserProfile(prev => {
        if (!prev) return null;
        const newProfile = { ...prev, ...updates };
        return newProfile;
    });
  }, [user]);
  
  const signUpWithEmailAndPassword = async (email: string, pass: string, name: string, legalRegion: string, refId?: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        const userData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
        };
        await createNewUserProfile(userData, legalRegion, refId);
      }
  };

  const signInWithEmailAndPassword = async (email: string, pass: string) => {
      await signInWithEmail(auth, email, pass);
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

  const deductCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (isDevMode) return true;
    if (!user || !userProfile) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in again." });
      return false;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const freshProfileDoc = await getDoc(userDocRef);
    if (!freshProfileDoc.exists()) {
      toast({ variant: "destructive", title: "Error", description: "User profile not found." });
      return false;
    }

    let currentProfile = freshProfileDoc.data() as UserProfile;

    const today = new Date();
    const lastReset = currentProfile.lastCreditReset ? new Date(currentProfile.lastCreditReset) : new Date(0);
    const isNewUTCDay = today.getUTCFullYear() > lastReset.getUTCFullYear() ||
                      today.getUTCMonth() > lastReset.getUTCMonth() ||
                      today.getUTCDate() > lastReset.getUTCDate();
    
    if (isNewUTCDay) {
        currentProfile.dailyCreditsUsed = 0;
        currentProfile.lastCreditReset = today.toISOString();
    }

    const bonusCredits = currentProfile.creditBalance ?? 0;
    const dailyLimit = currentProfile.dailyCreditLimit ?? 0;
    const dailyUsed = currentProfile.dailyCreditsUsed ?? 0;
    const dailyRemaining = dailyLimit - dailyUsed;
    
    const finalUpdates: Partial<UserProfile> = {};
    if (isNewUTCDay) {
        finalUpdates.dailyCreditsUsed = 0;
        finalUpdates.lastCreditReset = today.toISOString();
    }

    if (bonusCredits >= amount) {
        finalUpdates.creditBalance = bonusCredits - amount;
    } else if (bonusCredits + dailyRemaining >= amount) {
        const neededFromDaily = amount - bonusCredits;
        finalUpdates.creditBalance = 0;
        finalUpdates.dailyCreditsUsed = dailyUsed + neededFromDaily;
    } else {
        toast({
            variant: "destructive",
            title: "Credits Exhausted",
            description: "You've used up your bonus and daily credits. Upgrade for more.",
            action: <ToastAction altText="Upgrade Now"><Link href="/dashboard/billing">Upgrade Plan</Link></ToastAction>,
        });
        if (isNewUTCDay) {
          await updateDoc(userDocRef, { dailyCreditsUsed: 0, lastCreditReset: today.toISOString() });
          setUserProfile(prev => prev ? {...prev, dailyCreditsUsed: 0, lastCreditReset: today.toISOString()} : null);
        }
        return false;
    }

    await updateDoc(userDocRef, finalUpdates);
    setUserProfile(prev => prev ? { ...prev, ...finalUpdates } : null);
    
    return true;
  }, [user, userProfile, isDevMode, toast]);

  const saveChatHistory = async (chat: ChatMessage[]) => {
    if (!user) return;
    const historyCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
    await addDoc(historyCollectionRef, {
        messages: chat,
        createdAt: serverTimestamp(),
    });
  };

  const getChatHistory = async (): Promise<ChatMessage[][]> => {
    if (!user) return [];
    const historyCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
    const q = query(historyCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().messages as ChatMessage[]);
  };
  
  const value = { user, userProfile, loading, isPlanActive, notifications, isDevMode, setDevMode, updateUserProfile, deductCredits, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, saveChatHistory, getChatHistory, addNotification, markNotificationAsRead, markAllNotificationsAsRead };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
