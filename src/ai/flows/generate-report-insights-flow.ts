
'use server';
/**
 * @fileOverview An AI flow for generating insights for a compliance health report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ReportInsightsInputSchema = z.object({
  hygieneScore: z.number().describe("The company's Legal Hygiene Score (0-100)."),
  overdueCount: z.number().describe("Number of overdue compliance tasks."),
  burnRate: z.number().describe("The company's net monthly cash burn. Positive number indicates a loss."),
  runway: z.string().describe("The estimated financial runway, e.g., '12 months', 'Profitable'."),
  hasEsop: z.boolean().describe("Whether the company has an established ESOP pool."),
  founderOwnershipPercentage: z.number().describe("The combined ownership percentage of all founders."),
});
export type ReportInsightsInput = z.infer<typeof ReportInsightsInputSchema>;


const ReportInsightsOutputSchema = z.object({
    insights: z.array(z.string()).describe("A list of 2-3 concise, actionable insights or red flags based on the provided company data."),
});
export type ReportInsightsOutput = z.infer<typeof ReportInsightsOutputSchema>;


export async function generateReportInsights(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportInsightsPrompt',
  input: {schema: ReportInsightsInputSchema},
  output: {schema: ReportInsightsOutputSchema},
  prompt: `You are an expert startup advisor and CFO. Analyze the following data points for a company and generate 2-3 critical, concise, and actionable insights for a "Founder Health Report". Frame each insight as a complete sentence.

Data Points:
- Legal Hygiene Score: {{hygieneScore}}/100
- Overdue Filings: {{overdueCount}}
- Net Monthly Burn: {{burnRate}}
- Estimated Runway: "{{runway}}"
- Has ESOP Pool: {{hasEsop}}
- Founder Ownership: {{founderOwnershipPercentage}}%

Insight Generation Rules:
- **If hygieneScore < 75:** Start with "The company's Legal Hygiene Score of {{hygieneScore}} is below the recommended 85. Focus on clearing overdue filings and completing the company profile to improve it."
- **If burnRate > 0 and runway is less than 6 months (and not "Profitable"):** Start with "Financial runway is critically low at {{runway}}. Immediate action on fundraising or cost reduction is advised to extend it."
- **If hasEsop is false:** Add an insight like "No ESOP pool has been formally created. Establishing one soon could be crucial for hiring and retaining top talent in the future."
- **If founderOwnershipPercentage > 85 and there's more than one founder:** Add an insight like "The high founder ownership concentration ({{founderOwnershipPercentage}}%) could be a point of discussion for future investors. Ensure the cap table is structured for future rounds."
- **If all metrics look good:** Provide a positive but watchful insight, e.g., "The company's core metrics appear healthy. Continue to monitor compliance and financial performance regularly to maintain this positive momentum."

Combine the most relevant insights into a list of 2-3 distinct points.
`,
});

const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: ReportInsightsInputSchema,
    outputSchema: ReportInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate report insights.');
    }
    return output;
  }
);
