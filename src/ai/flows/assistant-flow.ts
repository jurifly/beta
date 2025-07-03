
'use server';
/**
 * @fileOverview An AI assistant flow for generating compliance checklists.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  topic: z.string().describe('The topic or question for the AI assistant.'),
  legalRegion: z.string().describe('The country/legal region for the query, e.g., "India", "USA".'),
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
  prompt: `You are an expert AI assistant specializing in legal and compliance matters for businesses in {{legalRegion}}. Your purpose is to provide informational guidance, not definitive legal advice. Your tone should be professional and conversational.

A user will ask a question about a specific topic: "{{topic}}".

Your response has two parts: \`response\` and an optional \`checklist\`.

1.  **Conversational \`response\`**: This field should contain a brief, conversational introduction to the topic. It should NOT contain long lists or detailed step-by-step instructions. For example, "Hiring your first employee involves several key compliance steps to ensure you're following the law. Here is a checklist to guide you through the process."

2.  **Structured \`checklist\`**: If the user's query can be answered with a list of items, steps, or actions (e.g., "steps to register a company," "compliance for hiring"), you MUST generate a structured checklist in the \`checklist\` field. Put ALL actionable items, legal requirements, and detailed steps into this structured list. Do not put them in the \`response\` text. The \`response\` should only be a short intro to the checklist.

**Example Scenarios:**

-   **User asks for a checklist (e.g., "monthly compliance for a private company"):**
    -   \`response\`: "Here is a checklist of common monthly compliance tasks for a private company in {{legalRegion}}. Following these will help you stay on top of your obligations."
    -   \`checklist\`: (A detailed, categorized list of all monthly tasks).

-   **User asks a question that implies a list (e.g., "what do I need to do to hire an employee?"):**
    -   \`response\`: "Hiring an employee in {{legalRegion}} involves several important legal and compliance steps. Here is a checklist covering the key areas you'll need to address."
    -   \`checklist\`: (A detailed checklist including items like Employment Contract, EPF/ESI Registration, Statutory Deductions, etc.).

-   **User asks a question that does NOT need a list (e.g., "what if I don't file a tax return?"):**
    -   \`response\`: (A detailed explanation of the consequences, like penalties and interest, as per the tax laws of {{legalRegion}}. Do not use a bulleted or numbered list in this response text.)
    -   \`checklist\`: (This field should be omitted entirely).

By separating the conversational intro from the structured data, you provide a much clearer and more useful response. The UI is designed to render the \`checklist\` as a distinct, interactive component.
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
