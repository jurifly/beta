
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, Company, UserPlan } from '@/lib/types';
import { useToast } from './use-toast';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits?: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  updateUserProfile: async () => {},
  deductCredits: async () => false,
  addCredits: () => {},
});

const USER_PROFILE_STORAGE_KEY = 'userProfile_v2'; // v2 for new plan structure


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching user data. In a real app, this would be an API call.
    const timer = setTimeout(() => {
       let storedProfile: UserProfile | null = null;
      try {
        const storedProfileString = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (storedProfileString) {
          storedProfile = JSON.parse(storedProfileString);
        }
      } catch (error) {
        console.error("Failed to parse user profile from localStorage", error);
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      }
      
      const mockUser: User = {
        uid: 'mock-user-123',
        email: 'heckerrr@example.com',
        displayName: 'HECKERRR',
      };
      
      const defaultProfile: UserProfile = {
        role: 'Founder',
        plan: 'Starter',
        companies: [
          { id: '1', name: 'Example Private Limited Company', type: 'Private Limited Company', pan: 'ABCDE1234F', incorporationDate: '2022-01-01', sector: 'Tech', location: 'Bengaluru, Karnataka', cin: 'U72200KA2022PTC123456' },
          { id: '2', name: 'Another Company Inc.', type: 'Private Limited Company', pan: 'FGHIJ5678K', incorporationDate: '2021-05-15', sector: 'SaaS', location: 'Pune, Maharashtra', cin: 'U72900PN2021PTC654321' }
        ],
        activeCompanyId: '1',
        name: 'HECKERRR',
        email: 'heckerrr@example.com',
        phone: '1234567890',
        credits: 90, // Starter plan default
      };

      const finalProfile = storedProfile || defaultProfile;

      setUser(mockUser);
      setUserProfile(finalProfile);
      
      try {
        if (!storedProfile) {
            localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(finalProfile));
        }
      } catch (error) {
         console.error("Failed to save user profile to localStorage", error);
      }


      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updates };
      try {
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      } catch (error) {
         console.error("Failed to save updated user profile to localStorage", error);
      }
      return newProfile;
    });
  }, []);

  const deductCredits = useCallback(async (amount: number) => {
    if (!userProfile) return false;

    // Enterprise plan has unlimited credits
    if (userProfile.plan === 'Enterprise') return true;

    if ((userProfile.credits ?? 0) < amount) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: `You need ${amount} credit(s) for this action. Please upgrade your plan or buy more credits.`,
      });
      return false;
    }
    
    const newCredits = (userProfile.credits ?? 0) - amount;
    await updateUserProfile({ credits: newCredits });
    
    toast({
      title: "Credits Deducted",
      description: `You have ${newCredits} credits remaining.`,
    });
    
    return true;
  }, [userProfile, toast, updateUserProfile]);

  const addCredits = useCallback((amount: number) => {
    if(!userProfile) return;
    const newCredits = (userProfile.credits ?? 0) + amount;
    updateUserProfile({ credits: newCredits });
    toast({
        title: "Credits Added!",
        description: `You have successfully added ${amount} credits. Your new balance is ${newCredits}.`,
    });
  }, [userProfile, toast, updateUserProfile]);

  const value = { user, userProfile, loading, updateUserProfile, deductCredits, addCredits };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
