
'use server';

import { getCompanyDetails, type CompanyDetailsInput, type CompanyDetailsOutput } from '@/ai/flows/company-details-flow';

export async function fetchCompanyDetailsFromCIN(cin: string): Promise<CompanyDetailsOutput> {
  if (!cin || cin.length !== 21) {
    throw new Error('Invalid CIN provided.');
  }

  const input: CompanyDetailsInput = { cin };

  try {
    const result = await getCompanyDetails(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI is currently unavailable: ${errorMessage}`);
  }
}
