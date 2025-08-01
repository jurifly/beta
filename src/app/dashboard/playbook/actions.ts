

'use server';

import { useActionState } from 'react';
import { generateChecklist as generateDiligenceChecklistFlow, type GenerateChecklistInput, type GenerateChecklistOutput } from '@/ai/flows/generate-checklist-flow';
import { findInvestors, type InvestorFinderInput, type InvestorFinderOutput } from '@/ai/flows/investor-finder-flow';
import { compareStates, type StateComparisonInput, type StateComparisonOutput } from '@/ai/flows/state-comparison-flow';

const initialDiligenceState: { data: GenerateChecklistOutput | null; error: string | null; } = { data: null, error: null };
export async function generateDiligenceChecklistAction(previousState: typeof initialDiligenceState, formData: FormData): Promise<typeof initialDiligenceState> {
  const dealType = formData.get('dealType') as string;
  const legalRegion = formData.get('legalRegion') as string;
  if (!dealType || !legalRegion) return { data: null, error: 'Deal type and legal region are required.' };
  try {
    const result = await generateDiligenceChecklistFlow({ dealType, legalRegion });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}

export async function findInvestorsAction(input: InvestorFinderInput): Promise<InvestorFinderOutput> {
    try {
        return await findInvestors(input);
    } catch (e: any) {
        console.error('AI Flow Error:', e);
        throw new Error(e.message || 'Could not find investor recommendations.');
    }
}

export async function compareStatesAction(input: StateComparisonInput): Promise<StateComparisonOutput> {
  try {
    const result = await compareStates(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI state comparison is currently unavailable: ${errorMessage}`);
  }
}

