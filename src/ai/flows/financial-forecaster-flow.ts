
'use server';
/**
 * @fileOverview An AI flow for generating financial forecasts for startups.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const HireSchema = z.object({
  role: z.string().describe("Job title or role of the new hire."),
  monthlySalary: z.number().describe("The gross monthly salary for this hire."),
  startMonth: z.number().min(1).max(12).describe("The month number (1-12) when this hire starts."),
});

const OneTimeExpenseSchema = z.object({
  item: z.string().describe("Description of the one-time expense."),
  amount: z.number().describe("The amount of the expense."),
  month: z.number().min(1).max(12).describe("The month number (1-12) when this expense occurs."),
});

const FinancialForecasterInputSchema = z.object({
  cashBalance: z.number().describe("Current cash balance of the company."),
  monthlyRevenue: z.number().describe("Current average monthly revenue."),
  monthlyExpenses: z.number().describe("Current average monthly expenses (excluding salaries of new hires)."),
  revenueGrowthRate: z.number().min(0).max(100).describe("Projected month-over-month revenue growth rate (percentage)."),
  newHires: z.array(HireSchema).describe("A list of planned new hires for the forecast period."),
  oneTimeExpenses: z.array(OneTimeExpenseSchema).describe("A list of planned one-time expenses."),
  forecastPeriodInMonths: z.literal(12).describe("The duration of the forecast in months. Must be 12."),
  legalRegion: z.string().describe("The country/legal region for context."),
});
export type FinancialForecasterInput = z.infer<typeof FinancialForecasterInputSchema>;

const MonthlyForecastSchema = z.object({
  month: z.string().describe("The month of the forecast (e.g., 'Month 1', 'Month 2')."),
  revenue: z.number().describe("Projected revenue for the month."),
  expenses: z.number().describe("Projected expenses for the month."),
  profit: z.number().describe("Projected profit or loss for the month."),
  closingBalance: z.number().describe("Projected closing cash balance at the end of the month."),
});

const FinancialForecasterOutputSchema = z.object({
  forecast: z.array(MonthlyForecastSchema).describe("A 12-month financial forecast."),
  runwayInMonths: z.number().nullable().describe("The number of months until the cash runs out. Null if profitable or runway is longer than the forecast period."),
  summary: z.string().describe("A concise, insightful summary of the financial forecast, highlighting key events like reaching profitability or running out of cash."),
});
export type FinancialForecasterOutput = z.infer<typeof FinancialForecasterOutputSchema>;

export async function generateFinancialForecast(input: FinancialForecasterInput): Promise<FinancialForecasterOutput> {
  return financialForecasterFlow(input);
}


const financialForecasterFlow = ai.defineFlow(
  {
    name: 'financialForecasterFlow',
    inputSchema: FinancialForecasterInputSchema,
    outputSchema: FinancialForecasterOutputSchema,
  },
  async (input) => {
    // 1. Perform calculations
    const forecast: z.infer<typeof MonthlyForecastSchema>[] = [];
    let currentRevenue = input.monthlyRevenue;
    let currentCash = input.cashBalance;
    let runwayInMonths: number | null = null;
    let profitableMonth: number | null = null;
    
    for (let i = 1; i <= input.forecastPeriodInMonths; i++) {
        // Calculate revenue for the month
        currentRevenue *= (1 + input.revenueGrowthRate / 100);

        // Calculate expenses for the month
        const newHireSalaries = input.newHires
            .filter(h => h.startMonth <= i)
            .reduce((sum, h) => sum + h.monthlySalary, 0);
        
        const oneTimeExpense = input.oneTimeExpenses
            .filter(e => e.month === i)
            .reduce((sum, e) => sum + e.amount, 0);

        const totalExpenses = input.monthlyExpenses + newHireSalaries + oneTimeExpense;
        const profit = currentRevenue - totalExpenses;
        const closingBalance = currentCash + profit;
        
        forecast.push({
            month: `Month ${i}`,
            revenue: Math.round(currentRevenue),
            expenses: Math.round(totalExpenses),
            profit: Math.round(profit),
            closingBalance: Math.round(closingBalance),
        });

        currentCash = closingBalance;
        
        if (runwayInMonths === null && currentCash < 0) {
            runwayInMonths = i;
        }

        if (profitableMonth === null && profit > 0) {
            profitableMonth = i;
        }
    }

    // 2. Generate summary without LLM
    let summary = "";
    if (runwayInMonths !== null) {
      summary = `Based on your assumptions, the company is projected to run out of cash in approximately ${runwayInMonths} months.`;
      if (profitableMonth) {
        summary += ` However, profitability is expected around month ${profitableMonth}, which could alter this outlook.`;
      } else {
        summary += " Immediate focus on revenue growth or cost management is critical.";
      }
    } else if (profitableMonth !== null) {
      summary = `The company is projected to become profitable in month ${profitableMonth}. The cash runway appears stable for the forecast period.`;
    } else {
      summary = `The forecast shows the company remains profitable throughout the 12-month period, with a consistently positive cash balance.`;
    }
    
    return {
      forecast: forecast,
      runwayInMonths: runwayInMonths,
      summary: summary,
    };
  }
);
