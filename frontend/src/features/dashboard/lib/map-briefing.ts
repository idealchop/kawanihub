/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import {
  SOLICITATION_KINDS,
  type Solicitation,
  type SolicitationKind,
  type SolicitationStatus,
} from '@/features/solicitation/types/solicitation';
import { isOpenDeskStatus } from './las-pinas-map-model';
import type { CountMap } from '../types/analytics';

export type StatusFilter = 'open' | 'all' | SolicitationStatus;
export type KindFilter = 'all' | SolicitationKind;

export type DailyKindPoint = {
  day: string;
  counts: Record<SolicitationKind, number>;
  total: number;
};

export function localDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function shiftDay(day: string, delta: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const next = new Date(Date.UTC(year, (month ?? 1) - 1, (date ?? 1) + delta));
  const yyyy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(next.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function orderedRange(from: string, to: string): [string, string] {
  if (!from) return [to, to];
  if (!to) return [from, from];
  return from <= to ? [from, to] : [to, from];
}

export function eachDay(from: string, to: string): string[] {
  const [start, end] = orderedRange(from, to);
  if (!start || !end) return [];
  const days: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = shiftDay(cursor, 1);
    if (days.length > 366) break;
  }
  return days;
}

export function createdDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return localDayKey(date);
}

function emptyKindCounts(): Record<SolicitationKind, number> {
  return {
    burial: 0,
    education: 0,
    medical: 0,
    events: 0,
    financial: 0,
    daily: 0,
  };
}

export function filterBriefingRows(
  rows: Solicitation[],
  input: { from: string; to: string; status: StatusFilter; kind: KindFilter },
): Solicitation[] {
  const [from, to] = orderedRange(input.from, input.to);
  return rows.filter((row) => {
    const day = createdDay(row.createdAt);
    if (!day || day < from || day > to) return false;
    if (input.kind !== 'all' && row.kind !== input.kind) return false;
    if (input.status === 'open') return isOpenDeskStatus(row.status);
    if (input.status !== 'all' && row.status !== input.status) return false;
    return true;
  });
}

export function countByBarangay(rows: Solicitation[]): CountMap {
  return rows.reduce<CountMap>((acc, row) => {
    acc[row.barangay] = (acc[row.barangay] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildDailyKindSeries(rows: Solicitation[], from: string, to: string): DailyKindPoint[] {
  const days = eachDay(from, to);
  const buckets = new Map(days.map((day) => [day, emptyKindCounts()]));
  for (const row of rows) {
    const day = createdDay(row.createdAt);
    const bucket = buckets.get(day);
    if (!bucket) continue;
    bucket[row.kind] += 1;
  }
  return days.map((day) => {
    const counts = buckets.get(day) ?? emptyKindCounts();
    return {
      day,
      counts,
      total: SOLICITATION_KINDS.reduce((sum, kind) => sum + counts[kind], 0),
    };
  });
}
