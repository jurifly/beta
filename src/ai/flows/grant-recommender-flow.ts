
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
    category: z.enum(["Tax Exemption", "Grant / Funding", "Certification", "State-Specific", "Loan Scheme"]),
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
  prompt: `You are an expert advisor for startups in {{legalRegion}}, specializing in government schemes, grants, and tax exemptions. Your knowledge base must include specific, real-world Indian schemes.

Analyze the startup's profile and recommend relevant schemes. For each recommendation, determine if they are likely eligible based on their data.

**Startup Profile:**
- Industry: {{industry}}
- Location (State): {{location}}
- Age: {{businessAgeInMonths}} months
- Has Female Founder: {{hasFemaleFounder}}
- Is DPIIT Recognized: {{isDpiitRecognized}}

**Schemes to consider (for India):**
1.  **DPIIT Recognition / Startup India:** A fundamental certification. If they don't have it, this should be the top recommendation as it is a prerequisite for most other schemes.
2.  **Startup India Seed Fund Scheme (SISFS):** Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization. Check for DPIIT recognition.
3.  **CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises):** A collateral-free loan scheme from banks for MSMEs. Check MSME status and business age.
4.  **Section 80-IAC Tax Exemption:** A 3-year tax holiday on profits for eligible DPIIT-recognized startups. Check age criteria (usually < 10 years from incorporation).
5.  **Section 56(2)(viib) (Angel Tax Exemption):** Exemption from 'Angel Tax' on investments received above fair market value, for DPIIT-recognized startups.
6.  **Women Entrepreneur Schemes:** Such as the Stand-Up India Scheme (providing bank loans to women and SC/ST entrepreneurs) or the TREAD scheme if the user has a female founder.
7.  **State-Specific Startup Policies:** Every state has its own policy with grants, reimbursements, or incentives. You MUST recommend the specific policy for the startup's state. For example: "Maharashtra Startup Policy", "Karnataka Startup Policy", "Startup Bihar Policy".
8.  **Sector-Specific Grants:** Look for schemes relevant to their industry (e.g., MeitY TIDE 2.0 for tech startups, grants for agritech, biotech, etc.).

**Instructions:**
- Generate a list of specific, relevant recommendations.
- For each scheme, provide its official name, a brief description, a summary of key eligibility criteria, and a boolean \`isEligible\` flag indicating if the startup likely qualifies based on their profile.
- If the user is not DPIIT recognized, make that the first and most important recommendation. Most other benefits depend on it.
- Classify each recommendation into the correct category: "Tax Exemption", "Grant / Funding", "Certification", "State-Specific", or "Loan Scheme".

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
