/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Activity',
    description: 'A log of every change on the desk — who, what, when.',
    empty: 'No activity yet.',
    loadError: 'Could not load activity logs.',
    action: 'Action',
    actor: 'Actor',
    resource: 'Resource',
    when: 'When',
  },
  fil: {
    title: 'Activity',
    description: 'Talaan ng bawat pagbabago sa desk — sino, ano, kailan.',
    empty: 'Wala pang activity.',
    loadError: 'Hindi ma-load ang activity logs.',
    action: 'Action',
    actor: 'Actor',
    resource: 'Resource',
    when: 'Kailan',
  },
} as const;

export function getActivityCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}
