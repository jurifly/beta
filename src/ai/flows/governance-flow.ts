
'use server';
/**
 * @fileOverview AI flows for corporate governance tasks like generating meeting agendas and minutes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Agenda Generation ---

const GenerateAgendaInputSchema = z.object({
  meetingType: z.string().describe('The type of meeting, e.g., "Quarterly Board Meeting", "AGM", "Committee Meeting".'),
  topics: z.array(z.string()).describe('A list of key topics or discussion points to include in the agenda.'),
  legalRegion: z.string().describe('The legal region for context, e.g., "India", "USA".'),
});
export type GenerateAgendaInput = z.infer<typeof GenerateAgendaInputSchema>;

const AgendaItemSchema = z.object({
  topic: z.string().describe("The main topic of the agenda item."),
  presenter: z.string().describe("The person or department responsible for presenting the item, e.g., 'CEO', 'CFO', 'Legal Team'."),
  time_allocated: z.string().describe("Suggested time allocation, e.g., '15 minutes'."),
  description: z.string().describe("A brief description of the item's purpose."),
});

const GenerateAgendaOutputSchema = z.object({
  title: z.string().describe("The full title of the meeting agenda."),
  agenda: z.array(AgendaItemSchema).describe("The list of structured agenda items."),
});
export type GenerateAgendaOutput = z.infer<typeof GenerateAgendaOutputSchema>;

export async function generateAgenda(input: GenerateAgendaInput): Promise<GenerateAgendaOutput> {
  return generateAgendaFlow(input);
}

const agendaPrompt = ai.definePrompt({
  name: 'generateAgendaPrompt',
  input: {schema: GenerateAgendaInputSchema},
  output: {schema: GenerateAgendaOutputSchema},
  prompt: `You are an expert corporate secretary AI. Your task is to generate a professional and comprehensive agenda for a corporate meeting.

Meeting Type: "{{meetingType}}"
Key Topics: {{#each topics}}- {{this}}\n{{/each}}
Legal Region: {{legalRegion}}

Based on the inputs, generate a structured agenda. Ensure you include standard opening and closing items such as "Call to Order", "Approval of Previous Minutes", "Review of Action Items", and "Adjournment". Assign logical presenters (e.g., CFO for financial review, CEO for business update) and appropriate time allocations for each item. The final output should be well-organized and ready for a formal board or shareholder meeting.
`,
});

const generateAgendaFlow = ai.defineFlow(
  {
    name: 'generateAgendaFlow',
    inputSchema: GenerateAgendaInputSchema,
    outputSchema: GenerateAgendaOutputSchema,
  },
  async input => {
    const {output} = await agendaPrompt(input);
    if (!output) throw new Error("The AI failed to generate an agenda.");
    return output;
  }
);


// --- Minutes Generation ---

const GenerateMinutesInputSchema = z.object({
  agenda: z.string().describe("The full agenda that was followed in the meeting."),
  attendees: z.array(z.string()).describe("A list of attendees who were present."),
  notes: z.string().describe("Detailed raw notes, decisions, and discussions from the meeting."),
  legalRegion: z.string().describe('The legal region for context, e.g., "India", "USA".'),
});
export type GenerateMinutesInput = z.infer<typeof GenerateMinutesInputSchema>;

const GenerateMinutesOutputSchema = z.object({
  minutes: z.string().describe("The fully drafted, professional meeting minutes in Markdown format. This should be a complete document, including title, date, attendees, and a detailed summary of discussions and decisions for each agenda item."),
});
export type GenerateMinutesOutput = z.infer<typeof GenerateMinutesOutputSchema>;

export async function generateMinutes(input: GenerateMinutesInput): Promise<GenerateMinutesOutput> {
  return generateMinutesFlow(input);
}

const minutesPrompt = ai.definePrompt({
  name: 'generateMinutesPrompt',
  input: {schema: GenerateMinutesInputSchema},
  output: {schema: GenerateMinutesOutputSchema},
  prompt: `You are an expert corporate secretary AI specializing in drafting precise and professional meeting minutes, compliant with standards in {{legalRegion}}.

Your task is to convert raw meeting notes into a formal minutes document.

Meeting Agenda:
\`\`\`
{{{agenda}}}
\`\`\`

Attendees:
- {{#each attendees}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Raw Notes:
\`\`\`
{{{notes}}}
\`\`\`

Based on the provided information, generate a complete and formal meeting minutes document in Markdown format. Follow the structure of the agenda. For each agenda item, summarize the discussion from the raw notes, clearly state any decisions made, resolutions passed, and action items assigned. The language must be formal, objective, and clear.
`,
});

const generateMinutesFlow = ai.defineFlow(
  {
    name: 'generateMinutesFlow',
    inputSchema: GenerateMinutesInputSchema,
    outputSchema: GenerateMinutesOutputSchema,
  },
  async input => {
    const {output} = await minutesPrompt(input);
    if (!output) throw new Error("The AI failed to generate meeting minutes.");
    return output;
  }
);
