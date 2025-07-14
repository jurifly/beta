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
  reasoning: z.string().describe("A detailed explanation for the recommended structure, covering tax efficiency, legal limits, and investor perception for the given company stage and region."),
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

1.  **Breakdown**: Allocate the desired payout across these components:
    *   **In-Hand Salary**: A reasonable monthly salary. For early-stage companies, this should be conservative to preserve cash.
    *   **Reimbursements**: Suggest a plausible amount for legitimate, tax-deductible business expenses (e.g., telephone, internet, fuel).
    *   **ESOP Allocation Value**: Suggest a notional value of stock options to compensate for a lower cash salary. This is about future wealth, not immediate cash.
    *   **Director's Fee**: A fee for directorial duties, which can be tax-efficient. Only recommend if appropriate for the company stage.

2.  **Reasoning**: Justify your breakdown. Explain WHY this structure is optimal for their stage, considering:
    *   **Tax Efficiency**: How the structure minimizes personal income tax.
    *   **Investor Perception**: How this salary level appears to potential investors (e.g., shows commitment without excessive cash burn).
    *   **Legal Compliance**: Mentioning that reimbursements must be for actual expenses.

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
