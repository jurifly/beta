'use server';

/**
 * @fileOverview A dashboard configuration suggestion AI agent.
 *
 * - suggestDashboardConfig - A function that suggests an optimal dashboard configuration based on business goals.
 * - SuggestDashboardConfigInput - The input type for the suggestDashboardConfig function.
 * - SuggestDashboardConfigOutput - The return type for the suggestDashboardConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDashboardConfigInputSchema = z.object({
  businessGoal: z
    .string()
    .describe('A description of the business goal for the dashboard.'),
});
export type SuggestDashboardConfigInput = z.infer<typeof SuggestDashboardConfigInputSchema>;

const SuggestDashboardConfigOutputSchema = z.object({
  dashboardConfiguration: z
    .string()
    .describe('The suggested dashboard configuration in JSON format.'),
  keyMetrics: z.array(
    z.string().describe('A list of key metrics relevant to the business goal.')
  ),
});
export type SuggestDashboardConfigOutput = z.infer<typeof SuggestDashboardConfigOutputSchema>;

export async function suggestDashboardConfig(
  input: SuggestDashboardConfigInput
): Promise<SuggestDashboardConfigOutput> {
  return suggestDashboardConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDashboardConfigPrompt',
  input: {schema: SuggestDashboardConfigInputSchema},
  output: {schema: SuggestDashboardConfigOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting optimal dashboard configurations and key metrics based on user-provided business goals.

  Given the following business goal, please suggest a dashboard configuration in JSON format and a list of key metrics that would be relevant to track.

  Business Goal: {{{businessGoal}}}

  Ensure the dashboard configuration is a valid JSON object.
`,
});

const suggestDashboardConfigFlow = ai.defineFlow(
  {
    name: 'suggestDashboardConfigFlow',
    inputSchema: SuggestDashboardConfigInputSchema,
    outputSchema: SuggestDashboardConfigOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
