/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { MEDIA_STATUSES, type MediaPiece, type MediaStatus } from '../types/media-piece';
import { dayKey } from './piece-calendar';

export type MediaOpenDuration = {
  value: number;
  unit: 'minute' | 'hour' | 'day';
};

export function pieceIsClosed(status: MediaStatus): boolean {
  return status === 'published' || status === 'not_published';
}

export function pieceNeedsAttention(
  piece: Pick<MediaPiece, 'status' | 'shootDate' | 'publishDate'>,
  now = new Date(),
): boolean {
  if (pieceIsClosed(piece.status)) return false;
  const today = dayKey(now);
  if (piece.publishDate && piece.publishDate <= today) return true;
  return piece.status === 'not_started' && Boolean(piece.shootDate) && piece.shootDate < today;
}

export function pieceOpenUntil(piece: Pick<MediaPiece, 'status' | 'updatedAt'>): string | undefined {
  return pieceIsClosed(piece.status) ? piece.updatedAt : undefined;
}

export function formatMediaOpenDuration(
  fromIso: string,
  untilIso?: string,
  now = Date.now(),
): MediaOpenDuration | null {
  const start = new Date(fromIso).getTime();
  if (Number.isNaN(start)) return null;
  const end = untilIso ? new Date(untilIso).getTime() : now;
  if (Number.isNaN(end)) return null;
  const ms = Math.max(0, end - start);
  if (ms < 60_000) return { value: 1, unit: 'minute' };
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return { value: minutes, unit: 'minute' };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: 'hour' };
  return { value: Math.floor(hours / 24), unit: 'day' };
}

export function compareMediaQueue(
  left: Pick<MediaPiece, 'status' | 'createdAt' | 'title'>,
  right: Pick<MediaPiece, 'status' | 'createdAt' | 'title'>,
): number {
  const rank = MEDIA_STATUSES.indexOf(left.status) - MEDIA_STATUSES.indexOf(right.status);
  if (rank !== 0) return rank;
  return left.createdAt.localeCompare(right.createdAt) || left.title.localeCompare(right.title);
}
