/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { createMediaContentType, deleteMediaContentType } from '../../../../services/media/media-content-type-service';
import { createMediaPiece, deleteMediaPiece, listMediaPieces, updateMediaPiece } from '../../../../services/media/media-service';
import { applyScheduledPublish, normalizeMediaPieceFields, normalizeMediaStatus, scheduledPostDue } from '../../../../services/media/media-types';

describe('media-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('creates, lists, updates, and deletes a media piece', async () => {
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
      personUid: 'staff-ana',
      shootDate: '2026-09-02',
      publishDate: '2026-09-04',
      link: 'https://drive.google.com',
    });
    expect(created.driveUrl).toBe('https://drive.google.com');
    expect(created.editorUid).toBe('staff-ana');
    expect(created.editorUids).toEqual(['staff-ana']);

    const listed = await listMediaPieces('demo-workspace', 'demo-owner');
    expect(listed).toHaveLength(1);

    const updated = await updateMediaPiece('demo-workspace', created.id, 'demo-owner', {
      title: created.title,
      type: created.type,
      status: 'published',
      personUid: created.personUid,
      shootDate: created.shootDate,
      publishDate: created.publishDate,
      link: created.link,
    });
    expect(updated.status).toBe('published');

    await expect(deleteMediaContentType('demo-workspace', kind.id, 'demo-owner')).rejects.toThrow(
      'Deactivate this type instead',
    );

    await deleteMediaPiece('demo-workspace', created.id, 'demo-owner');
    expect(await listMediaPieces('demo-workspace', 'demo-owner')).toHaveLength(0);
    await deleteMediaContentType('demo-workspace', kind.id, 'demo-owner');
    expect(memoryDb.auditLogs.map((log) => log.action)).toEqual([
      'media_type.create',
      'media.create',
      'media.update',
      'media.delete',
      'media_type.delete',
    ]);
  });

  it('normalizes legacy ready to ready_for_publish', () => {
    expect(normalizeMediaStatus('ready')).toBe('ready_for_publish');
    expect(normalizeMediaStatus('under_review')).toBe('under_review');
  });

  it('maps a facebook link to fbUrl', () => {
    const fields = normalizeMediaPieceFields({
      title: 'Hak hak challenge reel',
      type: 'reels',
      status: 'published',
      link: 'https://facebook.com/reel',
    });
    expect(fields.fbUrl).toBe('https://facebook.com/reel');
    expect(fields.driveUrl).toBe('');
  });

  it('publishes a scheduled post once the publish date has arrived', async () => {
    const kind = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Reels',
      hint: 'Short video',
      icon: 'clapperboard',
      status: 'active',
    });
    const created = await createMediaPiece('demo-workspace', 'demo-owner', {
      title: 'Night recap',
      type: kind.slug,
      status: 'scheduled_post',
      publishDate: '2020-01-01',
    });
    expect(created.status).toBe('published');

    const future = await createMediaPiece('demo-workspace', 'demo-owner', {
      title: 'Later recap',
      type: kind.slug,
      status: 'scheduled_post',
      publishDate: '2099-01-01',
    });
    expect(future.status).toBe('scheduled_post');

    memoryDb.mediaPieces.set(`${future.workspaceId}:${future.id}`, { ...future, publishDate: '2020-01-01' });
    const listed = await listMediaPieces('demo-workspace', 'demo-owner');
    expect(listed.find((row) => row.id === future.id)?.status).toBe('published');
  });

  it('lists open work before published and not published', async () => {
    const kind = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Photo',
      hint: 'Session stills',
      icon: 'camera',
      status: 'active',
    });
    await createMediaPiece('demo-workspace', 'demo-owner', {
      title: 'Z published',
      type: kind.slug,
      status: 'published',
    });
    await createMediaPiece('demo-workspace', 'demo-owner', {
      title: 'A editing',
      type: kind.slug,
      status: 'editing',
    });
    await createMediaPiece('demo-workspace', 'demo-owner', {
      title: 'B skipped',
      type: kind.slug,
      status: 'not_published',
    });
    const listed = await listMediaPieces('demo-workspace', 'demo-owner');
    expect(listed.map((row) => row.status)).toEqual(['editing', 'published', 'not_published']);
  });
});

describe('scheduledPostDue', () => {
  it('is true only for scheduled posts whose publish date is today or past', () => {
    expect(scheduledPostDue({ status: 'scheduled_post', publishDate: '2026-09-01' }, '2026-09-01')).toBe(true);
    expect(scheduledPostDue({ status: 'scheduled_post', publishDate: '2026-09-02' }, '2026-09-01')).toBe(false);
    expect(scheduledPostDue({ status: 'editing', publishDate: '2026-08-01' }, '2026-09-01')).toBe(false);
    expect(applyScheduledPublish({ status: 'scheduled_post' as const, publishDate: '2026-08-01' }, '2026-09-01').status).toBe(
      'published',
    );
  });
});
