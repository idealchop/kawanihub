/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { getAnalytics } from '../../../../services/analytics/analytics-service';
import { createSolicitation } from '../../../../services/solicitations/solicitation-service';
import { memoryDb } from '../../../../store/memory-store';

describe('analytics-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('aggregates solicitation queue counts after a request is created', async () => {
    await createSolicitation('demo-workspace', 'demo-owner', {
      requesterName: 'Rosa',
      barangay: 'Zapote',
      contact: '',
      idNumber: 'ID-1',
      kind: 'medical',
      notes: '',
      relatives: [],
    });

    const snapshot = await getAnalytics('demo-workspace', 'demo-owner');
    expect(snapshot.solicitations.total).toBeGreaterThanOrEqual(1);
    expect(snapshot.solicitations.byStatus.under_review).toBeGreaterThanOrEqual(1);
    expect(snapshot.solicitations.open).toBeGreaterThanOrEqual(1);
    expect(snapshot.solicitations.openByBarangay.Zapote).toBeGreaterThanOrEqual(1);
    expect(snapshot.solicitations.openByKind.medical).toBeGreaterThanOrEqual(1);
    expect(snapshot.solicitations.fund).toEqual({
      allotted: 500_000,
      claimed: 0,
      readyToClaim: 0,
      remaining: 500_000,
    });
    expect(snapshot.solicitations.needsRequirements).toBeGreaterThanOrEqual(1);
    expect(snapshot.notifications.unread).toBeGreaterThanOrEqual(1);
    expect(snapshot.activity.total).toBeGreaterThanOrEqual(1);
  });
});
