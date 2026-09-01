/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { countMediaKpis, pieceMatchesKpi } from '@/features/media/lib/piece-kpis';
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
    shootDate: '2026-09-01',
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

const today = new Date(2026, 8, 1);

describe('pieceMatchesKpi', () => {
  it('groups the edit and review piles', () => {
    expect(pieceMatchesKpi(piece({ status: 'caption' }), 'in_edit')).toBe(true);
    expect(pieceMatchesKpi(piece({ status: 'under_review' }), 'in_edit')).toBe(false);
    expect(pieceMatchesKpi(piece({ status: 'ready_for_review' }), 'in_review')).toBe(true);
    expect(pieceMatchesKpi(piece({ status: 'ready_for_publish' }), 'ready_to_post')).toBe(true);
    expect(pieceMatchesKpi(piece({ status: 'scheduled_post' }), 'ready_to_post')).toBe(true);
  });

  it('flags unfinished pieces with a shoot or publish date today', () => {
    expect(pieceMatchesKpi(piece({ status: 'editing', shootDate: '2026-09-01' }), 'due_today', today)).toBe(true);
    expect(pieceMatchesKpi(piece({ status: 'published', shootDate: '2026-09-01' }), 'due_today', today)).toBe(false);
    expect(pieceMatchesKpi(piece({ status: 'editing', shootDate: '2026-09-02', publishDate: '' }), 'due_today', today)).toBe(
      false,
    );
  });
});

describe('countMediaKpis', () => {
  it('counts each pile from the visible board', () => {
    const counts = countMediaKpis(
      [
        piece({ id: '1', status: 'editing', shootDate: '2026-09-10', publishDate: '2026-09-12' }),
        piece({ id: '2', status: 'under_review', shootDate: '2026-08-20', publishDate: '2026-08-22' }),
        piece({ id: '3', status: 'ready_for_publish', shootDate: '2026-08-10', publishDate: '2026-09-01' }),
        piece({ id: '4', status: 'caption', shootDate: '2026-09-01', publishDate: '2026-09-08' }),
      ],
      today,
    );
    expect(counts.in_edit).toBe(2);
    expect(counts.in_review).toBe(1);
    expect(counts.ready_to_post).toBe(1);
    expect(counts.due_today).toBe(2);
  });
});
