'use server';

import { generateChecklist, type GenerateChecklistInput, type GenerateChecklistOutput } from '@/ai/flows/generate-checklist-flow';

type FormState = {
  data: GenerateChecklistOutput | null;
  error: string | null;
};

/**
 * Server action to invoke the AI checklist generation flow.
 * @param previousState The previous state of the form.
 * @param formData The data submitted from the form.
 * @returns A promise that resolves to the new form state.
 */
export async function generateDiligenceChecklist(previousState: FormState, formData: FormData): Promise<FormState> {
  const dealType = formData.get('dealType') as string;

  if (!dealType) {
    return { data: null, error: 'Deal type is required.' };
  }
  
  const input: GenerateChecklistInput = { dealType };

  try {
    const result = await generateChecklist(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    return { data: null, error: `AI is currently unavailable: ${errorMessage}` };
  }
}
