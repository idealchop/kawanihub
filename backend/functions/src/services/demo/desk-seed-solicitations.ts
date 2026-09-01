/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { issueClaimCode, issueRequirements } from '../solicitations/solicitation-policy';
import {
  RELATIVE_RELATIONS,
  SOLICITATION_KINDS,
  type RelativeRelation,
  type SolicitationKind,
  type SolicitationRecord,
  type SolicitationStatus,
} from '../solicitations/solicitation-types';

const EXTRA_COUNT = 100;

const FIRST_NAMES = [
  'Aida',
  'Alvin',
  'Anton',
  'Beatriz',
  'Carmen',
  'Dina',
  'Diego',
  'Elena',
  'Enrico',
  'Fe',
  'Fidel',
  'Gina',
  'Gerry',
  'Helen',
  'Hugo',
  'Irene',
  'Isko',
  'Jenny',
  'Joel',
  'Karen',
  'Kevin',
  'Lina',
  'Luis',
  'Marites',
  'Mario',
  'Nena',
  'Nico',
  'Olivia',
  'Oscar',
  'Paula',
  'Paolo',
  'Queenie',
  'Ramon',
  'Rita',
  'Rene',
  'Sonia',
  'Tito',
  'Weng',
  'Yna',
  'Zeny',
] as const;

const LAST_NAMES = [
  'Aguilar',
  'Bautista',
  'Castillo',
  'De Leon',
  'Domingo',
  'Espinosa',
  'Fernandez',
  'Garcia',
  'Gonzales',
  'Hernandez',
  'Ignacio',
  'Javier',
  'Lim',
  'Lopez',
  'Mercado',
  'Navarro',
  'Ortega',
  'Pascual',
  'Reyes',
  'Salazar',
  'Torres',
  'Villanueva',
  'Yap',
] as const;

const BARANGAYS = [
  'Almanza Uno',
  'Almanza Dos',
  'BF International Village',
  'Daniel Fajardo',
  'Elias Aldana',
  'Ilaya',
  'Manuyo Uno',
  'Manuyo Dos',
  'Pamplona Uno',
  'Pamplona Dos',
  'Pamplona Tres',
  'Pilar',
  'Pulang Lupa Uno',
  'Pulang Lupa Dos',
  'Talon Uno',
  'Talon Dos',
  'Talon Tres',
  'Talon Kuatro',
  'Talon Singko',
  'Zapote',
] as const;

const REASONS: Record<SolicitationKind, readonly string[]> = {
  medical: ['Hospital bill for confinement.', 'Medicine assistance after discharge.', 'Dialysis transport for the week.'],
  burial: ['Funeral assistance for a parent.', 'Interment and wake expenses.', 'Assistance for a sudden death in the family.'],
  education: ['School assessment this semester.', 'Graduation fee shortfall.', 'Uniform and books for opening of classes.'],
  events: ['Team uniforms for the barangay league.', 'Contribution for a barangay fiesta booth.', 'Assistance for a school recognition day.'],
  financial: ['Electric bill past due.', 'Start-up for a sari-sari store.', 'Repair of a tricycle used for work.'],
  daily: ['Rice and groceries for the week.', 'Transport to the health center.', 'Help after a flood in the sitio.'],
};

const RESERVED_NAMES = new Set([
  'Rosa Mendoza',
  'Ben Santos',
  'Mia Cruz',
  'Lito Cruz',
  'Pedro Ramos',
  'Nena Reyes',
  'Carlo Mendoza',
  'Ana Kawani',
  'Rico Bilang',
]);

function isoDaysFromNow(days: number, hour = 9): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function pick<T>(items: readonly T[], index: number, salt = 0): T {
  return items[(index * 11 + salt) % items.length];
}

function personName(index: number): string {
  const first = pick(FIRST_NAMES, index, 3);
  const last = pick(LAST_NAMES, index, 5);
  const name = `${first} ${last}`;
  if (!RESERVED_NAMES.has(name)) return name;
  return `${pick(FIRST_NAMES, index, 9)} ${pick(LAST_NAMES, index, 2)}`;
}

function statusFor(index: number): SolicitationStatus {
  const slot = index % 25;
  if (slot < 6) return 'under_review';
  if (slot < 12) return 'pending_validation';
  if (slot < 16) return 'eligible';
  if (slot < 21) return 'ready_to_claim';
  if (slot < 23) return 'rejected';
  return 'claimed';
}

function papers(kind: SolicitationKind, status: SolicitationStatus, emptyPapers = false) {
  const items = issueRequirements(kind);
  if (emptyPapers) return items;
  if (status === 'under_review') {
    return items.map((item, index) => ({ ...item, submitted: true, validated: index === 0 }));
  }
  return items.map((item) => ({ ...item, submitted: true, validated: true }));
}

function assignment(index: number, status: SolicitationStatus) {
  const waitingFunds = status === 'eligible';
  const closed = status === 'ready_to_claim' || status === 'claimed';
  if (closed || waitingFunds || index % 4 !== 0) {
    return {
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: closed || waitingFunds || index % 5 === 0 ? 'staff-rico' : '',
      assignedAccountantName: closed || waitingFunds || index % 5 === 0 ? 'Rico Bilang' : '',
    };
  }
  return {
    assignedReviewerUid: '',
    assignedReviewerName: '',
    assignedAccountantUid: '',
    assignedAccountantName: '',
  };
}

function relativesFor(index: number, lastName: string): { name: string; relation: RelativeRelation }[] {
  if (index % 8 !== 3) return [];
  return [
    {
      name: `${pick(FIRST_NAMES, index, 17)} ${lastName}`,
      relation: RELATIVE_RELATIONS[index % RELATIVE_RELATIONS.length],
    },
  ];
}

export function extraDemoSolicitations(input: {
  workspaceId: string;
  actorUid: string;
  existing: SolicitationRecord[];
}): SolicitationRecord[] {
  const extras: SolicitationRecord[] = [];
  const known = [...input.existing];

  for (let index = 0; index < EXTRA_COUNT; index += 1) {
    const personSource = index >= EXTRA_COUNT - 8 ? index - (EXTRA_COUNT - 8) : index;
    const requesterName = personName(personSource);
    const lastName = requesterName.split(' ').slice(-1)[0] ?? 'Reyes';
    const kind = pick(SOLICITATION_KINDS, index, 1);
    const followUp = index >= EXTRA_COUNT - 8;
    const status = followUp ? 'under_review' : statusFor(index);
    const createdAt = isoDaysFromNow(followUp ? -2 : -((index % 70) + 3));
    const claimedAt = status === 'claimed' ? isoDaysFromNow(-((index % 20) + 1)) : '';
    const otherBeneficiary = !followUp && index % 6 === 2;
    const beneficiaryName = otherBeneficiary ? `${pick(FIRST_NAMES, index, 13)} ${lastName}` : requesterName;
    const emptyPapers = followUp || (status === 'under_review' && index % 3 === 0);
    const hasControl = status === 'eligible' || status === 'ready_to_claim' || status === 'claimed';
    const row: SolicitationRecord = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      requesterName,
      beneficiaryName,
      barangay: pick(BARANGAYS, personSource, 7),
      contact: `0917-555-${String(1000 + index).slice(-4)}`,
      idNumber: `ID-${6000 + personSource}`,
      kind,
      notes: pick(REASONS[kind], index),
      status,
      requirements: papers(kind, status, emptyPapers),
      relatives: relativesFor(index, lastName),
      flags: [],
      cooldownBlocked: false,
      ...assignment(index, status),
      expedited: index % 15 === 4,
      escalated: false,
      escalateNote: '',
      reviewerFeedback: '',
      findingNote: '',
      attentionMarks: [],
      findingByUid: '',
      findingByName: '',
      findingAt: '',
      adminFindingNote: '',
      adminFindingByUid: '',
      adminFindingByName: '',
      adminFindingAt: '',
      accountantNote: status === 'ready_to_claim' || status === 'claimed' ? 'Cash ready at the window.' : '',
      fundAmount: status === 'ready_to_claim' || status === 'claimed' ? 1000 + (index % 20) * 250 : 0,
      accountantByUid: status === 'ready_to_claim' || status === 'claimed' ? 'staff-rico' : '',
      accountantByName: status === 'ready_to_claim' || status === 'claimed' ? 'Rico Bilang' : '',
      accountantAt: status === 'ready_to_claim' || status === 'claimed' ? createdAt : '',
      rejectReason: status === 'rejected' ? 'Papers do not match the request. Submit a clearer ID.' : '',
      missingNote: emptyPapers && !followUp ? 'Need a clearer photo of the ID.' : '',
      overrideUsed: false,
      controlNumber: hasControl ? issueClaimCode(known) : '',
      controlIssuedAt: hasControl ? createdAt : '',
      claimedAt,
      claimedByName: claimedAt ? requesterName : '',
      claimPhoto: '',
      claimPhotoName: '',
      acknowledged: Boolean(claimedAt),
      acknowledgedAt: claimedAt,
      acknowledgedByName: claimedAt ? requesterName : '',
      createdBy: input.actorUid,
      createdAt,
      updatedAt: claimedAt || createdAt,
    };
    extras.push(row);
    known.push(row);
  }

  return extras;
}
