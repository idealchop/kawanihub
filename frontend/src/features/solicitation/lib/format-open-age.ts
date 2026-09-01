/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

export type OpenDuration = {
  value: number;
  unit: 'minute' | 'hour' | 'day';
};

export function formatRequestedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function openUntilIso(row: { status: string; claimedAt?: string; updatedAt?: string }): string | undefined {
  if (row.status === 'claimed' && row.claimedAt) return row.claimedAt;
  if (row.status === 'rejected' && row.updatedAt) return row.updatedAt;
  return undefined;
}

export function formatOpenDuration(fromIso: string, untilIso?: string, now = Date.now()): OpenDuration | null {
  const start = new Date(fromIso).getTime();
  if (Number.isNaN(start)) return null;
  const end = untilIso ? new Date(untilIso).getTime() : now;
  if (Number.isNaN(end)) return null;
  const ms = Math.max(0, end - start);
  if (ms < 60_000) return { value: 1, unit: 'minute' };
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return { value: minutes, unit: 'minute' };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: 'hour' };
  return { value: Math.floor(hours / 24), unit: 'day' };
}
