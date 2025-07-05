
'use server';
/**
 * @fileOverview An AI flow for calculating income tax and providing optimization advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IncomeDetailsSchema = z.object({
  salary: z.number().default(0).describe("Annual salary income."),
  businessIncome: z.number().default(0).describe("Net profit from business or profession."),
  capitalGains: z.number().default(0).describe("Income from capital gains."),
  otherIncome: z.number().default(0).describe("Income from other sources like interest, rent, etc."),
});

const DeductionDetailsSchema = z.object({
    section80C: z.number().default(0).describe("Deductions under Section 80C (e.g., PPF, ELSS, Life Insurance). Max 1,50,000."),
    section80D: z.number().default(0).describe("Deductions under Section 80D (Health Insurance Premium)."),
    hra: z.number().default(0).describe("House Rent Allowance exemption."),
    otherDeductions: z.number().default(0).describe("Any other applicable deductions."),
});

export const TaxAdvisorInputSchema = z.object({
  income: IncomeDetailsSchema,
  deductions: DeductionDetailsSchema,
  entityType: z.enum(["Individual", "Company"]).describe("The type of entity for tax calculation."),
  legalRegion: z.string().describe("The legal region for tax laws, e.g., 'India', 'USA'."),
});
export type TaxAdvisorInput = z.infer<typeof TaxAdvisorInputSchema>;


const TaxCalculationSchema = z.object({
    grossIncome: z.string().describe("Total gross income before any deductions."),
    totalDeductions: z.string().describe("Total deductions applied."),
    taxableIncome: z.string().describe("Net taxable income after deductions."),
    taxPayable: z.string().describe("The final calculated income tax liability, including cess."),
});

export const TaxAdvisorOutputSchema = z.object({
  oldRegime: TaxCalculationSchema.describe("Tax calculation as per the old tax regime."),
  newRegime: TaxCalculationSchema.describe("Tax calculation as per the new tax regime."),
  recommendedRegime: z.enum(["Old", "New"]).describe("The recommended tax regime for saving more tax."),
  recommendationReason: z.string().describe("A brief reason for the recommended regime."),
  optimizationTips: z.array(z.string()).describe("A list of personalized, actionable tax-saving tips."),
  summary: z.string().describe("A concise summary of the user's tax situation."),
});
export type TaxAdvisorOutput = z.infer<typeof TaxAdvisorOutputSchema>;

export async function getTaxAdvice(input: TaxAdvisorInput): Promise<TaxAdvisorOutput> {
  return taxAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxAdvisorPrompt',
  input: {schema: TaxAdvisorInputSchema},
  output: {schema: TaxAdvisorOutputSchema},
  prompt: `You are an expert AI Tax Advisor for {{legalRegion}}. Your task is to analyze the user's financial data, calculate their tax liability under both old and new tax regimes, recommend the better option, and provide actionable tax-saving advice.

**User Financial Data:**
- Entity Type: {{entityType}}
- Income:
  - Salary: {{income.salary}}
  - Business Income: {{income.businessIncome}}
  - Capital Gains: {{income.capitalGains}}
  - Other Income: {{income.otherIncome}}
- Deductions:
  - 80C: {{deductions.section80C}}
  - 80D: {{deductions.section80D}}
  - HRA: {{deductions.hra}}
  - Other: {{deductions.otherDeductions}}

**Instructions for {{legalRegion}} (Individual):**

1.  **Calculate Gross Income**: Sum up all income sources.
2.  **Calculate Tax (Old Regime)**:
    - Apply all user-provided deductions (cap 80C at 1,50,000).
    - Apply the standard deduction of 50,000 on salary income if applicable.
    - Calculate taxable income.
    - Use the OLD tax slabs for {{legalRegion}} to calculate the tax.
3.  **Calculate Tax (New Regime)**:
    - Do NOT apply any deductions except the standard deduction of 50,000 on salary income.
    - Calculate taxable income.
    - Use the NEW tax slabs for {{legalRegion}} to calculate the tax.
4.  **Add Cess**: Add Health and Education Cess (currently 4% in India) to both tax amounts.
5.  **Recommend Regime**: Compare the final tax payable in both regimes and recommend the one that results in lower tax. Provide a clear reason.
6.  **Provide Optimization Tips**: Based on the user's data, provide 3-5 specific, actionable tips. Examples: "You have only utilized ₹{{deductions.section80C}} of your ₹1,50,000 80C limit. Consider investing in an ELSS fund to save more tax." or "Since your deductions are low, the new regime is more beneficial for you."
7.  **Generate Summary**: Write a brief, clear summary of the findings.
8.  **Format all monetary values in a human-readable format (e.g., "₹ 1,50,000").**

**Reference Tax Slabs for India (FY 2023-24):**
*   **Old Regime:** Up to 2.5L: 0%; 2.5L-5L: 5%; 5L-10L: 20%; >10L: 30%. Rebate u/s 87A if income up to 5L.
*   **New Regime:** Up to 3L: 0%; 3L-6L: 5%; 6L-9L: 10%; 9L-12L: 15%; 12L-15L: 20%; >15L: 30%. Rebate u/s 87A if income up to 7L.

Return the final analysis in the specified JSON format. Ensure all calculations are accurate and tips are relevant.
`,
});

const taxAdvisorFlow = ai.defineFlow(
  {
    name: 'taxAdvisorFlow',
    inputSchema: TaxAdvisorInputSchema,
    outputSchema: TaxAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate tax advice.");
    }
    return output;
  }
);
