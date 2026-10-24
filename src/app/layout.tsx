import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { ThemeProvider } from '@/lib/themeContext';
import { AuthProvider } from '@/lib/authContext';
import { NavigationGuardProvider } from '@/lib/navigationGuardContext';

export const metadata: Metadata = {
  title: 'YojanaSethu — Proof-Based Student Career & Placement Platform',
  description:
    'Resumes show what students claim. YojanaSethu shows what they can prove, and tells them how to close the gap. Built for Nexathon 2026 by Team Neural Forge.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <NavigationGuardProvider>
              <AppShell>{children}</AppShell>
            </NavigationGuardProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
