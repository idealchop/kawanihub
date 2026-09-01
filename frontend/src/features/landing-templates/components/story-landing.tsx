/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storyCopy } from '../lib/story-copy';
import { LandingNav } from './landing-nav';

export function StoryLanding() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10 md:py-16">
      <LandingNav />
      <article className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{storyCopy.kicker}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{storyCopy.title}</h1>
        <p className="text-muted-foreground">{storyCopy.body}</p>
      </article>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{storyCopy.valuesTitle}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {storyCopy.values.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <CardTitle className="text-base">{value.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{value.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-card px-6 py-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">{storyCopy.ctaTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{storyCopy.ctaBody}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/components">Components</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
