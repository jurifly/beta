
'use server';
/**
 * @fileOverview An AI flow for generating a realistic list of compliance filings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { format } from 'date-fns';

const FilingGeneratorInputSchema = z.object({
  companyType: z.string().describe('The legal type of the company (e.g., "Private Limited Company", "LLC").'),
  incorporationDate: z.string().describe("The company's date of incorporation in YYYY-MM-DD format."),
  currentDate: z.string().describe("The current date in YYYY-MM-DD format, to be used as a reference for generating deadlines."),
  legalRegion: z.string().describe('The country/legal region for the company, e.g., "India", "USA".'),
});
export type FilingGeneratorInput = z.infer<typeof FilingGeneratorInputSchema>;

const FilingItemSchema = z.object({
    date: z.string().describe("The due date of the filing in YYYY-MM-DD format."),
    title: z.string().describe("The name of the compliance filing (e.g., 'GSTR-3B Filing', 'Annual Report Filing')."),
    type: z.enum(["Corporate Filing", "Tax Filing", "Other Task"]).describe("The category of the filing."),
    status: z.enum(["overdue", "upcoming", "completed"]).describe("The status of the filing based on the provided current date."),
});

const FilingGeneratorOutputSchema = z.object({
    filings: z.array(FilingItemSchema).describe("A list of plausible compliance filings for a full year.")
});
export type FilingGeneratorOutput = z.infer<typeof FilingGeneratorOutputSchema>;

export async function generateFilings(input: FilingGeneratorInput): Promise<FilingGeneratorOutput> {
  return filingGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filingGeneratorPrompt',
  input: {schema: FilingGeneratorInputSchema},
  output: {schema: FilingGeneratorOutputSchema},
  prompt: `You are an expert compliance officer AI. Your task is to generate a realistic and actionable list of key compliance filings for a company based on the provided data.

**Reference Current Date for Status Calculation**: {{currentDate}}
**Company Incorporation Date**: {{incorporationDate}}
**Company Type**: {{companyType}}
**Legal Region**: {{legalRegion}}

Use the following dataset as your **only source of truth**. First, find the section that matches the company's Legal Region and Type. Then, generate a list of all relevant compliance tasks.

**Instructions**:
1.  **Calculate Due Dates**: All due dates must be calculated based on the \`incorporationDate\`. For example, "Within 30 days of incorporation" means \`incorporationDate\` + 30 days. For annual tasks (e.g., "By 30 September every year"), calculate the *next* upcoming due date based on the \`currentDate\`.
2.  **Calculate for Full Year**: Generate all relevant compliance tasks for a full 12-month period starting from the \`currentDate\`. Include any recently overdue tasks from the last 2 months.
3.  **Determine Status**: The 'status' for each filing MUST be correctly set to 'overdue' or 'upcoming' by comparing its calculated due date to the \`currentDate\`.
4.  **Lifecycle Awareness**: For a newly incorporated company, prioritize initial filings. For an older company, prioritize recurring annual/quarterly filings.
5.  **Data-Driven**: Do not invent filings. Stick to the tasks listed in the provided dataset for the relevant jurisdiction and company type. Assign a 'type' (Corporate Filing, Tax Filing, Other Task) based on the task description.

**Compliance Datasets**:

---

🇮🇳 **India — Pvt Ltd Company** (INC Date = Day 0)
*   **Task**: Open bank account | **Due By**: Within 30 days of incorporation
*   **Task**: Auditor appointment (ADT-1) | **Due By**: Within 30 days of incorporation
*   **Task**: Issue share certificates | **Due By**: Within 60 days of incorporation
*   **Task**: First board meeting | **Due By**: Within 30 days of incorporation
*   **Task**: File for Commencement of Business (INC-20A) | **Due By**: Within 180 days of incorporation
*   **Task**: GST registration (if turnover > 40L) | **Due By**: As soon as threshold crossed
*   **Task**: MSME registration (optional) | **Due By**: Recommended within 90 days
*   **Task**: Professional tax registration | **Due By**: Within 30 days (in applicable states)
*   **Task**: ROC annual return (MGT-7) | **Due By**: Every year within 60 days of AGM
*   **Task**: Financial statements (AOC-4) | **Due By**: Every year within 30 days of AGM
*   **Task**: Director KYC (DIR-3 KYC) | **Due By**: Before 30 September every year
*   **Task**: Income tax return (ITR-6) | **Due By**: By 31 October every year (if audited)
*   **Task**: TDS returns | **Due By**: Quarterly (15th of April, July, Oct, Jan)
*   **Task**: Board meetings | **Due By**: At least 4 times per year (suggest quarterly)

---

🇮🇳 **India — LLP (Limited Liability Partnership)**
*   **Task**: LLP Agreement filing (Form 3) | **Due By**: Within 30 days of incorporation
*   **Task**: PAN/TAN application | **Due By**: Immediately after incorporation
*   **Task**: GST registration (if applicable) | **Due By**: ASAP if threshold crossed
*   **Task**: Annual return (Form 11) | **Due By**: By 30 May every year
*   **Task**: Statement of accounts (Form 8) | **Due By**: By 30 October every year
*   **Task**: Income tax return | **Due By**: By 31 July (non-audit) or 31 Oct (audit) every year

---

🇮🇳 **India — Sole Proprietorship**
*   **Task**: GST registration | **Due By**: If turnover exceeds ₹40 lakhs
*   **Task**: Shop & establishment license | **Due By**: Within 30 days of start
*   **Task**: Udyam/MSME registration | **Due By**: Optional but recommended
*   **Task**: Income tax return | **Due By**: By 31 July every year
*   **Task**: TDS (if hiring employees/contractors) | **Due By**: Monthly deduction & quarterly filing

---

🇺🇸 **USA — Delaware C-Corp**
*   **Task**: Obtain EIN (Employer ID Number) | **Due By**: Immediately after incorporation
*   **Task**: Open US bank account | **Due By**: Within 3 months
*   **Task**: Appoint Registered Agent | **Due By**: Annually
*   **Task**: Delaware Franchise Tax & Annual Report | **Due By**: By 1 March every year
*   **Task**: Federal income tax filing (Form 1120) | **Due By**: By 15 April every year
*   **Task**: State income tax filing (if applicable) | **Due By**: Varies by state (use a placeholder)

---

🇬🇧 **UK — Limited Company**
*   **Task**: Register for Corporation Tax | **Due By**: Within 3 months of starting trade
*   **Task**: VAT registration (if >£85,000 turnover) | **Due By**: ASAP upon crossing threshold
*   **Task**: Confirmation Statement (annual return) | **Due By**: Every year within 14 days of anniversary of incorporation date
*   **Task**: Annual accounts filing | **Due By**: 9 months after financial year-end
*   **Task**: Corporation tax return | **Due By**: 12 months after financial year-end

---

🇸🇬 **Singapore — Private Limited Company**
*   **Task**: Register for GST (if >S$1M turnover) | **Due By**: Within 30 days of threshold
*   **Task**: Open Corporate bank account | **Due By**: Within 2 months
*   **Task**: Hold Annual General Meeting (AGM) | **Due By**: Within 6 months of financial year-end
*   **Task**: File Annual Return (AR) with ACRA | **Due By**: Within 7 months of financial year-end
*   **Task**: File Estimated Chargeable Income (ECI) | **Due By**: Within 3 months of financial year-end

---

🇦🇺 **Australia — Proprietary Limited Company (Pty Ltd)**
*   **Task**: Apply for TFN/ABN | **Due By**: Immediately after incorporation
*   **Task**: Register for GST (if >AUD 75,000 turnover) | **Due By**: ASAP upon crossing threshold
*   **Task**: Complete ASIC annual review | **Due By**: Every year on anniversary date
*   **Task**: Lodge income tax return | **Due By**: By 31 October every year

---

🇨🇦 **Canada — Federal Corporation**
*   **Task**: Obtain CRA business number | **Due By**: Immediately after incorporation
*   **Task**: Register for GST/HST (if >CAD 30,000 turnover) | **Due By**: ASAP upon crossing threshold
*   **Task**: File annual return (Corporations Canada) | **Due By**: Every year within 60 days of anniversary date
*   **Task**: File T2 corporate tax return | **Due By**: Within 6 months of fiscal year-end

Return the response in the specified JSON format.
`,
});

const filingGeneratorFlow = ai.defineFlow(
  {
    name: 'filingGeneratorFlow',
    inputSchema: FilingGeneratorInputSchema,
    outputSchema: FilingGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a list of filings.");
    }
    // If the AI fails to generate filings, return some generic ones.
    if (output.filings.length === 0) {
      output.filings.push(
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Open Company Bank Account', type: 'Other Task', status: 'upcoming' },
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Apply for GST Registration', type: 'Tax Filing', status: 'upcoming' },
        { date: format(new Date(input.currentDate), 'yyyy-MM-dd'), title: 'Finalize Founders Agreement', type: 'Corporate Filing', status: 'upcoming' },
      )
    }
    return output;
  }
);
