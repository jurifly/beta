

'use server';

import { recommendBusinessStructure, type BusinessRecommenderInput, type BusinessRecommenderOutput } from '@/ai/flows/business-recommender-flow';
import { getAssistantResponse, type AssistantInput, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { findIncCode } from '@/ai/flows/inc-code-finder-flow';
import type { IncCodeFinderInput, IncCodeFinderOutput } from '@/ai/flows/inc-code-finder-flow';
import { compareStates, type StateComparisonInput, type StateComparisonOutput } from '@/ai/flows/state-comparison-flow';

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
        const result = await getAssistantResponse(input);
        return result;
    } catch (e: any) {
        console.error('AI Flow Error:', e);
        const errorMessage = e.message || 'An unexpected error occurred.';
        throw new Error(`AI checklist generation is currently unavailable: ${errorMessage}`);
    }
}

export async function getIncCodeAction(input: IncCodeFinderInput): Promise<IncCodeFinderOutput> {
  try {
    const result = await findIncCode(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI code finder is currently unavailable: ${errorMessage}`);
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

