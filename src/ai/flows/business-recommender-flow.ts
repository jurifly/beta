
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
  prompt: `You are an expert business consultant in India specializing in company formation. Your task is to recommend the most suitable business structure from these options: Private Limited Company, Limited Liability Partnership (LLP), One Person Company (OPC), Sole Proprietorship, Partnership Firm.

Here is your internal guide for making recommendations:
- **Private Limited Company (Pvt Ltd)**: Ideal for ventures planning to raise equity funding (Venture Capital, Angel Investors). It's a separate legal entity, offers limited liability, and is perceived as professional and scalable. Compliance is higher. Best for high revenue goals.
- **Limited Liability Partnership (LLP)**: A hybrid structure offering the limited liability of a company and the flexibility of a partnership. Good for multiple founders who don't plan to raise equity funding soon. Less compliance than a Pvt Ltd.
- **One Person Company (OPC)**: For a single founder. It's a separate legal entity but has restrictions on growth and investment. A good step up from a proprietorship.
- **Sole Proprietorship**: Simplest structure for a single founder with low risk and no plans for external funding. The owner and business are the same legal entity.
- **Partnership Firm**: For multiple founders, but it has unlimited liability for partners, making it risky. Generally, an LLP is a better alternative.

Analyze the user's details below and provide a structured recommendation.

User's Business Details:
- Number of Founders: {{founderCount}}
- Investment Plans: "{{investmentPlan}}"
- Annual Revenue Goal: "{{revenueGoal}}"
- Business Description: "{{businessDescription}}"

Based on these details:
1.  **Recommended Type**: State the single best business structure.
2.  **Reasoning**: Provide a clear explanation for your recommendation, explicitly linking it to the user's details and your internal guide. (e.g., "Given your plan to seek VC funding, a Private Limited Company is the most suitable structure...").
3.  **Pros**: List 3-4 key advantages of the recommended structure based on their situation.
4.  **Cons**: List 2-3 key disadvantages or considerations.
5.  **Alternative Option**: If there's another close option, suggest it.

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
