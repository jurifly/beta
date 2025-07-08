
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/auth';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Inter, Source_Code_Pro, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-source-code-pro',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});


export const metadata: Metadata = {
  title: 'Legalizd - AI Co-Pilot for Startup Compliance',
  description: 'Organize legal tasks, track compliance, and collaborate with your CA in one place. Your AI assistant for startup compliance and legal docs.',
  keywords: ['startup compliance', 'AI assistant', 'founders', 'CA tools', 'legal tech', 'document generation', 'cap table'],
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceCodePro.variable} ${playfairDisplay.variable} font-body antialiased`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
