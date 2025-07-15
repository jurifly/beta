'use server';
/**
 * @fileOverview An AI flow for suggesting an early-stage startup valuation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ValuationOptimizerInputSchema = z.object({
  industry: z.string().describe("The industry or sector of the startup (e.g., 'Fintech', 'SaaS')."),
  stage: z.enum(['Idea', 'Pre-Seed', 'Seed']).describe("The current funding stage of the startup."),
  traction: z.string().describe("A brief summary of the startup's traction (e.g., '1000 active users', '₹5L monthly revenue', '2 pilot customers')."),
  teamSummary: z.string().describe("A brief summary of the founding team's experience (e.g., '2 founders, ex-Flipkart engineers')."),
  legalRegion: z.string().describe("The legal region for context, e.g., 'India', 'USA'."),
});
export type ValuationOptimizerInput = z.infer<typeof ValuationOptimizerInputSchema>;

const ValuationOptimizerOutputSchema = z.object({
  suggestedValuationRange: z.string().describe("A plausible, defensible valuation range, e.g., '₹2 Cr - ₹4 Cr'."),
  reasoning: z.string().describe("A markdown-formatted explanation for the suggested valuation, referencing the startup's stage, industry, and traction."),
  justificationSteps: z.array(z.string()).describe("A list of 3-4 actionable steps the founder can take to legally justify this valuation to investors and tax authorities (e.g., 'Prepare a DCF model', 'Benchmark against comparable startups')."),
  angelTaxWarning: z.string().describe("A concise warning about the implications of Section 56(2)(viib) (Angel Tax) in India and the importance of a fair market value report."),
});
export type ValuationOptimizerOutput = z.infer<typeof ValuationOptimizerOutputSchema>;


export async function getValuationOptimization(input: ValuationOptimizerInput): Promise<ValuationOptimizerOutput> {
  return valuationOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'valuationOptimizerPrompt',
  input: {schema: ValuationOptimizerInputSchema},
  output: {schema: ValuationOptimizerOutputSchema},
  prompt: `You are an expert startup advisor and Chartered Accountant in {{legalRegion}}, specializing in early-stage valuations and the implications of "Angel Tax" (Section 56(2)(viib) of the Income Tax Act).

A founder needs help determining a safe but ambitious valuation for their startup. Here is their profile:
- Industry: {{industry}}
- Stage: {{stage}}
- Traction: "{{traction}}"
- Team: "{{teamSummary}}"

Your task is to provide a structured valuation analysis.

1.  **Valuation Range**: Suggest a realistic pre-money valuation range. Base this on the industry, stage, traction, and team background. Use industry benchmarks common in {{legalRegion}}.

2.  **Reasoning**: In markdown, explain *why* you are suggesting this range. Reference their inputs directly. For example: "For a {{stage}} {{industry}} startup with traction like '{{traction}}', this valuation is competitive..."

3.  **Justification Steps**: Provide 3-4 concrete, actionable steps the founder MUST take to justify this valuation to both investors and tax authorities. This is critical for Angel Tax compliance. Examples:
    *   "Prepare a detailed 5-year financial projection and a Discounted Cash Flow (DCF) valuation model."
    *   "Get a valuation certificate from a SEBI-registered Merchant Banker or a Big 4 accounting firm."
    *   "Create a 'Comparables' slide in your pitch deck showing recent funding rounds of similar startups."

4.  **Angel Tax Warning**: Provide a clear, concise warning about Section 56(2)(viib). Explain that if they raise funds at a price higher than the Fair Market Value (FMV) determined by a professional, the excess amount could be taxed as income for the company.

**CRITICAL QUALITY CONTROL**: You MUST be thorough and professional. Ensure all generated text is plausible, well-written, and completely free of spelling or grammatical errors. Proofread the entire analysis before responding.
`,
});

const valuationOptimizerFlow = ai.defineFlow(
  {
    name: 'valuationOptimizerFlow',
    inputSchema: ValuationOptimizerInputSchema,
    outputSchema: ValuationOptimizerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a valuation analysis.');
    }
    return output;
  }
);
