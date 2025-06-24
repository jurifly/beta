
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserProfile, Company } from '@/lib/types';
import { useToast } from './use-toast';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  updateUserProfile: async () => {},
  deductCredits: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching user data. In a real app, this would be an API call.
    const timer = setTimeout(() => {
      const mockUser: User = {
        uid: 'mock-user-123',
        email: 'heckerrr@example.com',
        displayName: 'HECKERRR',
      };
      
      const mockUserProfile: UserProfile = {
        role: 'Founder',
        plan: 'Enterprise',
        companies: [
          { id: '1', name: 'Example Private Limited Company', type: 'Private Limited Company', pan: 'ABCDE1234F', incorporationDate: '2022-01-01', sector: 'Tech', location: 'Bengaluru, Karnataka', cin: 'U72200KA2022PTC123456' },
          { id: '2', name: 'Another Company Inc.', type: 'Private Limited Company', pan: 'FGHIJ5678K', incorporationDate: '2021-05-15', sector: 'SaaS', location: 'Pune, Maharashtra', cin: 'U72900PN2021PTC654321' }
        ],
        activeCompanyId: '1',
        name: 'HECKERRR',
        email: 'heckerrr@example.com',
        credits: 10,
      };

      setUser(mockUser);
      setUserProfile(mockUserProfile);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
    // In a real app, you would save this to your backend.
  }, []);

  const deductCredits = useCallback(async (amount: number) => {
    if (!userProfile || (userProfile.credits ?? 0) < amount) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: `You need ${amount} credit(s) for this action. Please upgrade your plan.`,
      });
      return false;
    }
    
    const newCredits = (userProfile.credits ?? 0) - amount;
    setUserProfile(prev => {
      if (!prev) return null;
      return { ...prev, credits: newCredits };
    });
    
    toast({
      title: "Credits Deducted",
      description: `You have ${newCredits} credits remaining.`,
    });
    
    return true;
  }, [userProfile, toast]);

  const value = { user, userProfile, loading, updateUserProfile, deductCredits };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
