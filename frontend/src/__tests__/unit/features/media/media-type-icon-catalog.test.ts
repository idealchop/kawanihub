/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { visibleMediaTypeIcons } from '@/features/media/lib/media-type-icon-catalog';

describe('visibleMediaTypeIcons', () => {
  it('ranks used icons first, then fills popular slots', () => {
    expect(visibleMediaTypeIcons('', ['mic', 'mic', 'camera'], 'camera')).toEqual([
      'mic',
      'camera',
      'film',
      'image',
      'message-square',
      'clapperboard',
      'newspaper',
      'video',
      'music',
      'file-text',
    ]);
  });

  it('keeps the selected icon visible when it is not in the popular set', () => {
    const icons = visibleMediaTypeIcons('', ['camera'], 'podcast');
    expect(icons[0]).toBe('podcast');
    expect(icons).toHaveLength(10);
  });

  it('filters the catalog by name and aliases', () => {
    expect(visibleMediaTypeIcons('podcast', [], 'camera')).toEqual(expect.arrayContaining(['podcast', 'mic']));
    expect(visibleMediaTypeIcons('zzzz', [], 'camera')).toEqual([]);
  });
});
