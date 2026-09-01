/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher, useLocale } from '@/features/locale';
import { getLandingCopy } from '../lib/landing-copy';

export function LandingHero() {
  const { locale } = useLocale();
  const landingCopy = getLandingCopy(locale);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 md:py-16">
      <header className="flex items-center justify-between gap-3">
        <BrandMark />
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher id="landing-language" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/landing">Landings</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/components">Components</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">{landingCopy.signIn}</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{landingCopy.heroKicker}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{landingCopy.heroTitle}</h1>
          <p className="max-w-xl text-muted-foreground">{landingCopy.heroBody}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/solicit/request">{landingCopy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/solicit/claim">{landingCopy.secondaryCta}</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{landingCopy.deskCardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {landingCopy.deskCardLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {landingCopy.pillars.map((pillar) => (
          <Card key={pillar.title}>
            <CardHeader>
              <CardTitle className="text-base">{pillar.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{pillar.body}</CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
