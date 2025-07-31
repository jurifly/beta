

'use server';
/**
 * @fileOverview An AI flow for comparing Indian states for business registration.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const StateComparisonInputSchema = z.object({
  businessType: z.enum(['Tech/IT/SaaS', 'Manufacturing', 'Services (Non-IT)', 'Agri-business', 'E-commerce/Retail']),
  fundingStage: z.enum(['Bootstrapped', 'Pre-Seed/Angel', 'VC Funded']),
  hiringPlan: z.enum(['1-10 Employees', '11-50 Employees', '50+ Employees']),
  statesToCompare: z.array(z.string()).min(1).max(3).describe("A list of 1 to 3 Indian states to compare."),
});
export type StateComparisonInput = z.infer<typeof StateComparisonInputSchema>;

const StateAnalysisSchema = z.object({
    state: z.string().describe("The name of the Indian state being analyzed."),
    incorporation: z.object({
        easeOfRegistration: z.string().describe("A brief on the ease and speed of company registration (e.g., 'Fully online, fast track options')."),
        complianceNotes: z.string().describe("Key local compliance requirements (e.g., 'Mandatory Shop & Establishment license within 30 days')."),
    }),
    startupSchemes: z.object({
        keySchemes: z.array(z.string()).describe("List 2-3 flagship state-specific startup schemes (e.g., 'Maharashtra EV Policy', 'Karnataka Elevate Program')."),
        incentives: z.string().describe("A summary of available incentives like grants, reimbursements, or co-working space subsidies."),
    }),
    taxAndLabour: z.object({
        professionalTax: z.string().describe("Details on Professional Tax applicability and its slabs."),
        labourLawCompliance: z.string().describe("Notes on the complexity of local labour law compliance (e.g., 'Strict enforcement, multiple filings required')."),
    }),
    risksAndFlags: z.object({
        commonIssues: z.array(z.string()).describe("List 1-2 common red flags or challenges for startups in this state (e.g., 'High commercial rent', 'Delayed GST refunds')."),
    }),
    score: z.number().min(0).max(10).describe("A score out of 10 for how suitable this state is for the user's specific business profile."),
});

const StateComparisonOutputSchema = z.object({
  analysis: z.array(StateAnalysisSchema),
  recommendation: z.string().describe("A concluding paragraph recommending the best state out of the selected options for the user's specific business profile, with clear reasoning based on the analysis."),
});
export type StateComparisonOutput = z.infer<typeof StateComparisonOutputSchema>;

export async function compareStates(input: StateComparisonInput): Promise<StateComparisonOutput> {
  return stateComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stateComparisonPrompt',
  input: {schema: StateComparisonInputSchema},
  output: {schema: StateComparisonOutputSchema},
  prompt: `You are an expert corporate advisor specializing in pan-India business setup and compliance. Your task is to compare Indian states for a startup based on their specific profile.

**User's Startup Profile:**
- Business Type: {{businessType}}
- Funding Stage: {{fundingStage}}
- Hiring Plans: {{hiringPlan}}

**States to Compare:**
{{#each statesToCompare}}
- {{this}}
{{/each}}

For each state, provide a detailed analysis covering the following points. Tailor your analysis to the user's profile. For example, for a 'Manufacturing' business, focus on industrial policies. For a 'Tech' startup, highlight IT policies and talent availability.

1.  **State**: The name of the state.
2.  **Incorporation**:
    *   **Ease of Registration**: How easy and fast is it to register a company? Mention online systems.
    *   **Compliance Notes**: What are the immediate, mandatory local compliance tasks (e.g., Shops & Establishment Act, Professional Tax registration)?
3.  **Startup Schemes**:
    *   **Key Schemes**: Name 2-3 major, currently active startup schemes or policies in that state.
    *   **Incentives**: Summarize the types of benefits offered (e.g., seed funding, patent filing reimbursement, rent subsidy).
4.  **Tax & Labour**:
    *   **Professional Tax**: Explain that this is a state-level **tax** levied on earned income. Provide details on its applicability (e.g., "Applicable on salaries above X per month"). You MUST clearly state that the **maximum Professional Tax payable per individual is ₹2,500 per year**, ensuring there is no confusion that this is a tax, not a salary.
    *   **Labour Law Compliance**: Comment on the complexity and strictness of state-level labour law enforcement.
5.  **Risks & Flags**:
    *   **Common Issues**: Mention 1-2 well-known challenges for businesses in that state (e.g., high real estate costs, political instability, bureaucratic delays).
6.  **Score**: Give a score from 1 (least suitable) to 10 (most suitable) for this specific startup profile in this state.

After analyzing all selected states, provide a final **Recommendation**. This should be a clear, concluding paragraph advising which state is the best fit for the user's venture and why, directly referencing the points you've analyzed.

**CRITICAL QUALITY CONTROL**: Before returning your response, act as a meticulous editor. Ensure all scheme names are accurate and the information is practical and realistic. The output must be professional and error-free.
`,
});

const stateComparisonFlow = ai.defineFlow(
  {
    name: 'stateComparisonFlow',
    inputSchema: StateComparisonInputSchema,
    outputSchema: StateComparisonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a state comparison. Please try again.");
    }
    return output;
  }
);



