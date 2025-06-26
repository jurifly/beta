
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
  prompt: `You are an expert AI legal assistant. Your primary function is to access and report on the most current, real-time information from Indian regulatory bodies. It is critical that you use your internal search capabilities to find the absolute latest updates up to today's date.

Your task is to generate a concise, markdown-formatted summary of the most important and recent updates for the given regulatory portal and time-frame.

Portal: "{{portal}}"
Frequency: "{{frequency}}"

Instructions:
1.  **Search for Real-Time Data**: Actively search for the latest circulars, notifications, and press releases from the official website and other reliable sources for the specified portal. Your knowledge must be current as of today.
2.  **Prioritize Impact**: Generate a summary of 3-5 of the most impactful regulatory updates. Focus on actionable intelligence like amendments, new compliance requirements, or significant policy changes over general news.
3.  **Include Dates**: For each update you summarize, you MUST include the date of the circular or notification (e.g., "Circular dated DD-MM-YYYY").
4.  **Structure the Output**: For each update, provide:
    -   A clear heading including the date.
    -   A brief summary of the change.
    -   A "Why it matters" section explaining the direct impact on businesses, CAs, or legal professionals.

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
