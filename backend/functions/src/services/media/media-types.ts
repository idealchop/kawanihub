/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const MEDIA_STATUSES = [
  'not_started',
  'editing',
  'revision',
  'caption',
  'ready_for_review',
  'under_review',
  'ready_for_publish',
  'scheduled_post',
  'published',
  'not_published',
] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const SYSTEM_MEDIA_ACTOR_UID = 'system';

export function calendarDayKey(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function scheduledPostDue(
  row: { status: string; publishDate?: string },
  today = calendarDayKey(),
): boolean {
  const publishDate = row.publishDate ?? '';
  return row.status === 'scheduled_post' && publishDate !== '' && publishDate <= today;
}

export function applyScheduledPublish<T extends { status: MediaStatus }>(row: T, today = calendarDayKey()): T {
  if (!scheduledPostDue(row, today)) return row;
  return { ...row, status: 'published' };
}

export function compareMediaQueue(
  left: { status: MediaStatus; createdAt: string; title: string },
  right: { status: MediaStatus; createdAt: string; title: string },
): number {
  const rank = MEDIA_STATUSES.indexOf(left.status) - MEDIA_STATUSES.indexOf(right.status);
  if (rank !== 0) return rank;
  return left.createdAt.localeCompare(right.createdAt) || left.title.localeCompare(right.title);
}

const LEGACY_MEDIA_STATUSES: Record<string, MediaStatus> = {
  ready: 'ready_for_publish',
};

export function isMediaStatus(value: string): value is MediaStatus {
  return (MEDIA_STATUSES as readonly string[]).includes(value);
}

export function normalizeMediaStatus(value: string | undefined): MediaStatus {
  if (!value) return 'not_started';
  if (isMediaStatus(value)) return value;
  return LEGACY_MEDIA_STATUSES[value] ?? 'not_started';
}

export type MediaPieceFields = {
  title: string;
  type: string;
  status: MediaStatus;
  caption: string;
  editorUids: string[];
  reviewerUids: string[];
  editorUid: string;
  reviewerUid: string;
  deployedUids: string[];
  shootDate: string;
  publishDate: string;
  driveUrl: string;
  fbUrl: string;
  episode: string;
  subs: string;
  personUid: string;
  link: string;
};

export type MediaPieceRecord = MediaPieceFields & {
  id: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaPieceWriteInput = {
  title: string;
  type: string;
  status?: string;
  caption?: string;
  editorUids?: string[];
  reviewerUids?: string[];
  editorUid?: string;
  reviewerUid?: string;
  deployedUids?: string[];
  personUid?: string;
  shootDate?: string;
  publishDate?: string;
  driveUrl?: string;
  fbUrl?: string;
  link?: string;
  episode?: string;
  subs?: string;
};

function uniqueUids(uids: string[]): string[] {
  return [...new Set(uids.map((uid) => uid.trim()).filter(Boolean))];
}

function collectUids(multi: string[] | undefined, ...singles: Array<string | undefined>): string[] {
  if (Array.isArray(multi)) return uniqueUids(multi);
  return uniqueUids(singles.filter((value): value is string => Boolean(value)));
}

function splitLegacyLink(link: string): { driveUrl: string; fbUrl: string } {
  const value = link.trim();
  if (!value) return { driveUrl: '', fbUrl: '' };
  if (/facebook\.com|\bfb\.watch\b|\bfb\.com\b/i.test(value)) return { driveUrl: '', fbUrl: value };
  return { driveUrl: value, fbUrl: '' };
}

export function normalizeMediaPieceFields(row: MediaPieceWriteInput): MediaPieceFields {
  const editorUids = collectUids(row.editorUids, row.editorUid, row.personUid);
  const reviewerUids = collectUids(row.reviewerUids, row.reviewerUid);
  const editorUid = editorUids[0] ?? '';
  const reviewerUid = reviewerUids[0] ?? '';
  let driveUrl = (row.driveUrl || '').trim();
  let fbUrl = (row.fbUrl || '').trim();
  if (!driveUrl && !fbUrl) {
    const split = splitLegacyLink(row.link || '');
    driveUrl = split.driveUrl;
    fbUrl = split.fbUrl;
  }
  const deployedUids = Array.isArray(row.deployedUids)
    ? uniqueUids(row.deployedUids)
    : uniqueUids(editorUid ? [editorUid] : []);
  return {
    title: row.title,
    type: row.type,
    status: normalizeMediaStatus(row.status),
    caption: row.caption ?? '',
    editorUids,
    reviewerUids,
    editorUid,
    reviewerUid,
    deployedUids,
    shootDate: row.shootDate ?? '',
    publishDate: row.publishDate ?? '',
    driveUrl,
    fbUrl,
    episode: (row.episode ?? '').trim(),
    subs: row.subs ?? '',
    personUid: editorUid,
    link: driveUrl || fbUrl,
  };
}

export function normalizeMediaPieceRecord(
  row: MediaPieceRecord | (MediaPieceWriteInput & Pick<MediaPieceRecord, 'id' | 'workspaceId' | 'createdBy' | 'createdAt' | 'updatedAt'>),
): MediaPieceRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...normalizeMediaPieceFields(row),
  };
}
