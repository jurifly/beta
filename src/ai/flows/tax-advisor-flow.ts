
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
    section80C: z.number().default(0).describe("Deductions under Section 80C (e.g., PPF, ELSS, Life Insurance)."),
    section80D: z.number().default(0).describe("Deductions under Section 80D (Health Insurance Premium)."),
    hra: z.number().default(0).describe("House Rent Allowance exemption."),
    otherDeductions: z.number().default(0).describe("Any other applicable deductions."),
});

const TaxAdvisorInputSchema = z.object({
  income: IncomeDetailsSchema,
  deductions: DeductionDetailsSchema,
  entityType: z.enum(["Individual", "Company"]).describe("The type of entity for tax calculation."),
  legalRegion: z.string().describe("The legal region for tax laws, e.g., 'India', 'USA', 'UK', 'Australia'."),
});
export type TaxAdvisorInput = z.infer<typeof TaxAdvisorInputSchema>;


const TaxCalculationSchema = z.object({
    grossIncome: z.string().describe("Total gross income before any deductions."),
    totalDeductions: z.string().describe("Total deductions applied."),
    taxableIncome: z.string().describe("Net taxable income after deductions."),
    taxPayable: z.string().describe("The final calculated income tax liability, including any cess or surcharges."),
    effectiveRate: z.string().optional().describe("The effective tax rate as a percentage."),
});

const TaxAdvisorOutputSchema = z.object({
  oldRegime: TaxCalculationSchema.describe("Tax calculation as per the old tax regime. For corporate tax or regions without this concept, this will mirror the newRegime field."),
  newRegime: TaxCalculationSchema.describe("Tax calculation as per the new/default tax regime."),
  recommendedRegime: z.enum(["Old", "New", "N/A"]).describe("The recommended tax regime for saving more tax. 'N/A' if not applicable."),
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
  prompt: `You are an expert AI Tax Advisor for {{legalRegion}}. Your task is to analyze the user's financial data, calculate their tax liability, and provide actionable tax-saving advice based on the rules for the specified region and entity type.

**User Financial Data:**
- Entity Type: {{entityType}}
- Legal Region: {{legalRegion}}
- Income:
  - Salary: {{income.salary}}
  - Business Income/Profit: {{income.businessIncome}}
  - Capital Gains: {{income.capitalGains}}
  - Other Income: {{income.otherIncome}}
- Deductions:
  - 80C equivalent: {{deductions.section80C}}
  - 80D equivalent: {{deductions.section80D}}
  - HRA equivalent: {{deductions.hra}}
  - Other: {{deductions.otherDeductions}}

**CRITICAL INSTRUCTIONS**:
1.  **Select Correct Rules**: Based on the \`legalRegion\` and \`entityType\`, use the specific tax rules provided in the datasets below.
2.  **Calculate Gross Income**: Sum up all relevant income sources. For 'Company' type, use 'Salary' as Revenue and 'Business Income' as Profit.
3.  **Perform Calculations**: Calculate the tax liability precisely. Show all monetary values in a human-readable local currency format (e.g., "₹ 1,50,000", "$10,000", "£5,000").
4.  **Handle Tax Regimes**:
    -   **For India (Individual)**: Calculate for BOTH old and new regimes. Compare the final tax payable and set \`recommendedRegime\` to 'Old' or 'New'.
    -   **For other regions or Corporate tax**: The concept of dual regimes doesn't apply. Perform a single calculation. Populate BOTH \`oldRegime\` and \`newRegime\` fields in the output with the IDENTICAL calculation results. Set \`recommendedRegime\` to 'N/A' and \`recommendationReason\` to "Only one tax regime applies for this entity/region."
5.  **Generate Tips**: Provide 3-5 specific, actionable tax optimization tips relevant to the user's inputs and region.
6.  **Quality Control**: Double-check all calculations and ensure the advice is logical and relevant.

---
**TAX DATASETS (Financial Year 2023-24)**

---
🇮🇳 **India**
*   **Individual (New Regime)**: Rebate up to ₹7L income. Slabs: 0-3L (0%), 3-6L (5%), 6-9L (10%), 9-12L (15%), 12-15L (20%), >15L (30%). Standard Deduction: ₹50,000 on salary. No other deductions. Cess: 4%.
*   **Individual (Old Regime)**: Rebate up to ₹5L income. Slabs: 0-2.5L (0%), 2.5-5L (5%), 5-10L (20%), >10L (30%). All deductions (80C, 80D, HRA) and Standard Deduction are applicable. Cess: 4%.
*   **Company**: If turnover <= ₹400 Cr, tax is 25%. Otherwise, 30%. Surcharge: 7% if profit > ₹1 Cr, 12% if profit > ₹10 Cr. Cess: 4%.

---
🇺🇸 **USA (Federal Only)**
*   **Individual (2023, Single Filer)**: Slabs: $0-$11,000 (10%), $11,001-$44,725 (12%), $44,726-$95,375 (22%), $95,376-$182,100 (24%), $182,101-$231,250 (32%), $231,251-$578,125 (35%), >$578,125 (37%). Standard Deduction: $13,850.
*   **Company (C-Corp)**: Flat federal corporate tax rate of 21%.

---
🇬🇧 **UK (England/Wales/NI)**
*   **Individual (2023-24)**: Personal Allowance: £12,570. Slabs on income above allowance: Basic Rate up to £37,700 (20%), Higher Rate £37,701-£125,140 (40%), Additional Rate >£125,140 (45%).
*   **Company (Limited Company)**: Main rate of Corporation Tax is 25%. Small profits rate of 19% for companies with profits of £50,000 or less. Marginal relief between £50,000 and £250,000.

---
🇦🇺 **Australia**
*   **Individual (2023-24)**: Slabs: $0-$18,200 (0%), $18,201-$45,000 (19%), $45,001-$120,000 (32.5%), $120,001-$180,000 (37%), >$180,000 (45%).
*   **Company (Pty Ltd)**: 30%. Base rate entities (turnover < A$50m and <=80% passive income) pay 25%.

---
Return the final analysis in the specified JSON format.
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
