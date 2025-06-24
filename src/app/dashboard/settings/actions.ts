
'use server';

import { getCompanyDetails, type CompanyDetailsInput, type CompanyDetailsOutput } from '@/ai/flows/company-details-flow';

export async function fetchCompanyDetailsFromCIN(cin: string): Promise<CompanyDetailsOutput> {
  if (!cin || cin.length !== 21) {
    throw new Error('Invalid CIN provided.');
  }

  const input: CompanyDetailsInput = { cin };

  try {
    const result = await getCompanyDetails(input);
    return result;
  } catch (e: any) {
    console.error('AI Flow Error:', e);
    const errorMessage = e.message || 'An unexpected error occurred.';
    throw new Error(`AI is currently unavailable: ${errorMessage}`);
  }
}

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
