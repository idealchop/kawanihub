/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { shouldReadIdText } from '@/features/solicitation/lib/should-read-id-text';

describe('shouldReadIdText', () => {
  it('reads the front of the ID after the photo is saved', () => {
    expect(shouldReadIdText()).toBe(true);
  });
});
