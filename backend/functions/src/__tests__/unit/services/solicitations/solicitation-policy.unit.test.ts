/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { evaluatePolicy, issueClaimCode, namesMatch, normalizeClaimCode } from '../../../../services/solicitations/solicitation-policy';
import { emptyDeskState, type SolicitationRecord } from '../../../../services/solicitations/solicitation-types';

function row(overrides: Partial<SolicitationRecord> & Pick<SolicitationRecord, 'id' | 'requesterName'>): SolicitationRecord {
  return {
    workspaceId: 'demo-workspace',
    beneficiaryName: '',
    barangay: 'San Roque',
    contact: '',
    idNumber: '',
    kind: 'medical',
    notes: '',
    status: 'claimed',
    requirements: [],
    relatives: [],
    flags: [],
    cooldownBlocked: false,
    ...emptyDeskState(),
    controlNumber: '',
    controlIssuedAt: '',
    claimedAt: '',
    claimedByName: '',
    createdBy: 'demo-owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('solicitation-policy', () => {
  it('blocks the same person within 90 days', () => {
    const existing = [row({ id: 'prev', requesterName: 'Rosa Mendoza', idNumber: 'ID-1' })];
    const result = evaluatePolicy(
      { id: 'next', requesterName: 'Rosa Mendoza', barangay: 'San Roque', idNumber: 'ID-1', relatives: [], createdAt: new Date().toISOString() },
      existing,
    );
    expect(result.cooldownBlocked).toBe(true);
    expect(result.flags.some((flag) => flag.type === 'cooldown')).toBe(true);
  });

  it('ignores rejected solicitations for the 3-month rule', () => {
    const existing = [row({ id: 'prev', requesterName: 'Rosa Mendoza', idNumber: 'ID-1', status: 'rejected' })];
    const result = evaluatePolicy(
      { id: 'next', requesterName: 'Rosa Mendoza', barangay: 'San Roque', idNumber: 'ID-1', relatives: [], createdAt: new Date().toISOString() },
      existing,
    );
    expect(result.cooldownBlocked).toBe(false);
  });

  it('flags first-family relatives without blocking', () => {
    const existing = [row({ id: 'parent', requesterName: 'Lito Cruz' })];
    const result = evaluatePolicy(
      {
        id: 'child',
        requesterName: 'Mia Cruz',
        barangay: 'Malaya',
        idNumber: 'ID-2',
        relatives: [{ name: 'Lito Cruz', relation: 'parent' }],
        createdAt: new Date().toISOString(),
      },
      existing,
    );
    expect(result.cooldownBlocked).toBe(false);
    expect(result.flags.some((flag) => flag.type === 'relative')).toBe(true);
  });

  it('matches claimant names after normalizing spaces', () => {
    expect(namesMatch('Mia  Cruz', 'mia cruz')).toBe(true);
    expect(namesMatch('Mia Cruz', 'Lito Cruz')).toBe(false);
  });

  it('issues a unique non-sequential claim code', () => {
    const existing = [row({ id: 'a', requesterName: 'A', controlNumber: 'KH-7K2Q-9M4P' })];
    const first = issueClaimCode(existing);
    const second = issueClaimCode([...existing, row({ id: 'b', requesterName: 'B', controlNumber: first })]);
    expect(first).toMatch(/^KH-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(first).not.toBe('KH-7K2Q-9M4P');
    expect(second).not.toBe(first);
    expect(second).not.toMatch(/^KH-\d{4}-\d{4}$/);
  });

  it('normalizes claim codes so staff can type them loosely', () => {
    expect(normalizeClaimCode('kh 7k2q 9m4p')).toBe('KH-7K2Q-9M4P');
    expect(normalizeClaimCode('7K2Q9M4P')).toBe('KH-7K2Q-9M4P');
  });
});
