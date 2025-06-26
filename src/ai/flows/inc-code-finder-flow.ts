
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

Follow this process:
1.  **Identify Core Activity**: Analyze the description to determine the primary economic activity. Is it software development, manufacturing, trading, consulting, etc.?
2.  **Map to NIC Structure**: Mentally map this activity to the NIC 2008 structure (Section -> Division -> Group -> Class).
3.  **Determine Best Fit Code**: Select the single best 5-digit NIC code that accurately represents the main business activity.
4.  **Provide Rationale**: Explain *why* you chose this code, linking it directly to the business description.
5.  **Suggest Alternatives**: If the business description is broad or could fit into multiple categories, suggest 1-2 plausible alternative codes.

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
