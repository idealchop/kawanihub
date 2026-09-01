/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  dayKey,
  groupOccurrencesByDay,
  monthGrid,
  occurrencesInMonth,
  occurrencesInPeriod,
  periodGrid,
  periodLabel,
  shiftAnchor,
  startOfMonth,
  weekGrid,
} from '@/features/media/lib/piece-calendar';
import { formatPieceDate, linkLabel } from '@/features/media/lib/format-piece-date';
import { personName } from '@/features/media/lib/piece-person';
import type { MediaPiece } from '@/features/media/types/media-piece';
import type { Member } from '@/features/users/types/member';

function piece(partial: Pick<MediaPiece, 'id' | 'title' | 'shootDate' | 'publishDate'>): MediaPiece {
  return {
    type: 'photo',
    status: 'editing',
    caption: '',
    editorUids: ['staff-ana'],
    reviewerUids: [],
    editorUid: 'staff-ana',
    reviewerUid: '',
    deployedUids: ['staff-ana'],
    personUid: 'staff-ana',
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

describe('piece calendar', () => {
  it('groups pieces on shoot or publish date and skips blanks', () => {
    const anchor = startOfMonth(new Date(2026, 8, 15));
    expect(monthGrid(anchor)).toHaveLength(42);
    expect(dayKey(anchor)).toBe('2026-09-01');

    const session = piece({ id: 'a', title: 'Session', shootDate: '2026-09-02', publishDate: '2026-09-04' });
    const reel = piece({ id: 'b', title: 'Reel', shootDate: '2026-09-02', publishDate: '2026-10-01' });
    const undated = piece({ id: 'c', title: 'Later', shootDate: '', publishDate: '' });

    expect(groupOccurrencesByDay([session, reel, undated]).get('2026-09-02')?.map((row) => `${row.piece.id}:${row.kind}`)).toEqual([
      'b:shoot',
      'a:shoot',
    ]);
    expect(groupOccurrencesByDay([session, reel, undated]).get('2026-09-04')?.map((row) => `${row.piece.id}:${row.kind}`)).toEqual([
      'a:publish',
    ]);
    expect(
      occurrencesInMonth([session, reel, undated], anchor).map((row) => `${row.piece.id}:${row.kind}`),
    ).toEqual(['b:shoot', 'a:shoot', 'a:publish']);
    expect(
      groupOccurrencesByDay([session, reel], { kinds: ['publish'], range: { from: '2026-09-01', to: '2026-09-30' } })
        .get('2026-09-04')
        ?.map((row) => row.piece.id),
    ).toEqual(['a']);
    expect(linkLabel('https://www.facebook.com/post')).toBe('facebook.com');
    expect(personName([{ uid: 'staff-ana', displayName: 'Ana Kawani' } as Member], 'staff-ana')).toBe('Ana Kawani');
  });

  it('builds week and day grids from Sunday and keeps month as the default period', () => {
    const wednesday = new Date(2026, 8, 2);
    expect(weekGrid(wednesday)).toHaveLength(7);
    expect(dayKey(weekGrid(wednesday)[0])).toBe('2026-08-30');
    expect(dayKey(weekGrid(wednesday)[6])).toBe('2026-09-05');
    expect(periodGrid(wednesday, 'month')).toHaveLength(42);
    expect(periodGrid(wednesday, 'week')).toHaveLength(7);
    expect(periodGrid(wednesday, 'day')).toHaveLength(1);
    expect(dayKey(periodGrid(wednesday, 'day')[0])).toBe('2026-09-02');
    expect(dayKey(shiftAnchor(wednesday, 'day', 1))).toBe('2026-09-03');
    expect(dayKey(shiftAnchor(wednesday, 'week', -1))).toBe('2026-08-26');
    expect(periodLabel(wednesday, 'week', 'en')).toMatch(/Aug 30/);
    expect(periodLabel(wednesday, 'day', 'en')).toMatch(/September 2/);

    const session = piece({ id: 'a', title: 'Session', shootDate: '2026-09-02', publishDate: '2026-09-04' });
    const reel = piece({ id: 'b', title: 'Reel', shootDate: '2026-09-02', publishDate: '2026-10-01' });
    expect(occurrencesInPeriod([session, reel], wednesday, 'day').map((row) => `${row.piece.id}:${row.kind}`)).toEqual([
      'b:shoot',
      'a:shoot',
    ]);
    expect(occurrencesInPeriod([session, reel], wednesday, 'week').map((row) => `${row.piece.id}:${row.kind}`)).toEqual([
      'b:shoot',
      'a:shoot',
      'a:publish',
    ]);
  });
});
