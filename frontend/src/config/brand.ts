/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * Kawanihub — personalized constituent service for a government official.
 */

export const brand = {
  legalName: 'River Tech',
  productName: 'Kawanihub',
  productSlug: 'kawanihub',
  shortName: 'Kawani',
  tagline: 'Sentro ng serbisyo para sa taumbayan.',
  description:
    'Personal na app ng isang opisyal ng gobyerno — tumanggap ng solicitation, maglabas ng anunsyo, at maghatid ng tulong sa mamamayan.',
  copyrightYear: 2026,
  supportEmail: 'hello@kawanihub.ph',
  websiteUrl: 'https://kawanihub.ph',
  appUrl: 'http://localhost:3000',
  colors: {
    primary: '#0F4C81',
    primaryForeground: '#f8fafc',
    ring: '#0F4C81',
  },
} as const;

export type BrandConfig = typeof brand;

export function copyrightLine(year = brand.copyrightYear): string {
  return `© ${year} ${brand.legalName}. All rights reserved.`;
}

export function productTitle(page?: string): string {
  return page ? `${page} · ${brand.productName}` : brand.productName;
}
