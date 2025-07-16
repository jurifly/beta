
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
    category: z.enum(["Tax Exemption", "Grant / Funding", "Certification", "State-Specific", "Loan Scheme", "Women Entrepreneur"]),
    link: z.string().describe("The official URL for the scheme's landing or application page."),
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

Your task is to act as an intelligent engine. Analyze the user's profile and generate a comprehensive list of the most relevant schemes.

**Startup Profile:**
- Industry: {{industry}}
- Location (State): {{location}}
- Age: {{businessAgeInMonths}} months
- Has Female Founder: {{hasFemaleFounder}}
- Is DPIIT Recognized: {{isDpiitRecognized}}

**Your Mandatory Process:**

1.  **Initial Analysis**: Before generating results, you MUST mentally analyze how each profile detail impacts eligibility.
    *   **DPIIT Status**: If \`isDpiitRecognized\` is false, your #1 recommendation MUST be "DPIIT Recognition / Startup India," as it is the gateway to most other benefits.
    *   **Female Founder**: If \`hasFemaleFounder\` is true, you MUST find and include schemes specifically for women entrepreneurs, such as Stand-Up India, TREAD, or the Mahila Coir Yojana. You must categorize these as "Women Entrepreneur".
    *   **State**: You MUST find the official Startup Policy for the user's state (e.g., "Maharashtra State Startup Policy") and include it as a "State-Specific" recommendation.
    *   **Industry**: Find at least one scheme relevant to their specific industry (e.g., SAMRIDH for SaaS, fisheries-related grants for aquatech).
    *   **Age**: Use the business age to determine eligibility for schemes with age limits (e.g., Section 80-IAC tax exemption, which is for startups up to 10 years old).

2.  **Generate Recommendations**: Based on your analysis, generate a list of 5-8 highly relevant recommendations. For each recommendation, you MUST provide:
    *   \`schemeName\`: The official name of the scheme.
    *   \`description\`: A clear, concise summary of the benefits.
    *   \`eligibilitySummary\`: A brief outline of the key criteria.
    *   \`isEligible\`: Your boolean assessment of whether the startup is likely eligible based on their profile.
    *   \`category\`: Classify it correctly from the available options.
    *   \`link\`: The direct, official government URL for the scheme's landing or application page. DO NOT use news articles or third-party blog links. The URL must be official (e.g., ending in .gov.in or similar).

3.  **Knowledge Base of Schemes to Draw From (Include these and others you know):**
    *   **Certifications**: DPIIT Recognition / Startup India.
    *   **Funding Grants**: Startup India Seed Fund Scheme (SISFS), SAMRIDH Scheme (for software product startups), MeitY TIDE 2.0.
    *   **Loan Schemes**: CGTMSE (collateral-free bank loans), Stand-Up India (for Women/SC/ST entrepreneurs).
    *   **Tax Exemptions**: Section 80-IAC (3-year tax holiday), Section 56(2)(viib) (Angel Tax Exemption).
    *   **Women Entrepreneur Schemes**: TREAD, Mahila Coir Yojana, Annapurna Scheme.
    *   **State Policies**: Every state has one (e.g., "Karnataka Startup Policy", "Gujarat Startup Policy").

**CRITICAL QUALITY CONTROL**: Before finalizing your response, you MUST review every single recommendation. Ensure the links are official, the descriptions are accurate, and the eligibility assessment directly reflects the user's provided data. The output must be comprehensive and actionable.
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
