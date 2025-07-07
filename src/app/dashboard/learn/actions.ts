
'use server';

import { getLearningTopic, type LearnInput, type LearnOutput } from '@/ai/flows/learn-flow';

export async function getLearningContentAction(input: LearnInput): Promise<LearnOutput> {
  try {
    const result = await getLearningTopic(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI learning module is currently unavailable: ${errorMessage}`);
  }
}
