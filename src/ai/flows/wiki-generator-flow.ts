'use server';
/**
 * @fileOverview An AI flow for generating an internal wiki page from a policy document.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WikiGeneratorInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The policy document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentTitle: z.string().describe('The title of the policy document (e.g., "Terms of Service").'),
});
export type WikiGeneratorInput = z.infer<typeof WikiGeneratorInputSchema>;

const WikiGeneratorOutputSchema = z.object({
  wikiContent: z.string().describe("A markdown-formatted wiki page summarizing the policy document for internal employee reference."),
});
export type WikiGeneratorOutput = z.infer<typeof WikiGeneratorOutputSchema>;

export async function generateWiki(input: WikiGeneratorInput): Promise<WikiGeneratorOutput> {
  return wikiGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'wikiGeneratorPrompt',
  input: {schema: WikiGeneratorInputSchema},
  output: {schema: WikiGeneratorOutputSchema},
  prompt: `You are an AI assistant that creates simple, clear internal wiki pages from complex legal and policy documents. Your audience is employees who need to understand the key takeaways without reading the full document.

Generate a wiki page for the document titled: "{{documentTitle}}"
Document Content:
{{media url=fileDataUri}}

Structure the wiki page with the following sections using markdown:
-   **What is this policy for?** (A brief, one-sentence explanation)
-   **Why is this important?** (Explain the impact on employees or the company)
-   **Key Guidelines & Rules** (A bulleted list of the most important do's and don'ts)
-   **Who to contact for questions?** (Suggest a generic role, e.g., "the HR department" or "the Legal team")

The tone should be helpful and straightforward. Use markdown for headings, bold text, and lists.
`,
});

const wikiGeneratorFlow = ai.defineFlow(
  {
    name: 'wikiGeneratorFlow',
    inputSchema: WikiGeneratorInputSchema,
    outputSchema: WikiGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a wiki page.');
    }
    return output;
  }
);
