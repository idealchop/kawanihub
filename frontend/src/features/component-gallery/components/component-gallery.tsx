/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { CopyrightNotice } from '@/components/copyright-notice';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { brand } from '@/config/brand';
import { galleryCopy } from '../lib/gallery-copy';
import { GalleryData } from './gallery-data';
import { GalleryFeedback } from './gallery-feedback';
import { GalleryForms } from './gallery-forms';
import { GalleryOverlays } from './gallery-overlays';
import { GallerySection } from './gallery-section';

export function ComponentGallery() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" aria-label="Back to home">
          <BrandMark />
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/landing">Landings</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{galleryCopy.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{galleryCopy.description}</p>
      </div>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {galleryCopy.sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-md border bg-card px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <GallerySection id="brand" title="Brand" description="Identity tokens from brand.ts.">
        <div className="flex flex-col gap-4">
          <BrandMark />
          <div className="flex flex-wrap gap-3">
            {Object.entries(brand.colors).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="size-8 rounded-md border" style={{ backgroundColor: value }} />
                <div className="text-xs">
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <CopyrightNotice />
        </div>
      </GallerySection>

      <GallerySection id="buttons" title="Buttons" description="Variants, sizes, and disabled.">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </GallerySection>

      <GalleryForms />
      <GalleryFeedback />
      <GalleryOverlays />
      <GalleryData />
    </div>
  );
}
