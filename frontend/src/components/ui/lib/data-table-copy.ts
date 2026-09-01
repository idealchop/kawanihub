/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    searchPlaceholder: 'Search…',
    searchLabel: 'Search',
    allFilter: 'All',
    clearFilters: 'Clear all',
    showingFilters: 'Showing:',
    removeFilter: 'Remove {name}',
    previous: 'Previous',
    next: 'Next',
    rowsLabel: 'Rows',
    emptyTitle: 'No matching rows',
    emptyDescription: 'Try another search or clear filters.',
    pageSummary: (start: number, end: number, total: number) =>
      total === 0 ? '0 results' : `${start}–${end} of ${total}`,
  },
  fil: {
    searchPlaceholder: 'Maghanap…',
    searchLabel: 'Hanapin',
    allFilter: 'Lahat',
    clearFilters: 'I-clear lahat',
    showingFilters: 'Pinapakita:',
    removeFilter: 'Alisin ang {name}',
    previous: 'Nakaraan',
    next: 'Susunod',
    rowsLabel: 'Rows',
    emptyTitle: 'Walang tugmang row',
    emptyDescription: 'Subukan ang ibang search o i-clear ang filters.',
    pageSummary: (start: number, end: number, total: number) =>
      total === 0 ? '0 results' : `${start}–${end} of ${total}`,
  },
} as const;

export function getDataTableCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

export function withFilterName(template: string, name: string) {
  return template.replaceAll('{name}', name);
}
