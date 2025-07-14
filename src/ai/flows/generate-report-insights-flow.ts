

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
  executiveSummary: z.string().describe("A 3-paragraph executive summary in Markdown format. It should summarize the compliance posture, identify the most urgent issue, and provide 2-3 prioritized action items."),
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
Generate a 3-paragraph executive summary in Markdown format.

1.  **Paragraph 1: Overall Posture.** Start with a clear, concise summary of the company's current legal and financial health. Reference the Hygiene Score. Is it strong, average, or in need of attention? Briefly mention financial stability. Example: "Your company demonstrates excellent legal and compliance health, evidenced by a perfect Legal Hygiene Score of 100/100 and no overdue filings. This strong foundation minimizes legal risks and positions you favorably for future growth and investment."

2.  **Paragraph 2: Most Urgent Issue.** Based on all the data, identify the single most critical issue that requires immediate attention. This could be a high number of overdue filings, a very short financial runway, or a critical risk flag from a contract. State the problem clearly and explain its potential impact. Example: "The most critical issue demanding immediate attention is the undefined Valuation Cap in your recent contracts. The current placeholder value poses a significant risk. Failure to properly assess and define this cap in INR could lead to disputes with investors regarding equity stake dilution and potentially disadvantageous terms for the company."

3.  **Paragraph 3: Action Plan.** Provide 2-3 clear, prioritized, and actionable steps the founder should take right away to address the most urgent issue identified in Paragraph 2. Be specific. Example: "To address this, immediately prioritize the following: 1) Engage a qualified financial advisor or valuation expert to conduct a thorough valuation of the company... 2) Armed with this valuation, renegotiate the Valuation Cap clause in the relevant contracts..."

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
