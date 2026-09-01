/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { isLikelyImageFile } from '@/features/solicitation/lib/id-photo';

describe('isLikelyImageFile', () => {
  it('accepts iOS camera files with an empty type', () => {
    expect(isLikelyImageFile(new File([new Uint8Array([1, 2, 3])], 'image.jpg', { type: '' }))).toBe(true);
  });

  it('accepts jpeg from the camera roll', () => {
    expect(isLikelyImageFile(new File([new Uint8Array([1])], 'id.jpg', { type: 'image/jpeg' }))).toBe(true);
  });

  it('rejects a non-image file with a type', () => {
    expect(isLikelyImageFile(new File(['x'], 'notes.pdf', { type: 'application/pdf' }))).toBe(false);
  });
});
