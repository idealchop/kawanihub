/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { dayKey, eventDayKey, monthGrid, startOfMonth } from '@/features/calendar/lib/calendar-grid';

describe('calendar-grid', () => {
  it('builds a 42-day month grid from the first of the month', () => {
    const anchor = startOfMonth(new Date(2026, 7, 15));
    const grid = monthGrid(anchor);
    expect(grid).toHaveLength(42);
    expect(dayKey(anchor)).toBe('2026-08-01');
    expect(eventDayKey('2026-08-23T01:00:00.000Z').startsWith('2026-08-')).toBe(true);
  });
});
