
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
  prompt: `You are a world-class CA and business advisor. Your task is to analyze a startup's key health metrics for a company in {{legalRegion}} and write a concise, 3-paragraph executive summary for the founder. Be direct, insightful, and actionable.

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

1.  **Paragraph 1: Overall Posture.** Start with a clear summary of the company's current legal and compliance health. Reference the Hygiene Score. Is it strong, average, or in need of attention?

2.  **Paragraph 2: Most Urgent Issue.** Identify the single most critical issue that requires immediate attention. This could be the overdue filings, a very short runway, or a high-risk contract clause. State the problem clearly and explain its potential impact.

3.  **Paragraph 3: Action Plan.** Provide 2-3 clear, prioritized, and actionable steps the founder should take right away to address the most urgent issue.

**CRITICAL QUALITY CONTROL**: Before returning your response, you MUST act as a meticulous editor. Your analysis must be professional, well-written, and completely free of any spelling or grammatical errors.
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
