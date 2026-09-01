/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  countClosedInMonth,
  countDatesThisWeek,
  countPiecesByStatus,
  countPiecesByType,
  filterPiecesByCreatedRange,
  listOpenPieces,
  mediaProductivityRings,
  openPiecesOldestFirst,
  personLoad,
  piecesNeedingAttention,
  remainingOpenByDay,
  typeMixColor,
} from '@/features/media/lib/media-desk-stats';
import type { MediaPiece } from '@/features/media/types/media-piece';

function piece(partial: Partial<MediaPiece>): MediaPiece {
  return {
    id: 'piece-1',
    title: 'Session stills',
    type: 'photo',
    status: 'editing',
    caption: '',
    editorUids: [],
    reviewerUids: [],
    editorUid: '',
    reviewerUid: '',
    deployedUids: [],
    personUid: '',
    shootDate: '',
    publishDate: '',
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

describe('media desk stats', () => {
  it('counts status, type, attention, week dates, and closed month', () => {
    const rows = [
      piece({ id: 'a', type: 'photo', status: 'editing', shootDate: '2026-09-02', publishDate: '2026-09-10' }),
      piece({
        id: 'b',
        type: 'reels',
        status: 'not_started',
        shootDate: '2026-09-01',
        publishDate: '2026-09-20',
      }),
      piece({ id: 'c', type: 'photo', status: 'published', publishDate: '2026-09-04' }),
      piece({ id: 'd', type: 'photo', status: 'not_published', publishDate: '2026-08-20' }),
    ];

    expect(countPiecesByStatus(rows).editing).toBe(1);
    expect(countPiecesByStatus(rows).published).toBe(1);
    expect(countPiecesByType(rows)).toEqual([
      { type: 'photo', count: 3 },
      { type: 'reels', count: 1 },
    ]);
    expect(piecesNeedingAttention(rows, wednesday).map((row) => row.id)).toEqual(['b']);
    expect(countDatesThisWeek(rows, wednesday)).toEqual({ shoot: 2, publish: 1 });
    expect(countClosedInMonth(rows, wednesday)).toEqual({ published: 1, notPublished: 0 });
    expect(typeMixColor('photo')).toBe(typeMixColor('photo'));
    expect(typeMixColor('photo')).not.toBe(typeMixColor('reels'));
  });

  it('lists open age, who is holding work, and remaining this month', () => {
    const rows = [
      piece({
        id: 'a',
        status: 'editing',
        createdAt: '2026-09-01T00:00:00.000Z',
        editorUids: ['ed-1'],
        shootDate: '2026-09-02',
        publishDate: '2026-09-10',
      }),
      piece({
        id: 'b',
        type: 'reels',
        status: 'not_started',
        createdAt: '2026-08-20T00:00:00.000Z',
        reviewerUids: ['rev-1'],
        shootDate: '2026-09-01',
        publishDate: '2026-09-20',
      }),
      piece({
        id: 'c',
        status: 'published',
        createdAt: '2026-09-01T00:00:00.000Z',
        editorUids: ['ed-1'],
        publishDate: '2026-09-04',
      }),
      piece({ id: 'd', status: 'not_published', publishDate: '2026-08-20' }),
      piece({
        id: 'e',
        status: 'published',
        createdAt: '2026-08-15T00:00:00.000Z',
        editorUids: ['ed-1'],
        publishDate: '2026-09-02',
      }),
      piece({ id: 'f', status: 'caption', createdAt: '2026-09-02T00:00:00.000Z' }),
    ];

    expect(openPiecesOldestFirst(rows).map((row) => row.id)).toEqual(['b', 'a', 'f']);
    expect(listOpenPieces(rows, { status: 'editing', sort: 'open_oldest' }).map((row) => row.id)).toEqual(['a']);
    expect(listOpenPieces(rows, { sort: 'publish_asc' }).map((row) => row.id)).toEqual(['a', 'b', 'f']);
    expect(listOpenPieces(rows, { sort: 'shoot_desc' }).map((row) => row.id)).toEqual(['a', 'b', 'f']);
    expect(personLoad(rows, wednesday)).toEqual([
      {
        uid: 'rev-1',
        open: 1,
        closedThisMonth: 0,
        oldestCreatedAt: '2026-08-20T00:00:00.000Z',
        roles: ['reviewer'],
      },
      {
        uid: 'ed-1',
        open: 1,
        closedThisMonth: 2,
        oldestCreatedAt: '2026-09-01T00:00:00.000Z',
        roles: ['editor'],
      },
      { uid: '', open: 1, closedThisMonth: 0, oldestCreatedAt: '2026-09-02T00:00:00.000Z', roles: [] },
    ]);
    expect(remainingOpenByDay(rows, wednesday)).toEqual([
      { day: '2026-09-01', open: 4 },
      { day: '2026-09-02', open: 4 },
    ]);
    expect(remainingOpenByDay(rows, wednesday, { from: '2026-09-01', to: '2026-09-02' })).toEqual([
      { day: '2026-09-01', open: 4 },
      { day: '2026-09-02', open: 4 },
    ]);
    const scoped = filterPiecesByCreatedRange(rows, { from: '2026-09-01', to: '2026-09-02' });
    expect(scoped.map((row) => row.id)).toEqual(['a', 'c', 'd', 'f']);
    expect(mediaProductivityRings(rows, { from: '2026-09-01', to: '2026-09-02' }, wednesday)).toEqual([
      { id: 'closed', value: 2, total: 4 },
      { id: 'open', value: 2, total: 4 },
      { id: 'attention', value: 0, total: 2 },
      { id: 'published', value: 1, total: 2 },
    ]);
  });
});
