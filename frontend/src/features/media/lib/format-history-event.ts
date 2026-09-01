/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaPieceEvent } from '../types/media-history';
import type { MediaStatus } from '../types/media-piece';

export type HistoryLineCopy = {
  historyCreated: string;
  historyUpdated: string;
  historyStatus: string;
  historyAssigned: string;
  historyUnassigned: string;
  historyAssignedChanged: string;
  historyComment: string;
  historyReaction: string;
  historyDeleted: string;
  editorLabel: string;
  reviewerLabel: string;
  deployedLabel: string;
  statuses: Record<MediaStatus, string>;
};

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function roleLabel(copy: HistoryLineCopy, role: string | undefined): string {
  if (role === 'reviewer') return copy.reviewerLabel;
  if (role === 'deployed') return copy.deployedLabel;
  return copy.editorLabel;
}

function statusLabel(copy: HistoryLineCopy, status: string | undefined): string {
  if (!status) return '';
  return copy.statuses[status as MediaStatus] ?? status;
}

export function formatHistoryEvent(
  event: Pick<MediaPieceEvent, 'type' | 'actorUid' | 'actorName' | 'payload'>,
  copy: HistoryLineCopy,
  peopleNames: (uids: string[]) => string,
): string {
  const name = event.actorName || event.actorUid;
  const payload = event.payload;
  if (event.type === 'created') return fill(copy.historyCreated, { name });
  if (event.type === 'updated') return fill(copy.historyUpdated, { name });
  if (event.type === 'status') {
    return fill(copy.historyStatus, {
      name,
      from: statusLabel(copy, payload.statusFrom),
      to: statusLabel(copy, payload.statusTo),
    });
  }
  if (event.type === 'assigned') {
    const role = roleLabel(copy, payload.role);
    const added = peopleNames(payload.addedUids ?? []);
    const removed = peopleNames(payload.removedUids ?? []);
    if (added && removed) return fill(copy.historyAssignedChanged, { name, role, added, removed });
    if (removed) return fill(copy.historyUnassigned, { name, role, people: removed });
    return fill(copy.historyAssigned, { name, role, people: added || '—' });
  }
  if (event.type === 'comment') {
    return fill(copy.historyComment, { name, preview: payload.commentPreview || '' });
  }
  if (event.type === 'reaction') {
    return fill(copy.historyReaction, {
      name,
      emoji: payload.emoji || '',
      preview: payload.commentPreview || '',
    });
  }
  if (event.type === 'deleted') {
    return fill(copy.historyDeleted, { name, title: payload.title || '' });
  }
  return name;
}

export function formatActivityWhen(value: string, locale = 'en'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'fil' ? 'en-PH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
