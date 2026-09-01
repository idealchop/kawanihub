/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { DEMO_MEDIA_PIECE_TARGET, extraDemoMediaPieces } from '../../../../services/demo/desk-seed-media-pieces';
import { MEDIA_STATUSES } from '../../../../services/media/media-types';

describe('demo media piece seed', () => {
  it('fills the board up to 200 pieces with a mixed pipeline', () => {
    const named = extraDemoMediaPieces({
      workspaceId: 'demo-workspace',
      actorUid: 'demo-owner',
      existing: [],
    }).slice(0, 7);
    const extras = extraDemoMediaPieces({
      workspaceId: 'demo-workspace',
      actorUid: 'demo-owner',
      existing: named,
    });
    expect(named.length + extras.length).toBe(DEMO_MEDIA_PIECE_TARGET);
    expect(new Set(extras.map((row) => row.id)).size).toBe(extras.length);
    expect(new Set(extras.map((row) => row.title)).size).toBe(extras.length);
    expect(new Set(extras.map((row) => row.status))).toEqual(new Set(MEDIA_STATUSES));
    expect(new Set(extras.map((row) => row.type)).size).toBeGreaterThan(3);
    expect(extras.some((row) => row.editorUids.length === 0)).toBe(true);
    expect(extras.some((row) => row.editorUids.includes('staff-ana'))).toBe(true);
    expect(extras.filter((row) => row.status === 'published' || row.status === 'not_published').length).toBeGreaterThan(20);
    expect(extraDemoMediaPieces({ workspaceId: 'ws', actorUid: 'demo-owner', existing: extras.concat(named) })).toEqual(
      [],
    );
  });
});
