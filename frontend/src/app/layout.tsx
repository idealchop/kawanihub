/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { brand, productTitle } from '@/config/brand';
import { LocaleProvider } from '@/features/locale';
import { BrandTheme } from './brand-theme';
import './globals.css';

export const metadata: Metadata = {
  title: productTitle(),
  description: brand.description,
  icons: {
    icon: '/brand/logo.svg',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandTheme />
        <LocaleProvider>
          {children}
          <Toaster richColors position="top-right" />
        </LocaleProvider>
      </body>
    </html>
  );
}
