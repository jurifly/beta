
'use server';

import { getTaxAdvice, type TaxAdvisorInput, type TaxAdvisorOutput } from '@/ai/flows/tax-advisor-flow';
import { generateFinancialReport, type FinancialReportInput, type FinancialReportOutput } from '@/ai/flows/financial-report-flow';

export async function getTaxAdviceAction(input: TaxAdvisorInput): Promise<{ data: TaxAdvisorOutput | null, error: string | null }> {
  try {
    const result = await getTaxAdvice(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Tax Advisor Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: errorMessage };
  }
}


export async function getFinancialReportAction(input: FinancialReportInput): Promise<{ data: FinancialReportOutput | null, error: string | null }> {
  try {
    const result = await generateFinancialReport(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Financial Report Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: errorMessage };
  }
}
