
'use server';
/**
 * @fileOverview An AI flow for predicting penalties for compliance defaults.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PenaltyPredictorInputSchema = z.object({
  complianceDefault: z.string().describe('A detailed description of the compliance default or missed filing.'),
  legalRegion: z.string().describe('The country/legal region for the compliance context, e.g., "India", "USA".'),
});
export type PenaltyPredictorInput = z.infer<typeof PenaltyPredictorInputSchema>;


const PenaltyPredictorOutputSchema = z.object({
  penaltyAmount: z.string().describe("A plausible estimated penalty amount, expressed as a string (e.g., '₹500 per day', 'Up to $10,000')."),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe("The assessed risk level of this default."),
  reasoning: z.string().describe("A brief explanation for the predicted penalty and risk level, referencing relevant laws or consequences."),
  mitigationSteps: z.array(z.string()).describe("A list of 2-3 concrete steps the user can take to rectify the default or minimize the damage."),
});
export type PenaltyPredictorOutput = z.infer<typeof PenaltyPredictorOutputSchema>;

export async function predictPenalty(input: PenaltyPredictorInput): Promise<PenaltyPredictorOutput> {
  return penaltyPredictorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'penaltyPredictorPrompt',
  input: {schema: PenaltyPredictorInputSchema},
  output: {schema: PenaltyPredictorOutputSchema},
  prompt: `You are an expert AI compliance analyst for {{legalRegion}}. Your task is to predict the potential penalties for a specific compliance default.

Analyze the user's situation:
"{{complianceDefault}}"

Based on this, provide a structured analysis:

1.  **Penalty Amount**: Estimate the likely financial penalty. Be specific. If it's a daily penalty, state that. If it's a range, provide it. Use the currency symbol relevant to {{legalRegion}}.
2.  **Risk Level**: Classify the risk as 'Low', 'Medium', 'High'. Consider factors like financial impact, legal consequences (e.g., prosecution), and operational disruption.
3.  **Reasoning**: Explain *why* the penalty and risk are what they are. Briefly cite the relevant act or rule if possible (e.g., "as per Section 234F of the Income Tax Act").
4.  **Mitigation Steps**: Provide 2-3 clear, actionable steps the user should take immediately to address the issue. For example, "File the return immediately with the late fee," or "Prepare a letter explaining the delay and submit to the concerned officer."

**CRITICAL QUALITY CONTROL**: You MUST be thorough and professional. Ensure all generated text is plausible, well-written, and completely free of spelling or grammatical errors. Proofread the entire analysis before responding.
`,
});

const penaltyPredictorFlow = ai.defineFlow(
  {
    name: 'penaltyPredictorFlow',
    inputSchema: PenaltyPredictorInputSchema,
    outputSchema: PenaltyPredictorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a penalty prediction.');
    }
    return output;
  }
);
