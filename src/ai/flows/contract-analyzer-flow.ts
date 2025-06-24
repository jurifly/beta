
'use server';
/**
 * @fileOverview An AI flow for analyzing legal contracts from a file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeContractInputSchema = z.object({
  fileDataUri: z.string().describe("The contract document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeContractInput = z.infer<typeof AnalyzeContractInputSchema>;

const RiskFlagSchema = z.object({
  clause: z.string().describe("The specific clause or section containing the risk."),
  risk: z.string().describe("A concise description of the potential risk."),
});

const DetailedSummarySchema = z.object({
    contractType: z.string().describe("The type of contract, e.g., 'Non-Disclosure Agreement', 'Employment Contract'."),
    parties: z.array(z.string()).describe("The names of the parties involved in the contract."),
    effectiveDate: z.string().describe("The effective date of the contract, in YYYY-MM-DD format if available."),
    purpose: z.string().describe("A concise summary of the contract's main purpose."),
    keyObligations: z.array(z.string()).describe("A bulleted list of the main responsibilities for each party."),
});

const AnalyzeContractOutputSchema = z.object({
  summary: DetailedSummarySchema.describe("A detailed breakdown of the contract's key components."),
  riskScore: z.number().min(0).max(100).describe("A numerical score from 0 (very high risk) to 100 (very low risk) representing the overall risk level of the contract."),
  riskFlags: z.array(RiskFlagSchema).describe("A list of potential risks, liabilities, or unfavorable terms for the user."),
  missingClauses: z.array(z.string()).describe("A list of standard clauses that are recommended but appear to be missing from the contract."),
});
export type AnalyzeContractOutput = z.infer<typeof AnalyzeContractOutputSchema>;


export async function analyzeContract(input: AnalyzeContractInput): Promise<AnalyzeContractOutput> {
  return analyzeContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeContractPrompt',
  input: { schema: AnalyzeContractInputSchema },
  output: { schema: AnalyzeContractOutputSchema },
  prompt: `You are an expert AI legal assistant specializing in contract analysis for Indian law. Your task is to review the following legal contract and provide a structured analysis.

  Contract Document:
  {{media url=fileDataUri}}

  Please analyze the contract and provide the following:
  1.  **Summary**: A detailed, structured breakdown of the contract's key components. This should include:
      - **Contract Type**: The specific type of contract (e.g., "Employment Agreement", "Lease Agreement").
      - **Parties**: The full legal names of all parties involved.
      - **Effective Date**: The date the contract becomes effective. State if it is not explicitly mentioned.
      - **Purpose**: A clear, one or two-sentence summary of what the contract is for.
      - **Key Obligations**: A list of the most critical obligations and responsibilities for each party.
  2.  **Risk Score**: A numerical score from 0 (very high risk) to 100 (very low risk) representing the overall risk level.
  3.  **Risk Flags**: Identify potential risks, liabilities, or unfavorable terms. For each, specify the clause and the nature of the risk.
  4.  **Missing Clauses**: Suggest any standard or important clauses that seem to be missing.

  Return your analysis in the specified JSON format. Be thorough and professional.
  `,
});

const analyzeContractFlow = ai.defineFlow(
  {
    name: 'analyzeContractFlow',
    inputSchema: AnalyzeContractInputSchema,
    outputSchema: AnalyzeContractOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a contract analysis.');
    }
    return output;
  }
);
