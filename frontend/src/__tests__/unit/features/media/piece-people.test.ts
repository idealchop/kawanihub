/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { sameUids } from '@/features/media/lib/piece-person';
import { toMediaPieceWriteInput, type MediaPiece } from '@/features/media/types/media-piece';

function piece(partial: Partial<MediaPiece> = {}): MediaPiece {
  return {
    id: 'piece-1',
    title: 'Session stills',
    type: 'photo',
    status: 'editing',
    caption: 'Hall lights',
    editorUids: ['staff-ana'],
    reviewerUids: ['staff-ben'],
    editorUid: 'staff-ana',
    reviewerUid: 'staff-ben',
    deployedUids: ['staff-cam'],
    personUid: 'staff-ana',
    shootDate: '2026-09-02',
    publishDate: '2026-09-04',
    driveUrl: 'https://drive.example',
    fbUrl: '',
    link: 'https://drive.example',
    episode: '12',
    subs: 'On the floor',
    createdBy: 'demo',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...partial,
  };
}

describe('sameUids', () => {
  it('treats the same people as equal regardless of order', () => {
    expect(sameUids(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameUids(['a'], ['a', 'b'])).toBe(false);
    expect(sameUids([], [])).toBe(true);
  });
});

describe('toMediaPieceWriteInput', () => {
  it('keeps people lists for an inline table save', () => {
    expect(toMediaPieceWriteInput(piece())).toMatchObject({
      title: 'Session stills',
      type: 'photo',
      status: 'editing',
      editorUids: ['staff-ana'],
      reviewerUids: ['staff-ben'],
      deployedUids: ['staff-cam'],
      episode: '12',
    });
  });
});
