/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { buildDueDiligenceMatches, matchConfidence } from '../../../../services/solicitations/solicitation-due-diligence';
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
    controlNumber: 'KH-TEST-0001',
    controlIssuedAt: '',
    claimedAt: '',
    claimedByName: '',
    createdBy: 'demo-owner',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('due diligence matches', () => {
  it('ranks exact name and id above last-name only', () => {
    const current = row({
      id: 'now',
      requesterName: 'Rosa Mendoza',
      beneficiaryName: 'Rosa Mendoza',
      idNumber: 'ID-4412',
      relatives: [{ name: 'Carlo Mendoza', relation: 'spouse' }],
    });
    const matches = buildDueDiligenceMatches(current, [
      current,
      row({
        id: 'prior-rosa',
        requesterName: 'Rosa Mendoza',
        beneficiaryName: 'Rosa Mendoza',
        idNumber: 'ID-4412',
        controlNumber: 'KH-RSAM-OLD1',
        claimedAt: '2026-02-01T00:00:00.000Z',
        createdAt: '2025-12-01T00:00:00.000Z',
      }),
      row({
        id: 'cousin',
        requesterName: 'Lito Mendoza',
        barangay: 'Malaya',
        idNumber: 'ID-9',
        controlNumber: 'KH-LITO-0001',
      }),
    ]);
    expect(matches[0]?.name).toBe('Rosa Mendoza');
    expect(matches[0]?.confidence).toBeGreaterThan(matches[1]?.confidence ?? 0);
    expect(matches[0]?.asRequestor).toBe(true);
    expect(matches[0]?.asBeneficiary).toBe(true);
    expect(matches[0]?.records[0]?.controlNumber).toBe('KH-RSAM-OLD1');
    expect(matches.find((match) => match.name === 'Carlo Mendoza')?.taggedRelative).toBe(true);
    expect(matches.some((match) => match.name === 'Lito Mendoza')).toBe(false);
  });

  it('scores same id and barangay higher than a name-only overlap', () => {
    const current = row({ id: 'now', requesterName: 'Rosa Mendoza', barangay: 'San Roque', idNumber: 'ID-1' });
    const sameId = matchConfidence('Rosa Mendoza', current, { barangay: 'San Roque', idNumber: 'ID-1' });
    const lastNameOnly = matchConfidence('Carlo Mendoza', current, { barangay: 'Poblacion', idNumber: '' });
    expect(sameId).toBeGreaterThan(lastNameOnly);
  });
});
