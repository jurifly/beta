
'use server';

import { db } from '@/lib/firebase/config';
import { addDoc, collection } from "firebase/firestore";
import { add } from 'date-fns';

interface TransactionData {
  userId: string;
  userEmail: string;
  upiTransactionId: string;
  type: 'plan' | 'credit_pack';
  name: string;
  amount: number;
  plan?: string;
  cycle?: 'monthly' | 'yearly';
  credits?: number;
}

export async function saveUpiTransaction(data: TransactionData): Promise<{success: boolean, message: string}> {
  if (!data.upiTransactionId) {
    return { success: false, message: 'UPI Transaction ID is required.' };
  }

  // Build the core object with guaranteed properties
  const transactionRecord: any = {
      userId: data.userId,
      userEmail: data.userEmail,
      upiTransactionId: data.upiTransactionId,
      type: data.type,
      name: data.name,
      amount: data.amount,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
  };
  
  // Conditionally add properties based on type
  if (data.type === 'plan' && data.plan && data.cycle) {
    transactionRecord.plan = data.plan;
    transactionRecord.cycle = data.cycle;
    transactionRecord.planStartDate = new Date().toISOString();
    const newExpiry = add(new Date(), { [data.cycle === 'yearly' ? 'years' : 'months']: data.cycle === 'yearly' ? 1 : 1 });
    transactionRecord.planEndDate = newExpiry.toISOString();
  } else if (data.type === 'credit_pack' && data.credits) {
    transactionRecord.credits = data.credits;
  }

  try {
    // The transactionRecord object is now clean, with no undefined properties.
    await addDoc(collection(db, 'transactions'), transactionRecord);
    return { success: true, message: 'Transaction submitted for verification. Your plan will be activated shortly.' };
  } catch (error: any) {
    console.error("Error saving transaction:", error);
    return { success: false, message: 'There was an error submitting your transaction. Please contact support.' };
  }
}
