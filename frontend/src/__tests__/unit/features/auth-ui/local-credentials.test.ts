/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { isLocalAdmin, localCredentials } from '@/features/auth-ui/lib/local-credentials';

describe('local credentials', () => {
  it('accepts owner and desk roster logins', () => {
    expect(localCredentials.username).toBe('admin');
    expect(localCredentials.password).toBe('DeskOwner2026');
    expect(isLocalAdmin('admin', 'DeskOwner2026')).toBe(true);
    expect(isLocalAdmin(' admin ', 'DeskOwner2026')).toBe(true);
    expect(isLocalAdmin('ana.kawani', 'DeskAna2026')).toBe(true);
    expect(isLocalAdmin('admin', 'wrong')).toBe(false);
    expect(isLocalAdmin('other', 'DeskOwner2026')).toBe(false);
  });
});
