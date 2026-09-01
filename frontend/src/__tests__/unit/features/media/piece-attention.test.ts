/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  compareMediaQueue,
  formatMediaOpenDuration,
  pieceNeedsAttention,
} from '@/features/media/lib/piece-attention';
import type { MediaPiece } from '@/features/media/types/media-piece';

function piece(partial: Partial<MediaPiece> = {}): MediaPiece {
  return {
    id: 'piece-1',
    title: 'Session stills',
    type: 'photo',
    status: 'editing',
    caption: '',
    editorUids: ['staff-ana'],
    reviewerUids: [],
    editorUid: 'staff-ana',
    reviewerUid: '',
    deployedUids: [],
    personUid: 'staff-ana',
    shootDate: '2026-09-10',
    publishDate: '2026-09-12',
    driveUrl: '',
    fbUrl: '',
    link: '',
    episode: '',
    subs: '',
    createdBy: 'demo',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...partial,
  };
}

const today = new Date(2026, 8, 1);

describe('pieceNeedsAttention', () => {
  it('flags open work whose publish date has arrived', () => {
    expect(pieceNeedsAttention(piece({ status: 'ready_for_publish', publishDate: '2026-09-01' }), today)).toBe(true);
    expect(pieceNeedsAttention(piece({ status: 'editing', publishDate: '2026-08-27' }), today)).toBe(true);
    expect(pieceNeedsAttention(piece({ status: 'editing', publishDate: '2026-09-04' }), today)).toBe(false);
  });

  it('ignores published and not published pieces', () => {
    expect(pieceNeedsAttention(piece({ status: 'published', publishDate: '2026-08-15' }), today)).toBe(false);
    expect(pieceNeedsAttention(piece({ status: 'not_published', publishDate: '2026-08-15' }), today)).toBe(false);
  });

  it('flags a shoot that already passed while still not started', () => {
    expect(pieceNeedsAttention(piece({ status: 'not_started', shootDate: '2026-08-30', publishDate: '' }), today)).toBe(
      true,
    );
  });
});

describe('formatMediaOpenDuration', () => {
  it('counts whole days since the piece was opened', () => {
    const start = Date.parse('2026-08-20T00:00:00.000Z');
    expect(formatMediaOpenDuration('2026-08-20T00:00:00.000Z', undefined, start + 3 * 24 * 60 * 60 * 1000)).toEqual({
      value: 3,
      unit: 'day',
    });
  });
});

describe('compareMediaQueue', () => {
  it('keeps the pipeline in order and parks published last', () => {
    const rows = [
      piece({ id: 'pub', title: 'Done reel', status: 'published', createdAt: '2026-08-01T00:00:00.000Z' }),
      piece({ id: 'edit', title: 'Late stills', status: 'editing', createdAt: '2026-08-20T00:00:00.000Z' }),
      piece({ id: 'skip', title: 'Dropped card', status: 'not_published', createdAt: '2026-08-02T00:00:00.000Z' }),
      piece({ id: 'sched', title: 'Night recap', status: 'scheduled_post', createdAt: '2026-08-22T00:00:00.000Z' }),
    ].sort(compareMediaQueue);
    expect(rows.map((row) => row.status)).toEqual(['editing', 'scheduled_post', 'published', 'not_published']);
  });
});
