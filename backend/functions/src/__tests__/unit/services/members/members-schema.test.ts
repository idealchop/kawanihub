/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { memberWriteSchema } from '../../../../services/members/members-schema';

describe('memberWriteSchema', () => {
  it('accepts a valid member and defaults role', () => {
    const parsed = memberWriteSchema.parse({
      username: 'ana.kawani',
      firstName: 'Ana',
      lastName: 'Kawani',
      email: 'ana@kawanihub.ph',
    });
    expect(parsed.role).toBe('member');
    expect(parsed.status).toBe('active');
  });

  it('rejects a bad email', () => {
    expect(() =>
      memberWriteSchema.parse({
        username: 'ana',
        firstName: 'Ana',
        lastName: 'Kawani',
        email: 'not-an-email',
      }),
    ).toThrow();
  });
});
