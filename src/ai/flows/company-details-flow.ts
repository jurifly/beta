
'use server';
/**
 * @fileOverview An AI flow for fetching company details from a CIN.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompanyDetailsInputSchema = z.object({
  cin: z.string().length(21).describe('The 21-character Corporate Identification Number of the company.'),
});
export type CompanyDetailsInput = z.infer<typeof CompanyDetailsInputSchema>;

const CompanyDetailsOutputSchema = z.object({
  name: z.string().describe("The full legal name of the company."),
  pan: z.string().length(10).describe("The 10-character Permanent Account Number (PAN) of the company."),
  incorporationDate: z.string().describe("The date of incorporation in YYYY-MM-DD format."),
  sector: z.string().describe("The primary industry or sector the company operates in."),
  location: z.string().describe("The location of the registered office in 'City, State' format."),
});
export type CompanyDetailsOutput = z.infer<typeof CompanyDetailsOutputSchema>;

export async function getCompanyDetails(input: CompanyDetailsInput): Promise<CompanyDetailsOutput> {
  return companyDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'companyDetailsPrompt',
  input: { schema: CompanyDetailsInputSchema },
  output: { schema: CompanyDetailsOutputSchema },
  prompt: `You are an expert corporate data retrieval AI. Your task is to act as a mock API for the Indian Ministry of Corporate Affairs (MCA).

  Given a Corporate Identification Number (CIN), you must provide realistic and plausible company details.

  CIN: "{{cin}}"

  Generate the following details based on the CIN. The details should be internally consistent.
  - **Company Name**: The full legal name of the company.
  - **PAN**: A valid 10-character PAN. The 4th character must be 'C' for Company (e.g., AARPC1234A).
  - **Date of Incorporation**: A date in YYYY-MM-DD format. The year should plausibly match the year encoded in the CIN (characters 7-10).
  - **Industry/Sector**: A plausible business sector.
  - **Location**: The registered office location in "City, State" format. The state should plausibly match the state code in the CIN (characters 11-12).

  Return the data in the specified JSON format. Do not add any extra explanations or introductory text.
  `,
});

const companyDetailsFlow = ai.defineFlow(
  {
    name: 'companyDetailsFlow',
    inputSchema: CompanyDetailsInputSchema,
    outputSchema: CompanyDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to retrieve company details from AI.');
    }
    return output;
  }
);
