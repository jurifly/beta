'use server';
/**
 * @fileOverview An AI assistant flow for generating compliance checklists.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  topic: z.string().describe('The topic or question for the AI assistant.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const ChecklistItemSchema = z.object({
  task: z.string().describe('A single, actionable task in the checklist.'),
  category: z.string().describe('The compliance category for the task (e.g., "Corporate Governance", "Tax Filings").'),
});

const ChecklistSchema = z.object({
    title: z.string().describe('A suitable title for the generated checklist.'),
    items: z.array(ChecklistItemSchema).describe('The list of compliance tasks.'),
});
export type ChecklistOutput = z.infer<typeof ChecklistSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe("A conversational, helpful response to the user's query. This should directly answer the question."),
  checklist: ChecklistSchema.optional().describe("If the user's query can be best answered with a checklist, provide it here. Otherwise, omit this field.")
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function getAssistantResponse(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are an expert AI legal and compliance assistant for businesses in India. Engage in a natural, conversational manner to help users with their legal and compliance questions.

A user will ask a question about a specific topic: "{{topic}}".

1.  **Provide a direct, conversational answer**: First, address the user's question directly in the \`response\` field. Explain the concepts clearly and professionally.
2.  **Generate a checklist (if appropriate)**: If and only if the user's request explicitly asks for a checklist or would strongly benefit from one (e.g., "steps to register a company"), generate a structured checklist in the \`checklist\` field. If a checklist is not relevant, do not include this field.

For example, if the user asks "what if I don't file gst return", your \`response\` should explain the consequences (penalties, interest, etc.). A checklist would not be appropriate, so you would omit that field.

If the user asks for "monthly compliance for a private limited company", your \`response\` can be a brief introduction, and you should provide a detailed checklist in the \`checklist\` field.
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
