'use server';
/**
 * @fileOverview An AI flow for generating a summary of regulatory updates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const RegulatorySummaryInputSchema = z.object({
  portal: z.string().describe('The regulatory portal to get updates from (e.g., "MCA", "SEBI", "RBI").'),
  frequency: z.string().describe('The desired frequency of the summary (e.g., "daily", "weekly").'),
});
export type RegulatorySummaryInput = z.infer<typeof RegulatorySummaryInputSchema>;

export const RegulatorySummaryOutputSchema = z.object({
  summary: z.string().describe('A markdown-formatted summary of the latest regulatory updates.'),
});
export type RegulatorySummaryOutput = z.infer<typeof RegulatorySummaryOutputSchema>;


export async function getRegulatoryUpdatesSummary(input: RegulatorySummaryInput): Promise<RegulatorySummaryOutput> {
  return regulationWatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regulationWatcherSummaryPrompt',
  input: {schema: RegulatorySummaryInputSchema},
  output: {schema: RegulatorySummaryOutputSchema},
  prompt: `You are an expert AI legal assistant that monitors Indian regulatory bodies.
Your task is to generate a concise, markdown-formatted summary of the most important fictional updates for a given regulatory portal and time-frame.

Portal: "{{portal}}"
Frequency: "{{frequency}}"

Generate a summary of 3-5 of the most impactful (but fictional) regulatory updates from the specified portal for the selected frequency.
The summary should be written in professional language, use markdown for formatting (headings, bold text, lists), and be easy to read.

For a "daily" digest, the updates should be very recent.
For a "weekly" roundup, they can cover a broader range of topics from the past week.

Return ONLY the markdown summary in the 'summary' field of the JSON output.
`,
});

const regulationWatcherFlow = ai.defineFlow(
  {
    name: 'regulationWatcherFlow',
    inputSchema: RegulatorySummaryInputSchema,
    outputSchema: RegulatorySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate regulatory updates.');
    }
    return output;
  }
);
