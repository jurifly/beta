
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import type { Transaction, UserProfile, UserPlan } from '@/lib/types';
import { add } from 'date-fns';

export async function initiateTransaction(data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'isProcessed'>): Promise<Transaction> {
  const transactionData: Omit<Transaction, 'id'> = {
    ...data,
    status: 'initiated',
    createdAt: new Date().toISOString(),
    isProcessed: false,
  };

  const docRef = await addDoc(collection(db, 'transactions'), transactionData);

  return { ...transactionData, id: docRef.id };
}

export async function verifyPayment(transactionId: string, upiId: string): Promise<{success: boolean, message: string}> {
  if (!transactionId || !upiId) {
    return { success: false, message: 'Transaction ID and UPI ID are required.' };
  }

  const transactionRef = doc(db, 'transactions', transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    return { success: false, message: 'Transaction not found.' };
  }

  const transaction = transactionSnap.data() as Transaction;
  
  if (transaction.status === 'verified') {
    return { success: true, message: 'This payment has already been verified.'};
  }
  
  // Simulate successful payment if UPI ID is a 12-digit number
  const isSuccess = /^\d{12}$/.test(upiId);

  if (isSuccess) {
    const userRef = doc(db, 'users', transaction.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await updateDoc(transactionRef, { status: 'failed', upiTransactionId: upiId });
        return { success: false, message: "User profile not found for this transaction."};
    }
    const userProfile = userSnap.data() as UserProfile;
    
    const updates: Partial<UserProfile> = {};

    if (transaction.type === 'plan' && transaction.plan) {
      updates.plan = transaction.plan as UserPlan;
      updates.planStartDate = new Date().toISOString();
      const newExpiry = add(new Date(), { [transaction.cycle === 'yearly' ? 'years' : 'months']: transaction.cycle === 'yearly' ? 1 : 1 });
      updates.planExpiryDate = newExpiry.toISOString();
      // Reset daily credits when a new plan is purchased
      updates.dailyCreditLimit = transaction.plan === 'Pro' ? 500 : transaction.plan === 'Founder' ? 100 : userProfile.dailyCreditLimit;
      updates.dailyCreditsUsed = 0;
    } else if (transaction.type === 'credits' && transaction.credits) {
      // For this app, credit packs will just add to the daily limit for simplicity, though a separate credit pool would be better
      updates.dailyCreditLimit = (userProfile.dailyCreditLimit || 0) + transaction.credits;
    }

    await updateDoc(userRef, updates);
    await updateDoc(transactionRef, { status: 'verified', upiTransactionId: upiId, isProcessed: true });

    return { success: true, message: 'Payment verified! Your purchase has been applied.' };
  } else {
    await updateDoc(transactionRef, { status: 'failed', upiTransactionId: upiId });
    return { success: false, message: 'Invalid UPI Transaction ID. Verification failed.' };
  }
}
