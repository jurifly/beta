
'use server';

import { getAssistantResponse as getAssistantResponseFlow, type AssistantInput, type AssistantOutput } from '@/ai/flows/assistant-flow';
import { generateChecklist as generateDiligenceChecklistFlow, type GenerateChecklistInput, type GenerateChecklistOutput } from '@/ai/flows/generate-checklist-flow';
import { validateCompliance, type ComplianceValidatorInput, type ComplianceValidatorOutput } from '@/ai/flows/compliance-validator-flow';
import { analyzeDocument, type DocumentIntelligenceInput, type DocumentIntelligenceOutput } from '@/ai/flows/document-intelligence-flow';
import { generateDocument, type DocumentGeneratorInput, type DocumentGeneratorOutput } from '@/ai/flows/document-generator-flow';
import { generateWiki, type WikiGeneratorInput, type WikiGeneratorOutput } from '@/ai/flows/wiki-generator-flow';
import { watchRegulations, type WatcherInput, type WatcherOutput } from '@/ai/flows/regulation-watcher-flow';
import { reconcileDocuments, type ReconciliationInput, type ReconciliationOutput } from '@/ai/flows/reconciliation-flow';
import { performLegalResearch, type LegalResearchInput, type LegalResearchOutput } from '@/ai/flows/legal-research-flow';


// --- AI Assistant Actions ---
export async function getAssistantResponse(input: AssistantInput): Promise<AssistantOutput> {
  try {
    return await getAssistantResponseFlow(input);
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
  const legalRegion = formData.get('legalRegion') as string;
  if (!dealType || !legalRegion) return { data: null, error: 'Deal type and legal region are required.' };
  try {
    const result = await generateDiligenceChecklistFlow({ dealType, legalRegion });
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
  const legalRegion = formData.get('legalRegion') as string;
  if (!fileDataUri || !framework || !legalRegion) return { data: null, error: 'File, framework and legalRegion are required.' };
  try {
    const result = await validateCompliance({ fileDataUri, framework, legalRegion });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}

// --- Document Intelligence Action ---
export async function analyzeDocumentAction(input: DocumentIntelligenceInput): Promise<DocumentIntelligenceOutput> {
  try {
    return await analyzeDocument(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not analyze the document.');
  }
}

// --- Document Studio Actions ---
export async function generateDocumentAction(input: DocumentGeneratorInput): Promise<DocumentGeneratorOutput> {
  try {
    return await generateDocument(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'There was an error generating your document.');
  }
}

export async function generateWikiAction(input: WikiGeneratorInput): Promise<WikiGeneratorOutput> {
  try {
    return await generateWiki(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'There was an error generating the wiki page.');
  }
}


// --- Regulation Watcher Actions ---
type WatcherFormState = { data: WatcherOutput | null; error: string | null; };
export async function getRegulatoryUpdatesAction(previousState: WatcherFormState, formData: FormData): Promise<WatcherFormState> {
  const portal = formData.get('portal') as string;
  const frequency = formData.get('frequency') as string;
  const legalRegion = formData.get('legalRegion') as string;
  if (!portal || !frequency || !legalRegion) return { data: null, error: 'Portal, frequency, and legal region are required.' };
  try {
    const result = await watchRegulations({ portal, frequency, legalRegion });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    return { data: null, error: e.message || 'An unexpected error occurred.' };
  }
}

// --- Reconciliation Action ---
export async function reconcileDocumentsAction(input: ReconciliationInput): Promise<ReconciliationOutput> {
    try {
        return await reconcileDocuments(input);
    } catch (e: any) {
        console.error('AI Flow Error:', e);
        throw new Error(e.message || 'Could not reconcile the documents.');
    }
}

// --- Legal Research Action ---
export async function performLegalResearchAction(input: LegalResearchInput): Promise<LegalResearchOutput> {
  try {
    return await performLegalResearch(input);
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    throw new Error(e.message || 'Could not perform legal research.');
  }
}
