/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { dayKey } from './piece-calendar';
import type { MediaPiece, MediaStatus } from '../types/media-piece';

export const MEDIA_KPI_IDS = ['in_edit', 'in_review', 'ready_to_post', 'due_today'] as const;
export type MediaKpiId = (typeof MEDIA_KPI_IDS)[number];

const IN_EDIT: MediaStatus[] = ['not_started', 'editing', 'revision', 'caption'];
const IN_REVIEW: MediaStatus[] = ['ready_for_review', 'under_review'];
const READY_TO_POST: MediaStatus[] = ['ready_for_publish', 'scheduled_post'];
const DONE: MediaStatus[] = ['published', 'not_published'];

export function pieceMatchesKpi(piece: MediaPiece, kpi: MediaKpiId | null, now = new Date()): boolean {
  if (!kpi) return true;
  if (kpi === 'in_edit') return IN_EDIT.includes(piece.status);
  if (kpi === 'in_review') return IN_REVIEW.includes(piece.status);
  if (kpi === 'ready_to_post') return READY_TO_POST.includes(piece.status);
  if (DONE.includes(piece.status)) return false;
  const today = dayKey(now);
  return piece.shootDate === today || piece.publishDate === today;
}

export function countMediaKpis(pieces: MediaPiece[], now = new Date()): Record<MediaKpiId, number> {
  return {
    in_edit: pieces.filter((row) => pieceMatchesKpi(row, 'in_edit', now)).length,
    in_review: pieces.filter((row) => pieceMatchesKpi(row, 'in_review', now)).length,
    ready_to_post: pieces.filter((row) => pieceMatchesKpi(row, 'ready_to_post', now)).length,
    due_today: pieces.filter((row) => pieceMatchesKpi(row, 'due_today', now)).length,
  };
}
