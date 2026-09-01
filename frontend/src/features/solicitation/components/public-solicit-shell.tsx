/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { useLocale } from '@/features/locale';
import { getPublicSolicitationCopy } from '../lib/public-solicitation-copy';
import { PublicLanguageToggle } from './public-language-toggle';

export function PublicSolicitShell({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const copy = getPublicSolicitationCopy(locale);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 md:py-10">
        <header className="flex items-center justify-between gap-3">
          <Link href="/solicit" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-3">
            <PublicLanguageToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              {copy.staffLink}
            </Link>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
