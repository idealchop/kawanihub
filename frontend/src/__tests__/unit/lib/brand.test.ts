/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { brand, copyrightLine, productTitle } from '@/config/brand';

describe('brand', () => {
  it('is copyrighted to River Tech', () => {
    expect(brand.legalName).toBe('River Tech');
    expect(copyrightLine()).toBe('© 2026 River Tech. All rights reserved.');
  });

  it('builds a product page title', () => {
    expect(productTitle('Items')).toBe('Items · Kawanihub');
    expect(productTitle()).toBe('Kawanihub');
  });
});
