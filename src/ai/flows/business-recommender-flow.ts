
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
});
export type BusinessRecommenderInput = z.infer<typeof BusinessRecommenderInputSchema>;

const BusinessRecommenderOutputSchema = z.object({
  recommendedType: z.string().describe('The recommended business structure (e.g., "Private Limited Company", "LLP", "One Person Company").'),
  reasoning: z.string().describe('A detailed explanation for why this structure is recommended.'),
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
  prompt: `You are an expert business consultant in India specializing in company formation. A user will provide details about their new venture. Your task is to recommend the most suitable business structure.

User's Business Details:
- Number of Founders: {{founderCount}}
- Investment Plans: "{{investmentPlan}}"
- Annual Revenue Goal: "{{revenueGoal}}"
- Business Description: "{{businessDescription}}"

Based on these details, analyze the situation and recommend the best legal structure from these options: Private Limited Company, Limited Liability Partnership (LLP), One Person Company (OPC), Sole Proprietorship, Partnership Firm.

Provide the following in your analysis:
1.  **Recommended Type**: The single best business structure.
2.  **Reasoning**: A clear, concise explanation for your recommendation, referencing the user's details. For example, if they plan to seek VC funding, explain why a Pvt Ltd is best.
3.  **Pros**: List 3-4 key advantages of the recommended structure.
4.  **Cons**: List 2-3 key disadvantages or considerations.
5.  **Alternative Option**: Suggest one other viable alternative if applicable.

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
