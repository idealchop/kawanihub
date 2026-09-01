/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { itemWriteSchema } from '../../../../services/items/items-schema';

describe('itemWriteSchema', () => {
  it('accepts a valid item', () => {
    const parsed = itemWriteSchema.parse({ title: 'First task' });
    expect(parsed.status).toBe('open');
    expect(parsed.notes).toBe('');
  });

  it('rejects an empty title', () => {
    expect(() => itemWriteSchema.parse({ title: '' })).toThrow();
  });
});
