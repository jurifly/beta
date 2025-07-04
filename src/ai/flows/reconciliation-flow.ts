
'use server';
/**
 * @fileOverview An AI flow for reconciling financial documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReconciliationInputSchema = z.object({
  doc1Name: z.string().describe("Name of the first document (e.g., GST Filing)."),
  doc1DataUri: z
    .string()
    .describe(
      "The first document as a data URI."
    ),
  doc2Name: z.string().describe("Name of the second document (e.g., ROC Filing)."),
  doc2DataUri: z
    .string()
    .describe(
      "The second document as a data URI."
    ),
  doc3Name: z.string().describe("Name of the third document (e.g., ITR Filing)."),
  doc3DataUri: z
    .string()
    .describe(
      "The third document as a data URI."
    ),
  legalRegion: z.string().describe("The country/legal region for the compliance context."),
});
export type ReconciliationInput = z.infer<typeof ReconciliationInputSchema>;

const MatchedItemSchema = z.object({
    field: z.string().describe("The financial field being matched, e.g., 'Total Revenue', 'Profit Before Tax'."),
    value: z.string().describe("The consistent value found across documents."),
});

const DiscrepancySchema = z.object({
    field: z.string().describe("The financial field with a discrepancy."),
    values: z.array(z.object({
        source: z.string().describe("The source document, e.g., 'GST', 'ROC', 'ITR'."),
        value: z.string().describe("The value found in that document."),
    })),
    reason: z.string().describe("A brief explanation of the likely reason for the mismatch."),
});


const ReconciliationOutputSchema = z.object({
  overallStatus: z.enum(["Matched", "Discrepancies Found"]).describe("The overall reconciliation status."),
  summary: z.string().describe("A brief summary of the reconciliation findings."),
  matchedItems: z.array(MatchedItemSchema).describe("A list of key financial figures that match across documents."),
  discrepancies: z.array(DiscrepancySchema).describe("A list of discrepancies found between the documents."),
});
export type ReconciliationOutput = z.infer<typeof ReconciliationOutputSchema>;

export async function reconcileDocuments(input: ReconciliationInput): Promise<ReconciliationOutput> {
  return reconciliationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reconciliationPrompt',
  input: {schema: ReconciliationInputSchema},
  output: {schema: ReconciliationOutputSchema},
  prompt: `You are an expert AI financial auditor specializing in reconciling compliance documents for companies in {{legalRegion}}. Your task is to compare three financial documents.

Analyze the key financial figures across these three documents:
- Document 1 ({{doc1Name}}): {{media url=doc1DataUri}}
- Document 2 ({{doc2Name}}): {{media url=doc2DataUri}}
- Document 3 ({{doc3Name}}): {{media url=doc3DataUri}}

Your goal is to identify matches and discrepancies.

1.  **Reconciliation**: Compare values for key fields like Total Revenue, Gross Profit, Net Profit, Taxes Paid, etc.
2.  **Matched Items**: For figures that are consistent across all three documents, list them under 'matchedItems'. Each item in this list should be an object with a 'field' (e.g., 'Total Revenue') and a 'value' (the consistent monetary value).
3.  **Discrepancies**: If a value for a key field differs between any of the documents, flag it as a discrepancy. For each discrepancy, list the values from each source document and provide a likely reason for the mismatch (e.g., "Difference in reporting standards", "Timing differences in tax credits").
4.  **Summary**: Provide a short, professional summary of your findings.
5.  **Overall Status**: Set the 'overallStatus' to "Matched" if all key figures align, or "Discrepancies Found" otherwise.

Ensure the \`summary\` and \`reason\` fields are written clearly and professionally, with no spelling errors.

Return your analysis in the specified JSON format.
`,
});

const reconciliationFlow = ai.defineFlow(
  {
    name: 'reconciliationFlow',
    inputSchema: ReconciliationInputSchema,
    outputSchema: ReconciliationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a reconciliation report.');
    }
    return output;
  }
);
