
'use server';
/**
 * @fileOverview An AI flow for validating documents against compliance frameworks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceValidatorInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The policy document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  framework: z.string().describe('The compliance framework to validate against (e.g., "SOC2", "ISO27001", "GDPR").'),
});
export type ComplianceValidatorInput = z.infer<typeof ComplianceValidatorInputSchema>;

const MissingItemSchema = z.object({
    item: z.string().describe("The specific missing control or policy item."),
    recommendation: z.string().describe("A recommendation on how to address the missing item."),
});

const ComplianceValidatorOutputSchema = z.object({
  readinessScore: z.number().min(0).max(100).describe("A numerical score from 0 (not ready) to 100 (fully ready) representing the compliance readiness level."),
  summary: z.string().describe("A concise summary of the document's compliance status against the selected framework."),
  missingItems: z.array(MissingItemSchema).describe("A list of policies or controls that are required by the framework but appear to be missing or incomplete in the document."),
});
export type ComplianceValidatorOutput = z.infer<typeof ComplianceValidatorOutputSchema>;

export async function validateCompliance(input: ComplianceValidatorInput): Promise<ComplianceValidatorOutput> {
  return complianceValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceValidatorPrompt',
  input: {schema: ComplianceValidatorInputSchema},
  output: {schema: ComplianceValidatorOutputSchema},
  prompt: `You are an expert AI compliance auditor. Your task is to review a policy document against a specified compliance framework and provide a structured analysis.

Compliance Framework: "{{framework}}"

Document to Analyze:
{{media url=fileDataUri}}

Please analyze the document and provide the following:
1.  **Readiness Score**: A numerical score from 0 (not ready) to 100 (fully compliant) representing the document's readiness for the selected framework.
2.  **Summary**: A concise summary of the document's strengths and weaknesses in relation to the framework.
3.  **Missing Items**: Identify key policies, controls, or sections that are required by the framework but seem to be missing or insufficient in the document. For each missing item, provide a clear recommendation.

Return your analysis in the specified JSON format. Be thorough and professional.
`,
});

const complianceValidatorFlow = ai.defineFlow(
  {
    name: 'complianceValidatorFlow',
    inputSchema: ComplianceValidatorInputSchema,
    outputSchema: ComplianceValidatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a compliance analysis.');
    }
    return output;
  }
);
