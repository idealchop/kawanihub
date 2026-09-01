/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/features/locale';
import { getPublicSolicitationCopy } from '../lib/public-solicitation-copy';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import { claimPublicSolicitation, createPublicSolicitation } from '../services/public-solicitation-api';
import type { PublicSolicitation } from '../types/solicitation';
import { PictogramHome, PictogramOk, PictogramTicket, PictogramWrite } from './public-solicit-pictograms';
import { SolicitationClaimForm } from './solicitation-claim-form';
import { SolicitationForm } from './solicitation-form';

export function PublicSolicitationPage({ mode }: { mode: 'request' | 'claim' }) {
  const { locale } = useLocale();
  const publicCopy = getPublicSolicitationCopy(locale);
  const copy = getSolicitationCopy(locale);
  const [claimed, setClaimed] = useState<PublicSolicitation | null>(null);
  const [submitted, setSubmitted] = useState<PublicSolicitation | null>(null);
  const isClaim = mode === 'claim';

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/solicit"
        className="inline-flex w-fit items-center gap-2 rounded-xl border bg-background px-3 py-2 text-base font-semibold hover:bg-accent"
      >
        <PictogramHome className="size-7" />
        {publicCopy.backToPortal}
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        {isClaim ? <PictogramTicket className="size-16 text-amber-800" /> : <PictogramWrite className="size-16 text-primary" />}
        <h1 className="text-3xl font-bold tracking-tight">
          {isClaim ? publicCopy.claimTab : publicCopy.requestTab}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isClaim ? publicCopy.claimLead : publicCopy.requestLead}
        </p>
      </div>

      {mode === 'request' ? (
        submitted ? (
          <Card>
            <CardHeader className="items-center text-center">
              <PictogramOk className="size-16 text-primary" />
              <CardTitle className="text-2xl">{publicCopy.requestSuccess}</CardTitle>
              <CardDescription className="text-base">
                {publicCopy.requestSuccessBody}
              </CardDescription>
              <CardDescription className="text-base">
                {submitted.requesterName}
                {submitted.beneficiaryName ? ` · ${copy.beneficiaryLabel}: ${submitted.beneficiaryName}` : ''}
                {submitted.barangay ? ` · ${submitted.barangay}` : ''}
              </CardDescription>
              <Button asChild size="lg" variant="outline" className="mt-2 h-12 w-full max-w-md text-base">
                <Link href="/solicit">{publicCopy.backToPortal}</Link>
              </Button>
            </CardHeader>
          </Card>
        ) : (
          <SolicitationForm
            idPrefix="public-request"
            pictureLayout
            showSuccessToast={false}
            onCreate={async (input) => {
              const created = await createPublicSolicitation(input);
              setSubmitted(created);
              return created;
            }}
          />
        )
      ) : claimed ? (
        <Card>
          <CardHeader className="items-center text-center">
            <PictogramOk className="size-16 text-primary" />
            <CardTitle className="text-2xl">{publicCopy.claimSuccess}</CardTitle>
            <CardDescription className="text-base">
              {claimed.requesterName}
              {claimed.beneficiaryName ? ` · ${copy.beneficiaryLabel}: ${claimed.beneficiaryName}` : ''}
              {claimed.barangay ? ` · ${claimed.barangay}` : ''}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <SolicitationClaimForm
          idPrefix="public-claim"
          pictureLayout
          onClaim={async (input) => {
            const result = await claimPublicSolicitation(input);
            setClaimed(result);
            return result;
          }}
        />
      )}
    </div>
  );
}
