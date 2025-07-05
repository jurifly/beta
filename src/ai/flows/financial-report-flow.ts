
'use server';
/**
 * @fileOverview An AI flow for generating a financial health report (MIS Summary).
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const FinancialReportInputSchema = z.object({
  monthlyRevenue: z.number().describe("The company's average monthly revenue."),
  monthlyExpenses: z.number().describe("The company's average monthly expenses."),
  cashBalance: z.number().describe("The company's current cash balance."),
  legalRegion: z.string().describe("The legal region for context, e.g., 'India', 'USA'."),
});
export type FinancialReportInput = z.infer<typeof FinancialReportInputSchema>;

const FinancialReportOutputSchema = z.object({
  report: z.string().describe('A markdown-formatted financial health report, summarizing key metrics and providing actionable advice.'),
});
export type FinancialReportOutput = z.infer<typeof FinancialReportOutputSchema>;

export async function generateFinancialReport(input: FinancialReportInput): Promise<FinancialReportOutput> {
  return financialReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialReportPrompt',
  input: {schema: FinancialReportInputSchema},
  output: {schema: FinancialReportOutputSchema},
  prompt: `You are an expert financial analyst AI for startups in {{legalRegion}}. Your task is to generate a concise and professional monthly financial health report (MIS Summary) based on the provided data.

**Financial Data (Monthly):**
- Revenue: {{monthlyRevenue}}
- Expenses: {{monthlyExpenses}}
- Current Cash Balance: {{cashBalance}}

**Instructions:**
1.  **Calculate Key Metrics**:
    -   Calculate the Net Profit/Loss (Burn Rate) for the month (Revenue - Expenses).
    -   If there is a burn rate (loss), calculate the company's runway in months (Cash Balance / Monthly Burn).
2.  **Generate Report in Markdown**: Structure the output as a clean, readable markdown report.
    -   **Headline Summary**: Start with a one-sentence summary of the financial position (e.g., "The company is currently profitable with positive cash flow." or "The company has a monthly burn of X and an estimated runway of Y months.").
    -   **Key Metrics Section**: Create a section that clearly lists:
        -   Monthly Revenue
        -   Monthly Expenses
        -   Net Profit / Loss
        -   Runway (if applicable)
    -   **Analysis Section**: Provide a short analysis of the situation. Comment on the burn rate relative to the cash balance. Is it sustainable? What does the runway imply?
    -   **Actionable Recommendations**: Provide 2-3 specific, actionable recommendations. For a company with high burn, suggest cost-cutting measures or revenue-boosting strategies. For a profitable company, suggest reinvestment opportunities or building a contingency fund.
3.  **Tone**: The tone should be professional, objective, and helpful.

**Quality Control**: Double-check all calculations and ensure the analysis and recommendations are logical and relevant to a startup context in {{legalRegion}}. The final markdown must be well-formatted.

Return the generated report in the 'report' field of the JSON output.
`,
});

const financialReportFlow = ai.defineFlow(
  {
    name: 'financialReportFlow',
    inputSchema: FinancialReportInputSchema,
    outputSchema: FinancialReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a financial report.");
    }
    return output;
  }
);
