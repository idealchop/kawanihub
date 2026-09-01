/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const landingTemplateSlugs = ['product', 'waitlist', 'pricing', 'story'] as const;

export type LandingTemplateSlug = (typeof landingTemplateSlugs)[number];

export type LandingTemplateMeta = {
  slug: LandingTemplateSlug;
  title: string;
  description: string;
};

export const landingTemplates: LandingTemplateMeta[] = [
  {
    slug: 'product',
    title: 'Product',
    description: 'Hero, features, how it works, and a closing CTA. Default SaaS home.',
  },
  {
    slug: 'waitlist',
    title: 'Waitlist',
    description: 'Launch page with email capture and social proof.',
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    description: 'Three-plan grid and FAQ for a commercial product.',
  },
  {
    slug: 'story',
    title: 'Story',
    description: 'About / brand story with values and a contact CTA.',
  },
];

export function isLandingTemplateSlug(value: string): value is LandingTemplateSlug {
  return landingTemplateSlugs.includes(value as LandingTemplateSlug);
}

export function getLandingTemplate(slug: string): LandingTemplateMeta | undefined {
  return landingTemplates.find((template) => template.slug === slug);
}
