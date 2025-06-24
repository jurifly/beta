'use server';

import { analyzeContract, type ContractAnalyzerInput, type ContractAnalyzerOutput } from '@/ai/flows/contract-analyzer-flow';

type FormState = {
  data: ContractAnalyzerOutput | null;
  error: string | null;
  timestamp: string | null;
};

export async function generateContractAnalysis(previousState: FormState, formData: FormData): Promise<FormState> {
  const contractText = formData.get('contractText') as string;

  if (!contractText || contractText.length < 100) {
    return { data: null, error: 'Contract text must be at least 100 characters.', timestamp: null };
  }
  
  const input: ContractAnalyzerInput = { contractText };

  try {
    const result = await analyzeContract(input);
    return { data: result, error: null, timestamp: new Date().toISOString() };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI analysis failed: ${errorMessage}`, timestamp: null };
  }
}
