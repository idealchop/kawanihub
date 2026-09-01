/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { createMediaContentType } from '../../../../services/media/media-content-type-service';
import {
  createMediaComment,
  getMediaComment,
  listMediaComments,
  listMediaHistory,
  listRecentMediaEvents,
  toggleMediaCommentReaction,
} from '../../../../services/media/media-activity-service';
import { createMediaPiece, deleteMediaPiece, updateMediaPiece } from '../../../../services/media/media-service';
import { commentPreview, eventsForUpdate, paginateNewestFirst, uidListDiff } from '../../../../services/media/media-history-diff';
import { normalizeMediaPieceFields } from '../../../../services/media/media-types';

describe('media-history-diff', () => {
  it('shortens a comment to one line', () => {
    expect(commentPreview('  Need a trim.  ')).toBe('Need a trim.');
    expect(commentPreview('a'.repeat(90)).endsWith('…')).toBe(true);
    expect(commentPreview('a'.repeat(90)).length).toBe(80);
  });

  it('diffs people lists', () => {
    expect(uidListDiff(['ana'], ['ana', 'rico'])).toEqual({ added: ['rico'], removed: [] });
    expect(uidListDiff(['ana', 'rico'], ['rico'])).toEqual({ added: [], removed: ['ana'] });
  });

  it('emits status, assign, and edit drafts in that write order', () => {
    const before = normalizeMediaPieceFields({
      title: 'Reel',
      type: 'reels',
      status: 'editing',
      editorUids: ['staff-ana'],
      deployedUids: ['staff-ana'],
      caption: 'Old',
    });
    const after = normalizeMediaPieceFields({
      title: 'Reel',
      type: 'reels',
      status: 'published',
      editorUids: ['staff-rico'],
      deployedUids: ['staff-ana'],
      caption: 'New',
    });
    expect(eventsForUpdate(before, after).map((row) => row.type)).toEqual(['updated', 'assigned', 'status']);
  });

  it('pages newest first', () => {
    const rows = [
      { id: 'a', createdAt: '2026-09-01T10:00:00.000Z' },
      { id: 'b', createdAt: '2026-09-02T10:00:00.000Z' },
      { id: 'c', createdAt: '2026-09-03T10:00:00.000Z' },
    ];
    const first = paginateNewestFirst(rows, 1, 2);
    expect(first.items.map((row) => row.id)).toEqual(['c', 'b']);
    expect(first.total).toBe(3);
    expect(paginateNewestFirst(rows, 2, 2).items.map((row) => row.id)).toEqual(['a']);
  });
});

describe('media-activity-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('records create, status, assign, comments, and reactions newest first', async () => {
    const kind = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Photo',
      hint: 'Session stills',
      icon: 'camera',
      status: 'active',
    });
    const created = await createMediaPiece('demo-workspace', 'demo-owner', {
      title: '46th Regular Session',
      type: kind.slug,
      status: 'editing',
      editorUids: ['staff-ana'],
      deployedUids: ['staff-ana'],
    });

    await updateMediaPiece('demo-workspace', created.id, 'demo-owner', {
      title: created.title,
      type: created.type,
      status: 'published',
      editorUids: ['staff-rico'],
      deployedUids: ['staff-ana'],
      caption: 'Posted',
    });

    const comment = await createMediaComment('demo-workspace', created.id, 'demo-owner', 'Caption is ready.');
    const reacted = await toggleMediaCommentReaction(
      'demo-workspace',
      created.id,
      comment.id,
      'demo-owner',
      '👍',
    );
    expect(reacted.reactions['👍']).toEqual(['demo-owner']);

    const again = await toggleMediaCommentReaction(
      'demo-workspace',
      created.id,
      comment.id,
      'demo-owner',
      '👍',
    );
    expect(again.reactions['👍']).toBeUndefined();

    const history = await listMediaHistory('demo-workspace', created.id, 'demo-owner', 1, 20);
    expect(history.items.map((row) => row.type)).toEqual([
      'reaction',
      'comment',
      'status',
      'assigned',
      'updated',
      'created',
    ]);
    expect(history.items[2]?.payload.statusTo).toBe('published');
    expect(history.items[3]?.payload.addedUids).toEqual(['staff-rico']);

    const page = await listMediaComments('demo-workspace', created.id, 'demo-owner', 1, 5);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.body).toBe('Caption is ready.');
    expect((await getMediaComment('demo-workspace', created.id, comment.id, 'demo-owner')).id).toBe(comment.id);

    await deleteMediaPiece('demo-workspace', created.id, 'demo-owner');
    expect(memoryDb.mediaComments.size).toBe(0);
    const recent = await listRecentMediaEvents('demo-workspace', 'demo-owner', 1, 20);
    expect(recent.items[0]?.type).toBe('deleted');
    expect(recent.items[0]?.payload.title).toBe('46th Regular Session');
    expect(recent.items.some((row) => row.type === 'comment')).toBe(true);
  });
});
