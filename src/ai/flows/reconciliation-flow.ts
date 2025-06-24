
'use server';
/**
 * @fileOverview An AI flow for reconciling financial documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReconciliationInputSchema = z.object({
  gstDataUri: z
    .string()
    .describe(
      "The GST filing document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  rocDataUri: z
    .string()
    .describe(
      "The ROC filing document as a data URI that must include a MIME type and use Base64 encoding."
    ),
    itrDataUri: z
    .string()
    .describe(
      "The ITR filing document as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type ReconciliationInput = z.infer<typeof ReconciliationInputSchema>;

const MatchedItemSchema = z.object({
    field: z.string().describe("The financial field being matched, e.g., 'Total Revenue', 'Profit Before Tax'."),
    gstValue: z.string().describe("The value from the GST document."),
    rocValue: z.string().describe("The value from the ROC document."),
    itrValue: z.string().describe("The value from the ITR document."),
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
  prompt: `You are an expert AI financial auditor specializing in reconciling Indian compliance documents. Your task is to compare three documents: a GST filing, an ROC (MCA) filing, and an ITR (Income Tax Return).

Analyze the key financial figures across these three documents:
- GST Filing: {{media url=gstDataUri}}
- ROC Filing: {{media url=rocDataUri}}
- ITR Filing: {{media url=itrDataUri}}

Your goal is to identify matches and discrepancies.

1.  **Reconciliation**: Compare values for key fields like Total Revenue, Gross Profit, Net Profit, Taxes Paid, etc.
2.  **Matched Items**: For figures that are consistent across all three documents, list them under 'matchedItems'.
3.  **Discrepancies**: If a value for a key field differs between any of the documents, flag it as a discrepancy. For each discrepancy, list the values from each source document and provide a likely reason for the mismatch (e.g., "Difference in reporting standards", "Input tax credit differences").
4.  **Summary**: Provide a short, professional summary of your findings.
5.  **Overall Status**: Set the 'overallStatus' to "Matched" if all key figures align, or "Discrepancies Found" otherwise.

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
