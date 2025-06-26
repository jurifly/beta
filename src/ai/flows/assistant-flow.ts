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
  response: z.string().describe("A conversational, helpful response to the user's query. This should directly answer the question, framed as informational guidance, not definitive legal advice."),
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
  prompt: `You are an expert AI assistant specializing in Indian legal and compliance matters for businesses. Your tone should be professional, helpful, and conversational. Your purpose is to provide informational guidance, not to give definitive legal advice.

A user will ask a question about a specific topic: "{{topic}}".

1.  **Provide a direct, conversational answer**: First, address the user's question directly in the \`response\` field. Explain the concepts clearly, referencing specific Indian laws or acts (e.g., Companies Act 2013, GST Act, Income Tax Act) where relevant to add credibility. Always frame your answer as informational guidance. For example, instead of saying "You must do X," say "Under the Companies Act 2013, companies are generally required to do X."

2.  **Generate a checklist (if appropriate)**: If and only if the user's request explicitly asks for a checklist or would strongly benefit from one (e.g., "steps to register a company," "monthly compliance checklist"), generate a structured checklist in the \`checklist\` field. If a checklist is not relevant, do not include this field.

For example, if the user asks "what if I don't file gst return", your \`response\` should explain the potential consequences like penalties and interest as per the GST Act. A checklist would not be appropriate, so you would omit that field.

If the user asks for "monthly compliance for a private limited company", your \`response\` can be a brief introduction, and you should provide a detailed checklist in the \`checklist\` field, with tasks categorized appropriately.
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
