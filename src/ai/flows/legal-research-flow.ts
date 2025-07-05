
'use server';
/**
 * @fileOverview An AI flow for performing legal research.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const LegalResearchInputSchema = z.object({
  query: z.string().describe("The legal question or topic to research."),
  legalRegion: z.string().describe('The country/legal region for the research, e.g., "India", "USA".'),
});
export type LegalResearchInput = z.infer<typeof LegalResearchInputSchema>;

const PrecedentSchema = z.object({
    caseName: z.string().describe("The name of the case or legal precedent."),
    summary: z.string().describe("A brief summary of the precedent's relevance to the query."),
});

const LegalResearchOutputSchema = z.object({
    summary: z.string().describe("A concise summary of the answer to the legal query."),
    analysis: z.string().describe("A detailed analysis of the legal topic, explaining key principles and nuances relevant to the specified legal region."),
    precedents: z.array(PrecedentSchema).describe("A list of relevant (but potentially fictitious for this demo) case law or legal precedents."),
});
export type LegalResearchOutput = z.infer<typeof LegalResearchOutputSchema>;

export async function performLegalResearch(input: LegalResearchInput): Promise<LegalResearchOutput> {
  return legalResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalResearchPrompt',
  input: {schema: LegalResearchInputSchema},
  output: {schema: LegalResearchOutputSchema},
  prompt: `You are a world-class AI legal research assistant with deep expertise in the laws of {{legalRegion}}.

A legal professional has the following query: "{{query}}"

Your task is to provide a structured, comprehensive, and insightful legal analysis.

1.  **Summary**: Begin with a clear and concise summary that directly answers the user's query.
2.  **Detailed Analysis**: Provide an in-depth analysis of the legal topic. Explain the relevant statutes, regulations, and legal principles that apply in {{legalRegion}}. Use clear, professional language.
3.  **Precedents**: Identify and list 2-3 key legal precedents or landmark cases relevant to the query within {{legalRegion}}. For each precedent, provide the case name and a short summary of its significance and how it applies. For the purpose of this demonstration, these can be realistic but fictitious examples if necessary.

**Quality Control**: Your final output must be impeccably written, with no spelling or grammatical errors. The analysis should be clear, coherent, and professional.

Return the response in the specified JSON format.
`,
});

const legalResearchFlow = ai.defineFlow(
  {
    name: 'legalResearchFlow',
    inputSchema: LegalResearchInputSchema,
    outputSchema: LegalResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a legal research analysis.");
    }
    return output;
  }
);
