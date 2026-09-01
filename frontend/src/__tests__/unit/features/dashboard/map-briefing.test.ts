/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import type { Solicitation } from '@/features/solicitation/types/solicitation';
import {
  buildDailyKindSeries,
  createdDay,
  eachDay,
  filterBriefingRows,
  orderedRange,
} from '@/features/dashboard/lib/map-briefing';

function row(partial: Partial<Solicitation> & Pick<Solicitation, 'id' | 'createdAt' | 'kind' | 'status' | 'barangay'>): Solicitation {
  return partial as Solicitation;
}

describe('map-briefing', () => {
  it('orders a reversed date range', () => {
    expect(orderedRange('2026-08-20', '2026-08-10')).toEqual(['2026-08-10', '2026-08-20']);
  });

  it('lists each inclusive day', () => {
    expect(eachDay('2026-08-10', '2026-08-12')).toEqual(['2026-08-10', '2026-08-11', '2026-08-12']);
  });

  it('filters by day, open status, and kind, then stacks daily counts', () => {
    const rows = [
      row({
        id: '1',
        createdAt: '2026-08-10T04:00:00.000Z',
        kind: 'medical',
        status: 'under_review',
        barangay: 'Zapote',
      }),
      row({
        id: '2',
        createdAt: '2026-08-10T05:00:00.000Z',
        kind: 'burial',
        status: 'eligible',
        barangay: 'Zapote',
      }),
      row({
        id: '3',
        createdAt: '2026-08-11T12:00:00.000Z',
        kind: 'medical',
        status: 'claimed',
        barangay: 'Pilar',
      }),
      row({
        id: '4',
        createdAt: '2026-08-12T12:00:00.000Z',
        kind: 'medical',
        status: 'under_review',
        barangay: 'Pilar',
      }),
    ];

    const openMedical = filterBriefingRows(rows, {
      from: '2026-08-10',
      to: '2026-08-12',
      status: 'open',
      kind: 'medical',
    });
    expect(openMedical.map((item) => item.id)).toEqual(['1', '4']);

    const series = buildDailyKindSeries(openMedical, '2026-08-10', '2026-08-12');
    expect(series).toHaveLength(3);
    expect(series[0]?.counts.medical).toBe(1);
    expect(series[1]?.total).toBe(0);
    expect(series[2]?.counts.medical).toBe(1);
    expect(createdDay(rows[0].createdAt).length).toBe(10);
  });
});
