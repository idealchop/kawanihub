/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode } from '../../config/firebase-admin';
import { memoryDb } from '../../store/memory-store';
import type { DocumentRecord } from '../documents/documents-types';
import type { EventRecord } from '../events/events-types';
import { buildDemoDeskUsers, buildDemoOwner } from './desk-seed-users';
import { normalizeMediaPieceFields, type MediaPieceRecord } from '../media/media-types';
import type { NotificationRecord } from '../notifications/notifications-types';
import { seedMediaActivity } from './desk-seed-media-activity';
import { extraDemoMediaPieces } from './desk-seed-media-pieces';
import { extraDemoSolicitations } from './desk-seed-solicitations';
import { evaluatePolicy, issueRequirements } from '../solicitations/solicitation-policy';
import { emptyDeskState, type SolicitationRecord } from '../solicitations/solicitation-types';

function isoDaysFromNow(days: number, hour = 9): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function dateDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function seedDemoDesk(workspaceId: string, actorUid: string): void {
  if (!demoMode || process.env.VITEST === 'true') return;
  if ([...memoryDb.members.values()].some((row) => row.workspaceId === workspaceId)) {
    padDemoMediaPieces(workspaceId, actorUid);
    seedMediaActivity(workspaceId, actorUid, 'Admin');
    return;
  }

  const now = new Date().toISOString();

  const owner = buildDemoOwner(workspaceId, actorUid, now);
  const demoUsers = buildDemoDeskUsers(workspaceId, actorUid, now);

  for (const member of [owner, ...demoUsers]) {
    memoryDb.members.set(`${workspaceId}:${member.id}`, member);
  }

  const rosaId = randomUUID();
  const benId = randomUUID();
  const miaId = randomUUID();
  const nenaId = randomUUID();
  const litoId = randomUUID();
  const pedroClaimedId = randomUUID();
  const pedroNewId = randomUUID();
  const solicitations: SolicitationRecord[] = [
    {
      id: rosaId,
      workspaceId,
      requesterName: 'Rosa Mendoza',
      beneficiaryName: 'Rosa Mendoza',
      barangay: 'Zapote',
      contact: 'rosa@example.com',
      idNumber: 'ID-4412',
      kind: 'medical',
      notes: 'Hospital endorsement for surgery.',
      status: 'under_review',
      requirements: issueRequirements('medical'),
      relatives: [{ name: 'Carlo Mendoza', relation: 'spouse' }],
      flags: [],
      cooldownBlocked: false,
      controlNumber: '',
      controlIssuedAt: '',
      claimedAt: '',
      claimedByName: '',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: '',
      assignedAccountantName: '',
    },
    {
      id: benId,
      workspaceId,
      requesterName: 'Ben Santos',
      beneficiaryName: 'Ben Santos',
      barangay: 'Daniel Fajardo',
      contact: '0917-555-0101',
      idNumber: 'ID-7781',
      kind: 'education',
      notes: 'School assessment assistance.',
      status: 'pending_validation',
      requirements: issueRequirements('education').map((item) => ({ ...item, submitted: true, validated: true })),
      relatives: [],
      flags: [],
      cooldownBlocked: false,
      controlNumber: '',
      controlIssuedAt: '',
      claimedAt: '',
      claimedByName: '',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: '',
      assignedAccountantName: '',
      findingNote: 'Papers match the assessment. Odd timing with a barangay sports day.',
      attentionMarks: ['odd'],
      findingByUid: 'staff-ana',
      findingByName: 'Ana Kawani',
      findingAt: now,
      adminFindingNote: '',
    },
    {
      id: miaId,
      workspaceId,
      requesterName: 'Mia Cruz',
      beneficiaryName: 'Mia Cruz',
      barangay: 'Almanza Uno',
      contact: 'mia@example.com',
      idNumber: 'ID-2209',
      kind: 'burial',
      notes: 'Funeral assistance.',
      status: 'eligible',
      requirements: issueRequirements('burial').map((item) => ({ ...item, submitted: true, validated: true })),
      relatives: [{ name: 'Lito Cruz', relation: 'parent' }],
      flags: [],
      cooldownBlocked: false,
      controlNumber: 'KH-9B3L-6W2H',
      controlIssuedAt: now,
      claimedAt: '',
      claimedByName: '',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: 'staff-rico',
      assignedAccountantName: 'Rico Bilang',
      findingNote: 'Burial papers are complete.',
      attentionMarks: [],
      findingByUid: 'staff-ana',
      findingByName: 'Ana Kawani',
      findingAt: now,
      adminFindingNote: 'Eligible. Funeral papers match the request.',
      adminFindingByUid: actorUid,
      adminFindingByName: 'Admin',
      adminFindingAt: now,
    },
    {
      id: nenaId,
      workspaceId,
      requesterName: 'Nena Reyes',
      beneficiaryName: 'Nena Reyes',
      barangay: 'Zapote',
      contact: '0917-555-0144',
      idNumber: 'ID-5518',
      kind: 'events',
      notes: 'Team uniforms for the barangay league.',
      status: 'ready_to_claim',
      requirements: issueRequirements('events').map((item) => ({ ...item, submitted: true, validated: true })),
      relatives: [],
      flags: [],
      cooldownBlocked: false,
      controlNumber: 'KH-7K2Q-9M4P',
      controlIssuedAt: isoDaysFromNow(-4),
      claimedAt: '',
      claimedByName: '',
      createdBy: actorUid,
      createdAt: isoDaysFromNow(-8),
      updatedAt: isoDaysFromNow(-4),
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: 'staff-rico',
      assignedAccountantName: 'Rico Bilang',
      findingNote: 'League papers are complete.',
      findingByUid: 'staff-ana',
      findingByName: 'Ana Kawani',
      findingAt: isoDaysFromNow(-7),
      adminFindingNote: 'Eligible for uniforms.',
      adminFindingByUid: actorUid,
      adminFindingByName: 'Admin',
      adminFindingAt: isoDaysFromNow(-5),
      accountantNote: 'Cash ready at the window.',
      fundAmount: 8000,
      accountantByUid: 'staff-rico',
      accountantByName: 'Rico Bilang',
      accountantAt: isoDaysFromNow(-4),
    },
    {
      id: litoId,
      workspaceId,
      requesterName: 'Lito Cruz',
      beneficiaryName: 'Lito Cruz',
      barangay: 'Almanza Uno',
      contact: 'lito.cruz@example.com',
      idNumber: 'ID-1188',
      kind: 'financial',
      notes: 'Start-up assistance for a sari-sari store.',
      status: 'claimed',
      requirements: issueRequirements('financial').map((item) => ({ ...item, submitted: true, validated: true })),
      relatives: [],
      flags: [],
      cooldownBlocked: false,
      controlNumber: 'KH-3N8W-C5RT',
      controlIssuedAt: isoDaysFromNow(-12),
      claimedAt: isoDaysFromNow(-10),
      claimedByName: 'Lito Cruz',
      createdBy: actorUid,
      createdAt: isoDaysFromNow(-14),
      updatedAt: isoDaysFromNow(-10),
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: 'staff-rico',
      assignedAccountantName: 'Rico Bilang',
    },
    {
      id: pedroClaimedId,
      workspaceId,
      requesterName: 'Pedro Ramos',
      beneficiaryName: 'Pedro Ramos',
      barangay: 'Zapote',
      contact: '0917-555-0199',
      idNumber: 'ID-3301',
      kind: 'medical',
      notes: 'Medicine assistance last quarter.',
      status: 'claimed',
      requirements: issueRequirements('medical').map((item) => ({ ...item, submitted: true, validated: true })),
      relatives: [],
      flags: [],
      cooldownBlocked: false,
      controlNumber: 'KH-P6YJ-2H4B',
      controlIssuedAt: isoDaysFromNow(-25),
      claimedAt: isoDaysFromNow(-20),
      claimedByName: 'Pedro Ramos',
      createdBy: actorUid,
      createdAt: isoDaysFromNow(-28),
      updatedAt: isoDaysFromNow(-20),
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: 'staff-rico',
      assignedAccountantName: 'Rico Bilang',
    },
    {
      id: pedroNewId,
      workspaceId,
      requesterName: 'Pedro Ramos',
      beneficiaryName: 'Pedro Ramos',
      barangay: 'Zapote',
      contact: '0917-555-0199',
      idNumber: 'ID-3301',
      kind: 'daily',
      notes: 'Follow-up request within the 3-month window.',
      status: 'under_review',
      requirements: issueRequirements('daily'),
      relatives: [],
      flags: [],
      cooldownBlocked: false,
      controlNumber: '',
      controlIssuedAt: '',
      claimedAt: '',
      claimedByName: '',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
      assignedReviewerUid: 'staff-ana',
      assignedReviewerName: 'Ana Kawani',
      assignedAccountantUid: '',
      assignedAccountantName: '',
    },
  ];
  const allSolicitations = [...solicitations, ...extraDemoSolicitations({ workspaceId, actorUid, existing: solicitations })];
  for (const row of allSolicitations) {
    const others = allSolicitations.filter((item) => item.id !== row.id);
    const policy =
      row.status === 'claimed' || row.status === 'rejected'
        ? { flags: row.flags, cooldownBlocked: false }
        : evaluatePolicy(row, others);
    memoryDb.solicitations.set(`${workspaceId}:${row.id}`, { ...emptyDeskState(), ...row, ...policy });
  }

  const documents: DocumentRecord[] = [
    {
      id: randomUUID(),
      workspaceId,
      title: 'Barangay clearance',
      referenceNo: 'DOC-2026-014',
      requester: 'Rosa Mendoza',
      barangay: 'Zapote',
      kind: 'certification',
      status: 'in_review',
      dueAt: isoDaysFromNow(3).slice(0, 10),
      notes: 'Waiting for captain sign-off.',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Business permit endorsement',
      referenceNo: 'DOC-2026-021',
      requester: 'Kape Ni Juan',
      barangay: 'Daniel Fajardo',
      kind: 'permit',
      status: 'received',
      dueAt: isoDaysFromNow(7).slice(0, 10),
      notes: '',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Relief distribution report',
      referenceNo: 'DOC-2026-008',
      requester: 'Ana Kawani',
      barangay: 'Almanza Uno',
      kind: 'report',
      status: 'released',
      dueAt: isoDaysFromNow(-2).slice(0, 10),
      notes: 'Released to the district office.',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const document of documents) {
    memoryDb.documents.set(`${workspaceId}:${document.id}`, document);
  }

  const events: EventRecord[] = [
    {
      id: randomUUID(),
      workspaceId,
      title: 'Serbisyo caravan',
      notes: 'Medical at legal aid booth.',
      startsAt: isoDaysFromNow(2, 8),
      endsAt: isoDaysFromNow(2, 16),
      location: 'Zapote Plaza',
      kind: 'outreach',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Staff huddle',
      notes: 'Weekly desk briefing.',
      startsAt: isoDaysFromNow(1, 9),
      endsAt: isoDaysFromNow(1, 10),
      location: 'Opisina',
      kind: 'meeting',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Deadline: quarterly report',
      notes: 'Submit to the district office.',
      startsAt: isoDaysFromNow(5, 17),
      endsAt: isoDaysFromNow(5, 17),
      location: '',
      kind: 'deadline',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const event of events) {
    memoryDb.events.set(`${workspaceId}:${event.id}`, event);
  }

  const notifications: NotificationRecord[] = [
    {
      id: randomUUID(),
      workspaceId,
      title: 'New solicitation from Rosa Mendoza',
      body: 'Medical assistance — Zapote. Pending for Review.',
      kind: 'solicitation',
      read: false,
      createdBy: actorUid,
      createdAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Dokumento para i-review',
      body: 'Barangay clearance DOC-2026-014.',
      kind: 'document',
      read: false,
      createdBy: actorUid,
      createdAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      title: 'Serbisyo caravan sa Martes',
      body: 'Zapote Plaza — 8:00 AM.',
      kind: 'event',
      read: true,
      createdBy: actorUid,
      createdAt: now,
    },
  ];
  for (const notification of notifications) {
    memoryDb.notifications.set(`${workspaceId}:${notification.id}`, notification);
  }

  const mediaContentTypes: MediaContentTypeRecord[] = [
    {
      id: randomUUID(),
      workspaceId,
      slug: 'photo',
      name: 'Photo',
      hint: 'Session stills',
      icon: 'camera',
      status: 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      slug: 'reels',
      name: 'Reels',
      hint: 'Short video',
      icon: 'film',
      status: 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      slug: 'graphics',
      name: 'Graphics',
      hint: 'Cards and posters',
      icon: 'image',
      status: 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      slug: 'podcast',
      name: 'Podcast',
      hint: 'Audio episode',
      icon: 'mic',
      status: 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      workspaceId,
      slug: 'message',
      name: 'Message',
      hint: 'Written post',
      icon: 'message-square',
      status: 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const type of mediaContentTypes) {
    memoryDb.mediaContentTypes.set(`${workspaceId}:${type.id}`, type);
  }

  const mediaPieces: MediaPieceRecord[] = [
    {
      title: '46th Regular Session',
      type: 'photo',
      status: 'not_started' as const,
      personUid: 'staff-ana',
      shootDate: dateDaysFromNow(1),
      publishDate: dateDaysFromNow(3),
      link: 'https://drive.google.com',
      openedAt: isoDaysFromNow(-1),
    },
    {
      title: 'Desk hours — how to file',
      type: 'podcast',
      status: 'under_review' as const,
      personUid: 'staff-rico',
      reviewerUid: actorUid,
      shootDate: dateDaysFromNow(-2),
      publishDate: dateDaysFromNow(1),
      openedAt: isoDaysFromNow(-8),
    },
    {
      title: 'Hak hak challenge reel',
      type: 'reels',
      status: 'published' as const,
      editorUid: 'staff-ana',
      reviewerUid: 'staff-rico',
      deployedUids: ['staff-rico', 'staff-ana'],
      shootDate: dateDaysFromNow(-7),
      publishDate: dateDaysFromNow(-5),
      fbUrl: 'https://facebook.com',
      episode: '60',
      caption:
        'HakHak Challenge with Jerry Asban of Barangay Zapote — a neighbor who showed up when the desk needed a voice on the ground.',
      openedAt: isoDaysFromNow(-20),
      closedAt: isoDaysFromNow(-5),
    },
    {
      title: 'Claim window reminder',
      type: 'graphics',
      status: 'ready_for_review' as const,
      personUid: 'staff-rico',
      publishDate: dateDaysFromNow(5),
      openedAt: isoDaysFromNow(-3),
    },
    {
      title: 'Flood assistance message',
      type: 'message',
      status: 'ready_for_publish' as const,
      personUid: actorUid,
      shootDate: dateDaysFromNow(0),
      publishDate: dateDaysFromNow(0),
      caption: 'Claim window is open. Bring a valid ID and the control number.',
      openedAt: isoDaysFromNow(-6),
    },
    {
      title: 'Committee hearing recap',
      type: 'reels',
      status: 'scheduled_post' as const,
      personUid: 'staff-ana',
      shootDate: dateDaysFromNow(-1),
      publishDate: dateDaysFromNow(2),
      openedAt: isoDaysFromNow(-4),
    },
    {
      title: 'Storm advisory card',
      type: 'graphics',
      status: 'not_published' as const,
      personUid: 'staff-rico',
      shootDate: dateDaysFromNow(-12),
      publishDate: dateDaysFromNow(-10),
      openedAt: isoDaysFromNow(-14),
      closedAt: isoDaysFromNow(-10),
    },
  ].map(({ openedAt, closedAt, ...row }) => ({
    id: randomUUID(),
    workspaceId,
    createdBy: actorUid,
    createdAt: openedAt,
    updatedAt: closedAt ?? openedAt,
    ...normalizeMediaPieceFields(row),
  }));
  for (const piece of mediaPieces) {
    memoryDb.mediaPieces.set(`${workspaceId}:${piece.id}`, piece);
  }
  padDemoMediaPieces(workspaceId, actorUid);
  seedMediaActivity(workspaceId, actorUid, 'Admin');
}

function padDemoMediaPieces(workspaceId: string, actorUid: string): void {
  const existing = [...memoryDb.mediaPieces.values()].filter((row) => row.workspaceId === workspaceId);
  for (const piece of extraDemoMediaPieces({ workspaceId, actorUid, existing })) {
    memoryDb.mediaPieces.set(`${workspaceId}:${piece.id}`, piece);
  }
}
