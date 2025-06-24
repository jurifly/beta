'use server';

import { watchRegulations, type WatcherInput, type WatcherOutput } from '@/ai/flows/regulation-watcher-flow';

type FormState = {
  data: WatcherOutput | null;
  error: string | null;
};

export async function getRegulatoryUpdates(previousState: FormState, formData: FormData): Promise<FormState> {
  const portal = formData.get('portal') as string;
  const frequency = formData.get('frequency') as string;

  if (!portal || !frequency) {
    return { data: null, error: 'Portal and frequency are required.' };
  }

  const input: WatcherInput = { portal, frequency };

  try {
    const result = await watchRegulations(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI is currently unavailable: ${errorMessage}` };
  }
}
