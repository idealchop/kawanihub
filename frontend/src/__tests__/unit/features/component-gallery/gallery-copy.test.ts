/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { galleryCopy } from '@/features/component-gallery';

describe('galleryCopy', () => {
  it('labels the public components page', () => {
    expect(galleryCopy.title).toBe('Components');
    expect(galleryCopy.navLabel).toBe('Components');
    expect(galleryCopy.sections.map((section) => section.id)).toEqual([
      'brand',
      'buttons',
      'forms',
      'feedback',
      'overlays',
      'data',
      'data-table',
      'states',
    ]);
  });
});
