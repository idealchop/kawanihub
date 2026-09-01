/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  dropStatusForColumn,
  groupPiecesByBoardColumn,
  statusFromBoardDrop,
} from '@/features/media/lib/piece-board';
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

describe('groupPiecesByBoardColumn', () => {
  it('groups the edit pile through caption and keeps later stages paired', () => {
    const grouped = groupPiecesByBoardColumn([
      piece({ id: 'a', status: 'editing' }),
      piece({ id: 'b', status: 'revision' }),
      piece({ id: 'c', status: 'ready_for_review' }),
      piece({ id: 'd', status: 'under_review' }),
      piece({ id: 'e', status: 'ready_for_publish' }),
      piece({ id: 'f', status: 'scheduled_post' }),
      piece({ id: 'g', status: 'published' }),
      piece({ id: 'h', status: 'not_published' }),
      piece({ id: 'i', status: 'caption' }),
      piece({ id: 'j', status: 'not_started' }),
    ]);
    expect(grouped.edit.map((row) => row.id)).toEqual(['a', 'b', 'i', 'j']);
    expect(grouped.review.map((row) => row.id)).toEqual(['c', 'd']);
    expect(grouped.post.map((row) => row.id)).toEqual(['e', 'f']);
    expect(grouped.closed.map((row) => row.id)).toEqual(['g', 'h']);
  });
});

describe('statusFromBoardDrop', () => {
  const revision = piece({ id: 'a', status: 'revision' });
  const caption = piece({ id: 'b', status: 'caption' });
  const review = piece({ id: 'c', status: 'ready_for_review' });
  const rows = [revision, caption, review];

  it('keeps a status already in the column and uses the column default when entering', () => {
    expect(dropStatusForColumn(revision, 'edit')).toBe('revision');
    expect(dropStatusForColumn(caption, 'edit')).toBe('caption');
    expect(dropStatusForColumn(piece({ status: 'not_started' }), 'edit')).toBe('not_started');
    expect(dropStatusForColumn(review, 'edit')).toBe('editing');
    expect(dropStatusForColumn(caption, 'closed')).toBe('published');
  });

  it('uses a card status when dropping on a card', () => {
    expect(statusFromBoardDrop(caption, 'piece:a', { status: 'revision' }, rows)).toBe('revision');
    expect(statusFromBoardDrop(review, 'column:edit', { columnId: 'edit' }, rows)).toBe('editing');
    expect(statusFromBoardDrop(revision, 'column:edit', { columnId: 'edit' }, rows)).toBe('revision');
  });
});
