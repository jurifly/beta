
'use server';

import { getCompanyDetails } from '@/ai/flows/company-details-flow';

export async function fetchCompanyDetailsFromCIN(cin: string) {
  if (!cin || cin.length !== 21) {
    throw new Error('Invalid CIN provided.');
  }
  // This will call our Genkit flow
  const details = await getCompanyDetails({ cin });
  return details;
}
