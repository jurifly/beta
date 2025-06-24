'use server';
/**
 * @fileOverview An AI flow for summarizing legal documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentSummarizerInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the file being summarized.'),
});
export type DocumentSummarizerInput = z.infer<typeof DocumentSummarizerInputSchema>;

const DocumentSummarizerOutputSchema = z.object({
  summary: z.string().describe("A concise, plain-language summary of the document's key points, purpose, and obligations. Format in markdown."),
});
export type DocumentSummarizerOutput = z.infer<typeof DocumentSummarizerOutputSchema>;

export async function summarizeDocument(input: DocumentSummarizerInput): Promise<DocumentSummarizerOutput> {
  return documentSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentSummarizerPrompt',
  input: {schema: DocumentSummarizerInputSchema},
  output: {schema: DocumentSummarizerOutputSchema},
  prompt: `You are an expert AI legal assistant. Your task is to read the following document and provide a concise, easy-to-understand summary in plain language.

Document Name: "{{fileName}}"
Document Content:
{{media url=fileDataUri}}

Please provide the following in your summary:
1.  **Purpose**: What is this document for?
2.  **Key Parties**: Who is involved?
3.  **Main Obligations**: What are the most important responsibilities for each party?
4.  **Key Dates or Terms**: Are there any critical dates, deadlines, or terms to be aware of?

Present the summary in clear markdown format.
`,
});

const documentSummarizerFlow = ai.defineFlow(
  {
    name: 'documentSummarizerFlow',
    inputSchema: DocumentSummarizerInputSchema,
    outputSchema: DocumentSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a document summary.');
    }
    return output;
  }
);
