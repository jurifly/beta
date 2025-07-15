'use server';
/**
 * @fileOverview An AI flow for recommending a founder's salary and payout structure.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const FounderSalaryInputSchema = z.object({
  desiredAnnualPayout: z.number().min(1).describe("The founder's desired total annual compensation."),
  companyStage: z.enum(['Pre-Revenue', 'Early Revenue', 'Growth Stage']).describe("The current stage of the company."),
  lastFundingAmount: z.number().min(0).describe("The amount of the last funding round raised. Use 0 if bootstrapped."),
  legalRegion: z.string().describe("The legal region for context, e.g., 'India', 'USA'."),
});
export type FounderSalaryInput = z.infer<typeof FounderSalaryInputSchema>;

export const FounderSalaryOutputSchema = z.object({
  breakdown: z.object({
    inHandSalary: z.number().describe("The recommended annual in-hand salary component."),
    reimbursements: z.number().describe("The recommended annual amount for tax-free reimbursements."),
    esopAllocationValue: z.number().describe("The recommended notional value of ESOPs to be allocated."),
    directorsFee: z.number().describe("The recommended annual amount for director's fees or consulting charges, if applicable."),
  }),
  reasoning: z.string().describe("A markdown-formatted explanation for the recommended structure, covering tax efficiency, legal limits, and investor perception for the given company stage and region."),
  warnings: z.array(z.string()).describe("A list of potential warnings or considerations for the founder."),
});
export type FounderSalaryOutput = z.infer<typeof FounderSalaryOutputSchema>;


export async function getFounderSalaryBreakdown(input: FounderSalaryInput): Promise<FounderSalaryOutput> {
  return founderSalaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'founderSalaryPrompt',
  input: {schema: FounderSalaryInputSchema},
  output: {schema: FounderSalaryOutputSchema},
  prompt: `You are an expert CA and startup advisor specializing in founder compensation for companies in {{legalRegion}}.

A founder desires a total annual payout of {{desiredAnnualPayout}}. Their company profile is:
- Stage: {{companyStage}}
- Last Funding Round: {{lastFundingAmount}}

Your task is to recommend an optimal, legally compliant, and investor-friendly compensation structure.

1.  **Breakdown**: Allocate the desired payout across these components, keeping the company's stage in mind:
    *   **In-Hand Salary**: For 'Pre-Revenue' or bootstrapped companies, recommend a conservative salary to preserve cash. For 'Growth Stage' companies with significant funding, a market-rate salary is more appropriate.
    *   **Reimbursements**: Suggest a plausible amount for legitimate, tax-deductible business expenses (e.g., telephone, internet, fuel).
    *   **ESOP Allocation Value**: Suggest a notional value of stock options. This is a crucial component, especially when the cash salary is low, as it represents long-term wealth creation.
    *   **Director's Fee**: A fee for directorial duties. This can be tax-efficient but is more common in companies with established revenue and board structures.

2.  **Reasoning**: Justify your breakdown using **Markdown bullet points**. Explain WHY this structure is optimal for their stage, considering:
    *   **Tax Efficiency**: How the structure minimizes personal income tax in {{legalRegion}}.
    *   **Cash Preservation**: How the breakdown helps the company manage its cash flow, especially in early stages.
    *   **Investor Perception**: How this salary level appears to potential investors (e.g., "A lower cash salary signals to investors that you are committed to the long-term growth of the company.").

3.  **Warnings**: Provide 2-3 critical warnings. For example:
    *   "Ensure all reimbursements are backed by actual bills to be compliant."
    *   "Excessive salary can be a red flag for early-stage investors."
    *   "ESOPs are long-term wealth and not immediate cash."

**CRITICAL QUALITY CONTROL**: You MUST be thorough and professional. Ensure all generated text is plausible, well-written, and completely free of spelling or grammatical errors. Proofread the entire analysis before responding.
`,
});

const founderSalaryFlow = ai.defineFlow(
  {
    name: 'founderSalaryFlow',
    inputSchema: FounderSalaryInputSchema,
    outputSchema: FounderSalaryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a salary recommendation.');
    }
    return output;
  }
);
