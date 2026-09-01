/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { useLocale } from '@/features/locale';
import { getPublicSolicitationCopy } from '../lib/public-solicitation-copy';
import { PictogramTicket, PictogramWrite } from './public-solicit-pictograms';
import { PublicSolicitSteps } from './public-solicit-steps';

export function PublicSolicitHome() {
  const { locale } = useLocale();
  const copy = getPublicSolicitationCopy(locale);

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <p className="text-center text-lg font-medium md:text-xl">{copy.spiel}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/solicit/request"
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl bg-primary px-6 py-8 text-primary-foreground shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] sm:min-h-56"
        >
          <PictogramWrite className="size-20" />
          <span className="text-3xl font-bold tracking-tight">{copy.requestTab}</span>
          <span className="text-base text-primary-foreground/80">{copy.requestHint}</span>
        </Link>
        <Link
          href="/solicit/claim"
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-amber-700 bg-amber-50 px-6 py-8 text-amber-950 shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 active:scale-[0.99] sm:min-h-56"
        >
          <PictogramTicket className="size-20" />
          <span className="text-3xl font-bold tracking-tight">{copy.claimTab}</span>
          <span className="text-base text-amber-900/80">{copy.claimHint}</span>
        </Link>
      </div>

      <PublicSolicitSteps />
    </div>
  );
}
