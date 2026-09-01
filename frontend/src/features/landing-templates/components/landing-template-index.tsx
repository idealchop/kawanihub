/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { landingTemplates } from '../lib/landing-templates';
import { LandingNav } from './landing-nav';

export function LandingTemplateIndex() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
      <LandingNav current="landing" />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Landing pages</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Templates you can rebrand.</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Four marketing layouts. Copy the page, change brand.ts, keep the River Tech copyright.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {landingTemplates.map((template) => (
          <Card key={template.slug}>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/landing/${template.slug}`}>Open {template.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
