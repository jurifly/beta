
'use server';

import { generateChecklist as generateAssistantChecklist, type AssistantInput, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { generateChecklist as generateDiligenceChecklistFlow, type GenerateChecklistInput, type GenerateChecklistOutput } from '@/ai/flows/generate-checklist-flow';
import { validateCompliance, type ComplianceValidatorInput, type ComplianceValidatorOutput } from '@/ai/flows/compliance-validator-flow';
import { analyzeContract, type AnalyzeContractInput, type AnalyzeContractOutput } from '@/ai/flows/contract-analyzer-flow';
import { summarizeDocument, type DocumentSummarizerInput, type DocumentSummarizerOutput } from '@/ai/flows/document-summarizer-flow';
import { generateDocument, type DocumentGeneratorInput, type DocumentGeneratorOutput } from '@/ai/flows/document-generator-flow';
import { generateWiki, type WikiGeneratorInput, type WikiGeneratorOutput } from '@/ai/flows/wiki-generator-flow';
import { watchRegulations, type WatcherInput, type WatcherOutput } from '@/ai/flows/regulation-watcher-flow';


// --- AI Assistant Actions ---
export async function generateChecklist(input: AssistantInput): Promise<AssistantOutput> {
  try {
    return await generateAssistantChecklist(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI is currently unavailable: ${errorMessage}`);
  }
}

// --- Dataroom Audit Actions ---
type DiligenceFormState = { data: GenerateChecklistOutput | null; error: string | null; };
export async function generateDiligenceChecklistAction(previousState: DiligenceFormState, formData: FormData): Promise<DiligenceFormState> {
  const dealType = formData.get('dealType') as string;
  if (!dealType) return { data: null, error: 'Deal type is required.' };
  try {
    const result = await generateDiligenceChecklistFlow({ dealType });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}

type ComplianceFormState = { data: ComplianceValidatorOutput | null; error: string | null; };
export async function validateComplianceAction(previousState: ComplianceFormState, formData: FormData): Promise<ComplianceFormState> {
  const fileDataUri = formData.get('fileDataUri') as string;
  const framework = formData.get('framework') as string;
  if (!fileDataUri || !framework) return { data: null, error: 'File and framework are required.' };
  try {
    const result = await validateCompliance({ fileDataUri, framework });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}

// --- Contract Analyzer Actions ---
export async function analyzeContractAction(input: AnalyzeContractInput): Promise<AnalyzeContractOutput> {
  try {
    return await analyzeContract(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not analyze the contract.');
  }
}

export async function summarizeDocumentAction(input: DocumentSummarizerInput): Promise<DocumentSummarizerOutput> {
  try {
    return await summarizeDocument(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not summarize the document.');
  }
}

// --- Document Generator Actions ---
export async function generateDocumentAction(input: DocumentGeneratorInput): Promise<DocumentGeneratorOutput> {
  try {
    return await generateDocument(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'There was an error generating your document.');
  }
}

// --- Regulation Watcher Actions ---
type WatcherFormState = { data: WatcherOutput | null; error: string | null; };
export async function getRegulatoryUpdatesAction(previousState: WatcherFormState, formData: FormData): Promise<WatcherFormState> {
  const portal = formData.get('portal') as string;
  const frequency = formData.get('frequency') as string;
  if (!portal || !frequency) return { data: null, error: 'Portal and frequency are required.' };
  try {
    const result = await watchRegulations({ portal, frequency });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}
