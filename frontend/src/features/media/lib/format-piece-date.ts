/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { parseDateField } from './piece-calendar';

export function formatPieceDate(value: string, locale = 'en'): string {
  const date = parseDateField(value);
  if (!date) return value ? value : '—';
  return new Intl.DateTimeFormat(locale === 'fil' ? 'en-PH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function linkLabel(link: string): string {
  if (!link) return '';
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}
