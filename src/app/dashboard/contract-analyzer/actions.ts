'use server';

import { analyzeContract, type AnalyzeContractInput, type AnalyzeContractOutput } from '@/ai/flows/contract-analyzer-flow';

type FormState = {
  data: AnalyzeContractOutput | null;
  error: string | null;
};

export async function analyzeContractAction(previousState: FormState, formData: FormData): Promise<FormState> {
  const fileDataUri = formData.get('fileDataUri') as string;

  if (!fileDataUri) {
    return { data: null, error: 'File data is missing. Please try uploading again.' };
  }
  
  const input: AnalyzeContractInput = { fileDataUri };

  try {
    const result = await analyzeContract(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI analysis failed: ${errorMessage}` };
  }
}
