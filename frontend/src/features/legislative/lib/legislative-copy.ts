/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Legislative',
    workInProgress: 'Work in progress.',
  },
  fil: {
    title: 'Legislative',
    workInProgress: 'Work in progress.',
  },
} as const;

export function getLegislativeCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}
