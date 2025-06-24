
'use server';
/**
 * @fileOverview An AI flow for generating realistic forum threads.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ForumThreadSchema = z.object({
    id: z.number(),
    title: z.string().describe("An engaging and realistic title for a forum discussion."),
    author: z.string().describe("A plausible Indian name for the author."),
    replies: z.number().describe("A realistic number of replies for the thread."),
    tag: z.enum(["Taxation", "Legal", "Compliance", "Networking", "Fundraising", "General"]).describe("A relevant category tag for the discussion."),
});

const ForumGeneratorOutputSchema = z.object({
    threads: z.array(ForumThreadSchema).describe("A list of 5 to 7 plausible forum threads.")
});
export type ForumGeneratorOutput = z.infer<typeof ForumGeneratorOutputSchema>;

export async function generateForumThreads(): Promise<ForumGeneratorOutput> {
  return forumGeneratorFlow();
}

const prompt = ai.definePrompt({
  name: 'forumGeneratorPrompt',
  output: {schema: ForumGeneratorOutputSchema},
  prompt: `You are an AI content generator for a community forum for Indian founders, CAs, and legal professionals.

Your task is to generate a realistic list of 5-7 engaging discussion threads. The threads should cover topics that are relevant to this audience.

For each thread, provide:
- A unique ID.
- A compelling title.
- A plausible Indian author name.
- A realistic number of replies.
- A relevant tag from the available options.

Ensure the generated content is diverse and believable.
`,
});

const forumGeneratorFlow = ai.defineFlow(
  {
    name: 'forumGeneratorFlow',
    outputSchema: ForumGeneratorOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    if (!output) {
        throw new Error("The AI failed to generate forum threads.");
    }
    return output;
  }
);
