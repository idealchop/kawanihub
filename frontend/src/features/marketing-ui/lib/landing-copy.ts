/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    heroKicker: 'For the official and the public',
    heroTitle: 'A service desk for constituents.',
    heroBody:
      'A personal app for a government official — receive requests, share announcements, and deliver help to the people.',
    primaryCta: 'Request solicitation',
    secondaryCta: 'Claim solicitation',
    signIn: 'Sign in',
    deskCardTitle: 'What’s on the desk',
    deskCardLines: [
      'Constituent requests — aid, complaints, documents',
      'Status: open, in progress, done',
      'An official’s desk, not a generic portal',
      'Copyright © River Tech',
    ],
    pillars: [
      {
        title: 'Requests',
        body: 'Receive constituent requests — aid, complaints, or documents — in one list.',
      },
      {
        title: 'Response',
        body: 'Move status from open to done. Every action has an audit log.',
      },
      {
        title: 'Within reach',
        body: 'Landing pages and a dashboard you can rebrand with the official’s name and colors.',
      },
    ],
  },
  fil: {
    heroKicker: 'Para sa opisyal at sa taumbayan',
    heroTitle: brand.tagline,
    heroBody: brand.description,
    primaryCta: 'Mag-request ng solicitation',
    secondaryCta: 'I-claim ang solicitation',
    signIn: 'Mag-sign in',
    deskCardTitle: 'Ano ang nasa desk',
    deskCardLines: [
      'Hiling ng mamamayan — tulong, reklamo, dokumento',
      'Status: bukas, may tugon, tapos',
      'Desk ng opisyal, hindi generic portal',
      'Copyright © River Tech',
    ],
    pillars: [
      {
        title: 'Hiling',
        body: 'Tanggapin ang kahilingan ng mamamayan — tulong, reklamo, o dokumento — sa isang listahan.',
      },
      {
        title: 'Tugon',
        body: 'I-update ang status mula bukas hanggang tapos. May audit log ang bawat kilos.',
      },
      {
        title: 'Abot-kamay',
        body: 'Landing pages at dashboard na puwedeng i-rebrand sa pangalan at kulay ng opisyal.',
      },
    ],
  },
} as const;

export function getLandingCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}
