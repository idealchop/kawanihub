/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { MEDIA_COMMENT_PREVIEW_LENGTH, type MediaPeopleRole, type MediaPieceEventPayload, type MediaPieceEventType } from './media-activity-types';
import type { MediaPieceFields } from './media-types';

export type PieceEventDraft = {
  type: MediaPieceEventType;
  payload: MediaPieceEventPayload;
};

const CONTENT_KEYS = ['title', 'type', 'caption', 'shootDate', 'publishDate', 'driveUrl', 'fbUrl', 'episode', 'subs'] as const;

export function commentPreview(body: string, max = MEDIA_COMMENT_PREVIEW_LENGTH): string {
  const text = body.trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function uidListDiff(before: string[], after: string[]): { added: string[]; removed: string[] } {
  const previous = new Set(before);
  const next = new Set(after);
  return {
    added: after.filter((uid) => !previous.has(uid)),
    removed: before.filter((uid) => !next.has(uid)),
  };
}

export function contentFieldsChanged(before: MediaPieceFields, after: MediaPieceFields): boolean {
  return CONTENT_KEYS.some((key) => before[key] !== after[key]);
}

const PEOPLE_ROLES: Array<{ role: MediaPeopleRole; key: 'editorUids' | 'reviewerUids' | 'deployedUids' }> = [
  { role: 'editor', key: 'editorUids' },
  { role: 'reviewer', key: 'reviewerUids' },
  { role: 'deployed', key: 'deployedUids' },
];

export function eventsForUpdate(before: MediaPieceFields, after: MediaPieceFields): PieceEventDraft[] {
  const drafts: PieceEventDraft[] = [];
  if (contentFieldsChanged(before, after)) {
    drafts.push({ type: 'updated', payload: {} });
  }
  for (const { role, key } of PEOPLE_ROLES) {
    const { added, removed } = uidListDiff(before[key], after[key]);
    if (added.length || removed.length) {
      drafts.push({
        type: 'assigned',
        payload: { role, addedUids: added, removedUids: removed },
      });
    }
  }
  if (before.status !== after.status) {
    drafts.push({
      type: 'status',
      payload: { statusFrom: before.status, statusTo: after.status },
    });
  }
  return drafts;
}

export function paginateNewestFirst<T extends { createdAt: string; id: string }>(
  rows: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; pageSize: number; total: number } {
  const sorted = [...rows].sort((left, right) => {
    const byDate = right.createdAt.localeCompare(left.createdAt);
    if (byDate !== 0) return byDate;
    return right.id.localeCompare(left.id);
  });
  const total = sorted.length;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
  };
}
