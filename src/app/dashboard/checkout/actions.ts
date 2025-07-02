
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
  // 1. Validate required fields
  if (!data.userId || !data.userEmail || !data.upiTransactionId || !data.type || !data.name || typeof data.amount !== 'number') {
      console.error("Missing required transaction data", data);
      return { success: false, message: 'Internal error: Missing required transaction data.' };
  }

  // 2. Build a clean, new object from scratch.
  const transactionRecord: { [key: string]: any } = {
      userId: data.userId,
      userEmail: data.userEmail,
      upiTransactionId: data.upiTransactionId,
      type: data.type,
      name: data.name,
      amount: data.amount,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
  };

  // 3. Conditionally add properties based on the transaction type.
  if (data.type === 'plan') {
    if (!data.plan || !data.cycle) {
        console.error("Missing plan or cycle for subscription", data);
        return { success: false, message: 'Internal error: Missing plan or cycle for subscription.' };
    }
    transactionRecord.plan = data.plan;
    transactionRecord.cycle = data.cycle;
    transactionRecord.planStartDate = new Date().toISOString();
    const duration = data.cycle === 'yearly' ? { years: 1 } : { months: 1 };
    const newExpiry = add(new Date(), duration);
    transactionRecord.planEndDate = newExpiry.toISOString();
  } else if (data.type === 'credit_pack') {
    if (typeof data.credits !== 'number') {
        console.error("Missing credit amount for credit pack", data);
        return { success: false, message: 'Internal error: Missing credit amount for credit pack.' };
    }
    transactionRecord.credits = data.credits;
  }

  // 4. Attempt to save to Firestore
  try {
    await addDoc(collection(db, 'transactions'), transactionRecord);
    return { success: true, message: 'Transaction submitted for verification. Your plan will be activated shortly.' };
  } catch (error: any) {
    console.error("Error saving transaction to Firestore:", error);
    // Be more explicit about the potential cause in the error log
    console.error("Data sent to Firestore:", transactionRecord);
    return { success: false, message: 'There was an error submitting your transaction. Please contact support.' };
  }
}
