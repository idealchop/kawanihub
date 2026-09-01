/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productTitle } from '@/config/brand';
import { LandingFooter } from '@/features/marketing-ui';
import {
  getLandingTemplate,
  isLandingTemplateSlug,
  landingTemplateSlugs,
  LandingTemplatePage,
} from '@/features/landing-templates';

type LandingParams = { slug: string };

export function generateStaticParams() {
  return landingTemplateSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<LandingParams> }): Promise<Metadata> {
  const { slug } = await params;
  const template = getLandingTemplate(slug);
  if (!template) return { title: productTitle('Landing') };
  return {
    title: productTitle(template.title),
    description: template.description,
  };
}

export default async function LandingSlugPage({ params }: { params: Promise<LandingParams> }) {
  const { slug } = await params;
  if (!isLandingTemplateSlug(slug)) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingTemplatePage slug={slug} />
      <div className="mt-auto">
        <LandingFooter />
      </div>
    </div>
  );
}
