/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { brand } from '../../../config/brand';

describe('brand', () => {
  it('keeps River Tech copyright identity', () => {
    expect(brand.legalName).toBe('River Tech');
    expect(brand.copyrightYear).toBe(2026);
  });
});
