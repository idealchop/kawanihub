/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { createMember, deleteMember, listMembers, memberHasModule, updateMember } from '../../../../services/members/members-service';

describe('members-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('creates, lists, updates, and deletes a desk member', async () => {
    const created = await createMember('demo-workspace', 'demo-owner', {
      username: 'ana.kawani',
      firstName: 'Ana',
      lastName: 'Kawani',
      phone: '09171234567',
      email: 'staff@kawanihub.ph',
      role: 'member',
      access: {
        media: 'none',
        solicitation: 'reviewer',
        assistant: 'none',
        legislative: 'none',
      },
      status: 'active',
      uid: '',
      password: 'TempPass1234',
    });
    expect(created.member.email).toBe('staff@kawanihub.ph');
    expect(created.temporaryPassword).toBe('TempPass1234');
    expect(memberHasModule(created.member, 'solicitation')).toBe(true);
    expect(memberHasModule(created.member, 'users')).toBe(false);

    expect(await listMembers('demo-workspace', 'demo-owner')).toHaveLength(1);

    const updated = await updateMember('demo-workspace', created.member.id, 'demo-owner', {
      username: created.member.username,
      firstName: 'Ana',
      lastName: 'Kawani',
      phone: created.member.phone,
      email: created.member.email,
      displayName: 'Ana Kawani',
      role: 'admin',
      access: {
        media: 'admin',
        solicitation: 'admin',
        assistant: 'admin',
        legislative: 'admin',
      },
      status: 'active',
      uid: created.member.uid,
    });
    expect(updated.displayName).toBe('Ana Kawani');
    expect(memberHasModule(updated, 'users')).toBe(true);

    await deleteMember('demo-workspace', created.member.id, 'demo-owner');
    expect(await listMembers('demo-workspace', 'demo-owner')).toHaveLength(0);
    expect(memoryDb.auditLogs.map((log) => log.action)).toEqual([
      'members.create',
      'members.update',
      'members.delete',
    ]);
  });
});
