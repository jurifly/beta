
'use server';
/**
 * @fileOverview An AI flow for generating a realistic list of compliance filings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { format, addDays, addMonths } from 'date-fns';

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
    description: z.string().describe("A brief explanation of what this filing or task is about."),
    penalty: z.string().describe("The penalty or consequence for non-compliance."),
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

**CRITICAL INSTRUCTIONS**:
1.  **Strictly Adhere to Datasets**: Use the following compliance datasets as your **only source of truth**. You MUST find the section that perfectly matches the user's \`legalRegion\` and \`companyType\`. Do not invent filings or use external knowledge.
2.  **Generate Comprehensive Annual Calendar**: Based on the matched dataset, generate a complete and accurate list of compliance tasks for a full year.
3.  **Include All One-Time Filings**: You MUST include all one-time initial filings (e.g., "Open bank account", "Commencement of Business") for every company, regardless of its age. Their due dates are calculated from the \`incorporationDate\`. For a company incorporated in the past, these will likely be 'overdue'.
4.  **Include Recurring Filings**: For recurring tasks (annual, quarterly), generate the NEXT upcoming instance. Calculate the due date based on the \`currentDate\`. For example, if the \`currentDate\` is in 2024 and a task is due "By 30 September every year", the due date should be in 2024.
5.  **Determine Accurate Status**: Compare the calculated due date of EACH task with the \`currentDate\` to set its status to "overdue" or "upcoming". Do not use a "completed" status. A task is overdue if its due date is before the \`currentDate\`.
6.  **Quality Control**: For each task, you must provide a 'title', 'date', 'type', 'status', 'description', and 'penalty'. Do not leave any fields blank. Ensure all text is spelled correctly and the data is accurate.

**Compliance Datasets**:

---

🇮🇳 **India — Pvt Ltd Company** (INC Date = Day 0)
*   **Task**: Obtain DSC for Directors | **Due By**: Before incorporation | **Description**: A Digital Signature Certificate is required for directors to sign electronic documents for company filings. | **Penalty**: Filings cannot be submitted without it, leading to non-compliance and penalties for those filings.
*   **Task**: Apply for DIN for Directors | **Due By**: Before incorporation | **Description**: A Director Identification Number is a unique ID for any existing or proposed director. | **Penalty**: Cannot be appointed as a director without a DIN.
*   **Task**: Open bank account | **Due By**: Within 30 days of incorporation | **Description**: A dedicated bank account in the company's name is required for all transactions. | **Penalty**: Essential for business operations and receiving funds. Delays can impact business commencement.
*   **Task**: Auditor appointment (ADT-1) | **Due By**: Within 30 days of incorporation | **Description**: Appointing the first auditor of the company by filing form ADT-1 with the ROC. | **Penalty**: Penalty on the company and every officer in default, which can extend up to ₹300 per day.
*   **Task**: Issue share certificates | **Due By**: Within 60 days of incorporation | **Description**: Issuing formal share certificates to all shareholders of the company. | **Penalty**: Penalty on the company and defaulting officers, which can be significant.
*   **Task**: First board meeting | **Due By**: Within 30 days of incorporation | **Description**: The first meeting of the Board of Directors must be held. | **Penalty**: Penalty of ₹25,000 on the company and every officer in default.
*   **Task**: File for Commencement of Business (INC-20A) | **Due By**: Within 180 days of incorporation | **Description**: A declaration that the company has received its subscription money. | **Penalty**: Company liable for a penalty of ₹50,000 and every defaulting officer liable for ₹1,000 per day of default. The ROC may also strike off the company name.
*   **Task**: Maintain Statutory Registers | **Due By**: Ongoing from incorporation | **Description**: Maintaining various statutory registers like Register of Members, Directors, etc. | **Penalty**: Heavy penalties on the company and officers, which can be up to ₹3,00,000.
*   **Task**: GST registration (if turnover > 40L) | **Due By**: As soon as threshold crossed | **Description**: Goods and Services Tax registration is mandatory after crossing the specified turnover threshold. | **Penalty**: Penalty of 10% of the tax due or ₹10,000, whichever is higher.
*   **Task**: MSME registration (optional) | **Due By**: Recommended within 90 days | **Description**: Optional registration for Micro, Small, and Medium Enterprises to avail government benefits. | **Penalty**: No penalty for not registering, but benefits are missed.
*   **Task**: Professional tax registration | **Due By**: Within 30 days (in applicable states) | **Description**: A state-level tax on professionals and trades. Required in states like Maharashtra, Karnataka, etc. | **Penalty**: Varies by state, typically involves interest and fines on the unpaid tax.
*   **Task**: Hold Annual General Meeting (AGM) | **Due By**: Within 6 months from end of financial year | **Description**: An annual meeting of shareholders to discuss the company's performance and approve accounts. | **Penalty**: Penalty on the company and every officer in default, up to ₹1,00,000, and a further penalty for continuing default.
*   **Task**: ROC annual return (MGT-7) | **Due By**: Every year within 60 days of AGM | **Description**: Annual filing detailing the company's shareholders, directors, and shareholding structure. | **Penalty**: Late fee of ₹100 per day of default. No upper limit.
*   **Task**: Financial statements (AOC-4) | **Due By**: Every year within 30 days of AGM | **Description**: Annual filing of the company's audited financial statements (Balance Sheet, P&L). | **Penalty**: Late fee of ₹100 per day of default. No upper limit.
*   **Task**: Director KYC (DIR-3 KYC) | **Due By**: Before 30 September every year | **Description**: Annual KYC filing for all directors with an active DIN. | **Penalty**: A flat fee of ₹5,000 for late filing.
*   **Task**: Tax Audit Report Filing (if applicable) | **Due By**: By 30 September every year | **Description**: If company turnover exceeds the prescribed limit, a tax audit report must be filed. | **Penalty**: Penalty of 0.5% of the total sales, turnover or gross receipts, or ₹1,50,000, whichever is less.
*   **Task**: Income tax return (ITR-6) | **Due By**: By 31 October every year (if audited) | **Description**: Filing the annual income tax return with the Income Tax Department. | **Penalty**: Penalties under the Income Tax Act, including interest and late filing fees up to ₹10,000.
*   **Task**: TDS returns | **Due By**: Quarterly (15th of April, July, Oct, Jan) | **Description**: Filing quarterly returns for tax deducted at source on various payments like salaries, rent, etc. | **Penalty**: Late filing fee of ₹200 per day, and potential penalties equal to the tax amount.
*   **Task**: Board meetings | **Due By**: At least 4 times per year (suggest quarterly) | **Description**: Holding at least one board meeting in each quarter, with a maximum gap of 120 days between two meetings. | **Penalty**: Penalty of ₹25,000 on the company and every officer in default.

---

🇮🇳 **India — LLP (Limited Liability Partnership)**
*   **Task**: LLP Agreement filing (Form 3) | **Due By**: Within 30 days of incorporation | **Description**: Filing the main governing agreement of the LLP with the ROC. | **Penalty**: Penalty of ₹100 per day of default, with no maximum limit.
*   **Task**: PAN/TAN application | **Due By**: Immediately after incorporation | **Description**: Applying for a Permanent Account Number (PAN) and Tax Deduction and Collection Account Number (TAN). | **Penalty**: Essential for tax filings and banking.
*   **Task**: Annual return (Form 11) | **Due By**: By 30 May every year | **Description**: A summary of the LLP's partners and management structure. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: Statement of accounts (Form 8) | **Due By**: By 30 October every year | **Description**: Filing the LLP's annual financial statements. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: Income tax return | **Due By**: By 31 July (non-audit) or 31 Oct (audit) every year | **Description**: Filing the annual income tax return. | **Penalty**: Varies based on tax laws, includes interest and fines.

---

🇮🇳 **India — Sole Proprietorship**
*   **Task**: GST registration | **Due By**: If turnover exceeds ₹40 lakhs | **Description**: Mandatory tax registration if business turnover crosses the threshold. | **Penalty**: 10% of tax due or ₹10,000, whichever is higher.
*   **Task**: Shop & establishment license | **Due By**: Within 30 days of start | **Description**: A state-specific license for running a commercial establishment. | **Penalty**: Varies by state.
*   **Task**: Income tax return | **Due By**: By 31 July every year | **Description**: Filing personal income tax return, including business income. | **Penalty**: Late filing fee up to ₹5,000.

---

🇺🇸 **USA — Delaware C-Corp**
*   **Task**: Obtain EIN (Employer ID Number) | **Due By**: Immediately after incorporation | **Description**: A federal tax ID number required for hiring, banking, and tax filings. | **Penalty**: Essential for almost all business operations.
*   **Task**: Appoint Registered Agent | **Due By**: Annually | **Description**: A requirement to have a registered agent in Delaware to receive official mail. | **Penalty**: Loss of good standing, potential administrative dissolution.
*   **Task**: Delaware Franchise Tax & Annual Report | **Due By**: By 1 March every year | **Description**: An annual tax and report paid to the state of Delaware to maintain good standing. | **Penalty**: Late filing penalty and interest; company can become void after 2 years of non-payment.
*   **Task**: Federal income tax filing (Form 1120) | **Due By**: By 15 April every year | **Description**: Annual corporate income tax return filed with the IRS. | **Penalty**: Significant penalties based on tax owed and length of delay.

---

🇬🇧 **UK — Limited Company**
*   **Task**: Register for Corporation Tax | **Due By**: Within 3 months of starting trade | **Description**: Informing HMRC that the company is active and liable for Corporation Tax. | **Penalty**: Fines for late registration.
*   **Task**: Confirmation Statement (annual return) | **Due By**: Every year within 14 days of anniversary of incorporation date | **Description**: Confirming the company's details on record at Companies House are correct. | **Penalty**: Company and its officers can be fined, and the company may be struck off.
*   **Task**: Annual accounts filing | **Due By**: 9 months after financial year-end | **Description**: Filing the company's annual financial accounts with Companies House. | **Penalty**: Automatic late filing penalty, from £150 to £1,500 for private companies.

---

🇸🇬 **Singapore — Private Limited Company**
*   **Task**: Hold Annual General Meeting (AGM) | **Due By**: Within 6 months of financial year-end | **Description**: Annual meeting of shareholders. | **Penalty**: Fines and potential legal action against directors.
*   **Task**: File Annual Return (AR) with ACRA | **Due By**: Within 7 months of financial year-end | **Description**: Filing the company's annual return with the Accounting and Corporate Regulatory Authority (ACRA). | **Penalty**: Late filing penalties up to S$600.
*   **Task**: File Estimated Chargeable Income (ECI) | **Due By**: Within 3 months of financial year-end | **Description**: Filing an estimate of the company's taxable income for the year. | **Penalty**: IRAS may issue a Notice of Assessment based on their own estimation of your income.

---

🇦🇺 **Australia — Proprietary Limited Company (Pty Ltd)**
*   **Task**: Complete ASIC annual review | **Due By**: Every year on anniversary date | **Description**: Reviewing and updating company details with the Australian Securities and Investments Commission (ASIC). | **Penalty**: Late fees apply, and the company can be deregistered.
*   **Task**: Lodge income tax return | **Due By**: By 31 October every year | **Description**: Filing the annual corporate tax return with the Australian Taxation Office (ATO). | **Penalty**: Penalties for failure to lodge on time.

---

🇨🇦 **Canada — Federal Corporation**
*   **Task**: File annual return (Corporations Canada) | **Due By**: Every year within 60 days of anniversary date | **Description**: An annual filing that keeps the corporation's information up-to-date. | **Penalty**: The corporation may be dissolved if returns are not filed for 2 consecutive years.
*   **Task**: File T2 corporate tax return | **Due By**: Within 6 months of fiscal year-end | **Description**: Filing the annual corporate income tax return with the Canada Revenue Agency (CRA). | **Penalty**: Late-filing penalty based on the unpaid tax.

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
    // This is a much more comprehensive fallback that includes the items you mentioned.
    const generateFallback = (input: FilingGeneratorInput): FilingGeneratorOutput => {
        const incDate = new Date(input.incorporationDate + 'T00:00:00');
        const currDate = new Date(input.currentDate + 'T00:00:00');
        let fallbackFilings: { date: string, title: string, type: "Corporate Filing" | "Tax Filing" | "Other Task", description: string, penalty: string }[] = [];

        if (input.legalRegion === 'India' && input.companyType === 'Private Limited Company') {
            const agmDate = addMonths(new Date(currDate.getFullYear(), 2, 31), 6); // Assume AGM at end of 6 months from FY end

            fallbackFilings = [
                // One-time post-incorporation tasks
                { date: format(addDays(incDate, 30), 'yyyy-MM-dd'), title: 'Open bank account', type: 'Other Task', description: 'A dedicated bank account in the company\'s name is required for all transactions.', penalty: 'Essential for business operations. Delays can impact business commencement.' },
                { date: format(addDays(incDate, 30), 'yyyy-MM-dd'), title: 'First board meeting', type: 'Corporate Filing', description: 'The first meeting of the Board of Directors must be held.', penalty: 'Penalty of ₹25,000 on the company and every officer in default.' },
                { date: format(addDays(incDate, 180), 'yyyy-MM-dd'), title: 'File for Commencement of Business (INC-20A)', type: 'Corporate Filing', description: 'A declaration that the company has received its subscription money.', penalty: 'Company liable for a penalty of ₹50,000 and defaulting officer liable for ₹1,000 per day of default.' },
                // Annual recurring tasks
                { date: format(addDays(agmDate, 60), 'yyyy-MM-dd'), title: 'ROC annual return (MGT-7)', type: 'Corporate Filing', description: 'Annual filing detailing the company\'s shareholders and directors.', penalty: 'Late fee of ₹100 per day of default.' },
                { date: format(addDays(agmDate, 30), 'yyyy-MM-dd'), title: 'Financial statements (AOC-4)', type: 'Corporate Filing', description: 'Annual filing of the company\'s audited financial statements.', penalty: 'Late fee of ₹100 per day of default.' },
                { date: format(new Date(currDate.getFullYear(), 9, 31), 'yyyy-MM-dd'), title: 'Income tax return (ITR-6)', type: 'Tax Filing', description: 'Filing the annual income tax return with the Income Tax Department.', penalty: 'Penalties under the Income Tax Act, including interest and late fees.' },
            ];
        } else {
             // A generic fallback for other cases
            fallbackFilings = [
                { date: format(addDays(incDate, 30), 'yyyy-MM-dd'), title: 'Open bank account', type: 'Other Task', description: 'Open a business bank account.', penalty: 'Delays business operations.' },
                { date: format(new Date(currDate.getFullYear(), 9, 31), 'yyyy-MM-dd'), title: 'Annual tax return', type: 'Tax Filing', description: 'File annual tax return with the relevant tax authority.', penalty: 'Varies by jurisdiction, includes fines and interest.' },
            ];
        }
        
        return {
          filings: fallbackFilings.map(f => ({
            ...f,
            status: new Date(f.date + 'T00:00:00') < currDate ? 'overdue' : 'upcoming'
          }))
        };
    };
    
    try {
      const {output} = await prompt(input);

      if (!output || output.filings.length === 0) {
        console.log("AI returned no filings, using code-based fallback.");
        return generateFallback(input);
      }
      
      return output;

    } catch (e) {
      console.error("AI call to generate filings failed due to an exception, using code-based fallback.", e);
      return generateFallback(input);
    }
  }
);
