/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';

export const pricingCopy = {
  kicker: 'Para sa tanggapan',
  title: `Mga plano para sa ${brand.productName}.`,
  body: 'Palitan ang presyo kapag may billing na. Ang layout ang template.',
  plans: [
    {
      name: 'Barangay',
      price: 'Libre',
      detail: 'Unang desk ng opisyal',
      cta: 'Simulan',
      featured: false,
      items: ['1 workspace', 'Hiling list', 'Demo mode'],
    },
    {
      name: 'Distrito',
      price: '₱1,499',
      detail: 'Bawat tanggapan / buwan',
      cta: 'Piliin',
      featured: true,
      items: ['Walang limit na staff', 'Data table + filter', 'Suporta sa email'],
    },
    {
      name: 'Lalawigan',
      price: 'Kausapin kami',
      detail: brand.supportEmail,
      cta: 'Makipag-ugnayan',
      featured: false,
      items: ['Custom domain', 'Onboarding ng River Tech', 'Maraming opisina'],
    },
  ],
  faqTitle: 'Mga tanong',
  faqs: [
    { q: 'Pwede bang pangalan ng opisyal ang brand?', a: 'Oo. Palitan ang brand.ts at logo. Copyright ay River Tech pa rin.' },
    { q: 'May bayad ba ito ngayon?', a: 'Hindi. Layout lang ito hanggang may payment sa API.' },
  ],
} as const;
