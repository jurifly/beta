
'use server';
/**
 * @fileOverview An AI flow for suggesting an INC/NIC code for a business.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IncCodeFinderInputSchema = z.object({
  businessDescription: z.string().describe('A brief description of what the business does.'),
});
export type IncCodeFinderInput = z.infer<typeof IncCodeFinderInputSchema>;

const IncCodeFinderOutputSchema = z.object({
  nicCode: z.string().describe('The suggested 5-digit NIC code (e.g., "62099").'),
  nicTitle: z.string().describe('The official title for the NIC code.'),
  reasoning: z.string().describe('A brief explanation for why this code is recommended.'),
  alternativeCodes: z.array(z.object({
    code: z.string(),
    title: z.string()
  })).optional().describe('A few alternative codes to consider.')
});
export type IncCodeFinderOutput = z.infer<typeof IncCodeFinderOutputSchema>;

export async function findIncCode(input: IncCodeFinderInput): Promise<IncCodeFinderOutput> {
  return incCodeFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incCodeFinderPrompt',
  input: {schema: IncCodeFinderInputSchema},
  output: {schema: IncCodeFinderOutputSchema},
  prompt: `You are an expert on Indian business regulations, specializing in the National Industrial Classification (NIC) 2008 codes used by the Ministry of Corporate Affairs (MCA).

Your task is to analyze a user's business description and suggest the most appropriate 5-digit NIC code.

Business Description: "{{businessDescription}}"

Based on this description:
1.  Identify the single best NIC code.
2.  Provide the official title for that code.
3.  Give a short, clear reason for your choice, linking it to the user's business.
4.  Optionally, suggest 1-2 alternative codes if the business could fit into multiple categories.

Return the response in the specified JSON format.
`,
});

const incCodeFinderFlow = ai.defineFlow(
  {
    name: 'incCodeFinderFlow',
    inputSchema: IncCodeFinderInputSchema,
    outputSchema: IncCodeFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to suggest an INC code.");
    }
    return output;
  }
);
