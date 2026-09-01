/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';

export const productCopy = {
  kicker: 'Para sa inyong distrito',
  title: brand.tagline,
  body: brand.description,
  primaryCta: 'Magsimula',
  secondaryCta: 'Mga landing',
  featuresTitle: 'Ano ang kaya ng Kawanihub',
  features: [
    { title: 'Hiling ng mamamayan', body: 'Isang desk para sa tulong, reklamo, at dokumento.' },
    { title: 'Desk ng opisyal', body: 'Login, workspace, at dashboard — hindi paper trail lang.' },
    { title: 'Malinaw na kontrata', body: 'Frontend ang nagbabasa. Backend ang nagsusulat. May GET sa bawat mutation.' },
  ],
  stepsTitle: 'Paano gagamitin',
  steps: [
    { title: 'I-rebrand', body: 'Pangalan, litrato, at kulay ng opisyal sa brand.ts.' },
    { title: 'Tanggapin ang hiling', body: 'Mamamayan o staff ang maglalagay; opisyal ang tutugon.' },
    { title: 'Ihatid ang serbisyo', body: 'Markahan ang hiling: bukas, may tugon, o tapos na.' },
  ],
  closingTitle: 'Mas malapit na serbisyo sa tao.',
  closingBody: 'Kawanihub ay ang personal na app ng opisyal — hindi generic portal.',
} as const;
