/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaDateField, MediaPiece } from '../types/media-piece';

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function atDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date: Date, amount: number): Date {
  const month = date.getMonth() + amount;
  const last = new Date(date.getFullYear(), month + 1, 0).getDate();
  return new Date(date.getFullYear(), month, Math.min(date.getDate(), last));
}

export function startOfWeek(date: Date): Date {
  const day = atDay(date);
  return addDays(day, -day.getDay());
}

export function monthLabel(date: Date, locale = 'en'): string {
  return date.toLocaleDateString(locale === 'fil' ? 'fil-PH' : 'en-US', { month: 'long', year: 'numeric' });
}

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateField(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function pieceDate(piece: MediaPiece, field: MediaDateField): string {
  return field === 'shoot' ? piece.shootDate : piece.publishDate;
}

export type CalendarOccurrence = {
  piece: MediaPiece;
  kind: MediaDateField;
  date: string;
};

export type CalendarPlot = {
  kinds?: MediaDateField[];
  range?: { from: string; to: string } | null;
};

function dateInRange(value: string, range: { from: string; to: string }): boolean {
  if (range.from && value < range.from) return false;
  if (range.to && value > range.to) return false;
  return true;
}

export function pieceOccurrences(piece: MediaPiece, plot: CalendarPlot = {}): CalendarOccurrence[] {
  const kinds = plot.kinds ?? ['shoot', 'publish'];
  const items: CalendarOccurrence[] = [];
  for (const kind of kinds) {
    const date = pieceDate(piece, kind);
    if (!date) continue;
    if (plot.range && !dateInRange(date, plot.range)) continue;
    items.push({ piece, kind, date });
  }
  return items;
}

function compareOccurrences(left: CalendarOccurrence, right: CalendarOccurrence): number {
  const kindRank = Number(left.kind === 'publish') - Number(right.kind === 'publish');
  return left.date.localeCompare(right.date) || kindRank || left.piece.title.localeCompare(right.piece.title);
}

export function groupOccurrencesByDay(
  pieces: MediaPiece[],
  plot: CalendarPlot = {},
): Map<string, CalendarOccurrence[]> {
  const map = new Map<string, CalendarOccurrence[]>();
  for (const piece of pieces) {
    for (const item of pieceOccurrences(piece, plot)) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
  }
  for (const list of map.values()) {
    list.sort(compareOccurrences);
  }
  return map;
}

export function occurrencesInMonth(
  pieces: MediaPiece[],
  anchor: Date,
  plot: CalendarPlot = {},
): CalendarOccurrence[] {
  return pieces
    .flatMap((piece) => pieceOccurrences(piece, plot))
    .filter((item) => {
      const date = parseDateField(item.date);
      return date ? isSameMonth(date, anchor) : false;
    })
    .sort(compareOccurrences);
}

export function monthGrid(anchor: Date): Date[] {
  const first = startOfMonth(anchor);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function weekGrid(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export const CALENDAR_SCOPES = ['month', 'week', 'day'] as const;
export type CalendarScope = (typeof CALENDAR_SCOPES)[number];

export function periodGrid(anchor: Date, scope: CalendarScope): Date[] {
  if (scope === 'day') return [atDay(anchor)];
  if (scope === 'week') return weekGrid(anchor);
  return monthGrid(anchor);
}

export function shiftAnchor(anchor: Date, scope: CalendarScope, direction: -1 | 1): Date {
  if (scope === 'day') return addDays(anchor, direction);
  if (scope === 'week') return addDays(anchor, direction * 7);
  return addMonths(anchor, direction);
}

export function periodLabel(anchor: Date, scope: CalendarScope, locale = 'en'): string {
  const loc = locale === 'fil' ? 'fil-PH' : 'en-US';
  if (scope === 'day') {
    return atDay(anchor).toLocaleDateString(loc, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (scope === 'week') {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    const startText = start.toLocaleDateString(loc, { month: 'short', day: 'numeric' });
    const endText = end.toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startText} – ${endText}`;
  }
  return monthLabel(anchor, locale);
}

export function occurrencesInPeriod(
  pieces: MediaPiece[],
  anchor: Date,
  scope: CalendarScope,
  plot: CalendarPlot = {},
): CalendarOccurrence[] {
  if (scope === 'month') return occurrencesInMonth(pieces, anchor, plot);
  const keys = new Set(periodGrid(anchor, scope).map(dayKey));
  return pieces
    .flatMap((piece) => pieceOccurrences(piece, plot))
    .filter((item) => keys.has(item.date))
    .sort(compareOccurrences);
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function isToday(date: Date): boolean {
  return dayKey(date) === dayKey(new Date());
}
