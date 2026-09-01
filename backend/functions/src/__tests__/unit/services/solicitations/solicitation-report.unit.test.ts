/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { HttpError } from '../../../../utils/errors';
import {
  buildSolicitationExport,
  buildSolicitationReport,
  parseSolicitationReportFormat,
} from '../../../../services/solicitations/solicitation-report';
import { emptyDeskState, withDeskDefaults, type SolicitationRecord } from '../../../../services/solicitations/solicitation-types';

function sample(over: Partial<SolicitationRecord> = {}): SolicitationRecord {
  return withDeskDefaults({
    id: 's1',
    workspaceId: 'ws',
    requesterName: 'Rosa Mendoza',
    beneficiaryName: 'Rosa Mendoza',
    barangay: 'San Roque',
    contact: 'rosa@example.com',
    idNumber: 'ID-4412',
    kind: 'medical',
    notes: 'Hospital bill',
    status: 'claimed',
    requirements: [],
    relatives: [],
    flags: [],
    cooldownBlocked: false,
    controlNumber: 'KH-TEST-0001',
    controlIssuedAt: '2026-08-01T00:00:00.000Z',
    claimedAt: '2026-08-20T00:00:00.000Z',
    claimedByName: 'Rosa Mendoza',
    createdBy: 'demo-owner',
    createdAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...emptyDeskState(),
    fundAmount: 5000,
    ...over,
  });
}

describe('solicitation-report', () => {
  const now = new Date('2026-08-25T11:00:00.000Z');

  it('defaults format to csv and rejects unknown values', () => {
    expect(parseSolicitationReportFormat(undefined)).toBe('csv');
    expect(parseSolicitationReportFormat('pdf')).toBe('pdf');
    expect(() => parseSolicitationReportFormat('doc')).toThrow(HttpError);
  });

  it('builds a quoted CSV dump of visible cases', () => {
    const csv = buildSolicitationReport([sample()]);
    expect(csv.startsWith('controlNumber,status,kind,')).toBe(true);
    expect(csv).toContain('"KH-TEST-0001"');
    expect(csv).toContain('"Rosa Mendoza"');
    expect(csv).toContain('"claimed"');
  });

  it('builds an Excel workbook with a statement sheet and the case row', () => {
    const file = buildSolicitationExport([sample()], 'xlsx', now);
    expect(file.filename).toBe('solicitations-20260825.xlsx');
    expect(file.bytes.subarray(0, 2).toString()).toBe('PK');
    const unzipped = file.bytes.toString('utf8');
    expect(unzipped).toContain('Statement');
    expect(unzipped).toContain('Rosa Mendoza');
    expect(unzipped).toContain('Solicitation fund');
    expect(unzipped).toContain('KH-TEST-0001');
  });

  it('builds a statement PDF with letterhead, fund, and the case table', () => {
    const file = buildSolicitationExport(
      [sample({ status: 'under_review', fundAmount: 0, controlNumber: '', claimedAt: '' })],
      'pdf',
      now,
    );
    expect(file.filename).toBe('solicitation-statement-20260825.pdf');
    expect(file.mime).toBe('application/pdf');
    const text = file.bytes.toString('latin1');
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('Kawanihub');
    expect(text).toContain('Solicitation statement');
    expect(text).toContain('Solicitation fund');
    expect(text).toContain('Pending for Review');
    expect(text).toContain('Rosa Mendoza');
    expect(text).toContain('%%EOF');
  });
});
