
'use server';
/**
 * @fileOverview An AI flow for recommending a business structure.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const BusinessRecommenderInputSchema = z.object({
  founderCount: z.number().min(1).describe('The number of founders in the business.'),
  investmentPlan: z.string().describe('The plans for raising investment (e.g., "bootstrapped", "angel investors", "venture capital").'),
  revenueGoal: z.string().describe('The projected annual revenue goal for the first 2-3 years.'),
  businessDescription: z.string().describe('A brief description of what the business does.'),
  legalRegion: z.string().describe('The country/legal region for the business, e.g., "India", "USA".'),
});
export type BusinessRecommenderInput = z.infer<typeof BusinessRecommenderInputSchema>;

const BusinessRecommenderOutputSchema = z.object({
  recommendedType: z.string().describe('The recommended business structure (e.g., "Private Limited Company", "LLC", "One Person Company").'),
  reasoning: z.string().describe('A detailed explanation for why this structure is recommended, referencing the user\'s inputs.'),
  pros: z.array(z.string()).describe('A list of advantages for the recommended structure.'),
  cons: z.array(z.string()).describe('A list of disadvantages for the recommended structure.'),
  alternativeOption: z.string().optional().describe('An alternative business structure to consider.'),
});
export type BusinessRecommenderOutput = z.infer<typeof BusinessRecommenderOutputSchema>;

export async function recommendBusinessStructure(input: BusinessRecommenderInput): Promise<BusinessRecommenderOutput> {
  return businessRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'businessRecommenderPrompt',
  input: {schema: BusinessRecommenderInputSchema},
  output: {schema: BusinessRecommenderOutputSchema},
  prompt: `You are an expert business consultant specializing in company formation in {{legalRegion}}. Your task is to recommend the most suitable business structure based on the user's inputs.

Analyze the user's details below and provide a structured recommendation. Use your knowledge of common business structures in {{legalRegion}} (e.g., Private Limited Company, LLP, Sole Proprietorship for India; LLC, S-Corp, C-Corp for USA).

User's Business Details:
- Number of Founders: {{founderCount}}
- Investment Plans: "{{investmentPlan}}"
- Annual Revenue Goal: "{{revenueGoal}}"
- Business Description: "{{businessDescription}}"
- Country / Legal Region: {{legalRegion}}

Based on these details:
1.  **Recommended Type**: State the single best business structure.
2.  **Reasoning**: Provide a clear explanation for your recommendation, explicitly linking it to the user's details and the regulatory environment of {{legalRegion}}. (e.g., "Given your plan to seek VC funding in the {{legalRegion}}, an C-Corp/Private Limited Company is the most suitable structure...").
3.  **Pros**: List 3-4 key advantages of the recommended structure based on their situation.
4.  **Cons**: List 2-3 key disadvantages or considerations.
5.  **Alternative Option**: If there's another close option, suggest it.

**Quality Control**: Before returning your response, critically review all fields for spelling, grammar, and accuracy. The reasoning must be clear and professional.

Return the response in the specified JSON format.
`,
});

const businessRecommenderFlow = ai.defineFlow(
  {
    name: 'businessRecommenderFlow',
    inputSchema: BusinessRecommenderInputSchema,
    outputSchema: BusinessRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a business recommendation.");
    }
    return output;
  }
);
