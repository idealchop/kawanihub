/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { mediaContentTypeWriteSchema } from '../../../../services/media/media-content-type-schema';
import { createMediaContentType, slugifyTypeName } from '../../../../services/media/media-content-type-service';

describe('media-content-type-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('slugifies names and avoids reserved slugs', () => {
    expect(slugifyTypeName('Session Stills')).toBe('session-stills');
    expect(slugifyTypeName('New')).toBe('new-content');
    expect(slugifyTypeName('Types')).toBe('types-content');
  });

  it('creates a content type with a unique slug', async () => {
    const first = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Photo',
      hint: 'Session stills',
      icon: 'camera',
      status: 'active',
    });
    const second = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Photo',
      hint: 'More stills',
      icon: 'image',
      status: 'active',
    });
    expect(first.slug).toBe('photo');
    expect(second.slug).toBe('photo-2');
  });

  it('accepts expanded catalog icons', async () => {
    const row = await createMediaContentType('demo-workspace', 'demo-owner', {
      name: 'Podcast',
      hint: 'Audio episode',
      icon: 'podcast',
      status: 'active',
    });
    expect(row.icon).toBe('podcast');
  });

  it('rejects unknown icon keys', () => {
    expect(() => mediaContentTypeWriteSchema.parse({ name: 'Podcast', icon: 'not-an-icon' })).toThrow();
  });
});
