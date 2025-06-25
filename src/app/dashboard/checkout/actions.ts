
'use server';

import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

type FormState = {
  success: boolean;
  message: string;
};

export async function saveTransactionId(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const transactionId = formData.get('transactionId') as string;
  const transactionDocId = formData.get('transactionDocId') as string;

  if (!transactionId || !transactionDocId) {
    return { success: false, message: 'Missing transaction details.' };
  }

  try {
    const transactionRef = doc(db, 'transactions', transactionDocId);
    await updateDoc(transactionRef, {
      upiTransactionId: transactionId,
      status: 'pending_verification',
    });

    return {
      success: true,
      message: 'Your transaction ID has been submitted for verification.',
    };
  } catch (error: any) {
    console.error('Error saving transaction ID:', error);
    if (error.code === 'permission-denied') {
        return { success: false, message: 'You must be logged in to perform this action.' };
    }
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
