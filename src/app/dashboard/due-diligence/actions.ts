'use server';

import { generateChecklist, type GenerateChecklistOutput } from "@/ai/flows/generate-checklist-flow";

export async function generateDiligenceChecklist(
  prevState: any,
  formData: FormData
): Promise<{ data: GenerateChecklistOutput | null; error: string | null }> {
    const dealType = formData.get('dealType') as string;

    if (!dealType) {
        return { data: null, error: 'Deal type is required.' };
    }

    try {
        const result = await generateChecklist({ dealType });
        return { data: result, error: null };
    } catch (e: any) {
        console.error('Checklist Generation Error:', e);
        return { data: null, error: e.message || 'An unexpected error occurred.' };
    }
}
