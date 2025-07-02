
'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, increment } from "firebase/firestore";
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
    
    if (transaction.type === 'plan' && transaction.plan) {
      const updates: Partial<UserProfile> = {};
      updates.plan = transaction.plan as UserPlan;
      updates.planStartDate = new Date().toISOString();
      const newExpiry = add(new Date(), { [transaction.cycle === 'yearly' ? 'years' : 'months']: transaction.cycle === 'yearly' ? 1 : 1 });
      updates.planExpiryDate = newExpiry.toISOString();
      
      // Reset daily credits and set new limit based on plan
      let newCreditLimit = userProfile.dailyCreditLimit || 10;
      if (transaction.plan === 'Founder') newCreditLimit = 20; // ~600/month
      if (transaction.plan === 'Pro') newCreditLimit = 50; // ~1500/month
      
      updates.dailyCreditLimit = newCreditLimit;
      updates.dailyCreditsUsed = 0;
      await updateDoc(userRef, updates);
    } else if (transaction.type === 'credit_pack' && transaction.credits) {
        await updateDoc(userRef, {
            creditBalance: increment(transaction.credits)
        });
    }

    await updateDoc(transactionRef, { status: 'verified', upiTransactionId: upiId, isProcessed: true });

    return { success: true, message: 'Payment verified! Your purchase has been applied.' };
  } else {
    await updateDoc(transactionRef, { status: 'failed', upiTransactionId: upiId });
    return { success: false, message: 'Invalid UPI Transaction ID. Verification failed.' };
  }
}
