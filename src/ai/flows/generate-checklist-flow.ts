
'use server';
/**
 * @fileOverview An AI flow for generating due diligence checklists.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChecklistInputSchema = z.object({
  dealType: z.string().describe('The type of deal or audit, e.g., "Seed Funding", "Series A", "Merger & Acquisition".'),
  legalRegion: z.string().describe('The country/legal region for the company, e.g., "India", "USA".'),
});
export type GenerateChecklistInput = z.infer<typeof GenerateChecklistInputSchema>;

const ChecklistItemSchema = z.object({
  task: z.string().describe('A single, actionable task in the checklist.'),
  category: z.string().describe('The due diligence category for the task (e.g., "Financial", "Legal", "Technical").'),
});

const GenerateChecklistOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated checklist, like "Due Diligence Checklist for Seed Funding".'),
  checklist: z.array(ChecklistItemSchema).describe('The list of due diligence tasks.'),
});
export type GenerateChecklistOutput = z.infer<typeof GenerateChecklistOutputSchema>;

export async function generateChecklist(input: GenerateChecklistInput): Promise<GenerateChecklistOutput> {
  return generateChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChecklistPrompt',
  input: {schema: GenerateChecklistInputSchema},
  output: {schema: GenerateChecklistOutputSchema},
  prompt: `You are an expert AI assistant for legal and financial due diligence. A user will ask for a due diligence checklist for a specific deal or audit type for a company based in {{legalRegion}}.

Generate a comprehensive due diligence checklist based on the user's request: "{{dealType}}" for a company in {{legalRegion}}.

Your response should be a structured checklist with a clear title. For each task, provide a concise action and assign it to a relevant due diligence category (e.g., "Corporate Records", "Financial Information", "Intellectual Property", "Material Contracts", "Employee Matters", "Litigation"). The checklist items should be relevant to the legal and business environment of {{legalRegion}}. Be thorough and professional.
`,
});

const generateChecklistFlow = ai.defineFlow(
  {
    name: 'generateChecklistFlow',
    inputSchema: GenerateChecklistInputSchema,
    outputSchema: GenerateChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a checklist.");
    }
    return output;
  }
);
