
'use server';
/**
 * @fileOverview A multi-purpose document intelligence engine.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentIntelligenceInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  fileName: z.string().describe('The name of the file being analyzed.'),
});
export type DocumentIntelligenceInput = z.infer<typeof DocumentIntelligenceInputSchema>;

const DocumentTypeEnum = z.enum([
  'Legal Contract',
  'Government Notice',
  'Termination/Warning Letter',
  'Compliance Filing',
  'Other',
]);

const RiskFlagSchema = z.object({
  clause: z.string().describe("The specific clause, section, or part of the document containing the risk."),
  risk: z.string().describe("A concise description of the potential risk or issue."),
  severity: z.enum(['High', 'Medium', 'Low']).describe("The severity level of the identified risk."),
});

const ReminderSuggestionSchema = z.object({
    title: z.string().describe("A short, clear title for the reminder."),
    date: z.string().describe("The suggested reminder date in YYYY-MM-DD format. This should be a few days before the actual deadline if one is found."),
});

const ReplySuggestionSchema = z.object({
    title: z.string().describe("A suitable title for the suggested reply, e.g., 'Draft Reply to Income Tax Notice'."),
    content: z.string().describe("A professionally drafted, complete reply to the notice. Use markdown for formatting."),
});

const DocumentIntelligenceOutputSchema = z.object({
  documentType: DocumentTypeEnum.describe("The detected type of the document."),
  summary: z.string().describe("A concise, bullet-point summary of the document's key points, purpose, and obligations, in layman's terms."),
  riskFlags: z.array(RiskFlagSchema).describe("A list of potential risks, liabilities, or unfavorable terms identified in the document."),
  replySuggestion: ReplySuggestionSchema.optional().nullable().describe("If the document is a notice that requires a response, provide a suggested draft reply here. Otherwise, omit this field."),
  reminder: ReminderSuggestionSchema.optional().nullable().describe("If a deadline or follow-up date is mentioned, suggest a reminder. Otherwise, omit this field."),
});
export type DocumentIntelligenceOutput = z.infer<typeof DocumentIntelligenceOutputSchema>;

export async function analyzeDocument(input: DocumentIntelligenceInput): Promise<DocumentIntelligenceOutput> {
  return documentIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentIntelligencePrompt',
  input: {schema: DocumentIntelligenceInputSchema},
  output: {schema: DocumentIntelligenceOutputSchema},
  prompt: `You are an expert AI Legal and Compliance Analyst with deep expertise in Indian corporate law. Your task is to comprehensively analyze the provided document and return a structured analysis.

Document to Analyze: "{{fileName}}"
{{media url=fileDataUri}}

Perform the following steps and provide the output in the specified JSON format:

1.  **Classify Document Type**: First, determine the type of document from the following options: 'Legal Contract', 'Government Notice', 'Termination/Warning Letter', 'Compliance Filing', 'Other'.

2.  **Generate a Smart Summary**: Create a concise, easy-to-understand summary of the document. Explain what it's about, its purpose, and any key takeaways in simple bullet points.

3.  **Identify Risk Flags**: Scrutinize the document for any potential risks, liabilities, or unfavorable terms. Be highly specific.
    *   For a 'Legal Contract', look for penalty clauses, unilateral indemnity clauses, ambiguous termination conditions, restrictive non-compete clauses, unfavorable jurisdiction, or long lock-in periods.
    *   For a 'Government Notice', identify the core issue, potential legal implications (e.g., citation of a specific section of the Income Tax Act or Companies Act), and any mentioned deadlines.
    *   For any document, flag items that require urgent attention.
    *   Assign a 'High', 'Medium', or 'Low' severity to each risk. If no risks are found, return an empty array.

4.  **Suggest a Reply (If Applicable)**: If and only if the document is a 'Government Notice', a 'Termination/Warning Letter', or any other document that clearly requires a formal response, generate a complete, professionally drafted reply. The reply should be structured, respectful, and address the core points of the notice. Use markdown for formatting. If no reply is needed, omit the 'replySuggestion' field.

5.  **Suggest a Reminder (If Applicable)**: If the document contains a specific deadline, response date, or a clear follow-up action with a timeframe, suggest a reminder. The reminder date should be set a few days *before* the actual deadline. If no clear date or timeframe is found, omit the 'reminder' field.
`,
});

const documentIntelligenceFlow = ai.defineFlow(
  {
    name: 'documentIntelligenceFlow',
    inputSchema: DocumentIntelligenceInputSchema,
    outputSchema: DocumentIntelligenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to analyze the document.');
    }
    return output;
  }
);
