'use server';
/**
 * @fileOverview An AI flow for fetching and summarizing regulatory updates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RegulationWatcherInputSchema = z.object({
  regulator: z.string().describe('The name of the regulatory body (e.g., "MCA", "SEBI", "RBI").'),
  topic: z.string().optional().describe('An optional topic or keyword to filter the updates.'),
});
export type RegulationWatcherInput = z.infer<typeof RegulationWatcherInputSchema>;

const UpdateItemSchema = z.object({
  title: z.string().describe('The official title or headline of the notification/circular.'),
  summary: z.string().describe('A concise, AI-generated summary of the update.'),
  link: z.string().url().describe('A plausible mock URL to the official document.'),
  date: z.string().describe('The publication date of the update in YYYY-MM-DD format.'),
});

const RegulationWatcherOutputSchema = z.object({
  updates: z.array(UpdateItemSchema).describe('A list of recent regulatory updates.'),
});
export type RegulationWatcherOutput = z.infer<typeof RegulationWatcherOutputSchema>;

export async function fetchRegulatoryUpdates(input: RegulationWatcherInput): Promise<RegulationWatcherOutput> {
  return regulationWatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regulationWatcherPrompt',
  input: {schema: RegulationWatcherInputSchema},
  output: {schema: RegulationWatcherOutputSchema},
  prompt: `You are an expert AI legal assistant that monitors Indian regulatory bodies.
Your task is to act as a mock API for fetching the latest circulars and notifications from a specified regulator.

Regulator: "{{regulator}}"
{{#if topic}}Topic/Keyword: "{{topic}}"{{/if}}

Generate a list of 3-5 recent, plausible, and impactful (but fictional) regulatory updates from the specified regulator.
For each update, provide:
- A realistic title for the notification.
- A concise summary explaining its key impact.
- A plausible mock URL to the source document.
- A recent, realistic date in YYYY-MM-DD format.

If a topic is provided, ensure the generated updates are relevant to that topic.
Return the data in the specified JSON format. Do not add any extra explanations.
`,
});

const regulationWatcherFlow = ai.defineFlow(
  {
    name: 'regulationWatcherFlow',
    inputSchema: RegulationWatcherInputSchema,
    outputSchema: RegulationWatcherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate regulatory updates.');
    }
    return output;
  }
);
