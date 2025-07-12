
'use server';
/**
 * @fileOverview A server-side flow to fetch news from NewsAPI.org.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NewsInputSchema = z.object({
  topic: z.string().describe('The search topic for news articles, e.g., "corporate law", "taxation".'),
  legalRegion: z.string().describe('The country for the news, e.g., "India", "USA".'),
});
export type NewsInput = z.infer<typeof NewsInputSchema>;

const ArticleSchema = z.object({
    source: z.object({
        id: z.string().nullable(),
        name: z.string(),
    }),
    author: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    url: z.string().url(),
    urlToImage: z.string().url().nullable(),
    publishedAt: z.string(),
    content: z.string().nullable(),
});
export type NewsArticle = z.infer<typeof ArticleSchema>;

const NewsOutputSchema = z.object({
  articles: z.array(ArticleSchema),
});
export type NewsOutput = z.infer<typeof NewsOutputSchema>;

const regionToCountryCode: Record<string, string> = {
    'India': 'in',
    'USA': 'us',
    'UK': 'gb',
    'Singapore': 'sg',
    'Australia': 'au',
    'Canada': 'ca',
}

// This is not a standard genkit flow as it doesn't use an LLM,
// but we define it in this structure to act as a secure server-side
// function that can be called from our client components.
export async function getNews(input: NewsInput): Promise<NewsOutput> {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        console.error("NewsAPI key is not configured in .env file.");
        throw new Error('News service is currently unavailable.');
    }

    const countryCode = regionToCountryCode[input.legalRegion] || 'us';
    const query = encodeURIComponent(input.topic);
    
    // Construct the API URL
    const url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&q=${query}&category=business&pageSize=12&apiKey=${apiKey}`;

    try {
        const response = await fetch(url, {
            // Revalidate every 4 hours
            next: { revalidate: 14400 }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`NewsAPI request failed: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Validate the structure of the articles
        const validatedArticles = data.articles
            .map((article: any) => {
                const result = ArticleSchema.safeParse(article);
                if (result.success) {
                    return result.data;
                }
                console.warn("Skipping invalid article from NewsAPI:", result.error);
                return null;
            })
            .filter((article: NewsArticle | null): article is NewsArticle => article !== null);

        return { articles: validatedArticles };
    } catch (error: any) {
        console.error("Error fetching news:", error);
        throw new Error(`Could not fetch news: ${error.message}`);
    }
}
