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

export type MediaDateField = 'shoot' | 'publish';

export function isMediaDateField(value: string | null | undefined): value is MediaDateField {
  return value === 'shoot' || value === 'publish';
}

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

export type MediaPiece = {
  id: string;
  title: string;
  type: string;
  status: MediaStatus;
  caption: string;
  editorUids: string[];
  reviewerUids: string[];
  editorUid: string;
  reviewerUid: string;
  deployedUids: string[];
  personUid: string;
  shootDate: string;
  publishDate: string;
  driveUrl: string;
  fbUrl: string;
  link: string;
  episode: string;
  subs: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaPieceListResponse = {
  pieces: MediaPiece[];
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

export function normalizeMediaPiece(row: MediaPieceWriteInput & Partial<MediaPiece> & { id?: string }): MediaPiece {
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
    id: row.id ?? '',
    title: row.title,
    type: row.type,
    status: normalizeMediaStatus(row.status),
    caption: row.caption ?? '',
    editorUids,
    reviewerUids,
    editorUid,
    reviewerUid,
    deployedUids,
    personUid: editorUid,
    shootDate: row.shootDate ?? '',
    publishDate: row.publishDate ?? '',
    driveUrl,
    fbUrl,
    link: driveUrl || fbUrl,
    episode: (row.episode ?? '').trim(),
    subs: row.subs ?? '',
    createdBy: row.createdBy ?? '',
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  };
}

export function pieceLinks(piece: Pick<MediaPiece, 'driveUrl' | 'fbUrl' | 'link'>): string[] {
  return [...new Set([piece.driveUrl, piece.fbUrl, piece.link].map((value) => value.trim()).filter(Boolean))];
}

export function toMediaPieceWriteInput(piece: MediaPiece): MediaPieceWriteInput {
  return {
    title: piece.title,
    type: piece.type,
    status: piece.status,
    caption: piece.caption,
    editorUids: piece.editorUids,
    reviewerUids: piece.reviewerUids,
    deployedUids: piece.deployedUids,
    shootDate: piece.shootDate,
    publishDate: piece.publishDate,
    driveUrl: piece.driveUrl,
    fbUrl: piece.fbUrl,
    episode: piece.episode,
    subs: piece.subs,
  };
}
