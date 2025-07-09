
'use server';
/**
 * @fileOverview A rule-based engine for generating a realistic list of compliance filings.
 * This flow is deterministic and does not use an LLM for calculations to ensure accuracy.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { format, addDays, addMonths, setYear, parse, getYear } from 'date-fns';

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


// --- Rule-Based Compliance Generation ---

type FilingRule = {
  task: string;
  dueDateRule: string; // e.g., '180 days from incorporation', '30 Sep', '11th every month', '31 Jul, 31 Oct, 31 Jan, 31 May'
  frequency: 'One-time' | 'Annual' | 'Half-yearly' | 'Quarterly' | 'Monthly' | 'Voluntary';
  type: "Corporate Filing" | "Tax Filing" | "Other Task";
  description: string;
  penalty: string;
};

const complianceRules: Record<string, Record<string, FilingRule[]>> = {
  'India': {
    'Private Limited Company': [
      { task: "INC-20A – Commencement", dueDateRule: "180 days from incorporation", frequency: "One-time", type: "Corporate Filing", description: "A mandatory filing to declare that the company has received its subscription money and is ready to commence business.", penalty: "Penalty of ₹50,000 on the company, ₹1,000 per day on officers, and potential for the company to be struck off." },
      { task: "Auditor Appointment (ADT-1)", dueDateRule: "30 days from incorporation", frequency: "One-time", type: "Corporate Filing", description: "Filing Form ADT-1 to appoint the first statutory auditor of the company.", penalty: "Penalty on the company and every officer in default, which can extend up to ₹300 per day." },
      { task: "First Board Meeting", dueDateRule: "30 days from incorporation", frequency: "One-time", type: "Other Task", description: "The first meeting of the Board of Directors must be held to discuss initial business matters.", penalty: "Penalty of ₹25,000 on the company and every officer in default." },
      { task: "PAN, TAN, Bank A/C", dueDateRule: "15 days from incorporation", frequency: "One-time", type: "Other Task", description: "Obtaining Permanent Account Number (PAN), Tax Deduction and Collection Account Number (TAN), and opening a corporate bank account.", penalty: "Essential for all financial transactions and tax filings. Delays will halt business operations." },
      { task: "Share Certificate Issuance", dueDateRule: "60 days from incorporation", frequency: "One-time", type: "Corporate Filing", description: "Issuing formal share certificates to all shareholders as proof of ownership.", penalty: "Penalty on the company and defaulting officers, which can be significant." },
      { task: "Stamp Duty on Certificates", dueDateRule: "30 days from issuance", frequency: "One-time", type: "Other Task", description: "Paying the applicable stamp duty on the share certificates as per the state's stamp act.", penalty: "Unstamped certificates are not valid evidence in court. Penalties can be up to 10 times the duty." },
      { task: "MBP-1 & DIR-8", dueDateRule: "First board meeting of FY", frequency: "Annual", type: "Corporate Filing", description: "Directors must disclose their interest in other entities (MBP-1) and declare they are not disqualified (DIR-8).", penalty: "Non-disclosure can lead to penalties on the director and vacation of office." },
      { task: "AGM (Annual General Meeting)", dueDateRule: "30 Sep", frequency: "Annual", type: "Corporate Filing", description: "An annual meeting of shareholders to approve accounts, appoint auditors, and declare dividends.", penalty: "Fine up to ₹1,00,000 on the company and every officer in default." },
      { task: "AOC-4 (Financials)", dueDateRule: "30 days from AGM", frequency: "Annual", type: "Corporate Filing", description: "Filing of the company's audited financial statements (Balance Sheet, P&L) with the ROC.", penalty: "Late fee of ₹100 per day of default. No upper limit." },
      { task: "MGT-7 (Annual Return)", dueDateRule: "60 days from AGM", frequency: "Annual", type: "Corporate Filing", description: "Filing an annual return with details of the company's shareholders, directors, and capital structure.", penalty: "Late fee of ₹100 per day of default. No upper limit." },
      { task: "DIR-3 KYC", dueDateRule: "30 Sep", frequency: "Annual", type: "Corporate Filing", description: "Annual KYC filing for all directors with an active Director Identification Number (DIN).", penalty: "A flat fee of ₹5,000 for late filing and deactivation of DIN." },
      { task: "DPT-3 (Deposits)", dueDateRule: "30 Jun", frequency: "Annual", type: "Corporate Filing", description: "A return of deposits or particulars of transactions not considered as deposits.", penalty: "Heavy fines on the company which may extend to ₹1 Crore and imprisonment for officers." },
      { task: "MSME Form I", dueDateRule: "30 Apr, 31 Oct", frequency: "Half-yearly", type: "Corporate Filing", description: "Return for outstanding payments to Micro and Small Enterprises for more than 45 days.", penalty: "Penalty on the company and officers, which can be up to ₹25,000." },
      { task: "TDS Returns (24Q/26Q)", dueDateRule: "31 Jul, 31 Oct, 31 Jan, 31 May", frequency: "Quarterly", type: "Tax Filing", description: "Filing quarterly returns for tax deducted at source on payments like salaries, professional fees, etc.", penalty: "Late filing fee of ₹200 per day, and potential penalties equal to the tax amount." },
      { task: "Advance Tax", dueDateRule: "15 Jun, 15 Sep, 15 Dec, 15 Mar", frequency: "Quarterly", type: "Tax Filing", description: "Paying income tax in advance in installments instead of a lump sum at year-end.", penalty: "Interest is levied on the shortfall in payment of advance tax." },
      { task: "GSTR-1", dueDateRule: "11th every month", frequency: "Monthly", type: "Tax Filing", description: "Monthly return detailing all outward supplies (sales) of goods and services.", penalty: "Late fees of ₹50 per day (₹20 for nil return), up to a maximum of ₹10,000." },
      { task: "GSTR-3B", dueDateRule: "20th every month", frequency: "Monthly", type: "Tax Filing", description: "Monthly summary return for supplies, input tax credit, and tax paid.", penalty: "Late fees of ₹50 per day (₹20 for nil return), up to a maximum of ₹10,000." },
      { task: "GSTR-9 & 9C", dueDateRule: "31 Dec", frequency: "Annual", type: "Tax Filing", description: "GSTR-9 is the annual consolidated return. GSTR-9C is a reconciliation statement for taxpayers with turnover above ₹5 Crore, certified by a CA/CMA.", penalty: "Late fee of ₹200 per day (₹100 CGST + ₹100 SGST), up to 0.25% of turnover." },
    ],
    // Other company types would go here...
  }
};


function generateFilingsFromRules(input: FilingGeneratorInput): FilingGeneratorOutput {
    const { companyType, incorporationDate, currentDate, legalRegion } = input;
    const rules = complianceRules[legalRegion]?.[companyType];

    if (!rules) {
        console.warn(`No rules found for ${companyType} in ${legalRegion}`);
        return { filings: [] };
    }

    const allFilings: z.infer<typeof FilingItemSchema>[] = [];
    const incDate = new Date(incorporationDate + 'T00:00:00');
    const currDate = new Date(currentDate + 'T00:00:00');
    const startYear = getYear(incDate);
    const endYear = getYear(currDate);

    for (const rule of rules) {
        if (rule.frequency === 'One-time') {
            if (rule.dueDateRule.includes('days from incorporation')) {
                const days = parseInt(rule.dueDateRule.split(' ')[0]);
                const dueDate = addDays(incDate, days);
                allFilings.push({
                    date: format(dueDate, 'yyyy-MM-dd'),
                    title: rule.task,
                    type: rule.type,
                    description: rule.description,
                    penalty: rule.penalty,
                });
            } else if (rule.dueDateRule.includes('days from issuance')) {
                 // Assuming issuance is 60 days from incDate for simplicity
                const issuanceDate = addDays(incDate, 60);
                const days = parseInt(rule.dueDateRule.split(' ')[0]);
                const dueDate = addDays(issuanceDate, days);
                 allFilings.push({
                    date: format(dueDate, 'yyyy-MM-dd'),
                    title: rule.task,
                    type: rule.type,
                    description: rule.description,
                    penalty: rule.penalty,
                });
            }
        } else {
            for (let year = startYear; year <= endYear; year++) {
                const agmDate = new Date(year, 8, 30); // Assume Sep 30 for AGM

                switch(rule.frequency) {
                    case 'Annual':
                        if (rule.dueDateRule.includes('from AGM')) {
                            const days = parseInt(rule.dueDateRule.split(' ')[0]);
                            const dueDate = addDays(agmDate, days);
                            allFilings.push({ date: format(dueDate, 'yyyy-MM-dd'), ...rule });
                        } else if (rule.dueDateRule === 'First board meeting of FY') {
                            // Approximating as April 15th of the financial year
                            allFilings.push({ date: format(new Date(year, 3, 15), 'yyyy-MM-dd'), ...rule });
                        } else {
                            // Fixed date like "30 Sep"
                            try {
                                const dueDate = setYear(parse(rule.dueDateRule, 'dd MMM', new Date()), year);
                                allFilings.push({ date: format(dueDate, 'yyyy-MM-dd'), ...rule });
                            } catch (e) {
                                console.error(`Error parsing date rule: ${rule.dueDateRule}`)
                            }
                        }
                        break;
                    case 'Half-yearly':
                    case 'Quarterly':
                        const dates = rule.dueDateRule.split(', ');
                        for (const dateStr of dates) {
                            try {
                                // For quarterlies, the year might be next year (e.g., Jan, May for a financial year)
                                const parsedDate = parse(dateStr, 'dd MMM', new Date());
                                const dueMonth = parsedDate.getMonth();
                                // A simple way to handle FY year wrap-around for quarterly filings
                                const filingYear = (dueMonth < 3) ? year + 1 : year;
                                if (filingYear > endYear + 1) continue;
                                const dueDate = setYear(parsedDate, filingYear);
                                allFilings.push({ date: format(dueDate, 'yyyy-MM-dd'), ...rule });
                            } catch (e) {
                                console.error(`Error parsing date rule: ${rule.dueDateRule}`)
                            }
                        }
                        break;
                    case 'Monthly':
                         for (let month = 0; month < 12; month++) {
                             if (year === startYear && month < incDate.getMonth()) continue;
                             if (year === endYear && month > currDate.getMonth()) continue;
                             const day = parseInt(rule.dueDateRule.split('th')[0]);
                             const dueDate = new Date(year, month, day);
                             allFilings.push({ date: format(dueDate, 'yyyy-MM-dd'), ...rule });
                         }
                        break;
                }
            }
        }
    }

    return { filings: allFilings };
}


const filingGeneratorFlow = ai.defineFlow(
  {
    name: 'filingGeneratorFlow',
    inputSchema: FilingGeneratorInputSchema,
    outputSchema: FilingGeneratorOutputSchema,
  },
  async (input) => {
    return generateFilingsFromRules(input);
  }
);
