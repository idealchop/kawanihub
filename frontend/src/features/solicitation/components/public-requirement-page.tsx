/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/features/locale';
import { getPublicSolicitationCopy } from '../lib/public-solicitation-copy';
import { getPublicSolicitation } from '../services/public-solicitation-api';
import type { PublicSolicitation } from '../types/solicitation';
import { PictogramHome, PictogramOk } from './public-solicit-pictograms';

export function PublicRequirementPage({ solicitationId }: { solicitationId: string; autoFillDemo?: boolean }) {
  const { locale } = useLocale();
  const copy = getPublicSolicitationCopy(locale);
  const [row, setRow] = useState<PublicSolicitation | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getPublicSolicitation(solicitationId)
      .then((next) => {
        if (!active) return;
        setRow(next);
      })
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : copy.papersMissing);
      });
    return () => {
      active = false;
    };
  }, [copy.papersMissing, solicitationId]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/solicit"
        className="inline-flex w-fit items-center gap-2 rounded-xl border bg-background px-3 py-2 text-base font-semibold hover:bg-accent"
      >
        <PictogramHome className="size-7" />
        {copy.backToPortal}
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <PictogramOk className="size-16 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{copy.requestSuccess}</h1>
        <p className="text-lg text-muted-foreground">{copy.requestSuccessBody}</p>
        {row ? (
          <p className="text-base text-muted-foreground">
            {row.requesterName}
            {row.barangay ? ` · ${row.barangay}` : ''}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="grid gap-4 rounded-2xl border bg-card p-4 text-center md:p-6">
          <p className="text-base text-destructive">{error || copy.papersMissing}</p>
          <Button asChild size="lg" className="h-12 w-full text-base">
            <Link href="/solicit/request">{copy.requestTab}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 rounded-2xl border bg-card p-4 text-center md:p-6">
          <Button asChild size="lg" variant="outline" className="h-12 w-full text-base">
            <Link href="/solicit">{copy.backToPortal}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
