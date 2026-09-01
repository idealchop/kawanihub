/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pricingCopy } from '../lib/pricing-copy';
import { LandingNav } from './landing-nav';

export function PricingLanding() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10 md:py-16">
      <LandingNav />
      <section className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{pricingCopy.kicker}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{pricingCopy.title}</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">{pricingCopy.body}</p>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        {pricingCopy.plans.map((plan) => (
          <Card key={plan.name} className={plan.featured ? 'border-primary shadow-md' : undefined}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.detail}</CardDescription>
              <p className="pt-2 text-2xl font-semibold">{plan.price}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button asChild variant={plan.featured ? 'default' : 'outline'}>
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{pricingCopy.faqTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {pricingCopy.faqs.map((item) => (
            <div key={item.q} className="rounded-xl border bg-card p-5">
              <p className="font-medium">{item.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
