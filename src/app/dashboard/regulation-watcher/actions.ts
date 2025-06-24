'use server';

import { fetchRegulatoryUpdates, type RegulationWatcherInput, type RegulationWatcherOutput } from '@/ai/flows/regulation-watcher-flow';

type FormState = {
  data: RegulationWatcherOutput | null;
  error: string | null;
};

export async function fetchRegulationsAction(previousState: FormState, formData: FormData): Promise<FormState> {
  const regulator = formData.get('regulator') as string;
  const topic = formData.get('topic') as string;

  if (!regulator) {
    return { data: null, error: 'Regulator is required.' };
  }

  const input: RegulationWatcherInput = { regulator, topic: topic || '' };

  try {
    const result = await fetchRegulatoryUpdates(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI is currently unavailable: ${errorMessage}` };
  }
}
