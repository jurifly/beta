
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

  const transactionData: any = {
      ...data,
      status: 'pending_verification', // For manual check
      createdAt: new Date().toISOString(),
  };
  
  if (data.type === 'plan' && data.cycle) {
    transactionData.planStartDate = new Date().toISOString();
    const newExpiry = add(new Date(), { [data.cycle === 'yearly' ? 'years' : 'months']: data.cycle === 'yearly' ? 1 : 1 });
    transactionData.planEndDate = newExpiry.toISOString();
  }

  Object.keys(transactionData).forEach(key => {
    if (transactionData[key] === undefined) {
      delete transactionData[key];
    }
  });

  try {
    await addDoc(collection(db, 'transactions'), transactionData);
    return { success: true, message: 'Transaction submitted for verification. Your plan will be activated shortly.' };
  } catch (error: any) {
    console.error("Error saving transaction:", error);
    return { success: false, message: 'There was an error submitting your transaction. Please contact support.' };
  }
}
