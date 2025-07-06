
'use server';
/**
 * @fileOverview An AI flow for generating a summary of regulatory updates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const WatcherInputSchema = z.object({
  portal: z.string().describe('The regulatory portal to get updates from (e.g., "MCA", "SEC", "HMRC").'),
  frequency: z.string().describe('The desired frequency of the summary (e.g., "daily", "weekly").'),
  legalRegion: z.string().describe('The country/legal region for the compliance context, e.g., "India", "USA", "UK".'),
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
  prompt: `You are an expert AI legal assistant and a meticulous editor. Your primary function is to access and report on the most current, real-time information from regulatory bodies in {{legalRegion}}. It is critical that you use your internal search capabilities to find the absolute latest updates up to today's date.

Your task is to generate a concise, perfectly formatted, and grammatically correct markdown summary of the most important and recent updates for the given regulatory portal and time-frame.

Portal: "{{portal}}"
Frequency: "{{frequency}}"
Region: "{{legalRegion}}"

Instructions:
1.  **Search for Real-Time Data**: Actively search for the latest circulars, notifications, and press releases from the official website and other reliable sources for the specified portal in {{legalRegion}}. Your knowledge must be current as of today.
2.  **Prioritize Impact**: Generate a summary of 3-5 of the most impactful regulatory updates. Focus on actionable intelligence like amendments, new compliance requirements, or significant policy changes over general news.
3.  **Structure the Output**: For each update, you MUST provide:
    -   A clear markdown heading (e.g., \`### Update from [Date]\`) including the specific date of the circular or notification.
    -   A brief, clear summary of the change.
    -   A "**Why it matters**" section explaining the direct impact on businesses or professionals in {{legalRegion}}. Use bold markdown for the "Why it matters" title.
4.  **CRITICAL QUALITY CONTROL**: Before finalizing your response, you MUST proofread the entire summary for any spelling mistakes, grammatical errors, or formatting issues. The final output must be polished, professional, and error-free.

Return ONLY the markdown summary in the 'summary' field of the JSON output. Do not include any introductory text or apologies in the summary itself.
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
