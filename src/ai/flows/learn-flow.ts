
'use server';
/**
 * @fileOverview An AI flow for generating educational content on business topics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const LearnInputSchema = z.object({
  topic: z.string().describe('The business or startup topic to explain (e.g., "Angel Investing", "CAC", "Burn Rate").'),
  legalRegion: z.string().describe('The country/legal region for context, e.g., "India", "USA".'),
});
export type LearnInput = z.infer<typeof LearnInputSchema>;

const LearnOutputSchema = z.object({
  title: z.string().describe("A clear, concise title for the topic."),
  summary: z.string().describe("An 'Explain Like I'm 5' (ELI5) summary of the topic. Very simple and easy to understand."),
  content: z.string().describe("A detailed explanation of the topic, formatted in Markdown. Should include headings, bullet points, and practical examples relevant to a startup founder in {{legalRegion}}."),
  furtherReading: z.array(z.string()).optional().describe("A list of 3-4 related topics or next steps for the user to explore."),
});
export type LearnOutput = z.infer<typeof LearnOutputSchema>;

export async function getLearningTopic(input: LearnInput): Promise<LearnOutput> {
  return learnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learnPrompt',
  input: {schema: LearnInputSchema},
  output: {schema: LearnOutputSchema},
  prompt: `You are an expert business educator for startup founders in {{legalRegion}}. Your goal is to explain complex topics in a simple, clear, and actionable way.

Topic to Explain: "{{topic}}"

Generate a structured educational guide on this topic.

1.  **Title**: Create a clear title for the topic.
2.  **Summary (ELI5)**: Explain the topic as if you were talking to a 5-year-old. Use a simple analogy if possible. Keep it to 2-3 sentences.
3.  **Content (Markdown)**: Provide a detailed but easy-to-digest explanation using Markdown.
    *   Use headings (##) to structure the content (e.g., "What is it?", "Why does it matter?", "How do you calculate it?").
    *   Use bullet points for lists.
    *   Use **bold** for key terms.
    *   Provide a simple, practical example relevant to a startup in {{legalRegion}}.
4.  **Further Reading**: Suggest 3-4 related topics or next steps a founder should explore after understanding this one.

**CRITICAL QUALITY CONTROL**: You MUST act as a meticulous editor. Your entire output must be professional, well-written, and completely free of any spelling or grammatical errors. The final output must be polished, accurate, and easy to understand.
`,
});

const learnFlow = ai.defineFlow(
  {
    name: 'learnFlow',
    inputSchema: LearnInputSchema,
    outputSchema: LearnOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error(`The AI failed to generate content for the topic: ${input.topic}`);
    }
    return output;
  }
);
