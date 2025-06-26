
'use server';
/**
 * @fileOverview An AI flow for generating a realistic list of compliance filings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const FilingGeneratorInputSchema = z.object({
  companyType: z.string().describe('The legal type of the company (e.g., "Private Limited Company", "LLC").'),
  incorporationDate: z.string().describe("The company's date of incorporation in YYYY-MM-DD format."),
  currentDate: z.string().describe("The current date in YYYY-MM-DD format, to be used as a reference for generating deadlines."),
  legalRegion: z.string().describe('The country/legal region for the company, e.g., "India", "USA".'),
});
export type FilingGeneratorInput = z.infer<typeof FilingGeneratorInputSchema>;

const FilingItemSchema = z.object({
    date: z.string().describe("The due date of the filing in YYYY-MM-DD format."),
    title: z.string().describe("The name of the compliance filing (e.g., 'GSTR-3B Filing', 'Annual Report Filing')."),
    type: z.enum(["Corporate Filing", "Tax Filing", "Other Task"]).describe("The category of the filing."),
    status: z.enum(["overdue", "upcoming", "completed"]).describe("The status of the filing based on the provided current date."),
});

const FilingGeneratorOutputSchema = z.object({
    filings: z.array(FilingItemSchema).describe("A list of 5-7 plausible compliance filings.")
});
export type FilingGeneratorOutput = z.infer<typeof FilingGeneratorOutputSchema>;

export async function generateFilings(input: FilingGeneratorInput): Promise<FilingGeneratorOutput> {
  return filingGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filingGeneratorPrompt',
  input: {schema: FilingGeneratorInputSchema},
  output: {schema: FilingGeneratorOutputSchema},
  prompt: `You are an expert compliance officer for {{legalRegion}}. Your task is to generate a realistic and plausible list of 5-7 key compliance filings for a company, considering its lifecycle and jurisdiction.

Reference Current Date: {{currentDate}}

Company Details:
- Type: {{companyType}}
- Incorporation Date: {{incorporationDate}}
- Legal Region: {{legalRegion}}

Based on the company's details and the current date, generate a list of upcoming, recently overdue, and recently completed filings.

Instructions:
1.  **Lifecycle Awareness**: The filings must be relevant to the company's age. For a newly incorporated company, prioritize initial filings. For an older company, include annual filings.
2.  **Jurisdiction Relevance**: Filings MUST be relevant to the company type and legal region. For example, a Pvt Ltd in India has ROC filings, while an LLC in the USA has annual reports. Tax filings (like GST in India or Sales Tax in the US) are common.
3.  **Realistic Due Dates**: The due dates MUST be realistic. An annual filing cannot be due a month after incorporation. Monthly/quarterly filings are more likely for new companies.
4.  **Status Accuracy**: The 'status' for each filing must be correctly set relative to the provided 'currentDate'.
5.  **Data Diversity**: Generate a mix of statuses (upcoming, overdue, completed) to make the data look realistic for a dashboard.
6.  **Date Formatting**: Dates must be in YYYY-MM-DD format.

Return the response in the specified JSON format.
`,
});

const filingGeneratorFlow = ai.defineFlow(
  {
    name: 'filingGeneratorFlow',
    inputSchema: FilingGeneratorInputSchema,
    outputSchema: FilingGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a list of filings.");
    }
    return output;
  }
);
