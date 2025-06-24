
'use server';

import { recommendBusinessStructure, type BusinessRecommenderInput, type BusinessRecommenderOutput } from '@/ai/flows/business-recommender-flow';
import { generateChecklist, type AssistantInput, type AssistantOutput } from '@/ai/flows/assistant-flow';

export async function getBusinessRecommendationAction(input: BusinessRecommenderInput): Promise<BusinessRecommenderOutput> {
  try {
    const result = await recommendBusinessStructure(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI recommendation is currently unavailable: ${errorMessage}`);
  }
}

export async function getFinalChecklistAction(input: AssistantInput): Promise<AssistantOutput> {
    try {
        const result = await generateChecklist(input);
        return result;
    } catch (e: any) {
        console.error('AI Flow Error:', e);
        const errorMessage = e.message || 'An unexpected error occurred.';
        throw new Error(`AI checklist generation is currently unavailable: ${errorMessage}`);
    }
}
