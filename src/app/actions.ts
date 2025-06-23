'use server';

import { z } from 'zod';
import { suggestDashboardConfig, type SuggestDashboardConfigOutput } from '@/ai/flows/suggest-dashboard-config';

const schema = z.object({
  businessGoal: z.string({
    required_error: "Business goal is required.",
  }).min(10, { message: 'Please describe your business goal in more detail (at least 10 characters).' }),
});

export type State = {
  message?: string | null;
  data?: SuggestDashboardConfigOutput | null;
  errors?: {
    businessGoal?: string[];
  }
}

export async function getDashboardSuggestions(
  prevState: State, 
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    businessGoal: formData.get('businessGoal'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      data: null,
    };
  }

  try {
    const result = await suggestDashboardConfig({ businessGoal: validatedFields.data.businessGoal });
    return { message: 'Suggestions generated successfully.', data: result, errors: {} };
  } catch (error) {
    console.error(error);
    return { message: 'An AI error occurred. Please try again later.', data: null, errors: {} };
  }
}
