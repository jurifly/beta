'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, VaultItem, ChatMessage, AppNotification } from '@/lib/types';
import { useToast } from './use-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, orderBy, limit, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { add } from 'date-fns';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isPlanActive: boolean;
  notifications: AppNotification[];
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, pass: string, name: string, refId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveVaultItems: (items: VaultItem[]) => Promise<void>;
  getVaultItems: () => Promise<VaultItem[]>;
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

  const createNewUserProfile = async (firebaseUser: User, refId?: string) => {
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
    
    // Handle referral
    if (refId) {
        const referrerDocRef = doc(db, "users", refId);
        try {
            await runTransaction(db, async (transaction) => {
                const referrerDoc = await transaction.get(referrerDocRef);
                if (referrerDoc.exists()) {
                    transaction.update(referrerDocRef, { credits: increment(50) });
                    newProfile.credits = (newProfile.credits || 0) + 25; // Bonus for referred user
                }
                transaction.set(userDocRef, newProfile);
            });
            toast({ title: "Referral Applied!", description: "You and your friend have received bonus credits!"});
        } catch (e) {
            console.error("Referral transaction failed: ", e);
            await setDoc(userDocRef, newProfile); // Create profile even if referral fails
        }
    } else {
        await setDoc(userDocRef, newProfile);
    }
    
    setUserProfile(newProfile);
  }

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      setUserProfile(profile);
    } else {
      await createNewUserProfile(firebaseUser);
    }
  }, []);

  const fetchNotifications = useCallback(async (uid: string) => {
    if (!uid) return;
    const notificationsCollectionRef = collection(db, `users/${uid}/notifications`);
    const q = query(notificationsCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    const fetchedNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    setNotifications(fetchedNotifications);
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
    if (userProfile?.planExpiryDate) {
        const expiryDate = new Date(userProfile.planExpiryDate);
        const isActive = expiryDate > new Date();
        setIsPlanActive(isActive);
        if (!isActive && userProfile.plan !== 'Starter' && userProfile.plan !== 'Free') {
             addNotification({
                title: "Subscription Expired",
                description: "Your plan has expired. Some features may be locked.",
                icon: "AlertTriangle",
             })
        }
    } else {
        setIsPlanActive(true);
    }
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
  
  const signUpWithEmailAndPassword = async (email: string, pass: string, name: string, refId?: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        const userData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
        };
        await createNewUserProfile(userData, refId);
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
      const newCredits = (userProfile.credits ?? 0) - amount;
      await updateDoc(userDocRef, { credits: newCredits });
      setUserProfile(prev => prev ? {...prev, credits: newCredits} : null);
      toast({ title: "Credits Deducted", description: `You have ${newCredits} credits remaining.` });
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

  const addNotification = useCallback(async (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!user) return;
    const notification: Omit<AppNotification, 'id'> = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false,
    };
    const notificationsRef = collection(db, `users/${user.uid}/notifications`);
    await addDoc(notificationsRef, notification);
    setNotifications(prev => [{...notification, id: 'new'}, ...prev]);
  }, [user]);

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

  const value = { user, userProfile, loading, isPlanActive, notifications, updateUserProfile, deductCredits, addCredits, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, saveVaultItems, getVaultItems, saveChatHistory, getChatHistory, addNotification, markNotificationAsRead, markAllNotificationsAsRead };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
