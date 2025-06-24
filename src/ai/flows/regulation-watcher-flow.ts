'use server';
/**
 * @fileOverview An AI flow for generating a summary of regulatory updates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const WatcherInputSchema = z.object({
  portal: z.string().describe('The regulatory portal to get updates from (e.g., "MCA", "SEBI", "RBI").'),
  frequency: z.string().describe('The desired frequency of the summary (e.g., "daily", "weekly").'),
});
export type WatcherInput = z.infer<typeof WatcherInputSchema>;

export const WatcherOutputSchema = z.object({
  summary: z.string().describe('A markdown-formatted summary of the latest regulatory updates.'),
});
export type WatcherOutput = z.infer<typeof WatcherOutputSchema>;


export async function watchRegulations(input: WatcherInput): Promise<WatcherOutput> {
  return watchRegulationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'watchRegulationsPrompt',
  input: {schema: WatcherInputSchema},
  output: {schema: WatcherOutputSchema},
  prompt: `You are an expert AI legal assistant that monitors Indian regulatory bodies.
Your task is to generate a concise, markdown-formatted summary of the most important fictional updates for a given regulatory portal and time-frame.

Portal: "{{portal}}"
Frequency: "{{frequency}}"

Generate a summary of 3-5 of the most impactful (but fictional) regulatory updates from the specified portal for the selected frequency.
The summary should be written in professional language, use markdown for formatting (headings, bold text, lists), and be easy to read.

Return ONLY the markdown summary in the 'summary' field of the JSON output.
`,
});

const watchRegulationsFlow = ai.defineFlow(
  {
    name: 'watchRegulationsFlow',
    inputSchema: WatcherInputSchema,
    outputSchema: WatcherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate regulatory updates.');
    }
    return output;
  }
);
