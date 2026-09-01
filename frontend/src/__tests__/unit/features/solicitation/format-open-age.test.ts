/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { formatOpenDuration, formatRequestedDate, openUntilIso } from '@/features/solicitation/lib/format-open-age';

describe('formatOpenDuration', () => {
  const start = '2026-08-25T10:00:00.000Z';
  const at = new Date(start).getTime();

  it('uses minutes, then hours, then days', () => {
    expect(formatOpenDuration(start, undefined, at + 30_000)).toEqual({ value: 1, unit: 'minute' });
    expect(formatOpenDuration(start, undefined, at + 5 * 60_000)).toEqual({ value: 5, unit: 'minute' });
    expect(formatOpenDuration(start, undefined, at + 90 * 60_000)).toEqual({ value: 1, unit: 'hour' });
    expect(formatOpenDuration(start, undefined, at + 25 * 60 * 60_000)).toEqual({ value: 1, unit: 'day' });
    expect(formatOpenDuration(start, undefined, at + 3 * 24 * 60 * 60_000)).toEqual({ value: 3, unit: 'day' });
  });

  it('stops the clock when claimed', () => {
    expect(openUntilIso({ status: 'claimed', claimedAt: '2026-08-26T10:00:00.000Z' })).toBe('2026-08-26T10:00:00.000Z');
    expect(formatOpenDuration(start, '2026-08-26T10:00:00.000Z')).toEqual({ value: 1, unit: 'day' });
  });
});

describe('formatRequestedDate', () => {
  it('formats a Manila calendar date', () => {
    expect(formatRequestedDate('2026-08-12T04:00:00.000Z')).toMatch(/12/);
    expect(formatRequestedDate('2026-08-12T04:00:00.000Z')).toMatch(/2026/);
  });
});
