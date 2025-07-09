
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
2.  **Generate Comprehensive Annual Calendar**: Based on the matched dataset, generate a complete and accurate list of compliance tasks for a full year. For monthly items like GSTR-1 and GSTR-3B, generate entries for **every month** of the relevant year. For quarterly items, generate entries for **all four** due dates.
3.  **Strict Date Calculations**: You MUST calculate precise due dates in "YYYY-MM-DD" format based on these rules:
    *   **From Incorporation Date**: For tasks like "180 days from incorporation", calculate the due date by adding exactly 180 days to the \`incorporationDate\`.
    *   **Annual Fixed Date**: For tasks due on a specific day (e.g., "By 30th Sep"), use the year from the \`currentDate\` to form the due date (e.g., if \`currentDate\` is in 2024, the due date is "2024-09-30").
    *   **AGM Dependent**: For tasks dependent on the Annual General Meeting (AGM), assume the AGM is held on **30th September**. Calculate deadlines like AOC-4 (30 days from AGM) and MGT-7 (60 days from AGM) based on this assumed date.
    *   **Monthly**: For tasks like GSTR-1 due on the "11th every month", generate an entry for the 11th of **every single month** in the financial year related to the \`currentDate\`.
    *   **Quarterly**: For tasks like TDS returns with due dates "31 Jul, 31 Oct, 31 Jan, 31 May", generate entries for **all four** due dates for the financial year related to the \`currentDate\`.
4.  **Include All One-Time Filings**: You MUST include all one-time initial filings for every company, regardless of its age.
5.  **CRITICAL QUALITY CONTROL**: For each task, you MUST provide a 'title', 'date', 'type', 'description', and 'penalty'. Do not leave any fields blank. Ensure all text is spelled perfectly and all data is accurate.

**Compliance Datasets**:

---

🇮🇳 **India — Private Limited Company**
*   **Task**: INC-20A – Commencement | **Due Date**: 180 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: A mandatory filing to declare that the company has received its subscription money and is ready to commence business. | **Penalty**: Penalty of ₹50,000 on the company, ₹1,000 per day on officers, and potential for the company to be struck off.
*   **Task**: Auditor Appointment (ADT-1) | **Due Date**: 30 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Filing Form ADT-1 to appoint the first statutory auditor of the company. | **Penalty**: Penalty on the company and every officer in default, which can extend up to ₹300 per day.
*   **Task**: First Board Meeting | **Due Date**: 30 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: The first meeting of the Board of Directors must be held to discuss initial business matters. | **Penalty**: Penalty of ₹25,000 on the company and every officer in default.
*   **Task**: PAN, TAN, Bank A/C | **Due Date**: 15 days from incorporation | **Frequency**: One-time | **Type**: Other Task | **Description**: Obtaining Permanent Account Number (PAN), Tax Deduction and Collection Account Number (TAN), and opening a corporate bank account. | **Penalty**: Essential for all financial transactions and tax filings. Delays will halt business operations.
*   **Task**: Share Certificate Issuance | **Due Date**: 60 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Issuing formal share certificates to all shareholders as proof of ownership. | **Penalty**: Penalty on the company and defaulting officers, which can be significant.
*   **Task**: Stamp Duty on Certificates | **Due Date**: 30 days from issuance | **Frequency**: One-time | **Type**: Other Task | **Description**: Paying the applicable stamp duty on the share certificates as per the state's stamp act. | **Penalty**: Unstamped certificates are not valid evidence in court. Penalties can be up to 10 times the duty.
*   **Task**: MBP-1 & DIR-8 | **Due Date**: First board meeting of FY | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Directors must disclose their interest in other entities (MBP-1) and declare they are not disqualified (DIR-8). | **Penalty**: Non-disclosure can lead to penalties on the director and vacation of office.
*   **Task**: AGM (Annual General Meeting) | **Due Date**: By 30th Sep | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: An annual meeting of shareholders to approve accounts, appoint auditors, and declare dividends. | **Penalty**: Fine up to ₹1,00,000 on the company and every officer in default.
*   **Task**: AOC-4 (Financials) | **Due Date**: 30 days from AGM | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Filing of the company's audited financial statements (Balance Sheet, P&L) with the ROC. | **Penalty**: Late fee of ₹100 per day of default. No upper limit.
*   **Task**: MGT-7 (Annual Return) | **Due Date**: 60 days from AGM | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Filing an annual return with details of the company's shareholders, directors, and capital structure. | **Penalty**: Late fee of ₹100 per day of default. No upper limit.
*   **Task**: DIR-3 KYC | **Due Date**: 30 Sep | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Annual KYC filing for all directors with an active Director Identification Number (DIN). | **Penalty**: A flat fee of ₹5,000 for late filing and deactivation of DIN.
*   **Task**: DPT-3 (Deposits) | **Due Date**: 30 June | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: A return of deposits or particulars of transactions not considered as deposits. | **Penalty**: Heavy fines on the company which may extend to ₹1 Crore and imprisonment for officers.
*   **Task**: MSME Form I | **Due Date**: 30 Apr, 31 Oct | **Frequency**: Half-yearly | **Type**: Corporate Filing | **Description**: Return for outstanding payments to Micro and Small Enterprises for more than 45 days. | **Penalty**: Penalty on the company and officers, which can be up to ₹25,000.
*   **Task**: TDS Returns (24Q/26Q) | **Due Date**: 31 Jul, 31 Oct, 31 Jan, 31 May | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Filing quarterly returns for tax deducted at source on payments like salaries, professional fees, etc. | **Penalty**: Late filing fee of ₹200 per day, and potential penalties equal to the tax amount.
*   **Task**: Advance Tax | **Due Date**: 15 Jun, 15 Sep, 15 Dec, 15 Mar | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Paying income tax in advance in installments instead of a lump sum at year-end. | **Penalty**: Interest is levied on the shortfall in payment of advance tax.
*   **Task**: GSTR-1 | **Due Date**: 11th every month | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Monthly return detailing all outward supplies (sales) of goods and services. | **Penalty**: Late fees of ₹50 per day (₹20 for nil return), up to a maximum of ₹10,000.
*   **Task**: GSTR-3B | **Due Date**: 20th every month | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Monthly summary return for supplies, input tax credit, and tax paid. | **Penalty**: Late fees of ₹50 per day (₹20 for nil return), up to a maximum of ₹10,000.
*   **Task**: GSTR-9 & 9C | **Due Date**: 31 Dec next FY | **Frequency**: Annual | **Type**: Tax Filing | **Description**: GSTR-9 is the annual consolidated return. GSTR-9C is a reconciliation statement for taxpayers with turnover above ₹5 Crore, certified by a CA/CMA. | **Penalty**: Late fee of ₹200 per day (₹100 CGST + ₹100 SGST), up to 0.25% of turnover.

---

🇮🇳 **India — Limited Liability Partnership (LLP)**
*   **Task**: Form 3 (LLP Agreement) | **Due Date**: 30 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Filing the main governing agreement of the LLP with the ROC. | **Penalty**: Penalty of ₹100 per day of default, with no maximum limit.
*   **Task**: Form 11 (Annual Return) | **Due Date**: 30 May | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: A summary of the LLP's partners and their contributions. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: Form 8 (Statement of Accounts) | **Due Date**: 30 Oct | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Filing the LLP's annual financial statements and solvency declaration. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: ITR-5 | **Due Date**: 31 Jul / 31 Oct if audited | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Filing the annual income tax return for the LLP. | **Penalty**: Penalties under the Income Tax Act.
*   **Task**: Audit (if turnover > ₹40L) | **Due Date**: Before 31 Oct | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Mandatory audit of accounts if turnover exceeds ₹40 lakh or contribution exceeds ₹25 lakh. | **Penalty**: Penalty of 0.5% of the turnover, or ₹1,50,000, whichever is less.
*   **Task**: GSTR-1 & 3B (if GST reg.) | **Due Date**: 11th & 20th monthly | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Monthly GST returns for outward supplies and tax payment. | **Penalty**: Late fees apply.
*   **Task**: TDS Returns | **Due Date**: Quarterly | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Filing quarterly returns for tax deducted at source. | **Penalty**: Late fees and penalties apply.

---

🇮🇳 **India — One Person Company (OPC)**
*   **Task**: INC-20A – Commencement | **Due Date**: 180 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Declaration of commencement of business. | **Penalty**: Company liable for a penalty of ₹50,000 and every defaulting officer liable for ₹1,000 per day of default.
*   **Task**: First Board Meeting | **Due Date**: 30 days from incorporation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Initial board meeting to set up operations. | **Penalty**: Penalty of ₹25,000 on the company and every officer in default.
*   **Task**: AOC-4 | **Due Date**: 180 days from FY end (approx. 27 Sep) | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Filing financial statements with the ROC. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: MGT-7A | **Due Date**: 60 days from AGM or 28 Nov | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Abridged Annual Return for OPCs and Small Companies. | **Penalty**: Late fee of ₹100 per day of default.
*   **Task**: DIR-3 KYC | **Due Date**: 30 Sep | **Frequency**: Annual | **Type**: Corporate Filing | **Description**: Annual KYC for the director. | **Penalty**: Flat fee of ₹5,000.
*   **Task**: ITR-6 | **Due Date**: 31 Oct | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Annual Income Tax Return filing. | **Penalty**: Penalties under Income Tax Act.
*   **Task**: GSTR-1 & 3B | **Due Date**: 11th & 20th monthly | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Monthly GST returns if registered. | **Penalty**: Late fees apply.
*   **Task**: TDS Returns | **Due Date**: Quarterly | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Quarterly TDS returns if applicable. | **Penalty**: Late fees and penalties apply.

---

🇮🇳 **India — Sole Proprietorship**
*   **Task**: GST Returns (GSTR-1 & 3B) | **Due Date**: 11th & 20th monthly | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Filing monthly GST returns if registered. | **Penalty**: Late fees apply.
*   **Task**: ITR-3 | **Due Date**: 31 Jul / 31 Oct if audited | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Filing personal income tax return declaring business income. | **Penalty**: Late filing fee up to ₹5,000.
*   **Task**: TDS Return (if applicable) | **Due Date**: Quarterly | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Filing TDS returns if tax was deducted. | **Penalty**: Late fees and penalties apply.
*   **Task**: Advance Tax | **Due Date**: 15 Jun, 15 Sep, 15 Dec, 15 Mar | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Paying advance tax on estimated income. | **Penalty**: Interest on shortfall.
*   **Task**: Professional Tax (state-based) | **Due Date**: 15th monthly | **Frequency**: Monthly | **Type**: Other Task | **Description**: State-level tax on professionals, varies by state. | **Penalty**: Varies by state.
*   **Task**: Shop & Establishment Reg. | **Due Date**: Within 30 days of setup | **Frequency**: One-time | **Type**: Other Task | **Description**: License for running a commercial establishment. | **Penalty**: Varies by state.
*   **Task**: Udyam Registration | **Due Date**: Voluntary | **Frequency**: One-time | **Type**: Other Task | **Description**: Registration for MSME benefits. | **Penalty**: None, but benefits are missed.

---

🇮🇳 **India — Partnership Firm**
*   **Task**: Partnership Deed Registration | **Due Date**: At formation | **Frequency**: One-time | **Type**: Corporate Filing | **Description**: Registering the partnership deed is optional but recommended. | **Penalty**: Unregistered firms cannot sue third parties.
*   **Task**: ITR-5 | **Due Date**: 31 Jul / 31 Oct if audited | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Annual income tax return for the firm. | **Penalty**: Penalties under Income Tax Act.
*   **Task**: GST Returns (if applicable) | **Due Date**: Monthly | **Frequency**: Monthly | **Type**: Tax Filing | **Description**: Monthly GST returns if registered. | **Penalty**: Late fees apply.
*   **Task**: TDS Return | **Due Date**: Quarterly | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Quarterly TDS returns if applicable. | **Penalty**: Late fees and penalties apply.
*   **Task**: Audit (if turnover > ₹1 Cr / ₹50L) | **Due Date**: 31 Oct | **Frequency**: Annual | **Type**: Tax Filing | **Description**: Mandatory tax audit if turnover exceeds prescribed limits. | **Penalty**: 0.5% of turnover or ₹1.5 Lakhs, whichever is lower.
*   **Task**: Advance Tax | **Due Date**: 15 Jun, 15 Sep, 15 Dec, 15 Mar | **Frequency**: Quarterly | **Type**: Tax Filing | **Description**: Paying income tax in advance. | **Penalty**: Interest on shortfall.
*   **Task**: Professional Tax | **Due Date**: Monthly (varies by state) | **Frequency**: Monthly | **Type**: Other Task | **Description**: State-level professional tax. | **Penalty**: Varies by state.

---

🇺🇸 **USA — Delaware C-Corp**
*   **Task**: Obtain EIN (Employer ID Number) | **Due By**: Immediately after incorporation | **Type**: Tax Filing | **Description**: A federal tax ID number required for hiring, banking, and tax filings. | **Penalty**: Essential for almost all business operations.
*   **Task**: Appoint Registered Agent | **Due By**: Annually | **Type**: Corporate Filing | **Description**: A requirement to have a registered agent in Delaware to receive official mail. | **Penalty**: Loss of good standing, potential administrative dissolution.
*   **Task**: Delaware Franchise Tax & Annual Report | **Due By**: By 1 March every year | **Type**: Tax Filing | **Description**: An annual tax and report paid to the state of Delaware to maintain good standing. | **Penalty**: Late filing penalty and interest; company can become void after 2 years of non-payment.
*   **Task**: Federal income tax filing (Form 1120) | **Due By**: By 15 April every year | **Type**: Tax Filing | **Description**: Annual corporate income tax return filed with the IRS. | **Penalty**: Significant penalties based on tax owed and length of delay.

---

🇬🇧 **UK — Limited Company**
*   **Task**: Register for Corporation Tax | **Due By**: Within 3 months of starting trade | **Type**: Tax Filing | **Description**: Informing HMRC that the company is active and liable for Corporation Tax. | **Penalty**: Fines for late registration.
*   **Task**: Confirmation Statement (annual return) | **Due By**: Every year within 14 days of anniversary of incorporation date | **Type**: Corporate Filing | **Description**: Confirming the company's details on record at Companies House are correct. | **Penalty**: Company and its officers can be fined, and the company may be struck off.
*   **Task**: Annual accounts filing | **Due By**: 9 months after financial year-end | **Type**: Corporate Filing | **Description**: Filing the company's annual financial accounts with Companies House. | **Penalty**: Automatic late filing penalty, from £150 to £1,500 for private companies.

---

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
