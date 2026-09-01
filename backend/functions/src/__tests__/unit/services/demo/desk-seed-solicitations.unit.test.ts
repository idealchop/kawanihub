/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { extraDemoSolicitations } from '../../../../services/demo/desk-seed-solicitations';

describe('demo solicitation seed', () => {
  it('adds 100 extra cases with unique people mix', () => {
    const extras = extraDemoSolicitations({
      workspaceId: 'demo-workspace',
      actorUid: 'demo-owner',
      existing: [],
    });
    expect(extras).toHaveLength(100);
    expect(new Set(extras.map((row) => row.id)).size).toBe(100);
    const issued = extras.filter((row) => row.controlNumber);
    expect(issued.length).toBeGreaterThan(0);
    expect(new Set(issued.map((row) => row.controlNumber)).size).toBe(issued.length);
    expect(extras.filter((row) => row.status === 'under_review').length).toBeGreaterThan(10);
    expect(extras.filter((row) => row.status === 'pending_validation').length).toBeGreaterThan(15);
    expect(extras.filter((row) => row.status === 'eligible').length).toBeGreaterThan(10);
    expect(extras.filter((row) => row.status === 'ready_to_claim').length).toBeGreaterThan(10);
    expect(extras.filter((row) => row.status === 'claimed').length).toBeGreaterThan(4);
    expect(extras.every((row) => Boolean(row.controlNumber) === (row.status === 'eligible' || row.status === 'ready_to_claim' || row.status === 'claimed'))).toBe(
      true,
    );
    expect(new Set(extras.map((row) => row.status))).toEqual(
      new Set(['under_review', 'pending_validation', 'rejected', 'eligible', 'ready_to_claim', 'claimed']),
    );
    expect(new Set(extras.map((row) => row.kind)).size).toBeGreaterThan(3);
    expect(extras.some((row) => !row.assignedReviewerUid)).toBe(true);
    expect(extras.some((row) => row.beneficiaryName !== row.requesterName)).toBe(true);
  });
});
