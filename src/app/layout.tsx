import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/store/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingConcierge } from '@/components/layout/FloatingConcierge';
import { SpotlightSearch } from '@/components/commerce/SpotlightSearch';
import { BagContainerDrawer } from '@/components/commerce/BagContainerDrawer';
import { QuickViewModal } from '@/components/commerce/QuickViewModal';
import { CompareDock } from '@/components/commerce/CompareDock';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Ayaan Clothing — Global RMG Manufacturer, Branded Stock Lots & Buying House (Dhaka)',
  description:
    'Export-grade original branded stock lots, custom OEM apparel manufacturing, and AQL 2.5 inspected sourcing direct from 600+ verified Bangladesh factories since 2010.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-white font-sans text-[#0A0B0E] antialiased selection:bg-indigo-100 selection:text-indigo-950">
        <AppProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] bg-white">{children}</main>
          <Footer />
          <SpotlightSearch />
          <BagContainerDrawer />
          <QuickViewModal />
          <CompareDock />
          <FloatingConcierge />
        </AppProvider>
      </body>
    </html>
  );
}
