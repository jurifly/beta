
'use server';
/**
 * @fileOverview An AI flow for generating a summary of regulatory updates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const WatcherInputSchema = z.object({
  portal: z.string().describe('The regulatory portal to get updates from (e.g., "MCA", "SEBI", "RBI").'),
  frequency: z.string().describe('The desired frequency of the summary (e.g., "daily", "weekly").'),
});
export type WatcherInput = z.infer<typeof WatcherInputSchema>;

const WatcherOutputSchema = z.object({
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
  prompt: `You are an expert AI legal assistant with access to real-time information from Indian regulatory bodies. Your task is to generate a concise, markdown-formatted summary of the most important and recent updates for a given regulatory portal and time-frame.

Portal: "{{portal}}"
Frequency: "{{frequency}}"

Based on your latest knowledge, generate a summary of 3-5 of the most impactful and recent regulatory updates.
**Focus on actionable intelligence**: Prioritize circulars, notifications, and amendments over general press releases.
For each update, provide:
- A clear heading.
- A brief summary of the change.
- A "Why it matters" section explaining the direct impact on businesses, CAs, or legal professionals.

The summary should be written in professional language and use markdown for formatting (headings, bold text, lists).

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
