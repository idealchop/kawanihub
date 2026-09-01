/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { statusFromDates } from '@/features/media/lib/status-from-dates';

describe('statusFromDates', () => {
  const today = '2026-09-01';

  it('is not started when dates are missing or still ahead', () => {
    expect(statusFromDates('', '', today)).toBe('not_started');
    expect(statusFromDates('2026-09-02', '', today)).toBe('not_started');
    expect(statusFromDates('', '2026-09-10', today)).toBe('not_started');
  });

  it('is editing when the shoot date has arrived and publish has not', () => {
    expect(statusFromDates('2026-08-20', '', today)).toBe('editing');
    expect(statusFromDates('2026-09-01', '2026-09-10', today)).toBe('editing');
  });

  it('is published when the publish date has arrived', () => {
    expect(statusFromDates('2026-08-01', '2026-08-15', today)).toBe('published');
    expect(statusFromDates('', '2026-09-01', today)).toBe('published');
  });
});
