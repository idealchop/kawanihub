/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { statusBadgeClass, statusDotColor } from '@/features/media/lib/piece-badge';
import { MEDIA_STATUSES } from '@/features/media/types/media-piece';

describe('statusBadgeClass', () => {
  it('keeps every status on one line as a pill', () => {
    for (const status of MEDIA_STATUSES) {
      expect(statusBadgeClass(status)).toContain('whitespace-nowrap');
      expect(statusBadgeClass(status)).toContain('rounded-full');
    }
  });
});

describe('statusDotColor', () => {
  it('gives every status its own color', () => {
    const colors = MEDIA_STATUSES.map((status) => statusDotColor(status));
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(new Set(colors).size).toBe(MEDIA_STATUSES.length);
  });
});
