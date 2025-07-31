

'use server';

import { generateYoYAnalysis, type YoYInput, type YoYOutput } from '@/ai/flows/yoy-analysis-flow';


export async function getYoYAnalysisAction(input: YoYInput): Promise<YoYOutput> {
  try {
    const result = await generateYoYAnalysis(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not generate financial analysis.');
  }
}
