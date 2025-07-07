
'use server';
/**
 * @fileOverview An AI flow for generating proactive dashboard insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ProactiveInsightsInputSchema = z.object({
  userRole: z.enum(["Founder", "CA", "Legal Advisor", "Enterprise"]),
  legalRegion: z.string().describe("The country/legal region for the context."),
  founderContext: z.object({
      companyAgeInDays: z.number(),
      companyType: z.string(),
      hygieneScore: z.number(),
      overdueCount: z.number(),
      upcomingIn30DaysCount: z.number(),
      burnRate: z.number().describe("The monthly cash burn rate. Positive number indicates a loss."),
  }).optional(),
  caContext: z.object({
      clientCount: z.number(),
      highRiskClientCount: z.number(),
  }).optional(),
});
export type ProactiveInsightsInput = z.infer<typeof ProactiveInsightsInputSchema>;

const InsightSchema = z.object({
  title: z.string().describe("A short, catchy title for the insight."),
  description: z.string().describe("A one-sentence description of the situation or suggestion."),
  cta: z.string().describe("A call to action, e.g., 'Generate Report' or 'Review Filings'."),
  href: z.string().describe("The in-app link for the call to action."),
  icon: z.enum(["Lightbulb", "BarChart", "FileText", "AlertTriangle", "Users", "ShieldCheck"]).describe("The most relevant icon name for the insight."),
});

const ProactiveInsightsOutputSchema = z.object({
    insights: z.array(InsightSchema).describe("A list of 1 to 3 relevant, proactive insights for the user's dashboard."),
});
export type ProactiveInsightsOutput = z.infer<typeof ProactiveInsightsOutputSchema>;

export async function getProactiveInsights(input: ProactiveInsightsInput): Promise<ProactiveInsightsOutput> {
  return proactiveInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proactiveInsightsPrompt',
  input: {schema: ProactiveInsightsInputSchema},
  output: {schema: ProactiveInsightsOutputSchema},
  prompt: `You are an expert AI business and compliance advisor. Your task is to generate 1-3 highly relevant, actionable, and proactive insights for a user's dashboard based on their current context. The user is in {{legalRegion}}.

**User Role: {{userRole}}**

{{#if founderContext}}
---
**Founder's Company Context:**
- Company Age: {{founderContext.companyAgeInDays}} days
- Company Type: {{founderContext.companyType}}
- Legal Hygiene Score: {{founderContext.hygieneScore}}/100
- Overdue Filings: {{founderContext.overdueCount}}
- Upcoming Filings (30 days): {{founderContext.upcomingIn30DaysCount}}
- Monthly Burn Rate: {{founderContext.burnRate}}
---

**Founder Insight Generation Rules:**
- **If hygieneScore < 70:** Suggest reviewing the Analytics page to identify improvement areas. (Icon: ShieldCheck)
- **If overdueCount > 0:** Urgently prompt them to visit the CA Connect page to clear backlogs. (Icon: AlertTriangle)
- **If burnRate > 0:** Suggest generating a financial health report from the Financials page for cost-saving ideas. (Icon: BarChart)
- **If companyAgeInDays > 540 and companyType contains 'Private Limited':** Suggest it might be time to think about an ESOP plan and generate one from the Document Studio. (Icon: FileText)
- **If upcomingIn30DaysCount > 0:** Gently remind them of upcoming deadlines on the CA Connect page. (Icon: Lightbulb)
{{/if}}

{{#if caContext}}
---
**CA's Practice Context:**
- Total Clients: {{caContext.clientCount}}
- High-Risk Clients: {{caContext.highRiskClientCount}}
---

**CA Insight Generation Rules:**
- **If highRiskClientCount > 0:** Prompt them to check the Portfolio Analytics on their main dashboard to focus on these high-risk clients. (Icon: ShieldCheck)
- **If no clients yet:** Suggest adding their first client to get started from the Client Management page. (Icon: Users)
- **General Tip for CAs:** Suggest generating a "Client Compliance Health Report" from the Report Center to add value for a key client. (Icon: FileText)
{{/if}}


**Instructions:**
1.  Analyze the provided context for the user's role.
2.  Select the **most relevant and urgent** insight first.
3.  Generate a list of 1 to 3 unique insights. Do not repeat suggestions.
4.  For each insight, provide a concise \`title\`, \`description\`, a clear call-to-action \`cta\`, a valid \`href\`, and a matching \`icon\`.
5.  **Crucially for Founders**, when suggesting they visit their compliance page, use the term "CA Connect" for the \`cta\` and the link \`/dashboard/ca-connect\` for the \`href\`. Do not use "Compliance Hub".

**CRITICAL QUALITY CONTROL**: All generated text in the \`title\`, \`description\`, and \`cta\` fields must be professional and completely free of any spelling or grammatical errors.
`,
});

const proactiveInsightsFlow = ai.defineFlow(
  {
    name: 'proactiveInsightsFlow',
    inputSchema: ProactiveInsightsInputSchema,
    outputSchema: ProactiveInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        return { insights: [] };
    }
    return output;
  }
);
