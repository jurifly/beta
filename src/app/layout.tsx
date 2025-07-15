
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/auth';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 

export const metadata: Metadata = {
  title: 'Jurifly - Your AI Co-pilot for Startup Compliance',
  description: 'Jurifly is your AI co-pilot for startup compliance. Organize legal tasks, track compliance, and collaborate with your CA in one place.',
  keywords: ['startup compliance', 'AI assistant', 'founders', 'CA tools', 'legal tech', 'document generation', 'cap table'],
};

const GOOGLE_CLIENT_ID = "532549254703-3n55saddi2f1vpoa1mis3nlecpcc4c1o.apps.googleusercontent.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
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
