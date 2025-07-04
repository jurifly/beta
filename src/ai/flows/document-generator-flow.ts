
'use server';
/**
 * @fileOverview An AI flow for generating legal documents from templates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentGeneratorInputSchema = z.object({
  templateName: z.string().describe('The name of the legal template to generate.'),
  legalRegion: z.string().describe('The country/legal region for which to generate the document, e.g., "India", "USA".'),
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
  prompt: `You are an expert AI legal document assistant and a meticulous editor. Your task is to generate a complete and professional legal document based on the provided template name, tailored for use in {{legalRegion}}.

Template Name: "{{templateName}}"
Legal Region: "{{legalRegion}}"

Generate the full document text as plain text. The document should be comprehensive and ready for use. Use placeholders like "[Party A Name]" or "[Date]" where user input would be required. The 'title' field in your output should be the document's main title. 

**Quality Control**: Before finalizing your response, you must act as a meticulous editor and critically proofread the entire document for any spelling mistakes, grammatical errors, or formatting issues. The final output must be polished and professional.

Ensure the content is well-structured with clear paragraphs, line breaks, and terminology appropriate for {{legalRegion}}.
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
