
'use server';

// This AI flow is no longer used.
// The tax calculation logic has been moved to the client-side
// in /dashboard/financials/page.tsx for faster, more reliable, and free calculations.
// This file is kept to prevent potential build errors from old imports but can be safely deleted.

import { z } from 'zod';

const TaxCalculationSchema = z.object({
    grossIncome: z.string(),
    totalDeductions: z.string(),
    taxableIncome: z.string(),
    taxPayable: z.string(),
    effectiveRate: z.string().optional(),
});

export const TaxAdvisorOutputSchema = z.object({
  oldRegime: TaxCalculationSchema,
  newRegime: TaxCalculationSchema,
  recommendedRegime: z.enum(["Old", "New", "N/A"]),
  recommendationReason: z.string(),
  optimizationTips: z.array(z.string()),
  summary: z.string(),
});
export type TaxAdvisorOutput = z.infer<typeof TaxAdvisorOutputSchema>;
