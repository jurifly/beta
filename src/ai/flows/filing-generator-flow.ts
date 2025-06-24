'use server';
/**
 * @fileOverview An AI flow for generating a realistic list of compliance filings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const FilingGeneratorInputSchema = z.object({
  companyType: z.string().describe('The legal type of the company (e.g., "Private Limited Company", "LLP").'),
  incorporationDate: z.string().describe("The company's date of incorporation in YYYY-MM-DD format."),
  currentDate: z.string().describe("The current date in YYYY-MM-DD format, to be used as a reference for generating deadlines."),
});
export type FilingGeneratorInput = z.infer<typeof FilingGeneratorInputSchema>;

const FilingItemSchema = z.object({
    date: z.string().describe("The due date of the filing in YYYY-MM-DD format."),
    title: z.string().describe("The name of the compliance filing (e.g., 'GSTR-3B Filing', 'Form AOC-4 Filing')."),
    type: z.enum(["ROC Filing", "ITR Filing", "GST Filing", "Task"]).describe("The category of the filing."),
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
  prompt: `You are an expert Indian compliance officer. Your task is to generate a realistic and plausible list of 5-7 key compliance filings for a company.

Reference Current Date: {{currentDate}}

Company Details:
- Type: {{companyType}}
- Incorporation Date: {{incorporationDate}}

Based on the company's details and the current date, generate a list of upcoming, recently overdue, and recently completed filings.

Instructions:
1.  The filings should be relevant to the company type (e.g., ROC filings like AOC-4/MGT-7 for a Pvt Ltd company, GST filings for most businesses, ITR filings).
2.  The due dates MUST be realistic. For example, a company incorporated a month ago cannot have an annual filing due yet. Monthly or quarterly filings are more likely.
3.  The 'status' for each filing must be correctly set relative to the provided 'currentDate'.
4.  Generate a mix of statuses (upcoming, overdue, completed) to make the data look realistic for a dashboard.
5.  Dates must be in YYYY-MM-DD format.

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
