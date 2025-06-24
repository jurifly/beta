
'use client';

// This is a simplified mock. In a real app, you'd get this from your auth provider.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Company {
    id: string;
    name: string;
    type: string;
    cin?: string;
    pan: string;
    gstin?: string;
    incorporationDate: string;
    sector: string;
    location: string;
}

export type UserRole = 'Founder' | 'CA' | 'Legal Advisor' | 'Enterprise';
export type UserPlan = 'Free' | 'Pro' | 'CA Pro' | 'Enterprise' | 'Enterprise Pro';

export interface UserProfile {
  role: UserRole;
  plan: UserPlan;
  companies: Company[];
  activeCompanyId: string;
  name: string;
  email: string;
  phone?: string;
  credits?: number;
}

export type ChecklistItemStatus = 'Pending' | 'Completed' | 'In Progress' | 'Not Applicable';

export interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  status: ChecklistItemStatus;
}

export interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export interface GenerateDDChecklistOutput {
  reportTitle: string;
  checklist: ChecklistCategory[];
}
