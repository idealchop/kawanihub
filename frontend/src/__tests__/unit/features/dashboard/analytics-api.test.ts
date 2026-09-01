/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { memberCanAccess, type Member } from '@/features/users/types/member';

describe('memberCanAccess', () => {
  const member: Member = {
    id: '1',
    uid: 'staff',
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Kawani',
    phone: '',
    email: 'staff@kawanihub.ph',
    displayName: 'Ana Kawani',
    role: 'member',
    access: {
      media: 'none',
      solicitation: 'reviewer',
      assistant: 'none',
      legislative: 'none',
    },
    permissions: ['dashboard', 'solicitation'],
    status: 'active',
    createdBy: 'owner',
    createdAt: '',
    updatedAt: '',
  };

  it('allows assigned modules and owner override', () => {
    expect(memberCanAccess(member, 'solicitation')).toBe(true);
    expect(memberCanAccess(member, 'users')).toBe(false);
    expect(memberCanAccess({ ...member, role: 'owner' }, 'users')).toBe(true);
    expect(memberCanAccess({ ...member, status: 'disabled' }, 'dashboard')).toBe(false);
  });

  it('scopes domain admin nav to their domain', () => {
    const solAdmin: Member = {
      ...member,
      role: 'admin',
      access: { media: 'none', solicitation: 'admin', assistant: 'none', legislative: 'none' },
    };
    expect(memberCanAccess(solAdmin, 'solicitation')).toBe(true);
    expect(memberCanAccess(solAdmin, 'media')).toBe(false);
    expect(memberCanAccess(solAdmin, 'users')).toBe(true);
  });
});
