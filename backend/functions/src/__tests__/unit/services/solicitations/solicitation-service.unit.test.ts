/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { HttpError } from '../../../../utils/errors';
import { memoryDb } from '../../../../store/memory-store';
import {
  approveSolicitation,
  claimPublicSolicitation,
  claimSolicitation,
  createPublicSolicitation,
  createSolicitation,
  getPublicSolicitation,
  markReadyToClaim,
  rejectSolicitation,
  submitForReview,
  submitPublicRequirements,
  toPublicSolicitation,
  updateSolicitation,
} from '../../../../services/solicitations/solicitation-service';

const person = {
  requesterName: 'Rosa Mendoza',
  beneficiaryName: 'Rosa Mendoza',
  barangay: 'San Roque',
  contact: 'rosa@example.com',
  idNumber: 'ID-4412',
  kind: 'medical' as const,
  notes: 'Hospital bill',
  relatives: [] as { name: string; relation: 'spouse' }[],
};

const claimProof = {
  claimPhoto: 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  claimPhotoName: 'receive.jpg',
  acknowledged: true as const,
};

async function completeRequirements(id: string) {
  const listed = [...memoryDb.solicitations.values()].find((row) => row.id === id);
  if (!listed) throw new Error('missing');
  return updateSolicitation('demo-workspace', id, 'demo-owner', {
    ...person,
    requirements: listed.requirements.map((item) => ({ id: item.id, submitted: true, validated: true })),
  });
}

describe('solicitation-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('issues the control number on eligible and waits for the accountant before claim', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    expect(created.status).toBe('under_review');
    expect(created.controlNumber).toBe('');
    expect(created.requirements.length).toBeGreaterThan(0);

    await completeRequirements(created.id);
    const reviewed = await submitForReview('demo-workspace', created.id, 'demo-owner');
    expect(reviewed.status).toBe('pending_validation');
    expect(reviewed.controlNumber).toBe('');

    const eligible = await approveSolicitation('demo-workspace', created.id, 'demo-owner');
    expect(eligible.status).toBe('eligible');
    expect(eligible.controlNumber).toMatch(/^KH-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    await expect(
      claimSolicitation('demo-workspace', 'demo-owner', {
        controlNumber: eligible.controlNumber,
        claimantName: 'Rosa Mendoza',
        ...claimProof,
      }),
    ).rejects.toBeInstanceOf(HttpError);

    await expect(markReadyToClaim('demo-workspace', created.id, 'demo-owner')).rejects.toBeInstanceOf(HttpError);

    const funded = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      accountantNote: 'Cash ready at the window.',
      fundAmount: 5000,
    });
    expect(funded.fundAmount).toBe(5000);
    expect(funded.accountantNote).toBe('Cash ready at the window.');
    expect(funded.accountantByUid).toBe('demo-owner');
    expect('accountantNote' in toPublicSolicitation(funded)).toBe(false);
    expect('fundAmount' in toPublicSolicitation(funded)).toBe(false);

    const ready = await markReadyToClaim('demo-workspace', created.id, 'demo-owner');
    expect(ready.status).toBe('ready_to_claim');
    expect(ready.controlNumber).toBe(eligible.controlNumber);

    await expect(
      claimSolicitation('demo-workspace', 'demo-owner', {
        controlNumber: ready.controlNumber,
        claimantName: 'Someone Else',
        ...claimProof,
      }),
    ).rejects.toBeInstanceOf(HttpError);

    const claimed = await claimSolicitation('demo-workspace', 'demo-owner', {
      controlNumber: ready.controlNumber.toLowerCase().replace(/-/g, ' '),
      claimantName: 'rosa  mendoza',
      ...claimProof,
    });
    expect(claimed.status).toBe('claimed');
    expect(claimed.claimedByName).toBe('rosa  mendoza');
    expect(claimed.acknowledged).toBe(true);
  });

  it('blocks another request from the same person within 3 months', async () => {
    const first = await createSolicitation('demo-workspace', 'demo-owner', person);
    await completeRequirements(first.id);
    await submitForReview('demo-workspace', first.id, 'demo-owner');
    await approveSolicitation('demo-workspace', first.id, 'demo-owner');

    const second = await createSolicitation('demo-workspace', 'demo-owner', person);
    expect(second.cooldownBlocked).toBe(true);
    await completeRequirements(second.id);
    await expect(submitForReview('demo-workspace', second.id, 'demo-owner')).rejects.toBeInstanceOf(HttpError);
  });

  it('composes the person key from identity fields', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', {
      ...person,
      requesterName: '',
      identity: {
        firstName: 'Rosa',
        middleName: 'D',
        lastName: 'Mendoza',
        suffix: 'Jr',
        requesterIsBeneficiary: true,
        beneficiary: { firstName: '', middleName: '', lastName: '', suffix: '' },
        beneficiaryRelation: '',
        beneficiaryRelationOther: '',
        mobile: '09175550101',
        telephone: '8888',
        email: 'rosa@example.com',
        building: 'Blk 1 Lot 2',
        street: 'Main',
        subdivision: 'Villa',
        barangay: 'Zapote',
        idType: 'philsys',
        idNumber: 'PSN-1',
        idPhotoName: 'id.jpg',
        idPhoto: 'data:image/jpeg;base64,abc',
        idPhotoBackName: 'id-back.jpg',
        idPhotoBack: 'data:image/jpeg;base64,def',
      },
    });
    expect(created.requesterName).toBe('Rosa D Mendoza Jr');
    expect(created.beneficiaryName).toBe('Rosa D Mendoza Jr');
    expect(created.barangay).toBe('Zapote');
    expect(created.contact).toBe('09175550101');
    expect(created.idNumber).toBe('PSN-1');
    expect(created.identity?.idType).toBe('philsys');
  });

  it('lets the public submit a photo for every issued paper', async () => {
    const created = await createPublicSolicitation('demo-workspace', person);
    const paperPhoto = 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    await expect(
      submitPublicRequirements('demo-workspace', created.id, {
        requirements: created.requirements.slice(0, 1).map((item) => ({ id: item.id, photo: paperPhoto })),
      }),
    ).rejects.toBeInstanceOf(HttpError);

    await expect(
      submitPublicRequirements('demo-workspace', created.id, {
        requirements: created.requirements.map((item) => ({ id: item.id, photo: 'short' })),
      }),
    ).rejects.toBeInstanceOf(HttpError);

    const submitted = await submitPublicRequirements('demo-workspace', created.id, {
      requirements: created.requirements.map((item) => ({
        id: item.id,
        photo: paperPhoto,
        photoName: `${item.id}.jpg`,
      })),
    });
    expect(submitted.requirements.every((item) => item.submitted && item.photo === paperPhoto)).toBe(true);
    expect(submitted.status).toBe('under_review');
  });

  it('lets the desk attach a paper photo without marking it fulfilled', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    const paperPhoto = 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const first = created.requirements[0];
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      requirements: [{ id: first.id, photo: paperPhoto, photoName: `${first.id}.jpg` }],
    });
    const paper = updated.requirements.find((item) => item.id === first.id);
    expect(paper?.photo).toBe(paperPhoto);
    expect(paper?.photoName).toBe(`${first.id}.jpg`);
    expect(paper?.submitted).toBe(true);
    expect(paper?.validated).toBe(false);
  });

  it('stores a desk finding without showing it on the public record', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      findingNote: 'Reviewer is related to the requestor.',
      attentionMarks: ['conflict', 'special'],
    });
    expect(updated.findingNote).toBe('Reviewer is related to the requestor.');
    expect(updated.attentionMarks).toEqual(['conflict', 'special']);
    expect(updated.findingByUid).toBe('demo-owner');
    expect(updated.findingByName).toBe('demo-owner');
    expect(updated.findingAt).toBeTruthy();
    expect(updated.adminFindingNote).toBe('');
    const publicRow = toPublicSolicitation(updated);
    expect('findingNote' in publicRow).toBe(false);
    expect('attentionMarks' in publicRow).toBe(false);
    expect('adminFindingNote' in publicRow).toBe(false);
  });

  it('stores an admin finding note without showing it on the public record', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    await completeRequirements(created.id);
    await submitForReview('demo-workspace', created.id, 'demo-owner');
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      adminFindingNote: 'Papers are in order. Eligible for assistance.',
    });
    expect(updated.adminFindingNote).toBe('Papers are in order. Eligible for assistance.');
    expect(updated.adminFindingByUid).toBe('demo-owner');
    expect('adminFindingNote' in toPublicSolicitation(updated)).toBe(false);
  });

  it('lets the desk update a finding after the case is eligible', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    await completeRequirements(created.id);
    await submitForReview('demo-workspace', created.id, 'demo-owner');
    await approveSolicitation('demo-workspace', created.id, 'demo-owner');
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      findingNote: 'Admin corrected the attention mark.',
      attentionMarks: ['special'],
    });
    expect(updated.status).toBe('eligible');
    expect(updated.findingNote).toBe('Admin corrected the attention mark.');
    expect(updated.attentionMarks).toEqual(['special']);
  });

  it('lets admin edit a finding on a not-eligible case without reopening it', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    await rejectSolicitation('demo-workspace', created.id, 'demo-owner', 'Papers do not match the request.');
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      findingNote: 'Desk related to the requestor. Keep as not eligible.',
      attentionMarks: ['conflict', 'government_event'],
    });
    expect(updated.status).toBe('rejected');
    expect(updated.findingNote).toBe('Desk related to the requestor. Keep as not eligible.');
    expect(updated.attentionMarks).toEqual(['conflict', 'government_event']);
    expect(updated.status).toBe('rejected');
  });

  it('lets admin edit an admin finding on a not-eligible case without reopening it', async () => {
    const created = await createSolicitation('demo-workspace', 'demo-owner', person);
    await rejectSolicitation('demo-workspace', created.id, 'demo-owner', 'Papers do not match the request.');
    const updated = await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      adminFindingNote: 'ID photo is not the requestor. Keep as not eligible.',
    });
    expect(updated.status).toBe('rejected');
    expect(updated.adminFindingNote).toBe('ID photo is not the requestor. Keep as not eligible.');
  });

  it('exposes a tracking code on eligible and allows claim only after Ready for Claim', async () => {
    const created = await createPublicSolicitation('demo-workspace', person);
    expect(created.status).toBe('under_review');
    expect(created.requirements.length).toBeGreaterThan(0);
    expect(created.controlNumber).toBe('');

    const fetched = await getPublicSolicitation('demo-workspace', created.id);
    expect(fetched.requesterName).toBe('Rosa Mendoza');
    expect(fetched.controlNumber).toBe('');

    await completeRequirements(created.id);
    await submitForReview('demo-workspace', created.id, 'demo-owner');
    const eligible = await approveSolicitation('demo-workspace', created.id, 'demo-owner');
    expect(eligible.status).toBe('eligible');
    expect(toPublicSolicitation(eligible).controlNumber).toMatch(/^KH-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    await expect(
      claimPublicSolicitation('demo-workspace', {
        controlNumber: eligible.controlNumber,
        claimantName: 'Rosa Mendoza',
        ...claimProof,
      }),
    ).rejects.toBeInstanceOf(HttpError);

    await updateSolicitation('demo-workspace', created.id, 'demo-owner', {
      ...person,
      accountantNote: 'Cash ready at the window.',
      fundAmount: 3500,
    });

    const ready = await markReadyToClaim('demo-workspace', created.id, 'demo-owner');
    expect(ready.status).toBe('ready_to_claim');
    expect(ready.controlNumber).toBe(eligible.controlNumber);

    const claimed = await claimPublicSolicitation('demo-workspace', {
      controlNumber: ready.controlNumber,
      claimantName: 'Rosa Mendoza',
      ...claimProof,
    });
    expect(claimed.status).toBe('claimed');
    expect(claimed.controlNumber).toBe(ready.controlNumber);
    expect(claimed.acknowledged).toBe(true);
  });
});
