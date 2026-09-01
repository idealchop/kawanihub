/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { publicRequirementsSchema, publicSolicitationWriteSchema, solicitationWriteSchema } from '../../../../services/solicitations/solicitation-schema';

const identity = {
  firstName: 'Rosa',
  middleName: '',
  lastName: 'Mendoza',
  mobile: '09175550101',
  telephone: '',
  email: '',
  building: '',
  street: '',
  subdivision: '',
  barangay: 'Zapote',
  idType: 'philsys' as const,
  idNumber: 'PSN-1',
  idPhotoName: 'id.jpg',
  idPhoto: 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  idPhotoBackName: 'id-back.jpg',
  idPhotoBack: 'data:image/jpeg;base64,bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
};

describe('solicitation write schema', () => {
  it('still accepts a desk write with a single name', () => {
    const parsed = solicitationWriteSchema.parse({
      requesterName: 'Rosa Mendoza',
      barangay: 'San Roque',
    });
    expect(parsed.requesterName).toBe('Rosa Mendoza');
  });

  it('accepts a public request without ID photos', () => {
    const parsed = publicSolicitationWriteSchema.parse({
      identity: { ...identity, street: 'Main', idNumber: '', idPhoto: '', idPhotoBack: '' },
      beneficiaryName: 'Rosa Mendoza',
      notes: 'Hospital bill',
    });
    expect(parsed.identity.barangay).toBe('Zapote');
    expect(parsed.identity.idPhoto).toBe('');
  });

  it('accepts a public request with empty identity fields for now', () => {
    const parsed = publicSolicitationWriteSchema.parse({
      kind: 'burial',
    });
    expect(parsed.kind).toBe('burial');
    expect(parsed.requesterName).toBe('');
  });

  it('still accepts a named beneficiary when the requester is not the beneficiary', () => {
    const parsed = publicSolicitationWriteSchema.parse({
      identity: {
        ...identity,
        street: 'Main',
        requesterIsBeneficiary: false,
        beneficiary: { firstName: 'Lina', middleName: '', lastName: 'Mendoza', suffix: 'Jr' },
        beneficiaryRelation: 'other',
        beneficiaryRelationOther: 'Neighbor',
      },
      beneficiaryName: 'Lina Mendoza Jr',
      notes: 'Hospital bill',
    });
    expect(parsed.identity.beneficiary.firstName).toBe('Lina');
    expect(parsed.identity.beneficiaryRelation).toBe('other');
    expect(parsed.identity.beneficiaryRelationOther).toBe('Neighbor');
  });

  it('requires a photo on every public paper', () => {
    expect(() =>
      publicRequirementsSchema.parse({
        requirements: [{ id: 'valid-id', submitted: true }],
      }),
    ).toThrow();

    const parsed = publicRequirementsSchema.parse({
      requirements: [{ id: 'valid-id', photo: 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }],
    });
    expect(parsed.requirements[0].photoName).toBe('');
  });

  it('accepts a desk note and fulfilled mark on a paper', () => {
    const parsed = solicitationWriteSchema.parse({
      requesterName: 'Rosa Mendoza',
      requirements: [{ id: 'valid-id', validated: true, note: 'ID matches the requestor.' }],
    });
    expect(parsed.requirements?.[0].validated).toBe(true);
    expect(parsed.requirements?.[0].note).toBe('ID matches the requestor.');
  });

  it('accepts a desk finding note and attention marks', () => {
    const parsed = solicitationWriteSchema.parse({
      requesterName: 'Rosa Mendoza',
      findingNote: 'Desk related to the requestor. Odd government event ask.',
      attentionMarks: ['conflict', 'odd', 'government_event'],
    });
    expect(parsed.findingNote).toBe('Desk related to the requestor. Odd government event ask.');
    expect(parsed.attentionMarks).toEqual(['conflict', 'odd', 'government_event']);
  });

  it('accepts an admin finding note', () => {
    const parsed = solicitationWriteSchema.parse({
      requesterName: 'Rosa Mendoza',
      adminFindingNote: 'Papers are in order. Eligible for assistance.',
    });
    expect(parsed.adminFindingNote).toBe('Papers are in order. Eligible for assistance.');
  });

  it('accepts accountant remarks and a fund amount', () => {
    const parsed = solicitationWriteSchema.parse({
      requesterName: 'Rosa Mendoza',
      accountantNote: 'Cash ready at the window.',
      fundAmount: 5000,
    });
    expect(parsed.accountantNote).toBe('Cash ready at the window.');
    expect(parsed.fundAmount).toBe(5000);
  });
});
