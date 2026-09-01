/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { formatPeso } from '@/features/dashboard/lib/format-peso';

describe('formatPeso', () => {
  it('formats whole pesos with a sign', () => {
    expect(formatPeso(500_000)).toBe('₱500,000');
    expect(formatPeso(0)).toBe('₱0');
    expect(formatPeso(-1_250)).toBe('-₱1,250');
  });
});
