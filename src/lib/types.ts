
'use client';

import type { LucideIcon } from "lucide-react";
import type { AssistantOutput } from "@/ai/flows/assistant-flow";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface CapTableEntry {
  id: string;
  holder: string;
  type: 'Founder' | 'Investor' | 'ESOP';
  shares: number;
  grantDate: string;
  vesting: string;
}

export interface ClientMatter {
  id: string;
  title: string;
  status: 'Active' | 'Closed' | 'On Hold';
  lastActivity: string;
}

export interface DocumentRequest {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Received' | 'Overdue';
}

export interface Company {
    id: string;
    name: string;
    type: string;
    legalRegion: string;
    cin?: string;
    pan: string;
    gstin?: string;
    incorporationDate: string;
    sector: string;
    location: string;
    capTable?: CapTableEntry[];
    matters?: ClientMatter[];
    docRequests?: DocumentRequest[];
}

export type UserRole = 'Founder' | 'CA' | 'Legal Advisor' | 'Enterprise';
export type UserPlan = 'Starter' | 'Founder' | 'Pro' | 'Enterprise' | 'Free' | 'CA Pro' | 'Enterprise Pro';

export const planHierarchy: Record<UserPlan, number> = {
  'Starter': 0,
  'Founder': 1,
  'Pro': 2,
  'Enterprise': 3,
  'Free': 0, 
  'CA Pro': 2,
  'Enterprise Pro': 3,
};

export interface UserProfile {
  uid: string;
  role: UserRole;
  plan: UserPlan;
  planStartDate: string;
  planExpiryDate: string;
  companies: Company[];
  activeCompanyId: string;
  name: string;
  email: string;
  legalRegion: string;
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

export interface Clause {
  id: string;
  title: string;
  category: string;
  content: string;
}

export type VaultItem = {
    id: string;
    type: 'folder' | 'file';
    name: string;
    lastModified: string;
    size?: number;
    parentId: string | null;
    downloadURL?: string;
    contentType?: string;
};

export type Workflow = {
  id: string;
  trigger: string;
  action: string;
  notification: string;
};

export type ActivityLogItem = {
    id: string;
    timestamp: Date;
    icon: React.ElementType;
    title: string;
    description: string;
};

export interface Transaction {
  id?: string;
  userId: string;
  type: 'plan' | 'credits';
  name: string;
  amount: number;
  status: 'initiated' | 'pending_verification' | 'verified' | 'failed';
  createdAt: string;
  upiTransactionId?: string;
  plan?: string;
  cycle?: 'monthly' | 'yearly';
  credits?: number;
  isProcessed: boolean;
}

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | AssistantOutput;
};

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  icon: 'AlertTriangle' | 'RadioTower' | 'FileClock' | 'Default';
  link?: string;
}

export type DocumentType =
  | 'Legal Contract'
  | 'Government Notice'
  | 'Termination/Warning Letter'
  | 'Compliance Filing'
  | 'Other';

export interface RiskFlag {
  clause: string;
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface ReminderSuggestion {
  title: string;
  date: string; // YYYY-MM-DD format
}

export interface ReplySuggestion {
  title: string;
  content: string; // Markdown formatted
}

export interface DocumentAnalysis {
  id: string; // will be a timestamp
  fileName: string;
  uploadedAt: string;
  documentType: DocumentType;
  summary: string;
  riskFlags: RiskFlag[];
  replySuggestion: ReplySuggestion | null;
  reminder: ReminderSuggestion | null;
  redlineContent?: string;
}
