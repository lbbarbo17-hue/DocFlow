import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocFlow — Guarda & Gestão Documental',
  description:
    'Plataforma B2B corporativa para guarda e gestão de documentos de aprendizes e estagiários.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${jakarta.variable} ${jetbrains.variable} ${outfit.variable}`}
    >
      <body className="font-sans antialiased bg-[#eaedf2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
