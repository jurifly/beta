
'use server';

import { getCompanyDetails } from '@/ai/flows/company-details-flow';
import type { CompanyDetailsOutput } from '@/ai/flows/company-details-flow';

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

export async function fetchCompanyDetailsFromCIN(cin: string, legalRegion: string): Promise<CompanyDetailsOutput> {
  if (!cin || cin.length !== 21) {
    throw new Error('Invalid CIN provided.');
  }
  if (!legalRegion) {
    throw new Error('Legal region is required to fetch company details.');
  }

  try {
    const details = await getCompanyDetails({ cin, legalRegion });
    return details;
  } catch (error: any) {
    console.error('Error fetching company details from CIN flow:', error);
    throw new Error(error.message || 'Failed to fetch company details from AI.');
  }
}
