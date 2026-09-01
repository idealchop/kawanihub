/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { DashboardShell } from '@/features/dashboard';

export const metadata: Metadata = {
  title: productTitle('Desk'),
  robots: { index: false, follow: false },
};

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
