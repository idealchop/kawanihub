/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { MEDIA_STATUSES, normalizeMediaPieceFields, type MediaPieceRecord, type MediaStatus } from '../media/media-types';

export const DEMO_MEDIA_PIECE_TARGET = 200;

const TYPES = ['photo', 'reels', 'graphics', 'podcast', 'message'] as const;

const SUBJECTS = [
  'Barangay consult stills',
  'Clinic hours card',
  'Council recap reel',
  'Desk how-to',
  'Drainage update',
  'School aid message',
  'Session photo set',
  'Storm advisory',
  'Claim window poster',
  'Youth night recap',
] as const;

function pick<T>(items: readonly T[], index: number, salt = 0): T {
  return items[(index + salt) % items.length];
}

function isoDaysFromNow(days: number, hour = 9): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, (indexMinute(days) % 50) + 1, 0, 0);
  return date.toISOString();
}

function indexMinute(days: number): number {
  return Math.abs(days) * 7;
}

function dateDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function peopleFor(index: number, actorUid: string): {
  editorUids: string[];
  reviewerUids: string[];
  deployedUids: string[];
} {
  const ana = 'staff-ana';
  const rico = 'staff-rico';
  const pattern = index % 6;
  if (pattern === 0) return { editorUids: [], reviewerUids: [], deployedUids: [] };
  if (pattern === 1) return { editorUids: [ana], reviewerUids: [rico], deployedUids: [ana] };
  if (pattern === 2) return { editorUids: [rico], reviewerUids: [actorUid], deployedUids: [rico] };
  if (pattern === 3) return { editorUids: [actorUid], reviewerUids: [ana], deployedUids: [rico, ana] };
  if (pattern === 4) return { editorUids: [ana, rico], reviewerUids: [], deployedUids: [actorUid] };
  return { editorUids: [rico], reviewerUids: [ana], deployedUids: [] };
}

function datesFor(status: MediaStatus, index: number): { shootDate: string; publishDate: string; openedAt: string; closedAt?: string } {
  if (status === 'published' || status === 'not_published') {
    const closedAgo = -((index % 18) + 1);
    return {
      shootDate: dateDaysFromNow(closedAgo - 3),
      publishDate: dateDaysFromNow(closedAgo),
      openedAt: isoDaysFromNow(closedAgo - 12, 8),
      closedAt: isoDaysFromNow(closedAgo, 16),
    };
  }
  if (status === 'scheduled_post') {
    return {
      shootDate: dateDaysFromNow(-((index % 4) + 1)),
      publishDate: dateDaysFromNow((index % 6) + 1),
      openedAt: isoDaysFromNow(-((index % 10) + 2), 9),
    };
  }
  if (status === 'not_started') {
    return {
      shootDate: dateDaysFromNow((index % 8) + 1),
      publishDate: dateDaysFromNow((index % 8) + 4),
      openedAt: isoDaysFromNow(-((index % 20) + 1), 10),
    };
  }
  return {
    shootDate: dateDaysFromNow(-((index % 6) + 1)),
    publishDate: dateDaysFromNow((index % 5) - 1),
    openedAt: isoDaysFromNow(-((index % 25) + 3), 11),
  };
}

export function extraDemoMediaPieces(input: {
  workspaceId: string;
  actorUid: string;
  existing: MediaPieceRecord[];
}): MediaPieceRecord[] {
  const needed = Math.max(0, DEMO_MEDIA_PIECE_TARGET - input.existing.length);
  const extras: MediaPieceRecord[] = [];

  for (let index = 0; index < needed; index += 1) {
    const status = pick(MEDIA_STATUSES, index);
    const dates = datesFor(status, index);
    const people = peopleFor(index, input.actorUid);
    extras.push({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      createdBy: input.actorUid,
      createdAt: dates.openedAt,
      updatedAt: dates.closedAt ?? dates.openedAt,
      ...normalizeMediaPieceFields({
        title: `${pick(SUBJECTS, index)} ${String(index + 1).padStart(3, '0')}`,
        type: pick(TYPES, index, 2),
        status,
        editorUids: people.editorUids,
        reviewerUids: people.reviewerUids,
        deployedUids: people.deployedUids,
        shootDate: dates.shootDate,
        publishDate: dates.publishDate,
        caption: index % 5 === 0 ? 'Bring a valid ID and the control number.' : '',
        driveUrl: index % 7 === 0 ? 'https://drive.google.com' : '',
        fbUrl: status === 'published' && index % 3 === 0 ? 'https://facebook.com' : '',
        episode: pick(TYPES, index, 2) === 'podcast' ? String(20 + (index % 40)) : '',
      }),
    });
  }

  return extras;
}
