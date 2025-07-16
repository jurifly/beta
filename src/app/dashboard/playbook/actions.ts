

'use server';

import { useActionState } from 'react';
import { generateChecklist as generateDiligenceChecklistFlow, type GenerateChecklistInput, type GenerateChecklistOutput } from '@/ai/flows/generate-checklist-flow';
import { recommendGrants, type GrantRecommenderInput, type GrantRecommenderOutput } from '@/ai/flows/grant-recommender-flow';
import { findInvestors, type InvestorFinderInput, type InvestorFinderOutput } from '@/ai/flows/investor-finder-flow';

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

export async function recommendGrantsAction(input: GrantRecommenderInput): Promise<GrantRecommenderOutput> {
    try {
        return await recommendGrants(input);
    } catch (e: any) {
        console.error('AI Flow Error:', e);
        throw new Error(e.message || 'Could not find grant recommendations.');
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
