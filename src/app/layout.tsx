
import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 

export const metadata: Metadata = {
  title: 'Jurifly - Your AI Co-pilot for Startup Compliance',
  description: 'Stay legally compliant and build your startup with Jurifly, India\'s smartest AI co-pilot for founders and CAs. Handle GST, ROC, ITR, and more with ease.',
  keywords: ['startup compliance', 'AI assistant', 'founders', 'CA tools', 'legal tech', 'document generation', 'cap table'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
        <Providers>
            {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
