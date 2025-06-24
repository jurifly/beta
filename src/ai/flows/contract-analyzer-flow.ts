'use server';
/**
 * @fileOverview An AI flow for analyzing legal contracts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ContractAnalyzerInputSchema = z.object({
  contractText: z.string().min(100, "Contract text must be at least 100 characters.").describe("The full text of the legal contract to be analyzed."),
});
export type ContractAnalyzerInput = z.infer<typeof ContractAnalyzerInputSchema>;

const KeyTermSchema = z.object({
  term: z.string().describe("The identified key term or clause title."),
  explanation: z.string().describe("A concise explanation of the term's significance in the contract."),
});

const RiskItemSchema = z.object({
  risk: z.string().describe("A description of the potential risk found in the contract."),
  severity: z.enum(["High", "Medium", "Low"]).describe("The assessed severity of the risk."),
  recommendation: z.string().describe("A suggested action or revision to mitigate the risk."),
});

export const ContractAnalyzerOutputSchema = z.object({
  summary: z.string().describe("A brief, high-level summary of the contract's purpose and main parties."),
  keyTerms: z.array(KeyTermSchema).describe("A list of important terms and clauses identified in the contract."),
  risks: z.array(RiskItemSchema).describe("A list of potential risks, liabilities, or unfavorable terms for the user."),
  missingClauses: z.array(z.string()).describe("A list of standard clauses that are recommended but appear to be missing from the contract."),
});
export type ContractAnalyzerOutput = z.infer<typeof ContractAnalyzerOutputSchema>;

export async function analyzeContract(input: ContractAnalyzerInput): Promise<ContractAnalyzerOutput> {
  return contractAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contractAnalyzerPrompt',
  input: { schema: ContractAnalyzerInputSchema },
  output: { schema: ContractAnalyzerOutputSchema },
  prompt: `You are an expert AI legal assistant specializing in contract analysis for Indian law. Your task is to review the following legal contract and provide a structured analysis.

  Contract Text:
  """
  {{{contractText}}}
  """

  Please analyze the contract and provide the following:
  1.  **Summary**: A brief, neutral summary of the contract's purpose.
  2.  **Key Terms**: Identify and explain the most important terms and clauses.
  3.  **Risks**: Identify potential risks, liabilities, or unfavorable terms. For each risk, assess its severity (High, Medium, or Low) and provide a clear recommendation for mitigation.
  4.  **Missing Clauses**: Suggest any standard or important clauses that seem to be missing from the contract.

  Return your analysis in the specified JSON format. Be thorough and professional.
  `,
});

const contractAnalyzerFlow = ai.defineFlow(
  {
    name: 'contractAnalyzerFlow',
    inputSchema: ContractAnalyzerInputSchema,
    outputSchema: ContractAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a contract analysis.');
    }
    return output;
  }
);
