
'use server';
/**
 * @fileOverview An AI flow for fetching company details from a CIN.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompanyDetailsInputSchema = z.object({
  cin: z.string().describe('The Corporate Identification Number or equivalent business identifier of the company.'),
  legalRegion: z.string().describe('The country/legal region for the business, e.g., "India", "USA".'),
});
export type CompanyDetailsInput = z.infer<typeof CompanyDetailsInputSchema>;

const CompanyDetailsOutputSchema = z.object({
  name: z.string().describe("The full legal name of the company."),
  pan: z.string().describe("The Tax ID (e.g., PAN, EIN) of the company."),
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
  prompt: `You are an expert corporate data retrieval AI. Your task is to act as a mock API for the corporate affairs ministry of {{legalRegion}}.

  Given a Corporate Identification Number (or equivalent business identifier), you must provide realistic and plausible company details.

  Identifier: "{{cin}}"
  Country: "{{legalRegion}}"

  Generate the following details based on the identifier and country. The details should be internally consistent and appropriate for {{legalRegion}}.
  - **Company Name**: The full legal name of the company.
  - **Tax ID / PAN / EIN**: The primary tax identifier for the company.
  - **Date of Incorporation**: A plausible date in YYYY-MM-DD format.
  - **Industry/Sector**: A plausible business sector.
  - **Location**: The registered office location in "City, State/Region" format.

  Ensure all generated names and text are plausible and spelled correctly.

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
