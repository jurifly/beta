

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
  investmentAmount?: number;
  valuation?: number;
}

export interface ClientMatter {
  id:string;
  title: string;
  status: 'Active' | 'Closed' | 'On Hold';
  lastActivity: string;
}

export interface DocumentRequest {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Received' | 'Overdue';
  providedFile?: {
      id: string;
      name: string;
      url: string;
  };
}

export interface GovernanceActionItem {
    id: string;
    task: string;
    assignee: string;
    dueDate: string;
    completed: boolean;
}

export interface BoardMeeting {
    id: string;
    title: string;
    date: string;
    agenda: string;
    minutes?: string;
    actionItems: GovernanceActionItem[];
    meetingLink?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Member' | 'Viewer';
}

export interface Invite {
    id: string;
    caEmail: string;
    role: 'Admin' | 'Member' | 'Viewer' | 'Billing';
    founderId: string;
    founderName: string;
    companyId: string;
    companyName: string;
    status: 'pending' | 'accepted' | 'revoked' | 'processed';
    createdAt: string;
    caId?: string; // Add this
    caName?: string; // Add this
    acceptedAt?: string; // Add this
    type?: 'founder_to_ca' | 'ca_to_client';
    clientEmail?: string;
}

export interface ActivityLog {
    id: string;
    userName: string;
    action: string;
    timestamp: string;
}

export interface HistoricalFinancialData {
  year: string;
  revenue: number;
  expenses: number;
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
    boardMeetings?: BoardMeeting[];
    financials?: {
        cashBalance: number;
        monthlyRevenue: number;
        monthlyExpenses: number;
    };
    historicalFinancials?: HistoricalFinancialData[];
    diligenceChecklist?: GenerateDDChecklistOutput;
    founderUid?: string;
    checklistStatus?: Record<string, boolean>;
    health?: {
      score: number;
      risk: 'Low' | 'Medium' | 'High';
      deadlines: { title: string; dueDate: string }[];
    };
    connectedCaUid?: string;
}

export type UserRole = 'Founder' | 'CA' | 'Legal Advisor' | 'Enterprise';
export type UserPlan = 'Starter' | 'Founder' | 'Professional' | 'Enterprise';

export const planHierarchy: Record<UserPlan, number> = {
  'Starter': 0,
  'Founder': 1,
  'Professional': 2,
  'Enterprise': 3,
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
  
  // Team Management
  teamMembers?: TeamMember[];
  invites?: Invite[];
  activityLog?: ActivityLogItem[];

  // Beta AI Credit System
  signupIndex?: number;
  creditBalance?: number; // One-time bonus credits -> now monthly credits
  dailyCreditLimit?: number;
  dailyCreditsUsed?: number;
  lastCreditReset?: string; // ISO string
  accessPassesUsed?: { code: string; usedOn: string; rewardType: string; }[];


  // Founder-CA Connection
  invitedCaEmail?: string;
  connectedCaUid?: string;
  clientUids?: string[];
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
  timestamp?: string;
}

export interface Clause {
  id: string;
  title: string;
  category: string;
  content: string;
  description?: string;
  useCase?: string;
  relevantSection?: string;
  editableFields?: string[];
}

export type VaultItem = {
    id: string;
    type: 'folder' | 'file';
    name: string;
    lastModified: string;
    size?: number;
    parentId: string | null;
    iconLink?: string;
    webViewLink?: string;
    mimeType?: string;
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
  userEmail: string;
  type: 'plan' | 'credit_pack';
  name: string;
  amount: number;
  status: 'pending_verification' | 'verified' | 'failed';
  createdAt: string;
  upiTransactionId: string;
  plan?: string;
  cycle?: 'monthly' | 'yearly';
  credits?: number;
  planStartDate?: string;
  planEndDate?: string;
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
  icon: 'AlertTriangle' | 'RadioTower' | 'FileClock' | 'Default' | 'CheckCircle';
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

export interface ContractDetails {
    contractingParties: string[];
    effectiveDate: string;
    term: string;
    renewalNoticeDate?: string;
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
  contractDetails?: ContractDetails | null;
}

export interface Deadline {
  date: string;
  title: string;
  overdue: boolean;
}
