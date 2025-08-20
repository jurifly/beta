
'use client';

import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "@/hooks/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "532549254703-3n55saddi2f1vpoa1mis3nlecpcc4c1o.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
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
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}
