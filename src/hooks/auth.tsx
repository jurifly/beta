
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, ChatMessage, AppNotification, Transaction, UserRole, Company, ActivityLogItem, Invite } from '@/lib/types';
import { useToast } from './use-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword as signInWithEmail, updateProfile as updateFirebaseProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, orderBy, limit, writeBatch, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
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
  updateCompanyChecklistStatus: (companyId: string, newStatus: Record<string, boolean>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, pass: string, name: string, legalRegion: string, role: UserRole, refId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetLink: (email: string) => Promise<void>;
  saveChatHistory: (chat: ChatMessage[]) => Promise<void>;
  getChatHistory: () => Promise<ChatMessage[][]>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addFeedback: (category: string, message: string, sentiment?: 'positive' | 'negative') => Promise<void>;
  sendCaInvite: (caEmail: string, companyId: string, companyName: string) => Promise<{ success: boolean; message: string }>;
  sendClientInvite: (clientEmail: string) => Promise<{ success: boolean; message: string }>;
  getPendingInvites: () => Promise<any[]>;
  acceptInvite: (inviteId: string) => Promise<void>;
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


  const createNewUserProfile = useCallback(async (firebaseUser: User, legalRegion: string, role: UserRole, refId?: string): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newExpiry = add(new Date(), { days: 30 });
    
    // Logic to determine signupIndex
    const counterRef = doc(db, 'counters', 'userCounter');
    const newIndex = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
            transaction.set(counterRef, { count: 1 });
            return 1;
        }
        const newCount = (counterDoc.data().count || 0) + 1;
        transaction.update(counterRef, { count: newCount });
        return newCount;
    });

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'New User',
      role: role || 'Founder',
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
      signupIndex: newIndex,
      teamMembers: [{ id: firebaseUser.uid, name: firebaseUser.displayName || 'Me', email: firebaseUser.email || '', role: 'Admin' }],
      invites: [],
      activityLog: [{ id: Date.now().toString(), userName: 'System', action: 'Created workspace', timestamp: new Date().toISOString() }],
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
      const updatesToApply: Partial<UserProfile> = {};

      // --- Backfill missing credit fields for older user profiles ---
      if (profile.dailyCreditLimit === undefined) {
        updatesToApply.dailyCreditLimit = 5; // Default daily credits
        profile.dailyCreditLimit = 5;
      }
      if (profile.dailyCreditsUsed === undefined) {
        updatesToApply.dailyCreditsUsed = 0;
        profile.dailyCreditsUsed = 0;
      }
      if (!profile.lastCreditReset) {
        // Set to epoch to force a reset on the next check
        const epoch = new Date(0).toISOString();
        updatesToApply.lastCreditReset = epoch;
        profile.lastCreditReset = epoch;
      }

      // --- Credit Reset Logic on Load ---
      const today = new Date();
      const lastResetDate = new Date(profile.lastCreditReset!);
      
      const lastResetDay = Date.UTC(lastResetDate.getUTCFullYear(), lastResetDate.getUTCMonth(), lastResetDate.getUTCDate());
      const todayDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

      if (todayDay > lastResetDay) {
        updatesToApply.dailyCreditsUsed = 0;
        updatesToApply.lastCreditReset = today.toISOString();
        profile.dailyCreditsUsed = 0;
        profile.lastCreditReset = today.toISOString();
      }
      // --- End of Reset Logic ---


      if (!profile.legalRegion) {
        updatesToApply.legalRegion = 'India';
        profile.legalRegion = 'India';
      }

      // If there are any updates, write them to Firestore
      if (Object.keys(updatesToApply).length > 0) {
        updateDoc(userDocRef, updatesToApply).catch(e => console.error("Failed to update user profile with new fields:", e));
      }

      setUserProfile(profile);
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
    if (userProfile && userProfile.planExpiryDate) {
      setIsPlanActive(new Date(userProfile.planExpiryDate) > new Date());
    } else {
      setIsPlanActive(false);
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
  
  const updateCompanyChecklistStatus = useCallback(async (companyId: string, newStatus: Record<string, boolean>) => {
    if (!user || !userProfile) return;
    
    // Determine the correct user document to update (either the founder's or the CA's)
    const company = userProfile.companies.find(c => c.id === companyId);
    if (!company) return; // Should not happen

    const targetUserId = userProfile.role === 'CA' ? company.founderUid : user.uid;
    if (!targetUserId) {
        console.error("Could not find owner of the company to update checklist.");
        return;
    }

    const userToUpdateRef = doc(db, "users", targetUserId);
    
    // Fetch the latest profile to avoid overwriting other changes
    const userToUpdateDoc = await getDoc(userToUpdateRef);
    if (!userToUpdateDoc.exists()) return;

    const profileToUpdate = userToUpdateDoc.data() as UserProfile;
    
    const updatedCompanies = profileToUpdate.companies.map(c => {
        if (c.id === companyId) {
            // Sanitize keys before saving to prevent Firestore errors
            const sanitizedStatus: Record<string, boolean> = {};
            for (const key in newStatus) {
                const sanitizedKey = key.replace(/[.*~/[\]]/g, '_');
                sanitizedStatus[sanitizedKey] = newStatus[key];
            }
            return { ...c, checklistStatus: sanitizedStatus };
        }
        return c;
    });

    await updateDoc(userToUpdateRef, { companies: updatedCompanies });

    // If the current user is the one being updated, refresh their local profile state
    if(targetUserId === user.uid) {
        setUserProfile(prev => prev ? { ...prev, companies: updatedCompanies } : null);
    }
  }, [user, userProfile]);

  const signUpWithEmailAndPassword = async (email: string, pass: string, name: string, legalRegion: string, role: UserRole, refId?: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        const userData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
        };
        await createNewUserProfile(userData, legalRegion, role, refId);
      }
  };

  const signInWithEmailAndPassword = async (email: string, pass: string) => {
      await signInWithEmail(auth, email, pass);
  };

  const sendPasswordResetLink = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        if (firebaseUser) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                // If user doesn't exist in Firestore, it's a first-time Google sign-in
                await createNewUserProfile(firebaseUser, 'India', 'Founder');
            }
        }
    } catch(error: any) {
        console.error("Google Sign-In Error:", error);
        
        let description = "Could not sign in with Google. Please try again.";
        if (error.code) {
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    description = "The sign-in window was closed before completing. Please try again.";
                    break;
                case 'auth/popup-blocked':
                    description = "The sign-in pop-up was blocked by your browser. Please allow pop-ups for this site.";
                    break;
                case 'auth/account-exists-with-different-credential':
                    description = "An account already exists with this email address. Please sign in using the method you originally used.";
                    break;
                case 'permission-denied':
                    description = "There was a problem setting up your profile due to database permissions. Please contact support.";
                    break;
                default:
                    description = `An error occurred (${error.code}). Please try again or contact support.`;
            }
        }

        toast({
            title: "Sign-In Failed",
            description: description,
            variant: "destructive"
        });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

 const deductCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (isDevMode) return true;
    
    let success = false;
    await new Promise<void>(resolve => {
      setUserProfile(currentProfile => {
        if (!user || !currentProfile) {
          setTimeout(() => toast({ variant: "destructive", title: "Authentication Error", description: "Cannot deduct credits. Please log in again." }), 0);
          success = false;
          resolve();
          return currentProfile;
        }

        const bonusCredits = currentProfile.creditBalance ?? 0;
        const dailyUsed = currentProfile.dailyCreditsUsed ?? 0;
        const dailyLimit = currentProfile.dailyCreditLimit ?? 0;
        const dailyRemaining = dailyLimit - dailyUsed;
        const totalAvailable = bonusCredits + dailyRemaining;

        if (totalAvailable < amount) {
          setTimeout(() => toast({ variant: "destructive", title: "Credits Exhausted", description: "You've used up your bonus and daily credits. Upgrade for more.", action: <ToastAction altText="Upgrade Now"><Link href="/dashboard/settings?tab=subscription">Upgrade Plan</Link></ToastAction> }), 0);
          success = false;
          resolve();
          return currentProfile;
        }

        let newBonusCredits = bonusCredits;
        let newDailyUsed = dailyUsed;
        let amountToDeduct = amount;

        const fromBonus = Math.min(amountToDeduct, newBonusCredits);
        newBonusCredits -= fromBonus;
        amountToDeduct -= fromBonus;

        const fromDaily = Math.min(amountToDeduct, dailyRemaining);
        newDailyUsed += fromDaily;

        const finalUpdates: Partial<UserProfile> = {
          creditBalance: newBonusCredits,
          dailyCreditsUsed: newDailyUsed,
        };

        const newProfile = { ...currentProfile, ...finalUpdates };

        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, finalUpdates)
          .then(() => {
            success = true;
            resolve();
          })
          .catch(e => {
            console.error("Failed to update credits in Firestore:", e);
            setTimeout(() => toast({ variant: "destructive", title: "Network Error", description: "Could not save credit usage. Please try again." }), 0);
            success = false;
            resolve();
          });
          
        return newProfile;
      });
    });
    return success;
  }, [user, isDevMode, toast]);


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

  const addFeedback = async (category: string, message: string, sentiment?: 'positive' | 'negative') => {
    if (!user) {
      throw new Error("User not logged in");
    }
    const feedbackRef = collection(db, 'feedback');
    await addDoc(feedbackRef, {
      userId: user.uid,
      userEmail: userProfile?.email,
      category,
      message,
      sentiment,
      createdAt: new Date().toISOString(),
    });
  };
  
  const getPendingInvites = async () => {
    if (!user || userProfile?.role !== 'CA') return [];
    const invitesRef = collection(db, 'invites');
    const q = query(invitesRef, where('caEmail', '==', user.email), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  const sendClientInvite = async (clientEmail: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !userProfile || userProfile.role !== 'CA') {
      return { success: false, message: 'Only CAs can invite clients.' };
    }
    try {
        await addDoc(collection(db, "invites"), {
            type: 'ca_to_client',
            caId: user.uid,
            caName: userProfile.name,
            clientEmail: clientEmail,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        return { success: true, message: "Client invitation sent." };
    } catch (error) {
        console.error("Error sending client invite:", error);
        return { success: false, message: "An error occurred." };
    }
  };
  
  const sendCaInvite = async (caEmail: string, companyId: string, companyName: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !userProfile || userProfile.role !== 'Founder') {
      return { success: false, message: 'Only founders can send invites.' };
    }
    const invitesRef = collection(db, 'invites');
    const newInvite: Omit<Invite, 'id'> = {
        caEmail,
        founderId: user.uid,
        founderName: userProfile.name,
        companyId,
        companyName,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    try {
        const inviteDocRef = await addDoc(invitesRef, newInvite);
        const userUpdates: Partial<UserProfile> = {
            invites: [...(userProfile.invites || []), { ...newInvite, id: inviteDocRef.id }],
            invitedCaEmail: caEmail, // also keep the legacy field for now
        };
        await updateUserProfile(userUpdates);
        return { success: true, message: 'Invitation sent successfully!' };
    } catch (error) {
        console.error('Error sending invite:', error);
        return { success: false, message: 'An error occurred while sending the invitation.' };
    }
  };

  const acceptInvite = async (inviteId: string) => {
    if (!user || userProfile?.role !== 'CA') throw new Error("Only CAs can accept invites.");
    
    const inviteRef = doc(db, 'invites', inviteId);
    await runTransaction(db, async (transaction) => {
        const inviteDoc = await transaction.get(inviteRef);
        if (!inviteDoc.exists() || inviteDoc.data().status !== 'pending') throw new Error("Invite not found or already accepted.");

        const { founderId, companyId, companyName } = inviteDoc.data();
        const founderRef = doc(db, 'users', founderId);
        const caRef = doc(db, 'users', user.uid);

        const founderDoc = await transaction.get(founderRef);
        if (!founderDoc.exists()) throw new Error("Founder account not found.");

        const founderProfile = founderDoc.data() as UserProfile;
        const companyToAccept = founderProfile.companies.find(c => c.id === companyId);
        if (!companyToAccept) throw new Error("Company not found in founder's profile.");
        
        const companyForCa: Company = { ...companyToAccept, founderUid: founderId };

        // Update founder's profile
        const founderInvites = (founderProfile.invites || []).filter(inv => inv.caEmail !== user.email);
        transaction.update(founderRef, { connectedCaUid: user.uid, invitedCaEmail: null, invites: founderInvites });

        // Update CA's profile
        transaction.update(caRef, { companies: [...userProfile.companies, companyForCa] });
        
        // Update invite status to 'accepted' instead of deleting
        transaction.update(inviteRef, { status: 'accepted' });
    });

    await fetchUserProfile(user); // Refresh CA's profile
    await addNotification({
        title: 'Client Connected!',
        description: `You are now connected with ${companyName}. You can manage their profile from your dashboard.`,
        icon: 'CheckCircle',
        link: `/dashboard/clients/${companyId}`
    });
  };

  const value = { user, userProfile, loading, isPlanActive, notifications, isDevMode, setDevMode, updateUserProfile, updateCompanyChecklistStatus, deductCredits, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, sendPasswordResetLink, saveChatHistory, getChatHistory, addNotification, markNotificationAsRead, markAllNotificationsAsRead, addFeedback, getPendingInvites, acceptInvite, sendCaInvite, sendClientInvite };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
