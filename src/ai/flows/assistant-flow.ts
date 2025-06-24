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

const AssistantOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated checklist.'),
  checklist: z.array(ChecklistItemSchema).describe('The list of compliance tasks.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function generateChecklist(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are an expert AI legal and compliance assistant for businesses in India. A user will ask for a compliance checklist on a specific topic.

Generate a personalized compliance checklist based on the user's request: "{{topic}}".

Your response must be a structured checklist with a clear title. For each task, provide a concise action and assign it to a relevant compliance category.

Ensure the language is professional, clear, and uses standard legal and business terminology. The checklist should be comprehensive and accurate.

For example, if the user asks for "monthly compliance for a private limited company", the tasks could include items like "Review monthly financial statements" under "Financial Reporting" and "File monthly GST returns" under "Tax Filings".
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
