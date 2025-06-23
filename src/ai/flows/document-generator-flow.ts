'use server';
/**
 * @fileOverview An AI flow for generating legal documents from templates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentGeneratorInputSchema = z.object({
  templateName: z.string().describe('The name of the legal template to generate.'),
});
export type DocumentGeneratorInput = z.infer<typeof DocumentGeneratorInputSchema>;

const DocumentGeneratorOutputSchema = z.object({
  title: z.string().describe('The title of the generated document.'),
  content: z.string().describe('The full text content of the generated legal document, formatted as plain text with line breaks.'),
});
export type DocumentGeneratorOutput = z.infer<typeof DocumentGeneratorOutputSchema>;

export async function generateDocument(input: DocumentGeneratorInput): Promise<DocumentGeneratorOutput> {
  return documentGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentGeneratorPrompt',
  input: {schema: DocumentGeneratorInputSchema},
  output: {schema: DocumentGeneratorOutputSchema},
  prompt: `You are an expert AI legal document assistant. Your task is to generate a complete and professional legal document based on the provided template name.

Template Name: "{{templateName}}"

Generate the full document text as plain text. The document should be comprehensive and ready for use. Use placeholders like "[Party A Name]" or "[Date]" where user input would be required. The 'title' field in your output should be the document's main title. Ensure the content is well-structured with clear paragraphs and line breaks.
`,
});

const documentGeneratorFlow = ai.defineFlow(
  {
    name: 'documentGeneratorFlow',
    inputSchema: DocumentGeneratorInputSchema,
    outputSchema: DocumentGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
