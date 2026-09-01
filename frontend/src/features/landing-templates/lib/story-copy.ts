/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';

export const storyCopy = {
  kicker: 'Ang kwento',
  title: 'Ang kawani ay para sa taumbayan — hindi malayo sa tao.',
  body: `${brand.productName} ay gawa sa River Kit. Layunin: mas mabilis na tugon sa hiling ng mamamayan, sa pangalan ng opisyal ninyo.`,
  valuesTitle: 'Ano ang aming tinataya',
  values: [
    { title: 'Malasakit', body: 'Bawat hiling ay may may-ari at status — hindi nawawala sa papel.' },
    { title: 'Tapat na desk', body: `© ${brand.copyrightYear} ${brand.legalName}. Ang serbisyo ay sa taumbayan.` },
    { title: 'Abot-kamay', body: 'Mobile cards, desktop table, at landing na Tagalog.' },
  ],
  ctaTitle: 'Buksan ang desk',
  ctaBody: 'Tingnan ang mga landing o mag-sign in sa workspace.',
} as const;
