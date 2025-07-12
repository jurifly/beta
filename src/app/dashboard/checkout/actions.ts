
'use server';

import { db } from '@/lib/firebase/config';
import { addDoc, collection } from "firebase/firestore";
import { add } from 'date-fns';
import type { Transaction } from '@/lib/types';

// This interface defines what the client will send.
// It contains all possible fields.
interface TransactionInput {
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

export async function saveUpiTransaction(data: TransactionInput): Promise<{success: boolean, message: string}> {
  // 1. Validate the incoming data immediately.
  if (!data.userId || !data.userEmail || !data.upiTransactionId || !data.type || !data.name || typeof data.amount !== 'number') {
      console.error("Validation Error: Missing required transaction data from client.", data);
      return { success: false, message: 'Internal error: Incomplete transaction data received.' };
  }

  // 2. Build the base record with properties common to all transactions.
  //    Crucially, use a new object, don't modify the input `data`.
  const baseRecord: Omit<Transaction, 'id'> = {
      userId: data.userId,
      userEmail: data.userEmail,
      upiTransactionId: data.upiTransactionId,
      type: data.type,
      name: data.name,
      amount: data.amount,
      status: 'pending_verification', // For manual admin approval
      createdAt: new Date().toISOString(),
  };

  let finalRecord: Omit<Transaction, 'id'>;

  // 3. Create the final record based on the transaction type.
  //    This ensures no 'undefined' fields from other types are included.
  if (data.type === 'plan') {
      if (!data.plan || !data.cycle) {
        console.error("Validation Error: Missing plan details for subscription.", data);
        return { success: false, message: 'Internal error: Missing plan or cycle for subscription.' };
      }
      finalRecord = {
          ...baseRecord,
          plan: data.plan,
          cycle: data.cycle,
          planStartDate: new Date().toISOString(),
          planEndDate: add(new Date(), { [data.cycle === 'yearly' ? 'years' : 'months']: 1 }).toISOString(),
      };
  } else if (data.type === 'credit_pack') {
      if (typeof data.credits !== 'number') {
        console.error("Validation Error: Missing credit amount for credit pack.", data);
        return { success: false, message: 'Internal error: Missing credit amount for credit pack.' };
      }
      finalRecord = {
          ...baseRecord,
          credits: data.credits,
      };
  } else {
      console.error("Validation Error: Unknown transaction type.", data);
      return { success: false, message: 'Internal error: Unknown transaction type.' };
  }


  // 4. Attempt to save the cleanly constructed `finalRecord` to Firestore.
  try {
    await addDoc(collection(db, 'transactions'), finalRecord);
    return { success: true, message: 'Transaction submitted for verification. Your plan will be activated shortly.' };
  } catch (error: any) {
    console.error("Firestore Error:", error);
    console.error("Data that failed to save:", finalRecord);
    return { success: false, message: 'There was an error submitting your transaction. Please contact support.' };
  }
}
