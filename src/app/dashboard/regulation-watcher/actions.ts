'use server';

import { getRegulatoryUpdatesSummary, type RegulatorySummaryInput, type RegulatorySummaryOutput } from '@/ai/flows/regulation-watcher-flow';

type FormState = {
  data: RegulatorySummaryOutput | null;
  error: string | null;
};

export async function getRegulatoryUpdates(previousState: FormState, formData: FormData): Promise<FormState> {
  const portal = formData.get('portal') as string;
  const frequency = formData.get('frequency') as string;

  if (!portal || !frequency) {
    return { data: null, error: 'Portal and frequency are required.' };
  }

  const input: RegulatorySummaryInput = { portal, frequency };

  try {
    const result = await getRegulatoryUpdatesSummary(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI is currently unavailable: ${errorMessage}` };
  }
}
