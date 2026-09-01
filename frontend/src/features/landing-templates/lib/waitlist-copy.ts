/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';

export const waitlistCopy = {
  kicker: 'Malapit na',
  title: `${brand.productName} ay magbubukas para sa inyong distrito.`,
  body: 'Iwan ang email. Aabisuhan namin kayo kapag handa na ang desk ng inyong opisyal.',
  emailLabel: 'Email',
  submit: 'Sumali sa listahan',
  success: 'Nasa listahan na kayo. Demo mode — walang email na ipinapadala.',
  proof: [
    { value: '1', label: 'Opisyal' },
    { value: '∞', label: 'Hiling' },
    { value: '©', label: 'River Tech' },
  ],
} as const;
