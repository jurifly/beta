'use client';

// This is a simplified mock. In a real app, you'd get this from your auth provider.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserProfile {
  role: 'Founder' | 'CA' | 'Legal Advisor' | 'Enterprise';
  plan: 'Free' | 'Pro' | 'CA Pro' | 'Enterprise' | 'Enterprise Pro';
  companies: { id: string; name:string }[];
  activeCompanyId: string;
  name: string;
  email: string;
}
