
'use server';
/**
 * @fileOverview An AI flow for generating year-over-year financial analysis insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const HistoricalDataSchema = z.object({
    year: z.string(),
    revenue: z.number(),
    expenses: z.number(),
});

const YoYInputSchema = z.object({
  historicalData: z.array(HistoricalDataSchema).describe("An array of historical financial data for multiple years."),
  legalRegion: z.string().describe("The country/legal region for context, e.g., India."),
});
export type YoYInput = z.infer<typeof YoYInputSchema>;

const YoYOutputSchema = z.object({
  insights: z.array(z.string()).describe("A list of 6 to 8 detailed, actionable insights based on the year-over-year financial data."),
});
export type YoYOutput = z.infer<typeof YoYOutputSchema>;

export async function generateYoYAnalysis(input: YoYInput): Promise<YoYOutput> {
  return yoyAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yoyAnalysisPrompt',
  input: {
    schema: z.object({
        legalRegion: z.string(),
        // The prompt now expects data with profit/loss pre-calculated
        processedData: z.array(HistoricalDataSchema.extend({
            profitOrLoss: z.number(),
        })),
    })
  },
  output: {schema: YoYOutputSchema},
  prompt: `You are a world-class financial analyst for a company in {{legalRegion}}. Your task is to analyze the following year-over-year financial data and generate 6-8 insightful, actionable bullet points for the founder. Be direct and clear.

**Financial Data:**
{{#each processedData}}
- **FY {{year}}**: Revenue: {{revenue}}, Expenses: {{expenses}}, Profit/Loss: {{profitOrLoss}}
{{/each}}

**Analysis Instructions:**

Generate 6-8 bullet points covering the following areas:
1.  **Revenue Growth**: Comment on the year-over-year (YoY) revenue growth rate. Is it accelerating, decelerating, or flat? Highlight the strongest growth period.
2.  **Expense Management**: Analyze the growth of expenses relative to revenue. Are expenses growing faster than revenue? Point out any years with significant expense jumps and suggest potential reasons.
3.  **Profitability Trend**: Analyze the trend in net profit or loss. Is the company moving towards profitability or is the loss widening? Calculate and comment on the net profit margin for the most recent year.
4.  **Operational Efficiency**: Compare revenue growth to expense growth. If revenue is growing much faster than expenses, it indicates improving operational efficiency. Comment on this.
5.  **Key Turning Points**: Identify any significant years. For example, the year the company first became profitable, or a year where revenue growth dramatically outpaced expense growth.
6.  **Actionable Suggestion**: Based on the trends, provide a specific, actionable suggestion. For example, "Given the slowing revenue growth in the last year, focus on customer retention strategies," or "With expenses growing faster than revenue, a detailed cost audit of FY {{last_year}} is recommended."
7.  **Overall Health Summary**: Provide a concluding sentence summarizing the overall financial trajectory.
8.  **Data Quality**: If there is only one year of data, state that YoY analysis is not possible and recommend adding more data. If there are only two years, mention that the trend is emerging.

**CRITICAL**: Ensure all insights are distinct and provide real value. Do not repeat points. The final output must be professional and error-free.`,
});

const yoyAnalysisFlow = ai.defineFlow(
  {
    name: 'yoyAnalysisFlow',
    inputSchema: YoYInputSchema,
    outputSchema: YoYOutputSchema,
  },
  async (input) => {
    if (input.historicalData.length < 2) {
      return {
        insights: [
          "At least two years of data are required for a year-over-year analysis.",
          "Please add financial data for another year to generate insights.",
          "Consistent data tracking is crucial for identifying long-term trends.",
          "This tool can help you spot trends in revenue, expenses, and profitability once more data is available."
        ]
      }
    }
    
    // Pre-process the data to calculate profit/loss before sending to the prompt
    const processedData = input.historicalData.map(d => ({
        ...d,
        profitOrLoss: d.revenue - d.expenses,
    }));

    const {output} = await prompt({
        legalRegion: input.legalRegion,
        processedData: processedData,
    });
    
    if (!output) {
      throw new Error("The AI failed to generate a financial analysis.");
    }
    return output;
  }
);
