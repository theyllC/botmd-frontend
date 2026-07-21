import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import { TooltipProvider } from '@/components/ui/Tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'BoTMD - Assistant d\'Onboarding',
  description: 'Chatbot RAG pour l\'onboarding des nouveaux employés',
  keywords: ['onboarding', 'chatbot', 'RAG', 'assistant', 'entreprise'],
};

export const viewport: Viewport = {
  themeColor: '#0071e3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-secondary-900">
        <TooltipProvider delayDuration={300}>
          <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#1e293b', color: '#f8fafc' },
            }}
          />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}