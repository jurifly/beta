
'use server';
/**
 * @fileOverview An AI flow for analyzing legal contracts from a file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeContractInputSchema = z.object({
  fileDataUri: z.string().describe("The contract document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeContractInput = z.infer<typeof AnalyzeContractInputSchema>;

const RiskFlagSchema = z.object({
  clause: z.string().describe("The specific clause or section containing the risk."),
  risk: z.string().describe("A concise description of the potential risk."),
});

const AnalyzeContractOutputSchema = z.object({
  summary: z.string().describe("A brief, high-level summary of the contract's purpose and main parties."),
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
  1.  **Summary**: A brief, neutral summary of the contract's purpose.
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
