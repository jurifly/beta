
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
  legalRegion: z.string().describe('The country/legal region for the compliance context, e.g., "India", "USA".'),
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
  prompt: `You are an expert AI compliance auditor with deep knowledge of frameworks like SOC 2, ISO 27001, and data privacy laws (like GDPR, DPDP), with specific expertise in the regulations of {{legalRegion}}. Your task is to review a policy document against a specified compliance framework and provide a structured, actionable analysis.

Compliance Framework: "{{framework}}"
Legal Region: "{{legalRegion}}"

Document to Analyze:
{{media url=fileDataUri}}

Please perform a detailed analysis by following these steps:
1.  **Cross-Reference Controls**: Systematically check the document against the key control families of the selected framework, considering any specific requirements or nuances for {{legalRegion}}. For example, for SOC2, analyze against the Trust Services Criteria. For GDPR, check against principles like data minimization, consent, and user rights, noting any local variations.

2.  **Calculate Readiness Score**: Based on your analysis, provide a numerical score from 0 (not ready) to 100 (fully compliant). A higher score indicates better alignment with the framework.

3.  **Write a Summary**: Provide a concise executive summary of the document's strengths and weaknesses in relation to the framework and {{legalRegion}} regulations.

4.  **Identify Gaps & Recommendations**: Identify key policies, controls, or sections that are required by the framework but seem to be missing or insufficient in the document. For each missing item, provide a clear, actionable recommendation on how to remediate the gap.

**CRITICAL QUALITY CONTROL**: Before returning your response, you MUST act as a meticulous editor. Your analysis must be professional, well-written, and completely free of any spelling or grammatical errors. Be thorough, professional, and precise.

Return your analysis in the specified JSON format.
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
      throw new Error("The AI failed to generate a compliance analysis. Please try again.");
    }
    return output;
  }
);
