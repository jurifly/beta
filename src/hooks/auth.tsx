'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserProfile } from '@/lib/types';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
          { id: '1', name: 'Example Private Limited Company' },
          { id: '2', name: 'Another Company Inc.' }
        ],
        activeCompanyId: '1',
        name: 'HECKERRR',
        email: 'heckerrr@example.com'
      };

      setUser(mockUser);
      setUserProfile(mockUserProfile);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
