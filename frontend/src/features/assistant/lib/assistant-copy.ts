/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Assistant',
    workInProgress: 'Work in progress.',
  },
  fil: {
    title: 'Assistant',
    workInProgress: 'Work in progress.',
  },
} as const;

export function getAssistantCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}
