/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { listAuditLogs } from '../audit/audit-service';
import { listDocuments } from '../documents/documents-service';
import { listEvents } from '../events/events-service';
import { listMembers } from '../members/members-service';
import { listNotifications } from '../notifications/notifications-service';
import { listSolicitations } from '../solicitations/solicitation-service';
import type { SolicitationStatus } from '../solicitations/solicitation-types';
import type { AnalyticsSnapshot, CountMap } from './analytics-types';

const OPEN_STATUSES: SolicitationStatus[] = ['under_review', 'pending_validation', 'eligible', 'ready_to_claim'];
const DEFAULT_SOLICITATION_ALLOTMENT = 500_000;

function isOpenDeskStatus(status: SolicitationStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

function countBy<T>(rows: T[], key: (row: T) => string): CountMap {
  return rows.reduce<CountMap>((acc, row) => {
    const value = key(row);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function sumFundAmount(rows: { status: SolicitationStatus; fundAmount: number }[], status: SolicitationStatus): number {
  return rows.reduce((sum, row) => (row.status === status ? sum + (row.fundAmount || 0) : sum), 0);
}

export async function getAnalytics(workspaceId: string, actorUid: string): Promise<AnalyticsSnapshot> {
  const [solicitations, documents, events, members, notifications, activity] = await Promise.all([
    listSolicitations(workspaceId, actorUid),
    listDocuments(workspaceId, actorUid),
    listEvents(workspaceId, actorUid),
    listMembers(workspaceId, actorUid),
    listNotifications(workspaceId, actorUid),
    listAuditLogs(workspaceId, actorUid),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const upcoming = events.filter((event) => new Date(event.startsAt).getTime() >= now.getTime()).length;
  const openRows = solicitations.filter((row) => isOpenDeskStatus(row.status));
  const claimedAmount = sumFundAmount(solicitations, 'claimed');
  const readyToClaimAmount = sumFundAmount(solicitations, 'ready_to_claim');

  return {
    generatedAt: now.toISOString(),
    solicitations: {
      total: solicitations.length,
      open: openRows.length,
      byStatus: countBy(solicitations, (row) => row.status),
      byKind: countBy(solicitations, (row) => row.kind),
      openByBarangay: countBy(openRows, (row) => row.barangay),
      openByKind: countBy(openRows, (row) => row.kind),
      fund: {
        allotted: DEFAULT_SOLICITATION_ALLOTMENT,
        claimed: claimedAmount,
        readyToClaim: readyToClaimAmount,
        remaining: DEFAULT_SOLICITATION_ALLOTMENT - claimedAmount - readyToClaimAmount,
      },
      needsRequirements: solicitations.filter(
        (row) => row.status === 'under_review' && row.requirements.some((item) => !item.submitted),
      ).length,
      readyToReview: solicitations.filter((row) => row.status === 'under_review').length,
      readyToClaim: solicitations.filter((row) => row.status === 'ready_to_claim').length,
      claimedThisMonth: solicitations.filter(
        (row) => row.status === 'claimed' && row.claimedAt && new Date(row.claimedAt).getTime() >= monthStart,
      ).length,
      cooldownFlags: solicitations.filter((row) => row.flags.some((flag) => flag.type === 'cooldown')).length,
      relativeFlags: solicitations.filter((row) => row.flags.some((flag) => flag.type === 'relative')).length,
      missingRequirements: solicitations.filter((row) => row.status === 'under_review' && Boolean(row.missingNote)).length,
      requirementsComplete: solicitations.filter((row) => row.status === 'pending_validation').length,
      expedited: solicitations.filter((row) => row.expedited).length,
      escalated: solicitations.filter((row) => row.escalated).length,
      suspiciousFlags: solicitations.filter((row) =>
        row.flags.some((flag) => flag.type.startsWith('suspicious_')),
      ).length,
    },
    documents: {
      total: documents.length,
      byStatus: countBy(documents, (row) => row.status),
      byKind: countBy(documents, (row) => row.kind),
    },
    events: {
      total: events.length,
      upcoming,
      byKind: countBy(events, (row) => row.kind),
    },
    members: {
      total: members.length,
      byRole: countBy(members, (row) => row.role),
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter((row) => !row.read).length,
    },
    activity: {
      total: activity.length,
    },
  };
}
