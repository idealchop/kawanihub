/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { BARANGAY_OPTIONS } from '@/features/solicitation/lib/barangay-list';
import { LAS_PINAS_DISTRICT_1, LAS_PINAS_DISTRICT_2, queueHref } from '@/features/dashboard/lib/las-pinas-districts';

describe('las-pinas-districts', () => {
  it('covers each official Las Piñas barangay once', () => {
    const grouped = [...LAS_PINAS_DISTRICT_1, ...LAS_PINAS_DISTRICT_2];
    expect([...grouped].sort()).toEqual([...BARANGAY_OPTIONS].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it('builds queue links for status and barangay', () => {
    expect(queueHref({ status: 'under_review' })).toBe('/queue?status=under_review');
    expect(queueHref({ barangay: 'Zapote' })).toBe('/queue?barangay=Zapote');
    expect(queueHref({})).toBe('/queue');
  });
});
