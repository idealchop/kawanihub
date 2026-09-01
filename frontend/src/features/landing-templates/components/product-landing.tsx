/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productCopy } from '../lib/product-copy';
import { LandingNav } from './landing-nav';

export function ProductLanding() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10 md:py-16">
      <LandingNav />
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{productCopy.kicker}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{productCopy.title}</h1>
          <p className="max-w-xl text-muted-foreground">{productCopy.body}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">{productCopy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/components">{productCopy.secondaryCta}</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{productCopy.featuresTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {productCopy.features.map((feature) => (
              <p key={feature.title}>
                <span className="font-medium text-foreground">{feature.title}.</span> {feature.body}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{productCopy.featuresTitle}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {productCopy.features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{productCopy.stepsTitle}</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {productCopy.steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold text-primary">0{index + 1}</p>
              <p className="mt-2 font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border bg-card px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{productCopy.closingTitle}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{productCopy.closingBody}</p>
        <Button asChild className="mt-5">
          <Link href="/login">{productCopy.primaryCta}</Link>
        </Button>
      </section>
    </div>
  );
}
