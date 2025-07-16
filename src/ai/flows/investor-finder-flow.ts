
'use server';
/**
 * @fileOverview An AI flow for finding relevant investors for a startup.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const InvestorFinderInputSchema = z.object({
  industry: z.string().describe("The industry or sector of the startup (e.g., 'SaaS', 'Fintech', 'Healthtech')."),
  stage: z.string().describe("The current funding stage of the startup (e.g., 'Pre-seed', 'Seed', 'Series A')."),
  location: z.string().describe('The primary state of operation (e.g., "Bengaluru", "Delhi NCR", "Mumbai").'),
  legalRegion: z.string().describe('The country/legal region for the business, e.g., "India", "USA".'),
});
export type InvestorFinderInput = z.infer<typeof InvestorFinderInputSchema>;

const InvestorSchema = z.object({
    firmName: z.string().describe("The name of the VC firm or Angel Network."),
    sectorFocus: z.string().describe("A comma-separated list of their primary investment sectors."),
    chequeSize: z.string().describe("Their typical investment size range, e.g., '$100k - $500k', '₹1 Cr - ₹5 Cr'."),
    website: z.string().url().describe("The official website URL of the firm."),
    linkedin: z.string().url().describe("The official LinkedIn page URL for the firm."),
    keyPartners: z.array(z.object({
        name: z.string().describe("Full name of the key partner or decision-maker."),
        linkedin: z.string().url().describe("The LinkedIn profile URL of the partner."),
    })).describe("A list of 1-2 key partners at the firm."),
    portfolio: z.array(z.string()).optional().describe("A few notable portfolio companies."),
});

const InvestorFinderOutputSchema = z.object({
  investors: z.array(InvestorSchema).describe('A curated list of 10-15 relevant investors.'),
});
export type InvestorFinderOutput = z.infer<typeof InvestorFinderOutputSchema>;

export async function findInvestors(input: InvestorFinderInput): Promise<InvestorFinderOutput> {
  return investorFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investorFinderPrompt',
  input: {schema: InvestorFinderInputSchema},
  output: {schema: InvestorFinderOutputSchema},
  prompt: `You are an expert startup fundraising analyst with deep knowledge of the Venture Capital and Angel Investor ecosystem in {{legalRegion}}, particularly in Asia.

Your task is to generate a curated list of 10-15 active and relevant investors for the following startup profile. You must filter out outdated or irrelevant firms.

**Startup Profile:**
- Industry: {{industry}}
- Stage: {{stage}}
- Location: {{location}}
- Region: {{legalRegion}}

For each investor you recommend, you MUST provide the following details:
-   **VC Firm Name**: The official name.
-   **Sector Focus**: Key areas they invest in.
-   **Typical Cheque Size / Stage**: Their usual investment range and stage focus.
-   **Website**: The official, working website URL.
-   **LinkedIn Page**: The official LinkedIn page URL for the firm.
-   **Key Partners**: 1-2 key investment decision-makers at the firm, with their full names and direct LinkedIn profile URLs.
-   **Portfolio Startups**: 2-3 relevant or well-known portfolio companies.

**CRITICAL QUALITY CONTROL**: You MUST verify the data to the best of your ability. Ensure all links are correct and direct. The provided list must be highly relevant to the startup's profile. Prioritize investors known to be active in the last 12-18 months.
`,
});

const investorFinderFlow = ai.defineFlow(
  {
    name: 'investorFinderFlow',
    inputSchema: InvestorFinderInputSchema,
    outputSchema: InvestorFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate investor recommendations. Please try again.");
    }
    return output;
  }
);
