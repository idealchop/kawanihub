/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { mediaTypeHref } from '@/features/media/lib/media-type-href';
import { contentTypeLabel } from '@/features/media/lib/content-type-lookup';
import { isMediaDateField, normalizeMediaPiece, normalizeMediaStatus } from '@/features/media/types/media-piece';
import type { MediaContentType } from '@/features/media/types/media-content-type';

describe('media type helpers', () => {
  it('builds a type board path and labels a catalog slug', () => {
    expect(mediaTypeHref('photo')).toBe('/media/photo');
    expect(isMediaDateField('publish')).toBe(true);
    expect(
      contentTypeLabel(
        [{ slug: 'photo', name: 'Photo' } as MediaContentType],
        'photo',
      ),
    ).toBe('Photo');
    expect(contentTypeLabel([], 'reels')).toBe('reels');
    expect(normalizeMediaStatus('ready')).toBe('ready_for_publish');
    expect(normalizeMediaStatus('ready_for_review')).toBe('ready_for_review');
    expect(normalizeMediaPiece({ title: 'Reel', type: 'reels', link: 'https://facebook.com/p' }).fbUrl).toBe(
      'https://facebook.com/p',
    );
  });
});
