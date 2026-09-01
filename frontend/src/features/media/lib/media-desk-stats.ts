/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { MEDIA_STATUSES, type MediaPiece, type MediaStatus } from '../types/media-piece';
import { compareMediaQueue, pieceIsClosed, pieceNeedsAttention } from './piece-attention';
import { addDays, atDay, dayKey, parseDateField, startOfMonth } from './piece-calendar';
import { dateRangeForPreset, pieceMatchesDateFilter, type DateRange } from './piece-filters';

export type MediaDeskRange = DateRange;

function isoDay(value: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

export function pieceOpenedDay(piece: MediaPiece): string {
  return isoDay(piece.createdAt);
}

function dayInRange(day: string, range: MediaDeskRange | null): boolean {
  if (!range || !day) return false;
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

export function filterPiecesByCreatedRange(pieces: MediaPiece[], range: MediaDeskRange | null): MediaPiece[] {
  if (!range?.from && !range?.to) return pieces;
  return pieces.filter((piece) => dayInRange(pieceOpenedDay(piece), range));
}

export function filterEventsByRange<T extends { createdAt: string }>(events: T[], range: MediaDeskRange | null): T[] {
  if (!range?.from && !range?.to) return events;
  return events.filter((event) => dayInRange(isoDay(event.createdAt), range));
}

const TYPE_MIX_PALETTE = ['#0284c7', '#d97706', '#059669', '#7c3aed', '#e11d48', '#0f766e', '#ea580c', '#65a30d'];

export function countPiecesByStatus(pieces: MediaPiece[]): Record<MediaStatus, number> {
  const counts = Object.fromEntries(MEDIA_STATUSES.map((status) => [status, 0])) as Record<MediaStatus, number>;
  for (const piece of pieces) counts[piece.status] += 1;
  return counts;
}

export function countPiecesByType(pieces: MediaPiece[]): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const piece of pieces) {
    if (!piece.type) continue;
    counts.set(piece.type, (counts.get(piece.type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
}

export function piecesNeedingAttention(pieces: MediaPiece[], now = new Date()): MediaPiece[] {
  return pieces.filter((piece) => pieceNeedsAttention(piece, now)).sort(compareMediaQueue);
}

export function openPiecesOldestFirst(pieces: MediaPiece[]): MediaPiece[] {
  return listOpenPieces(pieces, { sort: 'open_oldest' });
}

export const OPEN_MEDIA_STATUSES = MEDIA_STATUSES.filter((status) => !pieceIsClosed(status));

export type OpenPieceSort =
  | 'open_oldest'
  | 'open_newest'
  | 'shoot_asc'
  | 'shoot_desc'
  | 'publish_asc'
  | 'publish_desc';

export type OpenPieceQuery = {
  status?: MediaStatus | '';
  sort: OpenPieceSort;
};

function compareOptionalDay(left: string, right: string, asc: boolean): number {
  const a = left || '';
  const b = right || '';
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const cmp = a.localeCompare(b);
  return asc ? cmp : -cmp;
}

function compareOpenPieces(left: MediaPiece, right: MediaPiece, sort: OpenPieceSort): number {
  switch (sort) {
    case 'open_newest':
      return right.createdAt.localeCompare(left.createdAt) || left.title.localeCompare(right.title);
    case 'shoot_asc':
      return compareOptionalDay(left.shootDate, right.shootDate, true) || left.title.localeCompare(right.title);
    case 'shoot_desc':
      return compareOptionalDay(left.shootDate, right.shootDate, false) || left.title.localeCompare(right.title);
    case 'publish_asc':
      return compareOptionalDay(left.publishDate, right.publishDate, true) || left.title.localeCompare(right.title);
    case 'publish_desc':
      return compareOptionalDay(left.publishDate, right.publishDate, false) || left.title.localeCompare(right.title);
    case 'open_oldest':
    default:
      return left.createdAt.localeCompare(right.createdAt) || left.title.localeCompare(right.title);
  }
}

export function listOpenPieces(pieces: MediaPiece[], query: OpenPieceQuery): MediaPiece[] {
  let rows = pieces.filter((piece) => !pieceIsClosed(piece.status));
  if (query.status) rows = rows.filter((piece) => piece.status === query.status);
  return [...rows].sort((left, right) => compareOpenPieces(left, right, query.sort));
}

export type PersonDeskRole = 'editor' | 'reviewer' | 'deployer';

const ROLE_ORDER: PersonDeskRole[] = ['editor', 'reviewer', 'deployer'];

export type PersonLoadRow = {
  uid: string;
  open: number;
  closedThisMonth: number;
  oldestCreatedAt: string | null;
  roles: PersonDeskRole[];
};

function pieceAssignees(piece: MediaPiece): { uid: string; roles: PersonDeskRole[] }[] {
  const map = new Map<string, Set<PersonDeskRole>>();
  const add = (uids: string[], role: PersonDeskRole) => {
    for (const uid of uids) {
      if (!uid) continue;
      const roles = map.get(uid) ?? new Set<PersonDeskRole>();
      roles.add(role);
      map.set(uid, roles);
    }
  };
  add(piece.editorUids, 'editor');
  add(piece.reviewerUids, 'reviewer');
  add(piece.deployedUids, 'deployer');
  return [...map.entries()].map(([uid, roles]) => ({
    uid,
    roles: ROLE_ORDER.filter((role) => roles.has(role)),
  }));
}

function monthRange(now: Date): DateRange {
  return {
    from: dayKey(startOfMonth(now)),
    to: dayKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

function pieceClosedInMonth(piece: MediaPiece, now: Date): boolean {
  return pieceIsClosed(piece.status) && pieceMatchesDateFilter(piece, 'publish', monthRange(now));
}

function pieceClosedInRange(piece: MediaPiece, range: MediaDeskRange): boolean {
  return pieceIsClosed(piece.status) && pieceMatchesDateFilter(piece, 'publish', range);
}

function emptyLoad(uid: string): PersonLoadRow {
  return { uid, open: 0, closedThisMonth: 0, oldestCreatedAt: null, roles: [] };
}

function addOpenAge(row: PersonLoadRow, createdAt: string) {
  if (!row.oldestCreatedAt || createdAt < row.oldestCreatedAt) row.oldestCreatedAt = createdAt;
}

function mergeRoles(row: PersonLoadRow, roles: PersonDeskRole[]) {
  const set = new Set([...row.roles, ...roles]);
  row.roles = ROLE_ORDER.filter((role) => set.has(role));
}

export function personLoad(pieces: MediaPiece[], now = new Date(), range: MediaDeskRange | null = null): PersonLoadRow[] {
  const scoped = range ? filterPiecesByCreatedRange(pieces, range) : pieces;
  const byUid = new Map<string, PersonLoadRow>();
  const unassigned = emptyLoad('');

  const bump = (row: PersonLoadRow, piece: MediaPiece, roles: PersonDeskRole[]) => {
    mergeRoles(row, roles);
    if (!pieceIsClosed(piece.status)) {
      row.open += 1;
      addOpenAge(row, piece.createdAt);
      return;
    }
    if (range ? pieceClosedInRange(piece, range) : pieceClosedInMonth(piece, now)) row.closedThisMonth += 1;
  };

  for (const piece of scoped) {
    const people = pieceAssignees(piece);
    if (people.length === 0) {
      bump(unassigned, piece, []);
      continue;
    }
    for (const person of people) {
      const row = byUid.get(person.uid) ?? emptyLoad(person.uid);
      bump(row, piece, person.roles);
      byUid.set(person.uid, row);
    }
  }

  const rows = [...byUid.values()].filter((row) => row.open > 0 || row.closedThisMonth > 0);
  if (unassigned.open > 0 || unassigned.closedThisMonth > 0) rows.push(unassigned);
  return rows.sort(
    (left, right) =>
      right.open - left.open ||
      (left.oldestCreatedAt ?? '\uffff').localeCompare(right.oldestCreatedAt ?? '\uffff') ||
      left.uid.localeCompare(right.uid),
  );
}

export function pieceClosedDay(piece: MediaPiece): string | null {
  if (!pieceIsClosed(piece.status)) return null;
  return piece.publishDate || isoDay(piece.updatedAt) || null;
}

export function remainingOpenByDay(
  pieces: MediaPiece[],
  now = new Date(),
  range: MediaDeskRange | null = null,
): { day: string; open: number }[] {
  const activeRange = range ?? monthRange(now);
  const end = activeRange.to > dayKey(atDay(now)) ? dayKey(atDay(now)) : activeRange.to;
  const start = parseDateField(activeRange.from);
  if (!start || !end || activeRange.from > end) return [];

  const points: { day: string; open: number }[] = [];
  for (let cursor = start; dayKey(cursor) <= end; cursor = addDays(cursor, 1)) {
    const day = dayKey(cursor);
    let open = 0;
    for (const piece of pieces) {
      const opened = pieceOpenedDay(piece);
      if (!opened || opened > day) continue;
      const closed = pieceClosedDay(piece);
      if (closed && closed <= day) continue;
      open += 1;
    }
    points.push({ day, open });
  }
  return points;
}

export function countDatesInRange(
  pieces: MediaPiece[],
  range: MediaDeskRange,
): { shoot: number; publish: number } {
  return {
    shoot: pieces.filter((piece) => pieceMatchesDateFilter(piece, 'shoot', range)).length,
    publish: pieces.filter((piece) => pieceMatchesDateFilter(piece, 'publish', range)).length,
  };
}

export function countClosedInRange(
  pieces: MediaPiece[],
  range: MediaDeskRange,
): { published: number; notPublished: number } {
  return {
    published: pieces.filter((piece) => piece.status === 'published' && pieceMatchesDateFilter(piece, 'publish', range))
      .length,
    notPublished: pieces.filter(
      (piece) => piece.status === 'not_published' && pieceMatchesDateFilter(piece, 'publish', range),
    ).length,
  };
}

export type ProductivityRing = {
  id: 'closed' | 'open' | 'attention' | 'published';
  value: number;
  total: number;
};

export function mediaProductivityRings(
  pieces: MediaPiece[],
  range: MediaDeskRange,
  now = new Date(),
): ProductivityRing[] {
  const scoped = filterPiecesByCreatedRange(pieces, range);
  const open = scoped.filter((piece) => !pieceIsClosed(piece.status));
  const closed = scoped.filter((piece) => pieceIsClosed(piece.status));
  const attention = open.filter((piece) => pieceNeedsAttention(piece, now));
  const published = closed.filter((piece) => piece.status === 'published').length;
  const total = scoped.length;
  return [
    { id: 'closed', value: closed.length, total },
    { id: 'open', value: open.length, total },
    { id: 'attention', value: attention.length, total: open.length || 1 },
    { id: 'published', value: published, total: closed.length || 1 },
  ];
}

export function countDatesThisWeek(pieces: MediaPiece[], now = new Date()): { shoot: number; publish: number } {
  const range = dateRangeForPreset('this_week', now);
  if (!range) return { shoot: 0, publish: 0 };
  return countDatesInRange(pieces, range);
}

export function countClosedInMonth(
  pieces: MediaPiece[],
  now = new Date(),
): { published: number; notPublished: number } {
  return countClosedInRange(pieces, monthRange(now));
}

export function typeMixColor(type: string): string {
  let hash = 0;
  for (const char of type) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TYPE_MIX_PALETTE[hash % TYPE_MIX_PALETTE.length];
}
