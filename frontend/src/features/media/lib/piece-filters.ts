/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { matchesSearch } from '@/components/ui/lib/data-table-model';
import { addDays, dayKey, startOfMonth, startOfWeek } from './piece-calendar';
import type { MediaPiece } from '../types/media-piece';

export type PieceDateRole = 'shoot' | 'publish' | 'both';
export type PiecePersonRole = 'editor' | 'reviewer' | 'deployed' | 'anyone';

export const DATE_PRESETS = ['today', 'yesterday', 'this_week', 'last_week', 'last_month', 'custom'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export type DateRange = { from: string; to: string };

function atDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function orderedRange(from: string, to: string): DateRange {
  if (from && to && from > to) return { from: to, to: from };
  return { from, to };
}

export function dateRangeForPreset(
  preset: DatePreset | '',
  now: Date,
  customFrom = '',
  customTo = '',
): DateRange | null {
  if (!preset) return null;
  const today = atDay(now);
  if (preset === 'today') return { from: dayKey(today), to: dayKey(today) };
  if (preset === 'yesterday') {
    const day = addDays(today, -1);
    return { from: dayKey(day), to: dayKey(day) };
  }
  if (preset === 'this_week') {
    const start = startOfWeek(today);
    return { from: dayKey(start), to: dayKey(addDays(start, 6)) };
  }
  if (preset === 'last_week') {
    const start = addDays(startOfWeek(today), -7);
    return { from: dayKey(start), to: dayKey(addDays(start, 6)) };
  }
  if (preset === 'last_month') {
    const end = addDays(startOfMonth(today), -1);
    return { from: dayKey(startOfMonth(end)), to: dayKey(end) };
  }
  if (!customFrom && !customTo) return null;
  return orderedRange(customFrom, customTo || customFrom);
}

export function pieceDateValue(piece: MediaPiece, field: Exclude<PieceDateRole, 'both'>): string {
  return field === 'shoot' ? piece.shootDate : piece.publishDate;
}

function dateInRange(value: string, range: DateRange): boolean {
  if (!value) return false;
  if (range.from && value < range.from) return false;
  if (range.to && value > range.to) return false;
  return true;
}

export function pieceMatchesDateFilter(piece: MediaPiece, field: PieceDateRole, range: DateRange | null): boolean {
  if (!range) return true;
  if (field === 'both') {
    return dateInRange(piece.shootDate, range) || dateInRange(piece.publishDate, range);
  }
  return dateInRange(pieceDateValue(piece, field), range);
}

export function piecePersonUids(piece: MediaPiece, role: PiecePersonRole): string[] {
  if (role === 'anyone') {
    return [...new Set([...piece.editorUids, ...piece.reviewerUids, ...piece.deployedUids])];
  }
  if (role === 'editor') return piece.editorUids;
  if (role === 'reviewer') return piece.reviewerUids;
  return piece.deployedUids;
}

export function pieceMatchesPersonFilter(piece: MediaPiece, role: PiecePersonRole, uids: string[]): boolean {
  if (uids.length === 0) return true;
  const assigned = new Set(piecePersonUids(piece, role));
  return uids.some((uid) => assigned.has(uid));
}

export function pieceSearchText(piece: MediaPiece, people: string): string {
  return `${piece.title} ${piece.type} ${piece.status} ${piece.caption} ${piece.episode} ${people} ${piece.driveUrl} ${piece.fbUrl}`;
}

export function filterMediaPieces(
  pieces: MediaPiece[],
  input: {
    query: string;
    status: string;
    type: string;
    dateRole: PieceDateRole;
    range: DateRange | null;
    personRole: PiecePersonRole;
    personUids: string[];
    searchText: (piece: MediaPiece) => string;
  },
): MediaPiece[] {
  return pieces.filter((row) => {
    if (!matchesSearch(input.searchText(row), input.query)) return false;
    if (input.status && row.status !== input.status) return false;
    if (input.type && row.type !== input.type) return false;
    if (!pieceMatchesDateFilter(row, input.dateRole, input.range)) return false;
    return pieceMatchesPersonFilter(row, input.personRole, input.personUids);
  });
}
