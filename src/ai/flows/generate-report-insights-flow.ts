

'use server';
/**
 * @fileOverview An AI flow for synthesizing multiple data points into a single, actionable report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ReportInsightsInputSchema = z.object({
  hygieneScore: z.number().describe("The company's overall compliance score, out of 100."),
  overdueFilings: z.number().describe("The number of compliance tasks that are past their due date."),
  upcomingFilings: z.number().describe("The number of compliance tasks due in the next 30 days."),
  burnRate: z.number().describe("The net monthly cash burn. A positive number indicates a loss."),
  runwayInMonths: z.string().describe("The estimated number of months until cash runs out."),
  recentRiskFlags: z.array(z.string()).describe("A list of the top 2-3 most critical risk flags from recently analyzed documents."),
  legalRegion: z.string().describe("The country/legal region for the company, e.g., 'India', 'USA'."),
});
export type ReportInsightsInput = z.infer<typeof ReportInsightsInputSchema>;

const ReportInsightsOutputSchema = z.object({
  executiveSummary: z.string().describe("A 3-5 point executive summary in Markdown format. It should summarize the compliance posture, identify the most urgent issue, and provide 2-3 prioritized action items in a bulleted list."),
});
export type ReportInsightsOutput = z.infer<typeof ReportInsightsOutputSchema>;

export async function generateReportInsights(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportInsightsPrompt',
  input: {schema: ReportInsightsInputSchema},
  output: {schema: ReportInsightsOutputSchema},
  prompt: `You are a world-class CA and business advisor. Your task is to analyze a startup's key health metrics for a company in {{legalRegion}} and write a concise, insightful, and actionable executive summary for the founder.

**Company Data:**
- Legal Hygiene Score: {{hygieneScore}}/100
- Overdue Filings: {{overdueFilings}}
- Upcoming Filings (30 days): {{upcomingFilings}}
- Net Monthly Burn: {{burnRate}}
- Estimated Runway: {{runwayInMonths}}
- Critical Risk Flags from Recent Contracts:
{{#each recentRiskFlags}}
  - "{{this}}"
{{/each}}
{{#unless recentRiskFlags}}
  - None identified recently.
{{/unless}}

**Instructions:**
Generate a 3-5 point executive summary using Markdown bullet points.

*   **Overall Posture:** Start with a bullet point summarizing the company's current legal and financial health. Reference the Hygiene Score. Example: "- **Overall Health:** Strong legal posture with a {{hygieneScore}}/100 score and stable financials."

*   **Most Urgent Issue:** Dedicate a bullet point to the single most critical issue that requires immediate attention. State the problem clearly. Example: "- **Urgent Priority:** The placeholder 'Valuation Cap' in recent contracts poses a significant risk of unfavorable dilution and investor disputes."

*   **Action Plan:** Provide 2-3 clear, prioritized, and actionable steps as sub-bullets under a main "Action Plan" bullet. Example:
    - **Action Plan:**
        - Immediately engage a qualified financial advisor to conduct a formal valuation.
        - Renegotiate the Valuation Cap clause in the relevant contracts to reflect the new valuation.
        - Update all signed documents and communicate the change to investors.

**CRITICAL QUALITY CONTROL**: Before returning your response, you MUST act as a meticulous editor. Your analysis must be professional, well-written, and completely free of any spelling or grammatical errors. Ensure the summary is actionable and directly addresses the provided data points.
`,
});

const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: ReportInsightsInputSchema,
    outputSchema: ReportInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate the report insights.");
    }
    return output;
  }
);
