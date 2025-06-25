
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCompanyDetails } from '@/ai/flows/company-details-flow';

export async function handleNotificationSettings(prevState: any, formData: FormData) {
    const emailNotifications = formData.get('email_notifications') === 'on';
    const quarterlySnapshot = formData.get('quarterly_snapshot') === 'on';
    const whatsappBot = formData.get('whatsapp_bot') === 'on';

    console.log('Saving notification settings:', {
        emailNotifications,
        quarterlySnapshot,
        whatsappBot,
    });

    // In a real app, you would save these settings to your database.
    // Here, we just simulate a successful save.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: 'Your notification preferences have been saved.', error: null };
}


const CompanyDetailsInputSchema = z.object({
  cin: z.string().length(21).describe('The 21-character Corporate Identification Number of the company.'),
});
export type CompanyDetailsInput = z.infer<typeof CompanyDetailsInputSchema>;

const CompanyDetailsOutputSchema = z.object({
  name: z.string().describe("The full legal name of the company."),
  pan: z.string().length(10).describe("The 10-character Permanent Account Number (PAN) of the company."),
  incorporationDate: z.string().describe("The date of incorporation in YYYY-MM-DD format."),
  sector: z.string().describe("The primary industry or sector the company operates in."),
  location: z.string().describe("The location of the registered office in 'City, State' format."),
});
export type CompanyDetailsOutput = z.infer<typeof CompanyDetailsOutputSchema>;


export async function fetchCompanyDetailsFromCIN(cin: string): Promise<CompanyDetailsOutput> {
  if (!cin || cin.length !== 21) {
    throw new Error('Invalid CIN provided.');
  }

  try {
    const details = await getCompanyDetails({ cin });
    return details;
  } catch (error: any) {
    console.error('Error fetching company details from CIN flow:', error);
    throw new Error(error.message || 'Failed to fetch company details from AI.');
  }
}
