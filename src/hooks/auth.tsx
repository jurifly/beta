
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, ChatMessage, AppNotification, Transaction, UserRole } from '@/lib/types';
import { useToast } from './use-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword as signInWithEmail, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, orderBy, limit, writeBatch, serverTimestamp, increment, where } from 'firebase/firestore';
import { add, type Duration } from 'date-fns';

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
    const userCounterRef = doc(db, "metadata", "userCounter");

    let signupIndex = 1;
    let dailyCreditLimit = 10;
    
    try {
        signupIndex = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(userCounterRef);
            if (!counterDoc.exists()) {
                transaction.set(userCounterRef, { count: 1 });
                return 1;
            }
            const newCount = (counterDoc.data().count || 0) + 1;
            transaction.update(userCounterRef, { count: newCount });
            return newCount;
        });
    } catch(e) {
        console.error("Failed to get signup index, defaulting to 1.", e);
    }

    if (signupIndex <= 100) {
        dailyCreditLimit = 10;
    } else if (signupIndex <= 500) {
        dailyCreditLimit = 5;
    } else {
        dailyCreditLimit = 3;
    }

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
      signupIndex: signupIndex,
      dailyCreditLimit: dailyCreditLimit,
      dailyCreditsUsed: 0,
      lastCreditReset: new Date().toISOString(),
    };
    
    // Referral logic does not exist in this version.
    await setDoc(userDocRef, newProfile);
    
    return newProfile;
  }, []);

  const addNotification = useCallback(async (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!user) return;
    const notificationsRef = collection(db, `users/${user.uid}/notifications`);

    // Check for existing similar unread notification in Firestore to prevent duplicates
    const q = query(notificationsRef, where('title', '==', notificationData.title), where('read', '==', false));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return; // Don't add duplicate
    }

    const notification: Omit<AppNotification, 'id'> = {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const newDocRef = await addDoc(notificationsRef, notification);
    setNotifications(prev => [{ ...notification, id: newDocRef.id }, ...prev]);
  }, [user]);

  const checkAndResetCredits = useCallback(async (profile: UserProfile, uid: string) => {
    const today = new Date();
    const lastReset = profile.lastCreditReset ? new Date(profile.lastCreditReset) : new Date(0);
    
    const isNewUTCDay = today.getUTCFullYear() > lastReset.getUTCFullYear() ||
                      today.getUTCMonth() > lastReset.getUTCMonth() ||
                      today.getUTCDate() > lastReset.getUTCDate();

    if (isNewUTCDay) {
      const updatedProfileData = {
        dailyCreditsUsed: 0,
        lastCreditReset: today.toISOString()
      };
      await updateDoc(doc(db, 'users', uid), updatedProfileData);
      setUserProfile(prev => prev ? { ...prev, ...updatedProfileData } : null);
    }
  }, []);

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      if (!profile.legalRegion) {
        profile.legalRegion = 'India';
        updateDoc(userDocRef, { legalRegion: 'India' }).catch(e => console.error("Failed to backfill legalRegion", e));
      }
      setUserProfile(profile);
      await checkAndResetCredits(profile, firebaseUser.uid);
    } else {
      const newProfile = await createNewUserProfile(firebaseUser, 'India');
      setUserProfile(newProfile);
    }
  }, [createNewUserProfile, checkAndResetCredits]);

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
    if (!userProfile || !user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Could not verify your identity. Please log in again." });
      return false;
    }
    
    // Re-check for credit reset before deducting
    await checkAndResetCredits(userProfile, user.uid);
    
    // After reset, we need the latest profile state.
    // The checkAndResetCredits function updates the state, but we'll re-read it here for safety.
    const freshProfile = (await getDoc(doc(db, "users", user.uid))).data() as UserProfile;
    setUserProfile(freshProfile); // Sync local state immediately

    const limit = freshProfile.dailyCreditLimit ?? 0;
    const used = freshProfile.dailyCreditsUsed ?? 0;

    if (used + amount > limit) {
        toast({
            variant: "destructive",
            title: "Daily Limit Reached",
            description: "You've reached your daily AI limit. Please come back tomorrow or upgrade once subscriptions launch.",
        });
        return false;
    }

    await updateDoc(doc(db, "users", user.uid), {
        dailyCreditsUsed: increment(amount),
    });
    
    setUserProfile(prev => prev ? { ...prev, dailyCreditsUsed: (prev.dailyCreditsUsed ?? 0) + amount } : null);

    return true;
  }, [user, userProfile, toast, checkAndResetCredits]);

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
