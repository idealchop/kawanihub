/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  EMPTY_ACCESS,
  filterMembersForActor,
  FULL_ADMIN_ACCESS,
  memberManagedByActor,
  moduleAccessGranted,
  permissionsFromAccess,
} from '../../../../services/members/members-access';
import type { MemberRecord } from '../../../../services/members/members-types';

function member(partial: Partial<MemberRecord> & Pick<MemberRecord, 'role' | 'access'>): MemberRecord {
  return {
    id: partial.id ?? 'id',
    workspaceId: 'ws',
    uid: partial.uid ?? 'uid',
    username: partial.username ?? 'user',
    firstName: partial.firstName ?? 'First',
    lastName: partial.lastName ?? 'Last',
    phone: '',
    email: partial.email ?? 'user@example.com',
    displayName: partial.displayName ?? 'First Last',
    solicitRole: 'reviewer',
    permissions: [],
    status: 'active',
    createdBy: 'owner',
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('members-access', () => {
  it('scopes domain admin permissions to their domain only', () => {
    const solicitationAdmin = member({
      role: 'admin',
      access: { media: 'none', solicitation: 'admin', assistant: 'none', legislative: 'none' },
    });
    expect(permissionsFromAccess(solicitationAdmin.access, 'admin')).toEqual([
      'dashboard',
      'solicitation',
      'users',
      'notifications',
      'activity',
    ]);
    expect(moduleAccessGranted('admin', solicitationAdmin.access, 'media')).toBe(false);
    expect(moduleAccessGranted('admin', solicitationAdmin.access, 'users')).toBe(true);
  });

  it('treats admin overall as full access', () => {
    expect(moduleAccessGranted('admin', FULL_ADMIN_ACCESS, 'media')).toBe(true);
    expect(moduleAccessGranted('admin', FULL_ADMIN_ACCESS, 'legislative')).toBe(true);
  });

  it('filters user lists for domain admins', () => {
    const owner = member({ uid: 'owner', role: 'owner', access: FULL_ADMIN_ACCESS });
    const overall = member({
      uid: 'overall',
      role: 'admin',
      access: FULL_ADMIN_ACCESS,
      email: 'overall@example.com',
    });
    const solAdmin = member({
      uid: 'sol-admin',
      role: 'admin',
      access: { media: 'none', solicitation: 'admin', assistant: 'none', legislative: 'none' },
    });
    const mediaAdmin = member({
      uid: 'media-admin',
      role: 'admin',
      access: { media: 'admin', solicitation: 'none', assistant: 'none', legislative: 'none' },
    });
    const solMember = member({
      uid: 'sol-member',
      role: 'member',
      access: { media: 'none', solicitation: 'reviewer', assistant: 'none', legislative: 'none' },
    });
    const roster = [owner, overall, solAdmin, mediaAdmin, solMember];

    const visible = filterMembersForActor(solAdmin, roster);
    expect(visible.map((row) => row.uid)).toEqual(['overall', 'sol-admin', 'sol-member']);
    expect(memberManagedByActor(solAdmin, owner)).toBe(false);
    expect(memberManagedByActor(solAdmin, mediaAdmin)).toBe(false);
  });

  it('defaults non-owner admin without access to empty domains', () => {
    expect(permissionsFromAccess(EMPTY_ACCESS, 'admin')).toEqual(['users']);
  });
});
