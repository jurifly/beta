
'use server';
/**
 * @fileOverview An AI flow for suggesting an business classification code.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IncCodeFinderInputSchema = z.object({
  businessDescription: z.string().describe('A brief description of what the business does.'),
  legalRegion: z.string().describe('The country/legal region for the business, e.g., "India", "USA".'),
});
export type IncCodeFinderInput = z.infer<typeof IncCodeFinderInputSchema>;

const IncCodeFinderOutputSchema = z.object({
  nicCode: z.string().describe('The suggested business classification code (e.g., "62099" for NIC in India, or a NAICS code for the USA).'),
  nicTitle: z.string().describe('The official title for the classification code.'),
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
  prompt: `You are an expert on business regulations in {{legalRegion}}, specializing in business classification codes (like NIC for India, NAICS for the USA, etc.).

Your task is to analyze a user's business description and suggest the most appropriate classification code for {{legalRegion}}.

Business Description: "{{businessDescription}}"
Legal Region: "{{legalRegion}}"

Follow this process:
1.  **Identify Core Activity**: Analyze the description to determine the primary economic activity. Is it software development, manufacturing, trading, consulting, etc.?
2.  **Map to Local Classification Structure**: Mentally map this activity to the relevant classification structure for {{legalRegion}}.
3.  **Determine Best Fit Code**: Select the single best classification code that accurately represents the main business activity.
4.  **Provide Rationale**: Explain *why* you chose this code, linking it directly to the business description.
5.  **Suggest Alternatives**: If the business description is broad or could fit into multiple categories, suggest 1-2 plausible alternative codes.

**CRITICAL QUALITY CONTROL**: Ensure the \`reasoning\` and all \`title\` fields are well-written, professional, and completely free of spelling errors. Proofread the entire output.

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
      throw new Error("The AI failed to suggest a business code.");
    }
    return output;
  }
);
