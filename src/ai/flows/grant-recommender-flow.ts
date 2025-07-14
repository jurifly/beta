
'use server';
/**
 * @fileOverview An AI flow for recommending grants and tax exemptions for startups.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GrantRecommenderInputSchema = z.object({
  industry: z.string().describe('The industry or sector of the startup (e.g., "Fintech", "Healthtech", "SaaS").'),
  location: z.string().describe('The primary state of operation (e.g., "Maharashtra", "Karnataka", "Delhi").'),
  businessAgeInMonths: z.number().describe('The age of the company in months since incorporation.'),
  hasFemaleFounder: z.boolean().describe('Whether the company has at least one female co-founder.'),
  isDpiitRecognized: z.boolean().describe('Whether the company already has DPIIT recognition.'),
  legalRegion: z.string().describe('The country/legal region for the business, e.g., "India", "USA".'),
});
export type GrantRecommenderInput = z.infer<typeof GrantRecommenderInputSchema>;

const RecommendationSchema = z.object({
    schemeName: z.string().describe("The official name of the grant, scheme, or tax exemption."),
    description: z.string().describe("A brief, clear summary of what the scheme offers."),
    eligibilitySummary: z.string().describe("A summary of the key eligibility criteria."),
    isEligible: z.boolean().describe("The AI's assessment of whether the startup is likely eligible based on the inputs."),
    category: z.enum(["Tax Exemption", "Grant / Funding", "Certification", "State-Specific"]),
});

const GrantRecommenderOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe('A list of recommended grants, exemptions, and schemes.'),
});
export type GrantRecommenderOutput = z.infer<typeof GrantRecommenderOutputSchema>;

export async function recommendGrants(input: GrantRecommenderInput): Promise<GrantRecommenderOutput> {
  return grantRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'grantRecommenderPrompt',
  input: {schema: GrantRecommenderInputSchema},
  output: {schema: GrantRecommenderOutputSchema},
  prompt: `You are an expert advisor for startups in {{legalRegion}}, specializing in government schemes, grants, and tax exemptions.

Analyze the startup's profile and recommend relevant schemes. For each recommendation, determine if they are likely eligible based on their data.

**Startup Profile:**
- Industry: {{industry}}
- Location (State): {{location}}
- Age: {{businessAgeInMonths}} months
- Has Female Founder: {{hasFemaleFounder}}
- Is DPIIT Recognized: {{isDpiitRecognized}}

**Schemes to consider (if applicable for {{legalRegion}}):**
1.  **DPIIT Recognition / Startup India:** A fundamental certification. If they don't have it, this should be the top recommendation.
2.  **Section 80-IAC Tax Exemption:** 3-year tax holiday for eligible DPIIT-recognized startups. Check age criteria (usually < 10 years).
3.  **Section 56(2)(viib) (Angel Tax Exemption):** For DPIIT-recognized startups.
4.  **Women Entrepreneur Schemes:** Such as the Stand-Up India Scheme or TREAD scheme, if there's a female founder.
5.  **State-Specific Startup Policies:** Every state (like Karnataka, Maharashtra, Gujarat) has its own policy with grants, reimbursements, or incentives. Recommend the policy for the startup's specific state.
6.  **Sector-Specific Grants:** Look for schemes relevant to their industry (e.g., grants for agritech, biotech, etc.).

**Instructions:**
- Generate a list of relevant recommendations.
- For each scheme, provide its name, a brief description, a summary of key eligibility criteria, and a boolean \`isEligible\` flag indicating if the startup likely qualifies.
- If they are not DPIIT recognized, make that the first and most important recommendation. Most other benefits depend on it.

**CRITICAL QUALITY CONTROL**: Ensure the recommendations are relevant to the startup's profile and the legal region. All text must be professional and free of errors.
`,
});

const grantRecommenderFlow = ai.defineFlow(
  {
    name: 'grantRecommenderFlow',
    inputSchema: GrantRecommenderInputSchema,
    outputSchema: GrantRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate recommendations. Please try again.");
    }
    return output;
  }
);
`