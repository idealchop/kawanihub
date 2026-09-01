/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { formatHistoryEvent, type HistoryLineCopy } from '@/features/media/lib/format-history-event';
import { getMediaCopy } from '@/features/media/lib/media-copy';

const copy = getMediaCopy('en') as HistoryLineCopy;
const names = (uids: string[]) => (uids.length ? uids.join(', ') : '');

describe('formatHistoryEvent', () => {
  it('names who added, edited, assigned, and changed status', () => {
    expect(
      formatHistoryEvent({ type: 'created', actorUid: 'demo-owner', actorName: 'Admin', payload: {} }, copy, names),
    ).toBe('Admin added this piece.');
    expect(
      formatHistoryEvent({ type: 'updated', actorUid: 'demo-owner', actorName: 'Admin', payload: {} }, copy, names),
    ).toBe('Admin edited the piece.');
    expect(
      formatHistoryEvent(
        {
          type: 'status',
          actorUid: 'staff-ana',
          actorName: 'Ana Kawani',
          payload: { statusFrom: 'editing', statusTo: 'published' },
        },
        copy,
        names,
      ),
    ).toBe('Ana Kawani changed status from Editing to Published.');
    expect(
      formatHistoryEvent(
        {
          type: 'assigned',
          actorUid: 'demo-owner',
          actorName: 'Admin',
          payload: { role: 'editor', addedUids: ['staff-ana'], removedUids: [] },
        },
        copy,
        names,
      ),
    ).toBe('Admin assigned Editor: staff-ana.');
  });

  it('includes the comment preview and who reacted', () => {
    expect(
      formatHistoryEvent(
        {
          type: 'comment',
          actorUid: 'staff-rico',
          actorName: 'Rico Bilang',
          payload: { commentPreview: 'Caption is ready.' },
        },
        copy,
        names,
      ),
    ).toBe('Rico Bilang commented: Caption is ready.');
    expect(
      formatHistoryEvent(
        {
          type: 'reaction',
          actorUid: 'demo-owner',
          actorName: 'Admin',
          payload: { emoji: '👍', commentPreview: 'Caption is ready.' },
        },
        copy,
        names,
      ),
    ).toBe('Admin reacted 👍 to a comment: Caption is ready.');
    expect(
      formatHistoryEvent(
        {
          type: 'deleted',
          actorUid: 'demo-owner',
          actorName: 'Admin',
          payload: { title: 'Old hallway poster' },
        },
        copy,
        names,
      ),
    ).toBe('Admin deleted Old hallway poster.');
  });
});
