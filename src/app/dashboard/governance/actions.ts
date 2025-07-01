
'use server';

import { 
    generateAgenda as generateAgendaFlow, 
    type GenerateAgendaInput, 
    type GenerateAgendaOutput,
    generateMinutes as generateMinutesFlow,
    type GenerateMinutesInput,
    type GenerateMinutesOutput
} from '@/ai/flows/governance-flow';

export async function generateAgenda(input: GenerateAgendaInput): Promise<GenerateAgendaOutput> {
  try {
    return await generateAgendaFlow(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI is currently unavailable: ${errorMessage}`);
  }
}

export async function generateMinutes(input: GenerateMinutesInput): Promise<GenerateMinutesOutput> {
    try {
      return await generateMinutesFlow(input);
    } catch (e: any) {
      console.error('AI Flow Error:', e);
      const errorMessage = e.message || 'An unexpected error occurred.';
      throw new Error(`AI is currently unavailable: ${errorMessage}`);
    }
  }
