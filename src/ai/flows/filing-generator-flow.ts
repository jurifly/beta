
'use server';
/**
 * @fileOverview An AI flow for generating a realistic list of compliance filings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { format } from 'date-fns';

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
  prompt: `You are an expert compliance officer for {{legalRegion}}. Your task is to generate a realistic and actionable list of 5-7 key compliance filings for a company.

Reference Current Date: {{currentDate}}

Company Details:
- Type: {{companyType}}
- Incorporation Date: {{incorporationDate}}
- Legal Region: {{legalRegion}}

Based on the company's details, generate a list of compliance tasks. Your primary focus is on what the user needs to do *now* and in the near future.

Instructions:
1.  **Focus on Actionable Timeline**: Generate filings that are due within the following timeframe:
    - Recently overdue (within the last 2 months from the current date).
    - Due in the current month.
    - Upcoming in the next 3 months.
    This should be the bulk of your response.

2.  **Include Initial Setup Tasks**: For newly incorporated companies (within the first 6 months), ALWAYS include critical one-time setup tasks like "Open Company Bank Account", "Apply for GSTIN", and "Shops & Establishment Act Registration". Set their due dates based on the standard, legally or practically recommended timelines for {{legalRegion}}. For example, the deadline for opening a bank account is typically within 30-60 days of incorporation in India to deposit share capital, but other tasks might have longer timelines. Ensure the generated dates are accurate and reflect these norms.

3.  **Lifecycle Awareness**: Other filings must be relevant to the company's age. For a newly incorporated company, prioritize initial filings. For an older company, include annual filings that fall within the specified timeline.

4.  **Jurisdiction Relevance**: Filings MUST be relevant to the company type and legal region (e.g., ROC filings for India, Annual Reports for USA).

5.  **Status Accuracy**: The 'status' for each filing must be correctly set to 'overdue', 'upcoming', 'completed' based on the 'date' relative to the 'currentDate'. A task should only be 'completed' if its due date is in the past.

6.  **Prioritize Upcoming Tasks**: Ensure the list is not just historical. The majority of the items should be 'upcoming' to provide a forward-looking checklist.

7.  **Date Formatting**: Dates must be in YYYY-MM-DD format.

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
    // If the AI fails to generate filings, return some generic ones.
    if (output.filings.length === 0) {
      output.filings.push(
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Open Company Bank Account', type: 'Other Task', status: 'upcoming' },
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Apply for GST Registration', type: 'Tax Filing', status: 'upcoming' },
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Finalize Founders Agreement', type: 'Corporate Filing', status: 'upcoming' },
      )
    }
    return output;
  }
);
