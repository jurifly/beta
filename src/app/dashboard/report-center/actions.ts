

'use server';

import { generateReportInsights } from '@/ai/flows/generate-report-insights-flow';
import type { ReportInsightsInput, ReportInsightsOutput } from '@/ai/flows/generate-report-insights-flow';


export async function generateReportInsightsAction(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  try {
    const result = await generateReportInsights(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not generate report insights.');
  }
}
