/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { composePersonName, missingMiddleName } from '@/features/solicitation/types/solicitation';

describe('composePersonName', () => {
  it('joins first, middle, and last without extra spaces', () => {
    expect(composePersonName('Rosa', 'D', 'Mendoza')).toBe('Rosa D Mendoza');
    expect(composePersonName('Rosa', '', 'Mendoza')).toBe('Rosa Mendoza');
    expect(composePersonName('Rosa', '', 'Mendoza', 'Jr')).toBe('Rosa Mendoza Jr');
  });

  it('requires a middle name unless the person declared they have none', () => {
    expect(missingMiddleName({ middleName: '', noMiddleName: false })).toBe(true);
    expect(missingMiddleName({ middleName: 'Dela', noMiddleName: false })).toBe(false);
    expect(missingMiddleName({ middleName: '', noMiddleName: true })).toBe(false);
  });
});
