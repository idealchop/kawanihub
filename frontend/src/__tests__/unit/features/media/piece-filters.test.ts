/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  dateRangeForPreset,
  filterMediaPieces,
  pieceMatchesDateFilter,
  pieceMatchesPersonFilter,
  pieceSearchText,
} from '@/features/media/lib/piece-filters';
import type { MediaPiece } from '@/features/media/types/media-piece';

function piece(partial: Partial<MediaPiece> = {}): MediaPiece {
  return {
    id: 'piece-1',
    title: 'Session stills',
    type: 'photo',
    status: 'editing',
    caption: '',
    editorUids: ['staff-ana'],
    reviewerUids: ['staff-ben'],
    editorUid: 'staff-ana',
    reviewerUid: 'staff-ben',
    deployedUids: ['staff-cam'],
    personUid: 'staff-ana',
    shootDate: '2026-09-02',
    publishDate: '2026-09-04',
    driveUrl: '',
    fbUrl: '',
    link: '',
    episode: '',
    subs: '',
    createdBy: 'demo',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...partial,
  };
}

const wednesday = new Date(2026, 8, 2);

describe('dateRangeForPreset', () => {
  it('builds week and month windows from Sunday', () => {
    expect(dateRangeForPreset('', wednesday)).toBeNull();
    expect(dateRangeForPreset('today', wednesday)).toEqual({ from: '2026-09-02', to: '2026-09-02' });
    expect(dateRangeForPreset('yesterday', wednesday)).toEqual({ from: '2026-09-01', to: '2026-09-01' });
    expect(dateRangeForPreset('this_week', wednesday)).toEqual({ from: '2026-08-30', to: '2026-09-05' });
    expect(dateRangeForPreset('last_week', wednesday)).toEqual({ from: '2026-08-23', to: '2026-08-29' });
    expect(dateRangeForPreset('last_month', wednesday)).toEqual({ from: '2026-08-01', to: '2026-08-31' });
    expect(dateRangeForPreset('custom', wednesday, '2026-09-01', '2026-09-10')).toEqual({
      from: '2026-09-01',
      to: '2026-09-10',
    });
  });
});

describe('pieceMatchesDateFilter', () => {
  it('matches the chosen field inside the range', () => {
    const row = piece();
    expect(pieceMatchesDateFilter(row, 'shoot', null)).toBe(true);
    expect(pieceMatchesDateFilter(row, 'shoot', { from: '2026-09-02', to: '2026-09-02' })).toBe(true);
    expect(pieceMatchesDateFilter(row, 'shoot', { from: '2026-09-04', to: '2026-09-04' })).toBe(false);
    expect(pieceMatchesDateFilter(row, 'publish', { from: '2026-09-01', to: '2026-09-10' })).toBe(true);
    expect(pieceMatchesDateFilter(row, 'both', { from: '2026-09-02', to: '2026-09-02' })).toBe(true);
    expect(pieceMatchesDateFilter(row, 'both', { from: '2026-09-04', to: '2026-09-04' })).toBe(true);
    expect(pieceMatchesDateFilter(row, 'both', { from: '2026-09-03', to: '2026-09-03' })).toBe(false);
  });
});

describe('pieceMatchesPersonFilter', () => {
  it('matches any selected person in the role', () => {
    const row = piece();
    expect(pieceMatchesPersonFilter(row, 'editor', [])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'editor', ['staff-ana'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'editor', ['staff-ben'])).toBe(false);
    expect(pieceMatchesPersonFilter(row, 'editor', ['staff-ben', 'staff-ana'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'reviewer', ['staff-ben'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'deployed', ['staff-cam'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'anyone', ['staff-cam'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'anyone', ['staff-ben'])).toBe(true);
    expect(pieceMatchesPersonFilter(row, 'anyone', ['staff-zzz'])).toBe(false);
  });
});

describe('filterMediaPieces', () => {
  const rows = [
    piece({ id: 'a', title: 'Flood assistance message', type: 'photo', status: 'editing' }),
    piece({
      id: 'b',
      title: 'Desk hours — how to file',
      type: 'video',
      status: 'ready_for_review',
      editorUids: ['staff-ben'],
      shootDate: '2026-09-10',
      publishDate: '2026-09-12',
    }),
    piece({
      id: 'c',
      title: 'Claim window reminder',
      type: 'photo',
      status: 'scheduled_post',
      caption: 'Barangay hall hours',
    }),
  ];

  function searchText(row: (typeof rows)[number]) {
    return pieceSearchText(row, row.editorUids.join(' '));
  }

  it('applies search, status, type, when, and who together', () => {
    expect(
      filterMediaPieces(rows, {
        query: 'flood',
        status: '',
        type: '',
        dateRole: 'publish',
        range: null,
        personRole: 'editor',
        personUids: [],
        searchText,
      }).map((row) => row.id),
    ).toEqual(['a']);

    expect(
      filterMediaPieces(rows, {
        query: '',
        status: 'editing',
        type: 'photo',
        dateRole: 'publish',
        range: null,
        personRole: 'editor',
        personUids: [],
        searchText,
      }).map((row) => row.id),
    ).toEqual(['a']);

    expect(
      filterMediaPieces(rows, {
        query: '',
        status: '',
        type: '',
        dateRole: 'shoot',
        range: { from: '2026-09-10', to: '2026-09-10' },
        personRole: 'editor',
        personUids: [],
        searchText,
      }).map((row) => row.id),
    ).toEqual(['b']);

    expect(
      filterMediaPieces(rows, {
        query: '',
        status: '',
        type: '',
        dateRole: 'publish',
        range: null,
        personRole: 'editor',
        personUids: ['staff-ben'],
        searchText,
      }).map((row) => row.id),
    ).toEqual(['b']);

    expect(
      filterMediaPieces(rows, {
        query: 'hours',
        status: '',
        type: '',
        dateRole: 'publish',
        range: null,
        personRole: 'editor',
        personUids: [],
        searchText,
      }).map((row) => row.id),
    ).toEqual(['b', 'c']);
  });
});
