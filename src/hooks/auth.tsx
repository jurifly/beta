
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, UserPlan, ChatMessage, AppNotification, Transaction, UserRole, Company, ActivityLogItem, Invite, HistoricalFinancialData } from '@/lib/types';
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
  updateCompanyChecklistStatus: (companyId: string, updates: { itemId: string; completed: boolean }[]) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, pass: string, name: string, legalRegion: string, role: UserRole, refId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetLink: (email: string) => Promise<void>;
  saveChatHistory: (chat: ChatMessage[]) => Promise<void>;
  getChatHistory: () => Promise<ChatMessage[][]>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>, targetUserId?: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addFeedback: (category: string, message: string, sentiment?: 'positive' | 'negative') => Promise<void>;
  sendCaInvite: (caEmail: string, companyId: string, companyName: string) => Promise<{ success: boolean; message: string }>;
  sendClientInvite: (clientEmail: string) => Promise<{ success: boolean; message: string }>;
  getPendingInvites: () => Promise<any[]>;
  acceptInvite: (inviteId: string) => Promise<void>;
  checkForAcceptedInvites: () => Promise<void>;
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

  const addNotification = useCallback(async (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>, targetUserId?: string) => {
    const uid = targetUserId || user?.uid;
    if (!uid) return;

    const notificationsRef = collection(db, `users/${uid}/notifications`);
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

    if (uid === user?.uid) {
        setNotifications(prev => [{ ...notification, id: newDocRef.id }, ...prev]);
    }
  }, [user]);

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      let profile = userDoc.data() as UserProfile;
      const updatesToApply: Partial<UserProfile> = {};
      
      if (!Array.isArray(profile.companies)) {
        profile.companies = [];
      } else {
        // Ensure historicalFinancials is an array for each company
        profile.companies.forEach(company => {
            if (!Array.isArray(company.historicalFinancials)) {
                company.historicalFinancials = [];
            }
        });
      }

      if (profile.dailyCreditLimit === undefined) updatesToApply.dailyCreditLimit = 5;
      if (profile.dailyCreditsUsed === undefined) updatesToApply.dailyCreditsUsed = 0;
      if (!profile.lastCreditReset) updatesToApply.lastCreditReset = new Date(0).toISOString();

      const today = new Date();
      const lastResetDate = new Date(updatesToApply.lastCreditReset || profile.lastCreditReset!);
      
      const lastResetDay = Date.UTC(lastResetDate.getUTCFullYear(), lastResetDate.getUTCMonth(), lastResetDate.getUTCDate());
      const todayDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

      if (todayDay > lastResetDay) {
        updatesToApply.dailyCreditsUsed = 0;
        updatesToApply.lastCreditReset = today.toISOString();
      }

      if (!profile.legalRegion) updatesToApply.legalRegion = 'India';

      if (Object.keys(updatesToApply).length > 0) {
        await updateDoc(userDocRef, updatesToApply).catch(e => console.error("Failed to backfill user profile fields:", e));
      }

      setUserProfile({ ...profile, ...updatesToApply});
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
    
    if (updates.companies && userProfile) {
        const oldCompanyIds = new Set((userProfile.companies || []).map(c => c.id));
        updates.companies.forEach(company => {
            if (!oldCompanyIds.has(company.id) && !company.health) {
                company.health = { score: 0, risk: 'Low', deadlines: [] };
            }
             if (!Array.isArray(company.historicalFinancials)) {
                company.historicalFinancials = [];
            }
        });
    }

    await updateDoc(userDocRef, updates);
    setUserProfile(prev => {
        if (!prev) return null;
        const newProfile = { ...prev, ...updates };
        return newProfile;
    });
  }, [user, userProfile]);
  
  const updateCompanyChecklistStatus = useCallback(async (
    companyId: string,
    updates: { itemId: string; completed: boolean }[]
  ) => {
    if (!user || !userProfile || updates.length === 0) return;
    
    const isCaUpdatingClient = userProfile.role === 'CA' || userProfile.role === 'Legal Advisor';
    const company = userProfile.companies.find(c => c.id === companyId);
    
    // 1. Determine the correct user document to update
    let targetUserId: string | undefined;
    if (isCaUpdatingClient) {
        // If CA is updating, the target is the founder of that company
        targetUserId = company?.founderUid;
        if (!targetUserId) {
            console.error("CA is updating a company without a founderUid. Updating CA's own profile as a fallback.");
            targetUserId = user.uid; // Fallback to self
        }
    } else {
        // Founder is updating their own company
        targetUserId = user.uid;
    }

    const userToUpdateRef = doc(db, "users", targetUserId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userToUpdateRef);
            if (!userDoc.exists()) {
                throw new Error("Target user profile does not exist.");
            }
        
            const remoteProfile = userDoc.data() as UserProfile;
            const companies = Array.isArray(remoteProfile.companies) ? remoteProfile.companies : [];
            const companyIndex = companies.findIndex(c => c.id === companyId);
        
            if (companyIndex === -1) {
                throw new Error(`Company with ID ${companyId} not found in profile of user ${targetUserId}.`);
            }
        
            // This is the correct, safe way to update a nested object in an array
            const newCompanies = [...companies];
            const oldChecklistStatus = newCompanies[companyIndex].checklistStatus || {};
            const newChecklistStatus = { ...oldChecklistStatus };
            updates.forEach(update => {
                const sanitizedKey = update.itemId.replace(/[.*~/[\]]/g, '_');
                newChecklistStatus[sanitizedKey] = update.completed;
            });
            newCompanies[companyIndex].checklistStatus = newChecklistStatus;

            transaction.update(userToUpdateRef, { companies: newCompanies });
        });

        // If the CA updated a client, we also need to update the local state of the CA's profile
        // to reflect the change in the nested company object.
        if (isCaUpdatingClient) {
            setUserProfile(prev => {
                if (!prev) return null;
                const newCompanies = prev.companies.map(c => {
                    if (c.id === companyId) {
                        const newChecklistStatus = { ...c.checklistStatus };
                        updates.forEach(update => {
                            const sanitizedKey = update.itemId.replace(/[.*~/[\]]/g, '_');
                            newChecklistStatus[sanitizedKey] = update.completed;
                        });
                        return { ...c, checklistStatus: newChecklistStatus };
                    }
                    return c;
                });
                return { ...prev, companies: newCompanies };
            });
        }
    
    } catch (e: any) {
        console.error("Checklist update transaction failed:", e);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save checklist changes. " + e.message,
        });
    }
  }, [user, userProfile, toast]);

  const signUpWithEmailAndPassword = async (email: string, pass: string, name: string, legalRegion: string, role: UserRole, refId?: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        const userData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
        };
        const newProfile = await createNewUserProfile(userData, legalRegion, role, refId);
        setUserProfile(newProfile);
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
                const newProfile = await createNewUserProfile(firebaseUser, 'India', 'Founder');
                setUserProfile(newProfile);
            }
        }
    } catch(error: any) {
        console.error("Google Sign-In Error:", error);
        
        let description = "Could not sign in with Google. Please try again.";
        if (error.code) {
            switch (error.code) {
                case 'auth/popup-closed-by-user': description = "The sign-in window was closed before completing. Please try again."; break;
                case 'auth/popup-blocked': description = "The sign-in pop-up was blocked by your browser. Please allow pop-ups for this site."; break;
                case 'auth/account-exists-with-different-credential': description = "An account already exists with this email address. Please sign in using the method you originally used."; break;
                case 'permission-denied': description = "There was a problem setting up your profile due to database permissions. Please contact support."; break;
                default: description = `An error occurred (${error.code}). Please try again or contact support.`;
            }
        }
        toast({ title: "Sign-In Failed", description, variant: "destructive" });
    }
  };

  const signOut = async () => { await firebaseSignOut(auth); };

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
          .then(() => { success = true; resolve(); })
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
    await addDoc(historyCollectionRef, { messages: chat, createdAt: serverTimestamp() });
  };

  const getChatHistory = async (): Promise<ChatMessage[][]> => {
    if (!user) return [];
    const historyCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
    const q = query(historyCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().messages as ChatMessage[]);
  };

  const addFeedback = async (category: string, message: string, sentiment?: 'positive' | 'negative') => {
    if (!user) throw new Error("User not logged in");
    await addDoc(collection(db, 'feedback'), {
      userId: user.uid,
      userEmail: userProfile?.email,
      category, message, sentiment,
      createdAt: new Date().toISOString(),
    });
  };
  
  const getPendingInvites = async () => {
    if (!user || !userProfile || (userProfile.role !== 'CA' && userProfile.role !== 'Legal Advisor')) return [];
    const invitesRef = collection(db, 'invites');
    const q = query(invitesRef, where('caEmail', '==', user.email), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  const sendClientInvite = async (clientEmail: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !userProfile || (userProfile.role !== 'CA' && userProfile.role !== 'Legal Advisor')) {
      return { success: false, message: 'Only CAs can invite clients.' };
    }
    try {
        const newInviteData = {
            type: 'ca_to_client', caId: user.uid, caName: userProfile.name,
            caEmail: userProfile.email, // Using CA's email for querying invites
            clientEmail, status: 'pending', createdAt: new Date().toISOString(),
        };
        const inviteDocRef = await addDoc(collection(db, "invites"), newInviteData);
        // Add invite to CA's own profile to update the UI
        await updateUserProfile({ invites: [...(userProfile.invites || []), { ...newInviteData, id: inviteDocRef.id }] });
        return { success: true, message: "Client invitation sent." };
    } catch (error) {
        console.error("Error sending client invite:", error);
        return { success: false, message: "An error occurred." };
    }
  };
  
  const sendCaInvite = async (caEmail: string, companyId: string, companyName: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !userProfile || userProfile.role !== 'Founder') return { success: false, message: 'Only founders can send invites.' };
    
    const existingInvite = (userProfile.invites || []).find(inv => inv.caEmail === caEmail && inv.companyId === companyId && inv.status === 'pending');
    if (existingInvite) return { success: false, message: "An invitation has already been sent to this advisor for this company." };

    const newInviteData: Omit<Invite, 'id'> = {
        caEmail, founderId: user.uid, founderName: userProfile.name,
        companyId, companyName, status: 'pending', createdAt: new Date().toISOString(),
    };

    try {
        const inviteDocRef = await addDoc(collection(db, 'invites'), newInviteData);
        await updateUserProfile({ invites: [...(userProfile.invites || []), { ...newInviteData, id: inviteDocRef.id }] });
        return { success: true, message: 'Invitation sent successfully!' };
    } catch (error) {
        console.error('Error sending invite:', error);
        return { success: false, message: 'An error occurred while sending the invitation.' };
    }
  };

  const acceptInvite = async (inviteId: string) => {
    if (!user || !userProfile || (userProfile.role !== 'CA' && userProfile.role !== 'Legal Advisor')) {
      throw new Error("Only advisors can accept invites.");
    }
    const inviteRef = doc(db, 'invites', inviteId);
    try {
      const inviteDoc = await getDoc(inviteRef);
      if (!inviteDoc.exists() || inviteDoc.data().status !== 'pending') {
        throw new Error("Invite not found or has already been processed.");
      }
      const inviteData = inviteDoc.data() as Invite;
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        caId: user.uid,
        caName: userProfile.name,
      });
      // The founder's side will now pick this up via `checkForAcceptedInvites`.
      // We just update the local state for the CA.
      // The `getPendingInvites` function will be called again on the invitations page to refresh the list.
      toast({ title: 'Invitation Accepted!', description: 'You can now manage the new client. It will appear on your dashboard shortly.' });
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      throw error;
    }
  };
  
  const checkForAcceptedInvites = useCallback(async () => {
    if (!user || !userProfile || userProfile.role !== 'Founder') return;
  
    const invitesRef = collection(db, 'invites');
    const q = query(invitesRef, where('founderId', '==', user.uid), where('status', '==', 'accepted'));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) return;
  
    const batch = writeBatch(db);
    let companiesUpdated = false;
  
    const updatedCompanies = [...userProfile.companies];
  
    querySnapshot.forEach(docSnap => {
      const inviteData = docSnap.data() as Invite & { caId: string };
      const companyIndex = updatedCompanies.findIndex(c => c.id === inviteData.companyId);
  
      if (companyIndex !== -1 && !updatedCompanies[companyIndex].connectedCaUid) {
        updatedCompanies[companyIndex].connectedCaUid = inviteData.caId;
        companiesUpdated = true;
        batch.update(docSnap.ref, { status: 'processed' });

        // Also add notification for the founder
        addNotification({
            title: 'Advisor Connected!',
            description: `${inviteData.caName} has accepted your invitation and can now manage ${inviteData.companyName}.`,
            icon: 'CheckCircle',
            link: '/dashboard/ca-connect',
        }, user.uid);
      }
    });
  
    if (companiesUpdated) {
      const userDocRef = doc(db, 'users', user.uid);
      batch.update(userDocRef, { companies: updatedCompanies });
      await batch.commit();
      setUserProfile(prev => ({ ...prev!, companies: updatedCompanies }));
      toast({
        title: 'Advisor Connected!',
        description: 'An advisor has accepted your invitation. You can now collaborate in the Connections Hub.',
      });
    }
  }, [user, userProfile, toast, addNotification]);

  const value = { user, userProfile, loading, isPlanActive, notifications, isDevMode, setDevMode, updateUserProfile, updateCompanyChecklistStatus, deductCredits, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, sendPasswordResetLink, saveChatHistory, getChatHistory, addNotification, markNotificationAsRead, markAllNotificationsAsRead, addFeedback, getPendingInvites, acceptInvite, sendCaInvite, sendClientInvite, checkForAcceptedInvites };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
